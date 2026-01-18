import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { ListAllPaymentsDto } from './dto/list-all-payments.dto';
import type { Request } from 'express';

export interface UnifiedPayment {
  id: string;
  type: 'transaction' | 'payment';
  paymentType: 'QR' | 'cash' | 'bank';
  merchantId: string;
  merchant?: {
    id: string;
    name: string;
  };
  provider: string | null;
  reference: string;
  amount: number;
  tipAmount: number | null;
  status: string;
  createdAt: Date;
  verifiedAt: Date | null;
  verifiedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  payerName: string | null;
  receiverAccount?: string | null;
  receiverName?: string | null;
  qrUrl?: string | null;
  note?: string | null;
  receiptUrl?: string | null;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all payments and transactions across all merchants (admin only)
   * Combines data from both Transaction and Payment tables
   */
  async listAllPayments(query: ListAllPaymentsDto, req: Request) {
    this.requireAdmin(req);

    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('pageSize must be a positive integer');
    }

    // Build where clauses for both tables
    const transactionWhere: Prisma.TransactionWhereInput = {
      ...(query.merchantId ? { merchantId: query.merchantId } : {}),
      ...(query.provider ? { provider: query.provider } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { reference: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    // Payment status can be VERIFIED, UNVERIFIED, or PENDING
    // Transaction status can be VERIFIED, PENDING, FAILED, or EXPIRED
    // Only apply status filter to payments if it's a valid PaymentVerificationStatus
    const paymentStatusFilter =
      query.status && ['VERIFIED', 'UNVERIFIED', 'PENDING'].includes(query.status)
        ? (query.status as 'VERIFIED' | 'UNVERIFIED' | 'PENDING')
        : undefined;

    const paymentWhere: Prisma.PaymentWhereInput = {
      ...(query.merchantId ? { merchantId: query.merchantId } : {}),
      ...(query.provider ? { provider: query.provider } : {}),
      ...(paymentStatusFilter ? { status: paymentStatusFilter } : {}),
      ...(query.search
        ? {
            OR: [
              { reference: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      // Filter by payment type if specified
      ...(query.paymentType === 'cash'
        ? {
            verificationPayload: {
              path: ['paymentMethod'],
              equals: 'cash',
            },
          }
        : query.paymentType === 'bank'
          ? {
              verificationPayload: {
                path: ['paymentMethod'],
                equals: 'bank',
              },
            }
          : {}),
    };

    // Fetch transactions (QR payments)
    const [transactions, transactionCount] = await Promise.all([
      this.prisma.transaction.findMany({
        where: transactionWhere,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          verifiedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          payments: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              order: {
                select: {
                  expectedAmount: true,
                  payerName: true,
                },
              },
              receiverAccount: {
                select: {
                  receiverAccount: true,
                  receiverName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.transaction.count({ where: transactionWhere }),
    ]);

    // Fetch standalone payments (cash/bank logged, not linked to transactions)
    // Only if paymentType filter allows it or is not set
    const shouldFetchPayments =
      !query.paymentType || query.paymentType === 'cash' || query.paymentType === 'bank';

    const [standalonePayments, paymentCount] = shouldFetchPayments
      ? await Promise.all([
          (this.prisma as any).payment.findMany({
            where: {
              ...paymentWhere,
              transactionId: null, // Only standalone payments
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
              merchant: {
                select: {
                  id: true,
                  name: true,
                },
              },
              verifiedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
              order: {
                select: {
                  expectedAmount: true,
                  payerName: true,
                },
              },
              receiverAccount: {
                select: {
                  receiverAccount: true,
                  receiverName: true,
                },
              },
            },
          }),
          (this.prisma as any).payment.count({
            where: {
              ...paymentWhere,
              transactionId: null,
            },
          }),
        ])
      : [[], 0];

    // Transform transactions to unified format
    const unifiedTransactions: UnifiedPayment[] = transactions
      .filter((tx) => {
        // Filter by paymentType if specified
        if (query.paymentType === 'cash' || query.paymentType === 'bank') {
          return false; // Transactions are QR type
        }
        return true;
      })
      .map((tx) => {
        const payment = tx.payments?.[0];
        const order = payment?.order;
        const receiverAccount = payment?.receiverAccount;

        return {
          id: tx.id,
          type: 'transaction' as const,
          paymentType: 'QR' as const,
          merchantId: tx.merchantId || '',
          merchant: tx.merchant || undefined,
          provider: tx.provider,
          reference: tx.reference,
          amount: order?.expectedAmount
            ? Number(order.expectedAmount)
            : 0,
          tipAmount: payment?.tipAmount ? Number(payment.tipAmount) : null,
          status: tx.status,
          createdAt: tx.createdAt,
          verifiedAt: tx.verifiedAt,
          verifiedBy: tx.verifiedBy
            ? {
                id: tx.verifiedBy.id,
                name: tx.verifiedBy.name || '',
                email: tx.verifiedBy.email || '',
                role: tx.verifiedBy.role,
              }
            : undefined,
          payerName: order?.payerName || null,
          receiverAccount: receiverAccount?.receiverAccount || null,
          receiverName: receiverAccount?.receiverName || null,
          qrUrl: tx.qrUrl || null,
          note: null,
          receiptUrl: null,
        };
      });

    // Transform standalone payments to unified format
    const unifiedPayments: UnifiedPayment[] = standalonePayments.map(
      (payment: any) => {
        const verificationPayload =
          (payment.verificationPayload as Record<string, unknown>) || {};
        const paymentMethod =
          (verificationPayload.paymentMethod as string) || 'bank';
        const note = (verificationPayload.note as string) || null;
        const receiptUrl = (verificationPayload.receiptUrl as string) || null;

        return {
          id: payment.id,
          type: 'payment' as const,
          paymentType: paymentMethod === 'cash' ? 'cash' : 'bank',
          merchantId: payment.merchantId,
          merchant: payment.merchant || undefined,
          provider: payment.provider,
          reference: payment.reference,
          amount: payment.claimedAmount
            ? Number(payment.claimedAmount)
            : payment.order?.expectedAmount
              ? Number(payment.order.expectedAmount)
              : 0,
          tipAmount: payment.tipAmount ? Number(payment.tipAmount) : null,
          status: payment.status,
          createdAt: payment.createdAt,
          verifiedAt: payment.verifiedAt,
          verifiedBy: payment.verifiedBy
            ? {
                id: payment.verifiedBy.id,
                name: payment.verifiedBy.name || '',
                email: payment.verifiedBy.email || '',
                role: payment.verifiedBy.role,
              }
            : undefined,
          payerName: payment.order?.payerName || null,
          receiverAccount:
            payment.receiverAccount?.receiverAccount || null,
          receiverName: payment.receiverAccount?.receiverName || null,
          qrUrl: null,
          note,
          receiptUrl,
        };
      },
    );

    // Combine and sort by createdAt descending
    const allPayments = [...unifiedTransactions, ...unifiedPayments].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    // Apply pagination to combined results
    const total = transactionCount + paymentCount;
    const paginatedPayments = allPayments.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    return {
      data: paginatedPayments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private requireAdmin(req: Request) {
    interface RequestWithUser extends Request {
      user?: {
        role?: string;
      };
    }
    const requestWithUser = req as RequestWithUser;
    const role = requestWithUser.user?.role;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('Admin role required');
    }
  }
}

