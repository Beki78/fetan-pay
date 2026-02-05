import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PrismaClient from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../../database/prisma.service';
import { MerchantUsersService } from '../merchant-users/merchant-users.service';
import { VerificationService } from '../verifier/services/verification.service';
import { WalletService } from '../wallet/wallet.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { UsageTrackerService } from '../../common/services/usage-tracker.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { DisableReceiverDto } from './dto/disable-receiver.dto';
import { SetActiveReceiverDto } from './dto/set-active-receiver.dto';
import { SubmitPaymentClaimDto } from './dto/submit-payment-claim.dto';
import { VerifyMerchantPaymentDto } from './dto/verify-merchant-payment.dto';
import { LogTransactionDto } from './dto/log-transaction.dto';
import {
  ListVerificationHistoryDto,
  type PaymentVerificationStatus,
} from './dto/list-verification-history.dto';

type TipsRange = { from?: string; to?: string };

@Injectable()
export class PaymentsService {
  private readonly paymentPageUrl: string;
  private readonly receiptsDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantUsersService: MerchantUsersService,
    private readonly verificationService: VerificationService,
    private readonly walletService: WalletService,
    private readonly webhooksService: WebhooksService,
    private readonly usageTracker: UsageTrackerService,
    private readonly configService: ConfigService,
  ) {
    // Get payment page URL from environment variables
    // This is where payment links will redirect users
    this.paymentPageUrl =
      this.configService.get<string>('PAYMENT_PAGE_URL') ||
      this.configService.get<string>('FRONTEND_URL') ||
      (process.env.NODE_ENV === 'production'
        ? 'https://fetanpay.et'
        : 'http://localhost:3000');

    // Setup receipts directory
    this.receiptsDir = path.join(process.cwd(), 'public', 'receipts');
    if (!fs.existsSync(this.receiptsDir)) {
      fs.mkdirSync(this.receiptsDir, { recursive: true });
    }
  }

  private paymentStatusEnum():
    | { VERIFIED: 'VERIFIED'; UNVERIFIED: 'UNVERIFIED'; PENDING: 'PENDING' }
    | undefined {
    // Prisma enum access - using type assertion for enum access
    return PrismaClient.PaymentVerificationStatus as unknown as
      | { VERIFIED: 'VERIFIED'; UNVERIFIED: 'UNVERIFIED'; PENDING: 'PENDING' }
      | undefined;
  }

  private normalizeAccount(raw?: string | null): string {
    return (raw ?? '')
      .toString()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .trim()
      .toLowerCase();
  }

  private normalizeAmountToCents(amount: number): number {
    // Avoid float errors by rounding to cents.
    return Math.round(amount * 100);
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

  private extractVerifierSenderName(
    payload: Record<string, unknown>,
  ): string | undefined {
    // Common fields for sender/payer name across providers
    const s =
      payload?.sender ||
      payload?.senderName ||
      payload?.payer ||
      payload?.payerName;
    if (typeof s === 'string' && s.trim()) return s.trim();
    return undefined;
  }

  private normalizeName(raw?: string | null): string {
    return (raw ?? '')
      .toString()
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private accountDigits(raw?: string | null): string {
    return (raw ?? '').toString().replace(/\D/g, '');
  }

  private accountLooksMasked(raw?: string | null): boolean {
    return /\*{2,}|x{2,}/i.test(raw ?? '');
  }

  /**
   * Receiver matching rules:
   * 1) Exact match after normalization (best).
   * 2) If receipt is masked (e.g., 01320******3801), fall back to last N digits match.
   * 3) If a receiverName is configured, also require name match when using the masked fallback.
   */
  private receiverAccountMatches(
    txReceiverAccount: string | undefined,
    configuredReceiverAccount: string,
    txReceiverName?: string,
    configuredReceiverName?: string | null,
  ): boolean {
    if (!txReceiverAccount) return false;

    const exact =
      this.normalizeAccount(txReceiverAccount) ===
      this.normalizeAccount(configuredReceiverAccount);
    if (exact) return true;

    // Masked fallback
    if (!this.accountLooksMasked(txReceiverAccount)) return false;

    const txDigits = this.accountDigits(txReceiverAccount);
    const cfgDigits = this.accountDigits(configuredReceiverAccount);
    if (!txDigits || !cfgDigits) return false;

    const last = 4; // common masking keeps last 4 digits visible
    const txTail = txDigits.slice(-last);
    const cfgTail = cfgDigits.slice(-last);
    if (!txTail || txTail.length < last) return false;
    if (txTail !== cfgTail) return false;

    // If merchant has a receiverName configured, require it to match too for safety.
    const cfgName = this.normalizeName(configuredReceiverName);
    if (cfgName) {
      const txName = this.normalizeName(txReceiverName);
      if (!txName) return false;
      // Use includes both ways to be resilient to middle names / spacing differences.
      return txName.includes(cfgName) || cfgName.includes(txName);
    }

    return true;
  }

  private extractVerifierReference(
    payload: Record<string, unknown>,
    fallback: string,
  ): string {
    const r = payload?.reference;
    return typeof r === 'string' && r.trim() ? r.trim() : fallback;
  }

  private async runCoreVerifier(
    provider: PrismaClient.TransactionProvider,
    reference: string,
  ) {
    switch (provider) {
      case PrismaClient.TransactionProvider.CBE:
        // Smart-only, no suffix required
        return this.verificationService.verifyCbeSmart(reference);
      case PrismaClient.TransactionProvider.TELEBIRR:
        return this.verificationService.verifyTelebirr(reference);
      case PrismaClient.TransactionProvider.AWASH:
        return this.verificationService.verifyAwashSmart(reference);
      case PrismaClient.TransactionProvider.BOA:
        return this.verificationService.verifyAbyssiniaSmart(reference);
      case PrismaClient.TransactionProvider.DASHEN:
        return this.verificationService.verifyDashen(reference);
      default:
        throw new BadRequestException('Unsupported provider');
    }
  }

  async verifyMerchantPayment(body: VerifyMerchantPaymentDto, req: Request) {
    const membership = await this.requireMembership(req);

    const tipAmount =
      body.tipAmount === undefined
        ? null
        : this.toDecimal(body.tipAmount as number, 'tipAmount');

    // Payment model currently requires an Order relation.
    // For merchant direct-verification (no order flow), we'll create a lightweight OPEN order
    // only if we need to create a new Payment record.
    const existingPayment = await this.prisma.payment.findUnique({
      where: {
        payment_merchant_provider_reference_unique: {
          merchantId: membership.merchantId,
          provider: body.provider,
          reference: body.reference,
        },
      },
      select: { id: true, orderId: true, status: true, verifiedAt: true },
    });

    if (existingPayment?.status === 'VERIFIED') {
      // Trigger duplicate webhook before throwing
      this.webhooksService
        .triggerWebhook('payment.duplicate', membership.merchantId, {
          payment: {
            id: existingPayment.id,
            reference: body.reference,
            provider: body.provider,
            status: 'VERIFIED',
            verifiedAt: existingPayment.verifiedAt?.toISOString(),
          },
          merchant: {
            id: membership.merchantId,
          },
        })
        .catch((error) => {
          console.error(
            '[Webhooks] Error triggering payment.duplicate webhook:',
            error,
          );
        });

      throw new ConflictException(
        `Transaction already verified at ${existingPayment.verifiedAt?.toLocaleString() ?? 'an earlier time'}`,
      );
    }

    // Require ACTIVE receiver to verify (disabled means merchant intentionally paused).
    const activeReceiver = await this.prisma.merchantReceiverAccount.findFirst({
      where: {
        merchantId: membership.merchantId,
        provider: body.provider,
        status: 'ACTIVE',
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!activeReceiver) {
      throw new BadRequestException(
        `No active receiver account configured for provider ${body.provider}`,
      );
    }

    // Check wallet balance before verification if wallet is enabled
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id: membership.merchantId },
      select: {
        walletEnabled: true,
        walletBalance: true,
        walletChargeType: true,
        walletChargeValue: true,
        walletMinBalance: true,
      },
    });

    if (merchant?.walletEnabled) {
      // If wallet is enabled and balance is 0, reject immediately
      if (merchant.walletBalance.lte(0)) {
        throw new BadRequestException(
          'Wallet balance is insufficient. Please top up your wallet before verifying payments.',
        );
      }
    }

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
    const effectiveReference = this.extractVerifierReference(
      payloadRecord,
      body.reference,
    );
    const txSenderName = this.extractVerifierSenderName(payloadRecord);

    // If the effective reference differs from the input (e.g. casing, formatting from provider),
    // we must check again to see if we already verified the canonical reference.
    if (effectiveReference !== body.reference) {
      const canonicalPayment = await this.prisma.payment.findUnique({
        where: {
          payment_merchant_provider_reference_unique: {
            merchantId: membership.merchantId,
            provider: body.provider,
            reference: effectiveReference,
          },
        },
        select: { status: true, verifiedAt: true },
      });

      if (canonicalPayment?.status === 'VERIFIED') {
        throw new ConflictException(
          `Transaction already verified at ${canonicalPayment.verifiedAt?.toLocaleString() ?? 'an earlier time'}`,
        );
      }
    }

    // Use claimed amount if provided, otherwise use amount from bank response
    const claimedAmount =
      body.claimedAmount !== undefined
        ? this.toDecimal(body.claimedAmount, 'claimedAmount')
        : txAmount !== undefined
          ? this.toDecimal(txAmount, 'txAmount')
          : new Prisma.Decimal(0);

    // Amount matches if: no claimed amount provided (trust bank), or claimed matches bank response
    const amountMatches =
      body.claimedAmount === undefined ||
      (txAmount !== undefined &&
        this.normalizeAmountToCents(txAmount) ===
          this.normalizeAmountToCents(body.claimedAmount));

    // Check wallet balance after getting payment amount (before marking as verified)
    if (merchant?.walletEnabled && claimedAmount.gt(0)) {
      const chargeAmount = await this.walletService.calculateCharge(
        membership.merchantId,
        claimedAmount,
      );

      if (chargeAmount && chargeAmount.gt(0)) {
        const currentBalance = merchant.walletBalance;
        const newBalance = currentBalance.sub(chargeAmount);

        // Check minimum balance if set
        if (merchant.walletMinBalance) {
          if (newBalance.lt(merchant.walletMinBalance)) {
            throw new BadRequestException(
              `Insufficient wallet balance. Required: ${chargeAmount.toFixed(2)} ETB, Available: ${currentBalance.toFixed(2)} ETB, Minimum balance: ${merchant.walletMinBalance.toFixed(2)} ETB. Please top up your wallet.`,
            );
          }
        } else {
          // No minimum balance set, but still check if balance goes negative
          if (newBalance.lt(0)) {
            throw new BadRequestException(
              `Insufficient wallet balance. Required: ${chargeAmount.toFixed(2)} ETB, Available: ${currentBalance.toFixed(2)} ETB. Please top up your wallet.`,
            );
          }
        }
      }
    }

    const receiverMatches = this.receiverAccountMatches(
      txReceiverAccount,
      activeReceiver.receiverAccount,
      txReceiverName,
      activeReceiver.receiverName,
    );

    const PaymentStatus = this.paymentStatusEnum();
    if (!PaymentStatus) {
      throw new BadRequestException(
        'Server misconfiguration: PaymentVerificationStatus enum not available',
      );
    }

    // Verify if: reference found AND receiver matches (amount check only if claimed amount provided)
    const status =
      referenceFound && receiverMatches && amountMatches
        ? PaymentStatus.VERIFIED
        : PaymentStatus.UNVERIFIED;

    // Create order only if we need to save a verified payment
    const order =
      status === PaymentStatus.VERIFIED && !existingPayment
        ? await this.prisma.order.create({
            data: {
              merchantId: membership.merchantId,
              expectedAmount: claimedAmount,
              currency: 'ETB',
              status: 'OPEN',
            },
          })
        : null;

    // Only save payment record if status is VERIFIED
    let payment: any = null;
    if (status === PaymentStatus.VERIFIED) {
      payment = await this.prisma.payment.upsert({
        where: {
          payment_merchant_provider_reference_unique: {
            merchantId: membership.merchantId,
            provider: body.provider,
            reference: effectiveReference,
          },
        },
        update: {
          ...(order ? { order: { connect: { id: order.id } } } : {}),
          claimedAmount,
          tipAmount,
          status,
          mismatchReason: null,
          receiverAccount: { connect: { id: activeReceiver.id } },
          verificationPayload: normalizedPayload as Prisma.InputJsonValue,
          verifiedAt: new Date(),
          // Set verifiedBy based on authentication type
          ...(membership.merchantUserId
            ? { verifiedBy: { connect: { id: membership.merchantUserId } } }
            : {}),
        },
        create: {
          merchant: { connect: { id: membership.merchantId } },
          order: {
            connect: {
              id:
                (existingPayment &&
                'orderId' in existingPayment &&
                existingPayment.orderId
                  ? existingPayment.orderId
                  : null) ??
                order?.id ??
                '',
            },
          },
          provider: body.provider,
          reference: body.reference, // Store the original user-entered reference
          claimedAmount,
          tipAmount,
          status,
          mismatchReason: null,
          receiverAccount: { connect: { id: activeReceiver.id } },
          verificationPayload: normalizedPayload as Prisma.InputJsonValue,
          verifiedAt: new Date(),
          // Set verifiedBy based on authentication type
          ...(membership.merchantUserId
            ? { verifiedBy: { connect: { id: membership.merchantUserId } } }
            : {}),
        },
        include: {
          receiverAccount: true,
          verifiedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Charge wallet if enabled (after payment is created)
      if (payment) {
        try {
          const walletChargeResult = await this.walletService.chargeForPayment(
            membership.merchantId,
            payment.id,
            claimedAmount,
          );

          if (!walletChargeResult.success && walletChargeResult.error) {
            // Log error but don't fail the payment verification
            // Payment is already verified, wallet charge failed
            console.error(
              `[Wallet] Failed to charge wallet for payment ${payment.id}:`,
              walletChargeResult.error,
            );
            // Optionally: You could throw an error here to rollback payment verification
            // For now, we allow payment verification to succeed even if wallet charge fails
            // This can be changed based on business requirements
          }
        } catch (error) {
          // Log error but don't fail payment verification
          console.error(
            `[Wallet] Error charging wallet for payment ${payment.id}:`,
            error,
          );
        }
      }
    }

    // Trigger webhooks based on payment status
    if (status === PaymentStatus.VERIFIED && payment) {
      // Track verification usage for subscription limits
      try {
        await this.usageTracker.trackVerification(membership.merchantId);
      } catch (error) {
        console.error('[Usage] Error tracking verification usage:', error);
        // Don't fail the payment verification if usage tracking fails
      }

      // Payment verified successfully
      this.webhooksService
        .triggerWebhook('payment.verified', membership.merchantId, {
          payment: {
            id: payment.id,
            reference: effectiveReference,
            provider: body.provider,
            amount: claimedAmount.toNumber(),
            status: 'VERIFIED',
            verifiedAt: payment.verifiedAt?.toISOString(),
            tipAmount: tipAmount?.toNumber() ?? null,
          },
          merchant: {
            id: membership.merchantId,
          },
        })
        .catch((error) => {
          console.error(
            '[Webhooks] Error triggering payment.verified webhook:',
            error,
          );
        });
    } else if (status === PaymentStatus.UNVERIFIED) {
      // Payment verification failed
      this.webhooksService
        .triggerWebhook('payment.unverified', membership.merchantId, {
          payment: {
            reference: body.reference,
            provider: body.provider,
            amount: claimedAmount.toNumber(),
            status: 'UNVERIFIED',
            checks: {
              referenceFound,
              receiverMatches,
              amountMatches,
            },
          },
          merchant: {
            id: membership.merchantId,
          },
        })
        .catch((error) => {
          console.error(
            '[Webhooks] Error triggering payment.unverified webhook:',
            error,
          );
        });
    }

    return {
      status,
      payment,
      checks: {
        referenceFound,
        receiverMatches,
        amountMatches,
      },
      transaction: {
        reference: effectiveReference,
        receiverAccount: txReceiverAccount ?? null,
        receiverName: txReceiverName ?? null,
        amount: txAmount ?? null,

        senderName: txSenderName ?? null,
        raw: normalizedPayload,
      },
    };
  }

  async listVerificationHistory(
    query: ListVerificationHistoryDto,
    req: Request,
  ) {
    const membership = await this.requireMembership(req);

    // Defensive parsing: depending on global validation/transform setup,
    // query params may still arrive as strings.
    const page = Math.max(1, Number(query.page ?? 1) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(query.pageSize ?? 20) || 20),
    );
    const skip = (page - 1) * pageSize;

    const where: Prisma.PaymentWhereInput = {
      merchantId: membership.merchantId,
      ...(query.provider ? { provider: query.provider } : {}),
      ...(query.status
        ? { status: query.status as PaymentVerificationStatus }
        : {}),
      ...(query.reference ? { reference: query.reference } : {}),
    };

    // Security: Waiter/Sales can only see their own verification history.
    // API key auth doesn't have role restrictions
    const restrictedRoles = ['WAITER', 'SALES'];
    if (
      membership.role &&
      restrictedRoles.includes(membership.role) &&
      membership.merchantUserId
    ) {
      where.verifiedById = membership.merchantUserId;
    }

    // Date range applies to verifiedAt if present, otherwise fall back to updatedAt.
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    if (query.from && Number.isNaN(from?.getTime())) {
      throw new BadRequestException('Invalid from date');
    }
    if (query.to && Number.isNaN(to?.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    if (from || to) {
      where.OR = [
        {
          verifiedAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        },
        {
          verifiedAt: null,
          updatedAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          receiverAccount: true,
          verifiedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      data,
    };
  }

  /**
   * Contract:
   * - Uses the current authenticated user to resolve MerchantUser + merchantId.
   * - Only one ACTIVE receiver per (merchant, provider) is enforced by marking previous ACTIVE as INACTIVE.
   * - Handles account number updates by deleting old records with different account numbers.
   */
  async setActiveReceiverAccount(body: SetActiveReceiverDto, req: Request) {
    const membership = await this.requireMembership(req);

    const desiredStatus = body.enabled === false ? 'INACTIVE' : 'ACTIVE';

    return this.prisma.$transaction(async (tx) => {
      // Step 1: Find existing record for this merchant + provider (regardless of account number)
      // We only allow one receiver account per merchant + provider combination
      const existingRecord = await tx.merchantReceiverAccount.findFirst({
        where: {
          merchantId: membership.merchantId,
          provider: body.provider,
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Step 2: If we're enabling this receiver, deactivate all other ACTIVE receivers for this provider
      if (desiredStatus === 'ACTIVE') {
        await tx.merchantReceiverAccount.updateMany({
          where: {
            merchantId: membership.merchantId,
            provider: body.provider,
            status: 'ACTIVE',
          },
          data: { status: 'INACTIVE' },
        });
      }

      // Step 3: If existing record has a different account number, delete it
      // (because unique constraint is on merchantId + provider + receiverAccount)
      if (
        existingRecord &&
        existingRecord.receiverAccount !== body.receiverAccount
      ) {
        await tx.merchantReceiverAccount.delete({
          where: { id: existingRecord.id },
        });
      }

      // Step 4: Upsert the receiver account with the new/updated data
      const result = await tx.merchantReceiverAccount.upsert({
        where: {
          merchant_receiver_account_unique: {
            merchantId: membership.merchantId,
            provider: body.provider,
            receiverAccount: body.receiverAccount,
          },
        },
        update: {
          status: desiredStatus,
          receiverLabel: body.receiverLabel,
          receiverName: body.receiverName,
          receiverAccount: body.receiverAccount,
          meta: (body.meta ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        },
        create: {
          merchantId: membership.merchantId,
          provider: body.provider,
          status: desiredStatus,
          receiverAccount: body.receiverAccount,
          receiverLabel: body.receiverLabel,
          receiverName: body.receiverName,
          meta: (body.meta ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        },
      });

      return { active: result };
    });
  }

  async getActiveReceiverAccount(provider: string | undefined, req: Request) {
    const membership = await this.requireMembership(req);

    let providerEnum: PrismaClient.TransactionProvider | undefined;
    if (provider) {
      if (
        !Object.values(PrismaClient.TransactionProvider).includes(
          provider as PrismaClient.TransactionProvider,
        )
      ) {
        throw new BadRequestException('Invalid provider');
      }
      providerEnum = provider as any;
    }

    // NOTE: despite the name, this endpoint returns BOTH ACTIVE and INACTIVE receiver accounts
    // for the provider(s). The UI uses this to show "Active" vs "Disabled" without losing
    // the configured account details.
    const where: any = {
      merchantId: membership.merchantId,
      ...(providerEnum ? { provider: providerEnum } : {}),
    };

    const data = await this.prisma.merchantReceiverAccount.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return { data };
  }

  /**
   * Disable the currently ACTIVE receiver account for a provider by marking it INACTIVE.
   * This preserves history while preventing future verifications from using it.
   */
  async disableActiveReceiverAccount(body: DisableReceiverDto, req: Request) {
    const membership = await this.requireMembership(req);

    const updated = await this.prisma.merchantReceiverAccount.updateMany({
      where: {
        merchantId: membership.merchantId,
        provider: body.provider,
        status: 'ACTIVE',
      },
      data: { status: 'INACTIVE' },
    });

    return { disabledCount: updated.count };
  }

  /**
   * Enable a previously configured receiver account for a provider.
   * Strategy: pick the most recently updated receiver account for that provider and mark it ACTIVE.
   * This keeps configuration (receiverAccount/receiverName) without forcing the user to re-enter it.
   */
  async enableLastReceiverAccount(body: DisableReceiverDto, req: Request) {
    const membership = await this.requireMembership(req);

    return this.prisma.$transaction(async (tx) => {
      const latest = await tx.merchantReceiverAccount.findFirst({
        where: {
          merchantId: membership.merchantId,
          provider: body.provider,
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (!latest) {
        throw new NotFoundException(
          `No receiver account configured for provider ${body.provider}`,
        );
      }

      await tx.merchantReceiverAccount.updateMany({
        where: {
          merchantId: membership.merchantId,
          provider: body.provider,
          status: 'ACTIVE',
        },
        data: { status: 'INACTIVE' },
      });

      const enabled = await tx.merchantReceiverAccount.update({
        where: { id: latest.id },
        data: { status: 'ACTIVE' },
      });

      return { enabled };
    });
  }

  /** Simple mock: create an order in OPEN status for the current merchant */
  async createOrder(body: CreateOrderDto, req: Request) {
    const membership = await this.requireMembership(req);

    const expectedAmount = this.toDecimal(
      body.expectedAmount,
      'expectedAmount',
    );
    const currency = (body.currency ?? 'ETB').trim() || 'ETB';

    const order = await this.prisma.order.create({
      data: {
        merchantId: membership.merchantId,
        expectedAmount,
        currency,
        payerName: body.payerName?.trim() || null,
      },
    });

    // Generate transaction reference (format: TXN + 12 random alphanumeric chars)
    const generateTransactionRef = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'TXN';
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const transactionRef = generateTransactionRef();
    const paymentLink = `${this.paymentPageUrl}/pay/${transactionRef}`;

    const selectedProvider = body.provider || 'CBE';

    // Get active receiver account for selected provider to include in response
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const activeReceiver = await (
      this.prisma as any
    ).merchantReceiverAccount.findFirst({
      where: {
        merchantId: membership.merchantId,
        provider: selectedProvider,
        status: 'ACTIVE', //2
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Create transaction record with PENDING status
    // Set verifiedById to the merchant user who created this transaction (admin)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const transaction = await (this.prisma as any).transaction.create({
      data: {
        provider: selectedProvider,
        reference: transactionRef,
        qrUrl: paymentLink,
        status: 'PENDING',
        merchantId: membership.merchantId,
        verifiedById: membership.merchantUserId, // Set the admin who created this transaction
      },
      include: {
        verifiedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        merchant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create a PENDING payment record to link Order, Transaction, and ReceiverAccount
    // This allows the transaction details page to show the expected amount and receiver info
    if (activeReceiver) {
      await (this.prisma as any).payment.create({
        data: {
          merchantId: membership.merchantId,
          orderId: order.id,
          transactionId: transaction.id,
          provider: selectedProvider,
          reference: transactionRef,
          claimedAmount: expectedAmount,
          status: 'PENDING',
          receiverAccountId: activeReceiver.id,
          verifiedById: membership.merchantUserId,
        },
      });
    }

    return { order, transaction, receiverAccount: activeReceiver };
  }

  /**
   * Verification logic (simple version):
   * - amountMatches: claimedAmount == order.expectedAmount
   * - receiverMatches: transaction receiver matches merchant active receiver (mock: exact match on receiverAccount)
   *
   * For now, receiver matching is mocked:
   * - if we have an active receiver account, we require that the Transaction.verificationPayload contains
   *   { receiverAccount: string } and it equals the active receiverAccount.
   * - if we don't have a Transaction record yet, we mark UNVERIFIED with reason.
   */
  async submitAndVerifyClaim(body: SubmitPaymentClaimDto, req: Request) {
    const membership = await this.requireMembership(req);

    const order = await this.prisma.order.findFirst({
      where: { id: body.orderId, merchantId: membership.merchantId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const claimedAmount = this.toDecimal(body.claimedAmount, 'claimedAmount');
    const tipAmount =
      body.tipAmount === undefined
        ? null
        : this.toDecimal(body.tipAmount, 'tipAmount');

    const activeReceiver = await this.prisma.merchantReceiverAccount.findFirst({
      where: {
        merchantId: membership.merchantId,
        provider: body.provider,
        status: 'ACTIVE',
      },
    });
    if (!activeReceiver) {
      throw new BadRequestException(
        `No active receiver account configured for provider ${body.provider}`,
      );
    }

    // optional: link to existing Transaction record if present
    const txRecord = await this.prisma.transaction.findUnique({
      where: {
        transaction_provider_reference_key: {
          provider: body.provider,
          reference: body.reference,
        },
      },
    });

    const amountMatches = order.expectedAmount.equals(claimedAmount);

    const receiverAccountFromPayload = this.extractReceiverAccount(
      txRecord?.verificationPayload,
    );
    const receiverMatches =
      receiverAccountFromPayload != null &&
      receiverAccountFromPayload === activeReceiver.receiverAccount;

    const PaymentStatus = this.paymentStatusEnum();
    if (!PaymentStatus) {
      throw new BadRequestException(
        'Server misconfiguration: PaymentVerificationStatus enum not available',
      );
    }

    const status =
      amountMatches && receiverMatches
        ? PaymentStatus.VERIFIED
        : PaymentStatus.UNVERIFIED;

    // Only save payment record if status is VERIFIED
    let payment: any = null;
    if (status === PaymentStatus.VERIFIED) {
      payment = await this.prisma.payment.upsert({
        where: {
          payment_merchant_provider_reference_unique: {
            merchantId: membership.merchantId,
            provider: body.provider,
            reference: body.reference,
          },
        },
        update: {
          orderId: order.id,
          claimedAmount,
          tipAmount,
          receiverAccountId: activeReceiver.id,
          transactionId: txRecord?.id ?? null,
          status,
          verifiedAt: new Date(),
          verifiedById: membership.merchantUserId,
          mismatchReason: null,
          verificationPayload: (txRecord?.verificationPayload ??
            Prisma.JsonNull) as Prisma.InputJsonValue,
        },
        create: {
          merchantId: membership.merchantId,
          orderId: order.id,
          provider: body.provider,
          reference: body.reference,
          claimedAmount,
          tipAmount,
          receiverAccountId: activeReceiver.id,
          transactionId: txRecord?.id ?? null,
          status,
          verifiedAt: new Date(),
          verifiedById: membership.merchantUserId,
          mismatchReason: null,
          verificationPayload: (txRecord?.verificationPayload ??
            Prisma.JsonNull) as Prisma.InputJsonValue,
        },
        include: {
          order: true,
          receiverAccount: true,
          transaction: true,
          verifiedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // If verified, mark order as PAID
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });

      // Track verification usage for subscription limits
      try {
        await this.usageTracker.trackVerification(membership.merchantId);
      } catch (error) {
        console.error('[Usage] Error tracking verification usage:', error);
        // Don't fail the payment verification if usage tracking fails
      }
    }

    return {
      status,
      payment,
      checks: {
        amountMatches,
        receiverMatches,
      },
    };
  }

  async getPayment(paymentId: string, req: Request) {
    const membership = await this.requireMembership(req);
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, merchantId: membership.merchantId },
      include: {
        order: true,
        receiverAccount: true,
        transaction: true,
        verifiedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    // Security: Waiter/Sales can only view payments they verified.
    // API key auth doesn't have role restrictions
    const restrictedRoles = ['WAITER', 'SALES'];
    if (
      membership.role &&
      restrictedRoles.includes(membership.role) &&
      membership.merchantUserId &&
      payment.verifiedById !== membership.merchantUserId
    ) {
      throw new ForbiddenException(
        'You are not authorized to view this payment',
      );
    }

    return { payment };
  }

  async getTipsSummary(range: TipsRange, req: Request) {
    const membership = await this.requireMembership(req);

    const from = range.from ? new Date(range.from) : undefined;
    const to = range.to ? new Date(range.to) : undefined;
    if (range.from && Number.isNaN(from?.getTime())) {
      throw new BadRequestException('Invalid from date');
    }
    if (range.to && Number.isNaN(to?.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    const where: Prisma.PaymentWhereInput = {
      merchantId: membership.merchantId,
      tipAmount: { not: null },
      // Filter by the current user so they only see their own tips
      verifiedById: membership.merchantUserId,
    };

    // Add date range filter if provided
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const [count, sum] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.aggregate({
        where,
        _sum: { tipAmount: true },
      }),
    ]);

    return {
      count,
      totalTipAmount: sum._sum.tipAmount,
    };
  }

  async listTips(
    query: { from?: string; to?: string; page?: number; pageSize?: number },
    req: Request,
  ) {
    const membership = await this.requireMembership(req);

    const page = Math.max(1, Number(query.page ?? 1) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(query.pageSize ?? 20) || 20),
    );
    const skip = (page - 1) * pageSize;

    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    if (query.from && Number.isNaN(from?.getTime())) {
      throw new BadRequestException('Invalid from date');
    }
    if (query.to && Number.isNaN(to?.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    const where: Prisma.PaymentWhereInput = {
      merchantId: membership.merchantId,
      tipAmount: { not: null },
      // Filter by the current user so they only see their own tips
      verifiedById: membership.merchantUserId,
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          tipAmount: true,
          claimedAmount: true,
          reference: true,
          provider: true,
          status: true,
          createdAt: true,
          verifiedAt: true,
          verifiedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data,
    };
  }

  // Admin methods for tips management
  async getAdminTipsSummary(range: { from?: string; to?: string }) {
    const from = range.from ? new Date(range.from) : undefined;
    const to = range.to ? new Date(range.to) : undefined;
    if (range.from && Number.isNaN(from?.getTime())) {
      throw new BadRequestException('Invalid from date');
    }
    if (range.to && Number.isNaN(to?.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    const where: Prisma.PaymentWhereInput = {
      tipAmount: { not: null },
      // Add date range filter if provided
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [count, sum] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.aggregate({
        where,
        _sum: { tipAmount: true },
      }),
    ]);

    return {
      count,
      totalTipAmount: sum._sum.tipAmount,
    };
  }

  async listAllTips(query: {
    merchantId?: string;
    provider?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, Number(query.page ?? 1) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(query.pageSize ?? 20) || 20),
    );
    const skip = (page - 1) * pageSize;

    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    if (query.from && Number.isNaN(from?.getTime())) {
      throw new BadRequestException('Invalid from date');
    }
    if (query.to && Number.isNaN(to?.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    const where: Prisma.PaymentWhereInput = {
      tipAmount: { not: null },
      ...(query.merchantId ? { merchantId: query.merchantId } : {}),
      ...(query.provider
        ? { provider: query.provider as PrismaClient.TransactionProvider }
        : {}),
      ...(query.status
        ? { status: query.status as PrismaClient.PaymentVerificationStatus }
        : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          tipAmount: true,
          claimedAmount: true,
          reference: true,
          provider: true,
          status: true,
          createdAt: true,
          verifiedAt: true,
          verifiedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          merchant: {
            select: {
              id: true,
              name: true,
              contactEmail: true,
            },
          },
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data,
    };
  }

  async getTipsAnalytics(range: { from?: string; to?: string }) {
    const from = range.from ? new Date(range.from) : undefined;
    const to = range.to ? new Date(range.to) : undefined;
    if (range.from && Number.isNaN(from?.getTime())) {
      throw new BadRequestException('Invalid from date');
    }
    if (range.to && Number.isNaN(to?.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    const where: Prisma.PaymentWhereInput = {
      tipAmount: { not: null },
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [summary, byProvider] = await Promise.all([
      this.prisma.payment.aggregate({
        where,
        _sum: { tipAmount: true },
        _count: { id: true },
        _avg: { tipAmount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['provider'],
        where,
        _sum: { tipAmount: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalTips: summary._sum.tipAmount || 0,
      totalCount: summary._count.id,
      averageTip: summary._avg.tipAmount || 0,
      byProvider: byProvider.map((p) => ({
        provider: p.provider,
        totalTips: p._sum.tipAmount || 0,
        count: p._count.id,
      })),
    };
  }

  async getTipsByMerchant(range: { from?: string; to?: string }) {
    const from = range.from ? new Date(range.from) : undefined;
    const to = range.to ? new Date(range.to) : undefined;
    if (range.from && Number.isNaN(from?.getTime())) {
      throw new BadRequestException('Invalid from date');
    }
    if (range.to && Number.isNaN(to?.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    const where: Prisma.PaymentWhereInput = {
      tipAmount: { not: null },
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const byMerchant = await this.prisma.payment.groupBy({
      by: ['merchantId'],
      where,
      _sum: { tipAmount: true },
      _count: { id: true },
      _avg: { tipAmount: true },
    });

    // Get merchant details
    const merchantIds = byMerchant.map((m) => m.merchantId);
    const merchants = await this.prisma.merchant.findMany({
      where: { id: { in: merchantIds } },
      select: { id: true, name: true },
    });

    const merchantMap = new Map(merchants.map((m) => [m.id, m.name]));

    return byMerchant.map((m) => ({
      merchantId: m.merchantId,
      merchantName: merchantMap.get(m.merchantId) || 'Unknown',
      totalTips: m._sum.tipAmount || 0,
      tipCount: m._count.id,
      averageTip: m._avg.tipAmount || 0,
    }));
  }

  /**
   * Log a transaction (cash or bank payment)
   * Creates an order and payment record for manual transaction logging
   */
  async logTransaction(
    body: LogTransactionDto,
    req: Request,
    receiptFile?: Express.Multer.File,
  ) {
    const membership = await this.requireMembership(req);

    const amount = this.toDecimal(body.amount, 'amount');
    const tipAmount =
      body.tipAmount !== undefined && body.tipAmount > 0
        ? this.toDecimal(body.tipAmount, 'tipAmount')
        : null;

    // Generate unique reference for the transaction
    const generateReference = (prefix: string) => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `${prefix}-${timestamp}-${random}`;
    };

    // Create order
    const order = await this.prisma.order.create({
      data: {
        merchantId: membership.merchantId,
        expectedAmount: amount,
        currency: 'ETB',
        status: 'PAID', // Mark as paid immediately for logged transactions
        payerName: null,
      },
    });

    let provider: PrismaClient.TransactionProvider;
    let reference: string;
    let receiverAccountId: string | null = null;

    if (body.paymentMethod === 'cash') {
      // For cash transactions, use a special reference format
      reference = generateReference('CASH');
      // Cash doesn't have a provider in the enum, so we'll use CBE as a placeholder
      // but store the payment method in verificationPayload
      provider = 'CBE' as PrismaClient.TransactionProvider;
    } else {
      // For bank transactions
      if (!body.provider && !body.otherBankName) {
        throw new BadRequestException(
          'Provider or otherBankName is required for bank transactions',
        );
      }

      if (body.provider) {
        provider = body.provider;
        reference = generateReference(provider);
      } else {
        // For other banks, use CBE as placeholder but store bank name in payload
        provider = 'CBE' as PrismaClient.TransactionProvider;
        reference = generateReference('BANK');
      }

      // Try to get active receiver account for the provider
      if (body.provider) {
        const activeReceiver =
          await this.prisma.merchantReceiverAccount.findFirst({
            where: {
              merchantId: membership.merchantId,
              provider: body.provider,
              status: 'ACTIVE',
            },
            orderBy: { updatedAt: 'desc' },
          });
        receiverAccountId = activeReceiver?.id ?? null;
      }
    }

    // Handle receipt upload for bank transactions
    let receiptUrl: string | undefined;
    if (receiptFile && body.paymentMethod === 'bank') {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const ext = path.extname(receiptFile.originalname) || '.jpg';
      const filename = `receipt-${timestamp}-${random}${ext}`;
      const filePath = path.join(this.receiptsDir, filename);

      // Save file
      fs.writeFileSync(
        filePath,
        receiptFile.buffer || fs.readFileSync(receiptFile.path),
      );

      // Clean up temp file if it exists
      if (receiptFile.path && fs.existsSync(receiptFile.path)) {
        fs.unlinkSync(receiptFile.path);
      }

      receiptUrl = `/receipts/${filename}`;
    } else if (receiptFile && body.paymentMethod === 'cash') {
      // Reject receipt for cash transactions
      throw new BadRequestException(
        'Receipt upload is only allowed for bank transactions',
      );
    }

    // Build verification payload with metadata
    const verificationPayload: Record<string, unknown> = {
      paymentMethod: body.paymentMethod,
      loggedAt: new Date().toISOString(),
    };

    if (body.note) {
      verificationPayload.note = body.note;
    }

    if (receiptUrl) {
      verificationPayload.receiptUrl = receiptUrl;
    }

    if (body.paymentMethod === 'cash') {
      verificationPayload.isCash = true;
    } else if (body.otherBankName) {
      verificationPayload.otherBankName = body.otherBankName;
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        merchantId: membership.merchantId,
        orderId: order.id,
        provider,
        reference,
        claimedAmount: amount,
        tipAmount,
        receiverAccountId,
        status: 'VERIFIED', // Logged transactions are considered verified
        verifiedAt: new Date(),
        verifiedById: membership.merchantUserId,
        verificationPayload: verificationPayload as Prisma.InputJsonValue,
      },
      include: {
        order: true,
        receiverAccount: true,
        verifiedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Track verification usage for subscription limits
    try {
      await this.usageTracker.trackVerification(membership.merchantId);
    } catch (error) {
      console.error('[Usage] Error tracking verification usage:', error);
      // Don't fail the transaction logging if usage tracking fails
    }

    return {
      payment,
      order,
    };
  }

  private async requireMembership(req: Request) {
    // Check if API key authentication was used
    const reqWithAuth = req as any;
    if (reqWithAuth.authType === 'api_key' && reqWithAuth.merchantId) {
      // API key authentication - return merchant context directly
      return {
        merchantId: reqWithAuth.merchantId,
        merchantUserId: null, // API keys don't have a specific merchant user
        userId: null,
        role: null,
      };
    }

    // Fall back to session authentication (Better Auth)
    interface RequestWithUser extends Request {
      user?: { id: string };
    }
    const reqWithUser = req as RequestWithUser;
    const userId = reqWithUser.user?.id;
    if (!userId) {
      throw new ForbiddenException('Not authenticated');
    }

    const membership = await this.merchantUsersService.me(req);
    interface MembershipResponse {
      membership?: {
        id: string;
        role: string;
        merchant?: {
          id: string;
        };
      };
    }
    const membershipData = membership as MembershipResponse;
    const merchantId = membershipData.membership?.merchant?.id;
    const merchantUserId = membershipData.membership?.id;
    const role = membershipData.membership?.role;

    if (!merchantId || !merchantUserId || !role) {
      throw new ForbiddenException('Merchant membership required');
    }

    return { merchantId, merchantUserId, userId, role };
  }

  private toDecimal(value: number, field: string) {
    if (!Number.isFinite(value))
      throw new BadRequestException(`${field} is invalid`);
    // Prisma Decimal accepts string/number but we normalize via string to preserve precision.
    return new Prisma.Decimal(value.toFixed(2));
  }

  private extractReceiverAccount(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') return null;
    const obj = payload as Record<string, unknown>;
    const candidate =
      (typeof obj.receiverAccount === 'string' && obj.receiverAccount) ||
      (typeof obj.receiver_account === 'string' && obj.receiver_account) ||
      (typeof obj.receiverMsisdn === 'string' && obj.receiverMsisdn) ||
      (typeof obj.msisdn === 'string' && obj.msisdn) ||
      null;
    return candidate ? String(candidate).trim() : null;
  }

  private buildMismatchReason(input: {
    amountMatches: boolean;
    receiverMatches: boolean;
    receiverAccountFromPayload: string | null;
    expectedAmount: string;
    claimedAmount: string;
    activeReceiverAccount: string;
  }): string {
    const parts: string[] = [];
    if (!input.amountMatches) {
      parts.push(
        `Amount mismatch (expected ${input.expectedAmount}, got ${input.claimedAmount})`,
      );
    }
    if (!input.receiverMatches) {
      parts.push(
        `Receiver mismatch (expected ${input.activeReceiverAccount}, got ${input.receiverAccountFromPayload ?? 'unknown'})`,
      );
    }
    return parts.join('; ');
  }
}
