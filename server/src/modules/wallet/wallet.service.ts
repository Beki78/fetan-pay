import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, TransactionProvider } from '@prisma/client';
import { VerificationService } from '../verifier/services/verification.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { NotificationService } from '../notifications/notification.service';
import type { Request } from 'express';
import { VerifyWalletDepositDto } from './dto/verify-wallet-deposit.dto';
import { SetDepositReceiverDto } from './dto/set-deposit-receiver.dto';
import { ManualDepositDto } from './dto/manual-deposit.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { WalletTransactionHistoryDto } from './dto/wallet-transaction-history.dto';
import { CreateWalletDepositDto } from './dto/create-wallet-deposit.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
    private readonly webhooksService: WebhooksService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Calculate charge amount based on merchant configuration
   */
  async calculateCharge(
    merchantId: string,
    paymentAmount: Prisma.Decimal,
  ): Promise<Prisma.Decimal | null> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        walletEnabled: true,
        walletChargeType: true,
        walletChargeValue: true,
      },
    });

    if (!merchant || !merchant.walletEnabled) {
      return null;
    }

    if (!merchant.walletChargeType || !merchant.walletChargeValue) {
      return null;
    }

    if (merchant.walletChargeType === 'PERCENTAGE') {
      // Calculate percentage: amount * (percentage / 100)
      const percentage = merchant.walletChargeValue.toNumber();
      const charge = paymentAmount.mul(percentage).div(100);
      return charge;
    } else if (merchant.walletChargeType === 'FIXED') {
      // Fixed amount
      return merchant.walletChargeValue;
    }

    return null;
  }

  /**
   * Charge wallet for payment verification
   */
  async chargeForPayment(
    merchantId: string,
    paymentId: string,
    paymentAmount: Prisma.Decimal,
  ): Promise<{
    success: boolean;
    chargeAmount: Prisma.Decimal | null;
    walletTransactionId: string | null;
    error?: string;
  }> {
    // Get merchant wallet config
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        walletEnabled: true,
        walletBalance: true,
        walletChargeType: true,
        walletChargeValue: true,
        walletMinBalance: true,
      },
    });

    if (!merchant || !merchant.walletEnabled) {
      return {
        success: true,
        chargeAmount: null,
        walletTransactionId: null,
      };
    }

    // Calculate charge
    const chargeAmount = await this.calculateCharge(merchantId, paymentAmount);
    if (!chargeAmount || chargeAmount.lte(0)) {
      return {
        success: true,
        chargeAmount: null,
        walletTransactionId: null,
      };
    }

    // Check balance
    const currentBalance = merchant.walletBalance;
    const newBalance = currentBalance.sub(chargeAmount);

    // Check minimum balance if set
    if (merchant.walletMinBalance) {
      if (newBalance.lt(merchant.walletMinBalance)) {
        // Trigger insufficient balance webhook
        this.webhooksService
          .triggerWebhook('wallet.insufficient', merchantId, {
            wallet: {
              balance: currentBalance.toNumber(),
              required: chargeAmount.toNumber(),
              minimumBalance: merchant.walletMinBalance.toNumber(),
            },
            payment: {
              id: paymentId,
              amount: paymentAmount.toNumber(),
            },
            merchant: {
              id: merchantId,
            },
          })
          .catch((error) => {
            console.error(
              '[Webhooks] Error triggering wallet.insufficient webhook:',
              error,
            );
          });

        return {
          success: false,
          chargeAmount,
          walletTransactionId: null,
          error: `Insufficient wallet balance. Required: ${chargeAmount.toFixed(2)} ETB, Available: ${currentBalance.toFixed(2)} ETB, Minimum balance: ${merchant.walletMinBalance.toFixed(2)} ETB`,
        };
      }
    } else {
      // No minimum balance set, but still check if balance goes negative
      if (newBalance.lt(0)) {
        // Trigger insufficient balance webhook
        this.webhooksService
          .triggerWebhook('wallet.insufficient', merchantId, {
            wallet: {
              balance: currentBalance.toNumber(),
              required: chargeAmount.toNumber(),
              minimumBalance: null,
            },
            payment: {
              id: paymentId,
              amount: paymentAmount.toNumber(),
            },
            merchant: {
              id: merchantId,
            },
          })
          .catch((error) => {
            console.error(
              '[Webhooks] Error triggering wallet.insufficient webhook:',
              error,
            );
          });

        return {
          success: false,
          chargeAmount,
          walletTransactionId: null,
          error: `Insufficient wallet balance. Required: ${chargeAmount.toFixed(2)} ETB, Available: ${currentBalance.toFixed(2)} ETB`,
        };
      }
    }

    // Deduct from wallet using transaction for atomicity
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Lock merchant row for update
        const lockedMerchant = await tx.merchant.findUnique({
          where: { id: merchantId },
          select: { walletBalance: true },
        });

        if (!lockedMerchant) {
          throw new NotFoundException('Merchant not found');
        }

        const lockedBalance = lockedMerchant.walletBalance;
        const finalNewBalance = lockedBalance.sub(chargeAmount);

        // Double-check balance after lock
        if (
          merchant.walletMinBalance &&
          finalNewBalance.lt(merchant.walletMinBalance)
        ) {
          throw new BadRequestException(
            'Insufficient balance after lock check',
          );
        }
        if (finalNewBalance.lt(0)) {
          throw new BadRequestException(
            'Insufficient balance after lock check',
          );
        }

        // Update merchant balance
        await tx.merchant.update({
          where: { id: merchantId },
          data: { walletBalance: finalNewBalance },
        });

        // Create wallet transaction
        const walletTransaction = await tx.walletTransaction.create({
          data: {
            merchantId,
            type: 'CHARGE',
            amount: chargeAmount.negated(), // Negative for charges
            balanceBefore: lockedBalance,
            balanceAfter: finalNewBalance,
            payment: { connect: { id: paymentId } },
            description: `Payment verification fee (${merchant.walletChargeType === 'PERCENTAGE' ? `${merchant.walletChargeValue?.toNumber() ?? 0}%` : `${merchant.walletChargeValue?.toNumber() ?? 0} ETB`})`,
            metadata: {
              paymentAmount: paymentAmount.toNumber(),
              chargeType: merchant.walletChargeType,
              chargeValue: merchant.walletChargeValue?.toNumber() ?? 0,
            },
          },
        });

        // Update payment record
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            walletCharged: true,
            walletChargeAmount: chargeAmount,
            walletTransactionId: walletTransaction.id,
          },
        });

        return walletTransaction;
      });

      // Trigger wallet charged webhook
      this.webhooksService
        .triggerWebhook('wallet.charged', merchantId, {
          wallet: {
            balanceBefore: result.balanceBefore.toNumber(),
            balanceAfter: result.balanceAfter.toNumber(),
            chargeAmount: chargeAmount.toNumber(),
          },
          payment: {
            id: paymentId,
            amount: paymentAmount.toNumber(),
          },
          transaction: {
            id: result.id,
          },
          merchant: {
            id: merchantId,
          },
        })
        .catch((error) => {
          console.error(
            '[Webhooks] Error triggering wallet.charged webhook:',
            error,
          );
        });

      return {
        success: true,
        chargeAmount,
        walletTransactionId: result.id,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        return {
          success: false,
          chargeAmount,
          walletTransactionId: null,
          error: error.message,
        };
      }
      throw error;
    }
  }

  /**
   * Create a pending wallet deposit (merchant-initiated)
   */
  async createPendingDeposit(
    body: CreateWalletDepositDto,
    req: Request,
  ): Promise<any> {
    const membership = await this.requireMembership(req);

    // Verify receiver account exists and is active
    const receiverAccount =
      await this.prisma.walletDepositReceiverAccount.findUnique({
        where: { id: body.receiverAccountId },
      });

    if (!receiverAccount) {
      throw new NotFoundException('Receiver account not found');
    }

    if (receiverAccount.status !== 'ACTIVE') {
      throw new BadRequestException('Receiver account is not active');
    }

    if (receiverAccount.provider !== body.provider) {
      throw new BadRequestException('Provider mismatch with receiver account');
    }

    // Generate a temporary reference (will be replaced with actual reference on verification)
    const tempReference = `PENDING_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create pending deposit
    const deposit = await this.prisma.walletDeposit.create({
      data: {
        merchantId: membership.merchantId,
        provider: body.provider,
        reference: tempReference,
        amount: new Prisma.Decimal(body.amount),
        receiverAccountId: body.receiverAccountId,
        status: 'PENDING',
        expiresAt,
        description: `Pending deposit of ${body.amount} ETB via ${body.provider}`,
      },
      include: {
        receiverAccount: true,
      },
    });

    return deposit;
  }

  /**
   * Get pending deposits for merchant
   */
  async getPendingDeposits(merchantId: string) {
    const deposits = await this.prisma.walletDeposit.findMany({
      where: {
        merchantId,
        status: 'PENDING',
      },
      include: {
        receiverAccount: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return deposits.map((deposit) => ({
      id: deposit.id,
      provider: deposit.provider,
      amount: deposit.amount.toNumber(),
      receiverAccount: deposit.receiverAccount,
      expiresAt: deposit.expiresAt?.toISOString() || null,
      createdAt: deposit.createdAt.toISOString(),
      isExpired: deposit.expiresAt ? new Date() > deposit.expiresAt : false,
    }));
  }

  /**
   * Verify wallet deposit (merchant-initiated)
   */
  async verifyWalletDeposit(
    body: VerifyWalletDepositDto,
    req: Request,
  ): Promise<{
    success: boolean;
    status: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
    amount: Prisma.Decimal | null;
    walletDeposit: any;
    error?: string;
  }> {
    const membership = await this.requireMembership(req);

    // Check for existing deposit by reference
    const existingDeposit = await this.prisma.walletDeposit.findFirst({
      where: {
        merchantId: membership.merchantId,
        provider: body.provider,
        reference: body.reference,
      },
    });

    if (existingDeposit?.status === 'VERIFIED') {
      throw new ConflictException(
        `Deposit already verified at ${existingDeposit.verifiedAt?.toLocaleString() ?? 'an earlier time'}`,
      );
    }

    // Check if there's a pending deposit that matches (by provider)
    // This allows updating a pending deposit with the actual reference
    const pendingDeposit =
      existingDeposit?.status === 'PENDING'
        ? existingDeposit
        : await this.prisma.walletDeposit.findFirst({
            where: {
              merchantId: membership.merchantId,
              provider: body.provider,
              status: 'PENDING',
            },
            orderBy: { createdAt: 'desc' },
          });

    // Check expiration for pending deposits
    if (pendingDeposit?.expiresAt && new Date() > pendingDeposit.expiresAt) {
      // Update status to EXPIRED
      await this.prisma.walletDeposit.update({
        where: { id: pendingDeposit.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException(
        'This deposit request has expired. Please create a new deposit request.',
      );
    }

    // Get active wallet deposit receiver account
    // If we have a pending deposit, use its receiver account, otherwise find one
    let receiverAccount;
    if (pendingDeposit) {
      receiverAccount =
        await this.prisma.walletDepositReceiverAccount.findUnique({
          where: { id: pendingDeposit.receiverAccountId },
        });
    } else {
      receiverAccount =
        await this.prisma.walletDepositReceiverAccount.findFirst({
          where: {
            provider: body.provider,
            status: 'ACTIVE',
          },
        });
    }

    if (!receiverAccount) {
      throw new BadRequestException(
        `No active wallet deposit receiver account configured for provider ${body.provider}`,
      );
    }

    // Verify transaction against bank/provider API
    const verifierResult = await this.runCoreVerifier(
      body.provider,
      body.reference,
    );
    const normalizedPayload = JSON.parse(
      JSON.stringify(verifierResult ?? null),
    );

    const payloadRecord = normalizedPayload as Record<string, unknown>;
    const referenceFound =
      !!normalizedPayload &&
      typeof normalizedPayload === 'object' &&
      payloadRecord.success !== false;

    const txAmount = this.extractVerifierAmount(payloadRecord);
    const txReceiverAccount =
      this.extractVerifierReceiverAccount(payloadRecord);
    const txReceiverName = this.extractVerifierReceiverName(payloadRecord);

    // Check receiver account matches
    const receiverMatches = this.receiverAccountMatches(
      txReceiverAccount,
      receiverAccount.receiverAccount,
      txReceiverName,
      receiverAccount.receiverName,
    );

    // Determine status
    const status =
      referenceFound && receiverMatches && txAmount !== undefined
        ? 'VERIFIED'
        : 'UNVERIFIED';

    // Create or update wallet deposit record
    const depositAmount = txAmount
      ? new Prisma.Decimal(txAmount)
      : new Prisma.Decimal(0);

    let walletDeposit: any;
    let walletTransaction: any = null;

    if (status === 'VERIFIED') {
      // Use transaction for atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Update existing pending deposit or create new one
        const deposit = pendingDeposit
          ? await tx.walletDeposit.update({
              where: { id: pendingDeposit.id },
              data: {
                reference: body.reference, // Update with actual reference
                amount: depositAmount,
                status: 'VERIFIED',
                verifiedAt: new Date(),
                verifiedBy: membership.merchantUserId,
                verificationPayload: normalizedPayload as Prisma.InputJsonValue,
                errorMessage: null,
              },
            })
          : await tx.walletDeposit.create({
              data: {
                merchantId: membership.merchantId,
                provider: body.provider,
                reference: body.reference,
                amount: depositAmount,
                receiverAccountId: receiverAccount.id,
                status: 'VERIFIED',
                verifiedAt: new Date(),
                verifiedBy: membership.merchantUserId,
                verificationPayload: normalizedPayload as Prisma.InputJsonValue,
                description: `Wallet deposit via ${body.provider}`,
              },
            });

        // Get current balance
        const merchant = await tx.merchant.findUnique({
          where: { id: membership.merchantId },
          select: { walletBalance: true },
        });

        if (!merchant) {
          throw new NotFoundException('Merchant not found');
        }

        const balanceBefore = merchant.walletBalance;
        const balanceAfter = balanceBefore.add(depositAmount);

        // Update merchant balance
        await tx.merchant.update({
          where: { id: membership.merchantId },
          data: { walletBalance: balanceAfter },
        });

        // Create wallet transaction
        const wtx = await tx.walletTransaction.create({
          data: {
            merchantId: membership.merchantId,
            type: 'DEPOSIT',
            amount: depositAmount,
            balanceBefore,
            balanceAfter,
            walletDeposit: { connect: { id: deposit.id } },
            description: `Wallet deposit via ${body.provider} - Reference: ${body.reference}`,
            metadata: {
              provider: body.provider,
              reference: body.reference,
            },
          },
        });

        // Link deposit to transaction
        await tx.walletDeposit.update({
          where: { id: deposit.id },
          data: { walletTransactionId: wtx.id },
        });

        return { deposit, transaction: wtx };
      });

      walletDeposit = result.deposit;
      walletTransaction = result.transaction;

      // Send notifications for successful deposit
      try {
        // Get merchant details for notifications
        const merchant = await this.prisma.merchant.findUnique({
          where: { id: membership.merchantId },
          select: {
            name: true,
            users: {
              where: { role: 'MERCHANT_OWNER' },
              select: { userId: true, email: true },
            },
          },
        });

        if (merchant) {
          const depositDetails = {
            amount: depositAmount.toNumber(),
            provider: body.provider,
            reference: body.reference,
            newBalance: walletTransaction.balanceAfter.toNumber(),
          };

          // Notify merchant owner
          const ownerUser = merchant.users.find((u) => u.userId);
          if (ownerUser?.userId) {
            await this.notificationService.notifyWalletDepositVerified(
              membership.merchantId,
              merchant.name,
              ownerUser.userId,
              depositDetails,
            );
          } else {
            // Fallback to email if no userId
            const ownerWithEmail = merchant.users.find((u) => u.email);
            if (ownerWithEmail?.email) {
              console.log(
                `Owner userId not found for merchant ${membership.merchantId}, sending deposit notification directly to email: ${ownerWithEmail.email}`,
              );
              await this.notificationService.notifyWalletDepositVerifiedByEmail(
                membership.merchantId,
                merchant.name,
                ownerWithEmail.email,
                depositDetails,
              );
            }
          }

          // Notify admins
          await this.notificationService.notifyAdminsWalletDeposit(
            membership.merchantId,
            merchant.name,
            depositDetails,
          );
        }
      } catch (error) {
        console.error('Failed to send wallet deposit notifications:', error);
        // Don't fail the deposit if notifications fail
      }
    } else {
      // Create UNVERIFIED deposit record
      walletDeposit = await this.prisma.walletDeposit.upsert({
        where: {
          wallet_deposit_unique: {
            merchantId: membership.merchantId,
            provider: body.provider,
            reference: body.reference,
          },
        },
        update: {
          amount: depositAmount,
          status: 'UNVERIFIED',
          verificationPayload: normalizedPayload as Prisma.InputJsonValue,
          errorMessage: !referenceFound
            ? 'Transaction reference not found'
            : !receiverMatches
              ? 'Receiver account does not match'
              : txAmount === undefined
                ? 'Amount not found in transaction'
                : 'Verification failed',
        },
        create: {
          merchantId: membership.merchantId,
          provider: body.provider,
          reference: body.reference,
          amount: depositAmount,
          receiverAccountId: receiverAccount.id,
          status: 'UNVERIFIED',
          verificationPayload: normalizedPayload as Prisma.InputJsonValue,
          errorMessage: !referenceFound
            ? 'Transaction reference not found'
            : !receiverMatches
              ? 'Receiver account does not match'
              : txAmount === undefined
                ? 'Amount not found in transaction'
                : 'Verification failed',
        },
      });
    }

    return {
      success: status === 'VERIFIED',
      status,
      amount: status === 'VERIFIED' ? depositAmount : null,
      walletDeposit: {
        ...walletDeposit,
        walletTransaction,
      },
      error:
        status === 'UNVERIFIED'
          ? walletDeposit.errorMessage || 'Verification failed'
          : undefined,
    };
  }

  /**
   * Get wallet deposit receiver accounts (for merchants to see where to send money)
   */
  async getDepositReceiverAccounts(): Promise<any[]> {
    const accounts = await this.prisma.walletDepositReceiverAccount.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        provider: 'asc',
      },
    });

    return accounts.map((acc) => ({
      id: acc.id,
      provider: acc.provider,
      receiverAccount: acc.receiverAccount,
      receiverName: acc.receiverName,
      receiverLabel: acc.receiverLabel,
      status: acc.status,
    }));
  }

  /**
   * Admin: Set wallet deposit receiver account
   */
  async setDepositReceiverAccount(body: SetDepositReceiverDto): Promise<any> {
    const account = await this.prisma.walletDepositReceiverAccount.upsert({
      where: {
        wallet_deposit_receiver_unique: {
          provider: body.provider,
          receiverAccount: body.receiverAccount,
        },
      },
      update: {
        receiverName: body.receiverName,
        receiverLabel: body.receiverLabel,
        status: body.status || 'ACTIVE',
      },
      create: {
        provider: body.provider,
        receiverAccount: body.receiverAccount,
        receiverName: body.receiverName,
        receiverLabel: body.receiverLabel,
        status: body.status || 'ACTIVE',
      },
    });

    return account;
  }

  /**
   * Admin: Manual deposit
   */
  async manualDeposit(body: ManualDepositDto): Promise<any> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: body.merchantId },
      select: { id: true, walletBalance: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const amount = new Prisma.Decimal(body.amount);
    const balanceBefore = merchant.walletBalance;
    const balanceAfter = balanceBefore.add(amount);

    const result = await this.prisma.$transaction(async (tx) => {
      // Update merchant balance
      await tx.merchant.update({
        where: { id: body.merchantId },
        data: { walletBalance: balanceAfter },
      });

      // Create wallet transaction
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          merchantId: body.merchantId,
          type: 'DEPOSIT',
          amount,
          balanceBefore,
          balanceAfter,
          description: body.description || 'Manual deposit by admin',
          metadata: {
            type: 'manual',
            description: body.description,
          },
        },
      });

      return walletTransaction;
    });

    return result;
  }

  /**
   * Get merchant wallet configuration
   */
  async getMerchantWalletConfig(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        walletEnabled: true,
        walletChargeType: true,
        walletChargeValue: true,
        walletMinBalance: true,
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return {
      walletEnabled: merchant.walletEnabled,
      walletChargeType: merchant.walletChargeType,
      walletChargeValue: merchant.walletChargeValue?.toNumber() ?? null,
      walletMinBalance: merchant.walletMinBalance?.toNumber() ?? null,
    };
  }

  /**
   * Get wallet balance
   */
  async getBalance(merchantId: string): Promise<Prisma.Decimal> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { walletBalance: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant.walletBalance;
  }

  /**
   * Get wallet transaction history
   */
  async getTransactionHistory(
    merchantId: string,
    query: WalletTransactionHistoryDto,
  ): Promise<{
    transactions: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { merchantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          payment: {
            select: {
              id: true,
              reference: true,
              provider: true,
              claimedAmount: true,
            },
          },
          walletDeposit: {
            select: {
              id: true,
              reference: true,
              provider: true,
              amount: true,
            },
          },
        },
      }),
      this.prisma.walletTransaction.count({
        where: { merchantId },
      }),
    ]);

    return {
      transactions,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Admin: Adjust wallet balance
   */
  async adjustBalance(body: AdjustBalanceDto): Promise<any> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: body.merchantId },
      select: { id: true, walletBalance: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const amount = new Prisma.Decimal(body.amount);
    const balanceBefore = merchant.walletBalance;
    const balanceAfter = balanceBefore.add(amount);

    const result = await this.prisma.$transaction(async (tx) => {
      // Update merchant balance
      await tx.merchant.update({
        where: { id: body.merchantId },
        data: { walletBalance: balanceAfter },
      });

      // Create wallet transaction
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          merchantId: body.merchantId,
          type: 'ADJUSTMENT',
          amount,
          balanceBefore,
          balanceAfter,
          description:
            body.description ||
            `Balance adjustment: ${amount.gte(0) ? '+' : ''}${amount.toFixed(2)} ETB`,
          metadata: {
            type: 'adjustment',
            description: body.description,
          },
        },
      });

      return walletTransaction;
    });

    return result;
  }

  /**
   * Update merchant wallet configuration
   */
  async updateMerchantWalletConfig(
    merchantId: string,
    config: {
      walletEnabled?: boolean;
      walletChargeType?: 'PERCENTAGE' | 'FIXED' | null;
      walletChargeValue?: number | null;
      walletMinBalance?: number | null;
    },
  ): Promise<any> {
    const updateData: any = {};

    if (config.walletEnabled !== undefined) {
      updateData.walletEnabled = config.walletEnabled;
    }
    if (config.walletChargeType !== undefined) {
      updateData.walletChargeType = config.walletChargeType;
    }
    if (config.walletChargeValue !== undefined) {
      updateData.walletChargeValue =
        config.walletChargeValue !== null
          ? new Prisma.Decimal(config.walletChargeValue)
          : null;
    }
    if (config.walletMinBalance !== undefined) {
      updateData.walletMinBalance =
        config.walletMinBalance !== null
          ? new Prisma.Decimal(config.walletMinBalance)
          : null;
    }

    const merchant = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: updateData,
      select: {
        id: true,
        walletEnabled: true,
        walletChargeType: true,
        walletChargeValue: true,
        walletMinBalance: true,
        walletBalance: true,
      },
    });

    return merchant;
  }

  // Helper methods (similar to PaymentsService)

  private async runCoreVerifier(
    provider: TransactionProvider,
    reference: string,
  ) {
    switch (provider) {
      case TransactionProvider.CBE:
        return this.verificationService.verifyCbeSmart(reference);
      case TransactionProvider.TELEBIRR:
        return this.verificationService.verifyTelebirr(reference);
      case TransactionProvider.AWASH:
        return this.verificationService.verifyAwashSmart(reference);
      case TransactionProvider.BOA:
        return this.verificationService.verifyAbyssiniaSmart(reference);
      case TransactionProvider.DASHEN:
        return this.verificationService.verifyDashen(reference);
      default:
        throw new BadRequestException('Unsupported provider');
    }
  }

  private normalizeAccount(raw?: string | null): string {
    return (raw ?? '')
      .toString()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .trim()
      .toLowerCase();
  }

  private extractVerifierAmount(
    payload: Record<string, unknown>,
  ): number | undefined {
    const a = payload?.amount;
    if (typeof a === 'number' && Number.isFinite(a)) return a;
    if (typeof a === 'string') {
      const parsed = parseFloat(a.replace(/[^\d.]/g, ''));
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  private extractVerifierReceiverAccount(
    payload: Record<string, unknown>,
  ): string | undefined {
    const ra = payload?.receiverAccount;
    if (typeof ra === 'string' && ra.trim()) return ra.trim();
    return undefined;
  }

  private extractVerifierReceiverName(
    payload: Record<string, unknown>,
  ): string | undefined {
    const r = payload?.receiver;
    if (typeof r === 'string' && r.trim()) return r.trim();
    return undefined;
  }

  private receiverAccountMatches(
    txReceiverAccount: string | undefined,
    expectedAccount: string,
    txReceiverName: string | undefined,
    expectedName: string | null | undefined,
  ): boolean {
    if (!txReceiverAccount) return false;

    const normalizedTx = this.normalizeAccount(txReceiverAccount);
    const normalizedExpected = this.normalizeAccount(expectedAccount);

    // Exact match
    if (normalizedTx === normalizedExpected) return true;

    // Partial match (for masked accounts) - check if visible digits match
    // If expected account is shorter, it might be a suffix
    if (
      normalizedExpected.length > 0 &&
      normalizedTx.endsWith(normalizedExpected)
    ) {
      return true;
    }

    // Also check name if available
    if (txReceiverName && expectedName) {
      const normalizedTxName = txReceiverName.toLowerCase().trim();
      const normalizedExpectedName = expectedName.toLowerCase().trim();
      if (normalizedTxName === normalizedExpectedName) {
        return true;
      }
    }

    return false;
  }

  /**
   * Require merchant membership from request
   */
  private async requireMembership(req: Request) {
    // Better Auth attaches user to request
    interface RequestWithUser extends Request {
      user?: { id: string };
    }
    const reqWithUser = req as RequestWithUser;
    const userId = reqWithUser.user?.id;
    if (!userId) {
      throw new ForbiddenException('Not authenticated');
    }

    const membership = await (this.prisma as any).merchantUser.findFirst({
      where: { userId },
      select: {
        id: true,
        merchantId: true,
        role: true,
        status: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Merchant membership required');
    }

    if (membership.status !== 'ACTIVE') {
      throw new ForbiddenException('Merchant membership is not active');
    }

    return {
      merchantId: membership.merchantId,
      merchantUserId: membership.id,
      userId,
      role: membership.role,
    };
  }
}
