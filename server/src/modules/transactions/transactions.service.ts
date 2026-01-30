import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionProvider, TransactionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { VerificationService } from '../verifier/services/verification.service';
import { UsageTrackerService } from '../../common/services/usage-tracker.service';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { ListVerifiedByUserQueryDto } from './dto/list-verified-by-user.dto';
import { VerifyFromQrDto } from './dto/verify-from-qr.dto';
import { PublicVerifyDto } from './dto/public-verify.dto';
import type { Request } from 'express';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
    private readonly usageTracker: UsageTrackerService,
  ) {}

  async verifyFromQr(body: VerifyFromQrDto, req?: Request) {
    const parsedUrl = this.parseUrl(body.qrUrl);
    const provider = this.inferProvider(parsedUrl, body.provider);
    const reference = this.extractReference(parsedUrl, body.reference);

    if (!provider) {
      throw new BadRequestException(
        'Unable to determine provider from qrUrl; please supply provider explicitly',
      );
    }

    if (!reference) {
      throw new BadRequestException(
        'Unable to find a transaction reference in the QR payload; provide reference manually',
      );
    }

    let verificationPayload: Prisma.InputJsonValue | null = null;
    let status: TransactionStatus = TransactionStatus.PENDING;
    let errorMessage: string | undefined;

    try {
      verificationPayload = await this.runVerification(
        provider,
        reference,
        body.accountSuffix,
      );
      status = this.computeStatus(verificationPayload);
    } catch (error) {
      status = TransactionStatus.FAILED;
      errorMessage =
        error instanceof Error ? error.message : 'Verification failed';
    }

    const verifiedById = await this.resolveVerifiedById(req);

    const transaction = await this.prisma.transaction.upsert({
      where: {
        transaction_provider_reference_key: { provider, reference },
      },
      update: {
        qrUrl: body.qrUrl,
        status,
        verifiedAt: status === TransactionStatus.VERIFIED ? new Date() : null,
        verifiedById:
          status === TransactionStatus.VERIFIED ? verifiedById : null,
        verificationPayload: verificationPayload ?? Prisma.JsonNull,
        errorMessage,
      },
      create: {
        provider,
        reference,
        qrUrl: body.qrUrl,
        status,
        verifiedAt: status === TransactionStatus.VERIFIED ? new Date() : null,
        verifiedById:
          status === TransactionStatus.VERIFIED ? verifiedById : null,
        verificationPayload: verificationPayload ?? Prisma.JsonNull,
        errorMessage,
      },
    });

    return {
      provider,
      reference,
      status,
      transaction,
      verification: verificationPayload,
      error: errorMessage,
    };
  }

  async listTransactions(query: ListTransactionsQueryDto, req?: Request) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('pageSize must be a positive integer');
    }

    // Get merchant ID from request to scope transactions
    let merchantId: string | undefined;
    if (req) {
      try {
        const authUser = (req as any)?.user;
        const authUserId: string | undefined = authUser?.id;
        if (authUserId) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          const membership = await (this.prisma as any).merchantUser.findFirst({
            where: { userId: authUserId },
            select: { merchantId: true },
          });
          merchantId = membership?.merchantId;
        }
      } catch {
        // If we can't get merchant, continue without filtering (for admin access)
      }
    }

    // Mark expired transactions before listing
    const expiryThreshold = new Date(Date.now() - 20 * 60 * 1000);
    await (this.prisma as any).transaction.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: expiryThreshold },
        ...(merchantId ? { merchantId } : {}),
      },
      data: { status: 'EXPIRED' },
    });

    const where = {
      provider: query.provider,
      status: query.status,
      ...(merchantId ? { merchantId } : {}),
    } satisfies Prisma.TransactionWhereInput;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async getTransaction(idOrReference: string, req?: Request) {
    // Try to find by ID first, then by reference
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    let transaction = await (this.prisma as any).transaction.findFirst({
      where: {
        OR: [{ id: idOrReference }, { reference: idOrReference }],
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
        payments: {
          include: {
            order: {
              select: {
                id: true,
                expectedAmount: true,
                currency: true,
                status: true,
                createdAt: true,
              },
            },
            receiverAccount: {
              select: {
                receiverName: true,
                receiverAccount: true,
              },
            },
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // If request is provided, verify the transaction belongs to the merchant
    if (req && transaction.merchantId) {
      const authUser = (req as any)?.user;
      const authUserId: string | undefined = authUser?.id;

      if (authUserId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const membership = await (this.prisma as any).merchantUser.findFirst({
          where: { userId: authUserId },
          select: { merchantId: true },
        });

        if (membership?.merchantId !== transaction.merchantId) {
          throw new NotFoundException('Transaction not found');
        }
      }
    }

    return transaction;
  }

  /**
   * Get public payment details for a transaction (no auth required)
   * Returns limited info needed for payment page
   */
  async getPublicPaymentDetails(idOrReference: string) {
    const transaction = await (this.prisma as any).transaction.findFirst({
      where: {
        OR: [{ id: idOrReference }, { reference: idOrReference }],
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            branding: {
              select: {
                logoUrl: true,
                primaryColor: true,
                secondaryColor: true,
                displayName: true,
                tagline: true,
                showPoweredBy: true,
              },
            },
          },
        },
        verifiedBy: {
          select: {
            name: true,
          },
        },
        payments: {
          include: {
            order: {
              select: {
                id: true,
                expectedAmount: true,
                currency: true,
                status: true,
                payerName: true,
              },
            },
            receiverAccount: {
              select: {
                receiverName: true,
                receiverAccount: true,
                provider: true,
              },
            },
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Check if expired (20 minutes from creation)
    const createdAt = new Date(transaction.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 20 * 60 * 1000);
    const isExpired =
      new Date() > expiryTime || transaction.status === 'EXPIRED';

    const payment = transaction.payments?.[0];
    const order = payment?.order;
    const receiverAccount = payment?.receiverAccount;
    const branding = transaction.merchant?.branding;

    return {
      transactionId: transaction.id,
      reference: transaction.reference,
      status: isExpired ? 'EXPIRED' : transaction.status,
      provider: transaction.provider,
      createdAt: transaction.createdAt,
      expiresAt: expiryTime.toISOString(),
      isExpired,
      merchantName: branding?.displayName || transaction.merchant?.name || null,
      amount: order?.expectedAmount ? Number(order.expectedAmount) : 0,
      currency: order?.currency || 'ETB',
      receiverName: receiverAccount?.receiverName || null,
      receiverAccount: receiverAccount?.receiverAccount || null,
      receiverProvider: receiverAccount?.provider || null,
      payerName: order?.payerName || null,
      // Branding
      branding: branding
        ? {
            logoUrl: branding.logoUrl,
            primaryColor: branding.primaryColor,
            secondaryColor: branding.secondaryColor,
            displayName: branding.displayName,
            tagline: branding.tagline,
            showPoweredBy: branding.showPoweredBy,
          }
        : null,
    };
  }

  async publicVerify(body: PublicVerifyDto) {
    // Find the transaction
    const transaction = await (this.prisma as any).transaction.findFirst({
      where: {
        OR: [{ id: body.transactionId }, { reference: body.transactionId }],
      },
      include: {
        payments: {
          include: {
            order: true,
            receiverAccount: true,
          },
          take: 1,
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Check if already verified
    if (transaction.status === 'VERIFIED') {
      return {
        success: true,
        message: 'Payment already verified',
        status: 'VERIFIED',
      };
    }

    // Check if expired
    const createdAt = new Date(transaction.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 20 * 60 * 1000);
    if (new Date() > expiryTime || transaction.status === 'EXPIRED') {
      throw new BadRequestException('This payment has expired');
    }

    const payment = transaction.payments?.[0];
    if (!payment) {
      throw new BadRequestException(
        'No payment record found for this transaction',
      );
    }

    const receiverAccount = payment.receiverAccount;
    const accountSuffix = receiverAccount?.receiverAccount?.slice(-4);

    // Run verification against actual bank API
    let verificationPayload: Prisma.InputJsonValue | null = null;
    let errorMessage: string | undefined;
    let isVerified = false;

    try {
      verificationPayload = await this.runVerification(
        body.provider,
        body.reference,
        accountSuffix,
      );
      const computedStatus = this.computeStatus(verificationPayload);
      isVerified = computedStatus === TransactionStatus.VERIFIED;
    } catch (error) {
      // Don't change status to FAILED - keep as PENDING so user can retry
      // Only store the error message for debugging
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    // Only update transaction/payment if verification was successful
    if (isVerified) {
      // Update transaction to VERIFIED
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.VERIFIED,
          verificationPayload: verificationPayload ?? Prisma.JsonNull,
          errorMessage: null,
          verifiedAt: new Date(),
        },
      });

      // Update payment record
      const tipAmount = body.tipAmount
        ? new Prisma.Decimal(body.tipAmount)
        : null;
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
          tipAmount,
          reference: body.reference,
        },
      });

      // Track verification usage for subscription limits
      try {
        await this.usageTracker.trackVerification(transaction.merchantId);
      } catch (error) {
        console.error('[Usage] Error tracking verification usage:', error);
        // Don't fail the payment verification if usage tracking fails
      }

      return {
        success: true,
        message: 'Payment verified successfully',
        status: 'VERIFIED',
        tipAmount: body.tipAmount || 0,
      };
    } else {
      // Verification failed - don't update status, just return error
      // Transaction stays PENDING and will expire naturally after 20 minutes
      return {
        success: false,
        message:
          errorMessage ||
          'Payment verification failed. Please check your reference and try again.',
        status: 'PENDING', // Keep as PENDING so user can retry
      };
    }
  }

  async listVerifiedByUser(
    merchantUserId: string,
    query: ListVerifiedByUserQueryDto,
  ) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('pageSize must be a positive integer');
    }

    const where = {
      verifiedById: merchantUserId,
      // NOTE: Transaction in this schema isn't directly scoped to a merchant.
      // If/when Transaction.merchantId is present, we can re-add merchant scoping here.
    } satisfies Prisma.TransactionWhereInput;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: [{ verifiedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  private parseUrl(url: string): URL {
    try {
      return new URL(url);
    } catch (error) {
      throw new BadRequestException('qrUrl is not a valid URL');
    }
  }

  private inferProvider(
    url: URL,
    providerHint?: TransactionProvider,
  ): TransactionProvider | undefined {
    if (providerHint) return providerHint;

    const haystack =
      `${url.hostname}${url.pathname}${url.search}`.toLowerCase();

    if (haystack.includes('telebirr')) return TransactionProvider.TELEBIRR;
    if (haystack.includes('dashen')) return TransactionProvider.DASHEN;
    if (haystack.includes('abyssinia') || haystack.includes('boa'))
      return TransactionProvider.BOA;
    if (haystack.includes('awash')) return TransactionProvider.AWASH;
    if (haystack.includes('cbe')) return TransactionProvider.CBE;

    return undefined;
  }

  private extractReference(url: URL, override?: string): string | undefined {
    if (override?.trim()) return override.trim();

    const candidates = [
      'reference',
      'ref',
      'transactionReference',
      'transaction_ref',
      'txRef',
      'txnRef',
      'txn',
      'tx',
      'txno',
      'ftref',
      'ft',
      'receipt',
      'receiptNumber',
      'code',
      'id',
    ];

    for (const key of candidates) {
      const value =
        url.searchParams.get(key) ?? url.searchParams.get(key.toLowerCase());
      if (value) return value.trim();
    }

    return undefined;
  }

  private computeStatus(
    payload: Prisma.InputJsonValue | null,
  ): TransactionStatus {
    if (!payload) return TransactionStatus.FAILED;
    const maybeObject = payload as Record<string, unknown> | undefined;
    if (
      maybeObject &&
      typeof maybeObject === 'object' &&
      'success' in maybeObject
    ) {
      return (maybeObject as { success?: boolean }).success === false
        ? TransactionStatus.FAILED
        : TransactionStatus.VERIFIED;
    }
    return TransactionStatus.VERIFIED;
  }

  private async runVerification(
    provider: TransactionProvider,
    reference: string,
    accountSuffix?: string,
  ): Promise<Prisma.InputJsonValue> {
    switch (provider) {
      case TransactionProvider.CBE: {
        if (!accountSuffix) {
          throw new BadRequestException(
            'accountSuffix is required for CBE verification',
          );
        }
        return this.serializePayload(
          await this.verificationService.verifyCbe(reference, accountSuffix),
        );
      }
      case TransactionProvider.TELEBIRR:
        return this.serializePayload(
          await this.verificationService.verifyTelebirr(reference),
        );
      case TransactionProvider.AWASH:
        return this.serializePayload(
          await this.verificationService.verifyAwashSmart(reference),
        );
      case TransactionProvider.BOA:
        return this.serializePayload(
          await this.verificationService.verifyAbyssiniaSmart(reference),
        );
      case TransactionProvider.DASHEN:
        return this.serializePayload(
          await this.verificationService.verifyDashen(reference),
        );
      default:
        throw new BadRequestException('Unsupported provider');
    }
  }

  private serializePayload(input: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(input)) as Prisma.InputJsonValue;
  }

  /**
   * Best-effort mapping from Better Auth session user -> MerchantUser.id
   *
   * We store the relation as MerchantUser.userId (auth user id) and want to
   * write Transaction.verifiedById = MerchantUser.id.
   */
  private async resolveVerifiedById(req?: Request): Promise<string | null> {
    try {
      const authUser = (req as any)?.user;
      const authUserId: string | undefined = authUser?.id;
      if (!authUserId) return null;

      const membership = await (this.prisma as any).merchantUser.findFirst({
        where: { userId: authUserId },
        select: { id: true },
      });

      return membership?.id ?? null;
    } catch {
      // Never fail verification because attribution failed.
      return null;
    }
  }
}
