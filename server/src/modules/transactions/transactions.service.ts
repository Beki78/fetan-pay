import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionProvider, TransactionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { VerificationService } from '../verifier/services/verification.service';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { ListVerifiedByUserQueryDto } from './dto/list-verified-by-user.dto';
import { VerifyFromQrDto } from './dto/verify-from-qr.dto';
import type { Request } from 'express';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
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
