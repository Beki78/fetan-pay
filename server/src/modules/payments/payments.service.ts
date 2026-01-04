import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as PrismaClient from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';
import { MerchantUsersService } from '../merchant-users/merchant-users.service';
import { VerificationService } from '../verifier/services/verification.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { DisableReceiverDto } from './dto/disable-receiver.dto';
import { SetActiveReceiverDto } from './dto/set-active-receiver.dto';
import { SubmitPaymentClaimDto } from './dto/submit-payment-claim.dto';
import { VerifyMerchantPaymentDto } from './dto/verify-merchant-payment.dto';
import {
  ListVerificationHistoryDto,
  type PaymentVerificationStatus,
} from './dto/list-verification-history.dto';

type TipsRange = { from?: string; to?: string };

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantUsersService: MerchantUsersService,
    private readonly verificationService: VerificationService,
  ) {}

  private paymentStatusEnum() {
    return (PrismaClient as any).PaymentVerificationStatus as
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

  private extractVerifierAmount(payload: any): number | undefined {
    const a = payload?.amount;
    if (typeof a === 'number' && Number.isFinite(a)) return a;
    if (typeof a === 'string') {
      const parsed = parseFloat(a.replace(/[^\d.]/g, ''));
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  private extractVerifierReceiverAccount(payload: any): string | undefined {
    const ra = payload?.receiverAccount;
    if (typeof ra === 'string' && ra.trim()) return ra.trim();
    return undefined;
  }

  private extractVerifierReceiverName(payload: any): string | undefined {
    const r = payload?.receiver;
    if (typeof r === 'string' && r.trim()) return r.trim();
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
    txReceiverName?: string | undefined,
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

  private extractVerifierReference(payload: any, fallback: string): string {
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

    const claimedAmount = this.toDecimal(body.claimedAmount, 'claimedAmount');

    // Payment model currently requires an Order relation.
    // For merchant direct-verification (no order flow), we'll create a lightweight OPEN order
    // only if we need to create a new Payment record.
    const existingPayment = await (this.prisma as any).payment.findUnique({
      where: {
        payment_merchant_provider_reference_unique: {
          merchantId: membership.merchantId,
          provider: body.provider,
          reference: body.reference,
        },
      },
      select: { id: true, orderId: true },
    });

    const order = existingPayment
      ? null
      : await (this.prisma as any).order.create({
          data: {
            merchantId: membership.merchantId,
            expectedAmount: claimedAmount,
            currency: 'ETB',
            status: 'OPEN',
          },
        });

    // Require ACTIVE receiver to verify (disabled means merchant intentionally paused).
    const activeReceiver = await (this.prisma as any).merchantReceiverAccount.findFirst({
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

    const verifierResult = await this.runCoreVerifier(body.provider, body.reference);
    const normalizedPayload = JSON.parse(JSON.stringify(verifierResult ?? null));

    const referenceFound =
      !!normalizedPayload &&
      typeof normalizedPayload === 'object' &&
      (normalizedPayload as any).success !== false;

    const txAmount = this.extractVerifierAmount(normalizedPayload);
    const txReceiverAccount = this.extractVerifierReceiverAccount(normalizedPayload);
    const txReceiverName = this.extractVerifierReceiverName(normalizedPayload);
    const effectiveReference = this.extractVerifierReference(
      normalizedPayload,
      body.reference,
    );

    const amountMatches =
      txAmount !== undefined &&
      this.normalizeAmountToCents(txAmount) ===
        this.normalizeAmountToCents(body.claimedAmount);

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

    const status =
      referenceFound && amountMatches && receiverMatches
        ? PaymentStatus.VERIFIED
        : PaymentStatus.UNVERIFIED;

    const mismatchReason =
      status === PaymentStatus.VERIFIED
        ? null
        : !referenceFound
          ? 'REFERENCE_NOT_FOUND'
          : !receiverMatches
            ? 'RECEIVER_MISMATCH'
            : !amountMatches
              ? 'AMOUNT_MISMATCH'
              : 'UNVERIFIED';

    const payment = await (this.prisma as any).payment.upsert({
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
        status,
        mismatchReason,
        receiverAccount: { connect: { id: activeReceiver.id } },
        verificationPayload: normalizedPayload as any,
        verifiedAt: status === PaymentStatus.VERIFIED ? new Date() : null,
        verifiedBy:
          status === PaymentStatus.VERIFIED
            ? { connect: { id: membership.merchantUserId } }
            : { disconnect: true },
      },
      create: {
        merchant: { connect: { id: membership.merchantId } },
        order: { connect: { id: (order ?? existingPayment)?.orderId ?? order?.id } },
        provider: body.provider,
        reference: effectiveReference,
        claimedAmount,
        status,
        mismatchReason,
        receiverAccount: { connect: { id: activeReceiver.id } },
        verificationPayload: normalizedPayload as any,
        verifiedAt: status === PaymentStatus.VERIFIED ? new Date() : null,
        ...(status === PaymentStatus.VERIFIED
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
        amount: txAmount ?? null,
        raw: normalizedPayload,
      },
    };
  }

  async listVerificationHistory(query: ListVerificationHistoryDto, req: Request) {
    const membership = await this.requireMembership(req);

    // Defensive parsing: depending on global validation/transform setup,
    // query params may still arrive as strings.
    const page = Math.max(1, Number(query.page ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20) || 20));
    const skip = (page - 1) * pageSize;

    const where: any = {
      merchantId: membership.merchantId,
      ...(query.provider ? { provider: query.provider } : {}),
      ...(query.status ? { status: query.status as PaymentVerificationStatus } : {}),
      ...(query.reference ? { reference: query.reference } : {}),
    };

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
      (this.prisma as any).payment.count({ where }),
      (this.prisma as any).payment.findMany({
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
   */
  async setActiveReceiverAccount(body: SetActiveReceiverDto, req: Request) {
    const membership = await this.requireMembership(req);

    const desiredStatus = body.enabled === false ? 'INACTIVE' : 'ACTIVE';

    return this.prisma.$transaction(async (tx) => {
      // If we're enabling this receiver, ensure it's the only ACTIVE one for this provider.
      if (desiredStatus === 'ACTIVE') {
        await (tx as any).merchantReceiverAccount.updateMany({
          where: {
            merchantId: membership.merchantId,
            provider: body.provider,
            status: 'ACTIVE',
          },
          data: { status: 'INACTIVE' },
        });
      }

      const active = await (tx as any).merchantReceiverAccount.upsert({
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

      return { active };
    });
  }

  async getActiveReceiverAccount(provider: string | undefined, req: Request) {
    const membership = await this.requireMembership(req);

    let providerEnum: PrismaClient.TransactionProvider | undefined;
    if (provider) {
      if (
        !Object.values(PrismaClient.TransactionProvider).includes(
          provider as any,
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

    const data = await (this.prisma as any).merchantReceiverAccount.findMany({
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

    const updated = await (this.prisma as any).merchantReceiverAccount.updateMany({
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
      const latest = await (tx as any).merchantReceiverAccount.findFirst({
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

      await (tx as any).merchantReceiverAccount.updateMany({
        where: {
          merchantId: membership.merchantId,
          provider: body.provider,
          status: 'ACTIVE',
        },
        data: { status: 'INACTIVE' },
      });

      const enabled = await (tx as any).merchantReceiverAccount.update({
        where: { id: latest.id },
        data: { status: 'ACTIVE' },
      });

      return { enabled };
    });
  }

  /** Simple mock: create an order in OPEN status for the current merchant */
  async createOrder(body: CreateOrderDto, req: Request) {
    const membership = await this.requireMembership(req);

    const expectedAmount = this.toDecimal(body.expectedAmount, 'expectedAmount');
    const currency = (body.currency ?? 'ETB').trim() || 'ETB';

    const order = await (this.prisma as any).order.create({
      data: {
        merchantId: membership.merchantId,
        expectedAmount,
        currency,
      },
    });

    return { order };
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

    const order = await (this.prisma as any).order.findFirst({
      where: { id: body.orderId, merchantId: membership.merchantId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const claimedAmount = this.toDecimal(body.claimedAmount, 'claimedAmount');
    const tipAmount = body.tipAmount === undefined ? null : this.toDecimal(body.tipAmount, 'tipAmount');

    const activeReceiver = await (this.prisma as any).merchantReceiverAccount.findFirst({
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
    const txRecord = await (this.prisma as any).transaction.findUnique({
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

    const status = (amountMatches && receiverMatches)
      ? PaymentStatus.VERIFIED
      : PaymentStatus.UNVERIFIED;

    const mismatchReason =
      status === PaymentStatus.VERIFIED
        ? null
        : this.buildMismatchReason({
            amountMatches,
            receiverMatches,
            receiverAccountFromPayload,
            expectedAmount: order.expectedAmount.toString(),
            claimedAmount: claimedAmount.toString(),
            activeReceiverAccount: activeReceiver.receiverAccount,
          });

  const payment = await (this.prisma as any).payment.upsert({
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
        mismatchReason,
        verificationPayload: (txRecord?.verificationPayload ?? Prisma.JsonNull) as Prisma.InputJsonValue,
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
        mismatchReason,
        verificationPayload: (txRecord?.verificationPayload ?? Prisma.JsonNull) as Prisma.InputJsonValue,
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

    // If verified, mark order as PAID (simple version)
    if (status === PaymentStatus.VERIFIED) {
      await (this.prisma as any).order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });
    }

    return {
      status: payment.status,
      payment,
      checks: {
        amountMatches,
        receiverMatches,
      },
    };
  }

  async getPayment(paymentId: string, req: Request) {
    const membership = await this.requireMembership(req);
    const payment = await (this.prisma as any).payment.findFirst({
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

    const where: any = {
      merchantId: membership.merchantId,
      tipAmount: { not: null },
      createdAt: {
        gte: from,
        lte: to,
      },
    };

    const [count, sum] = await Promise.all([
      (this.prisma as any).payment.count({ where }),
      (this.prisma as any).payment.aggregate({
        where,
        _sum: { tipAmount: true },
      }),
    ]);

    return {
      count,
      totalTipAmount: sum._sum.tipAmount,
    };
  }

  private async requireMembership(req: Request) {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      throw new ForbiddenException('Not authenticated');
    }

    const membership = await this.merchantUsersService.me(req);
    const merchantId = membership?.membership?.merchant?.id as string | undefined;
    const merchantUserId = membership?.membership?.id as string | undefined;

    if (!merchantId || !merchantUserId) {
      throw new ForbiddenException('Merchant membership required');
    }

    return { merchantId, merchantUserId, userId };
  }

  private toDecimal(value: number, field: string) {
    if (!Number.isFinite(value)) throw new BadRequestException(`${field} is invalid`);
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
