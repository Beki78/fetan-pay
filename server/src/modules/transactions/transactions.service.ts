import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionProvider, TransactionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { VerificationService } from '../verifier/services/verification.service';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { VerifyFromQrDto } from './dto/verify-from-qr.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
  ) {}

  async verifyFromQr(body: VerifyFromQrDto) {
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
      errorMessage = error instanceof Error ? error.message : 'Verification failed';
    }

    const transaction = await this.prisma.transaction.upsert({
      where: {
        transaction_provider_reference_key: { provider, reference },
      },
      update: {
        qrUrl: body.qrUrl,
        status,
        verifiedAt: status === TransactionStatus.VERIFIED ? new Date() : null,
  verificationPayload: verificationPayload ?? Prisma.JsonNull,
        errorMessage,
      },
      create: {
        provider,
        reference,
        qrUrl: body.qrUrl,
        status,
        verifiedAt: status === TransactionStatus.VERIFIED ? new Date() : null,
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

  async listTransactions(query: ListTransactionsQueryDto) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('pageSize must be a positive integer');
    }
    const where = {
      provider: query.provider,
      status: query.status,
    } satisfies Prisma.TransactionWhereInput;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
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

    const haystack = `${url.hostname}${url.pathname}${url.search}`.toLowerCase();

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
      const value = url.searchParams.get(key) ?? url.searchParams.get(key.toLowerCase());
      if (value) return value.trim();
    }

    return undefined;
  }

  private computeStatus(payload: Prisma.InputJsonValue | null): TransactionStatus {
    if (!payload) return TransactionStatus.FAILED;
    const maybeObject = payload as Record<string, unknown> | undefined;
    if (maybeObject && typeof maybeObject === 'object' && 'success' in maybeObject) {
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
          throw new BadRequestException('accountSuffix is required for CBE verification');
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
}