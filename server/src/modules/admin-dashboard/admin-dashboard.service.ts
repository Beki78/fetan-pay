import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import type { Request } from 'express';
import { GetAnalyticsDto } from './dto/get-analytics.dto';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive analytics for admin dashboard
   */
  async getAnalytics(query: GetAnalyticsDto, req: Request) {
    this.requireAdmin(req);

    // Parse and validate date range
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    if (query.from && Number.isNaN(from?.getTime())) {
      throw new BadRequestException('Invalid from date');
    }
    if (query.to && Number.isNaN(to?.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    // Build date filter for Transaction queries
    const transactionDateFilter: Prisma.TransactionWhereInput =
      from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {};

    // Build date filter for Payment queries
    const paymentDateFilter: Prisma.PaymentWhereInput =
      from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {};

    // Build date filter for WalletTransaction queries
    const walletDateFilter: any =
      from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {};

    // User Analytics (not filtered by date as they are user counts)
    const [totalUsers, totalMerchants] = await Promise.all([
      this.prisma.user.count(),
      (this.prisma as any).merchant.count(),
    ]);

    // Platform Transactions - combine Transaction and Payment tables
    const [
      totalTransactions,
      totalVerifiedTransactions,
      totalPendingTransactions,
      totalFailedTransactions,
      totalExpiredTransactions,
      totalTips,
      totalPaymentAmount,
    ] = await Promise.all([
      // Total transactions (from Transaction table)
      this.prisma.transaction.count({
        where: transactionDateFilter,
      }),
      // Total verified transactions
      this.prisma.transaction.count({
        where: { ...transactionDateFilter, status: 'VERIFIED' },
      }),
      // Total pending transactions
      this.prisma.transaction.count({
        where: { ...transactionDateFilter, status: 'PENDING' },
      }),
      // Total failed transactions
      this.prisma.transaction.count({
        where: { ...transactionDateFilter, status: 'FAILED' },
      }),
      // Total expired transactions
      this.prisma.transaction.count({
        where: { ...transactionDateFilter, status: 'EXPIRED' },
      }),
      // Total tips from VERIFIED payments only
      (this.prisma as any).payment.aggregate({
        _sum: { tipAmount: true },
        where: {
          ...paymentDateFilter,
          status: 'VERIFIED',
          tipAmount: { not: null },
        },
      }),
      // Total payment amount from VERIFIED payments only
      (this.prisma as any).payment.aggregate({
        _sum: { claimedAmount: true },
        where: {
          ...paymentDateFilter,
          status: 'VERIFIED',
        },
      }),
    ]);

    // Count payments (standalone, not linked to transactions)
    const [
      totalPayments,
      totalVerifiedPayments,
      totalPendingPayments,
      totalUnverifiedPayments,
    ] = await Promise.all([
      (this.prisma as any).payment.count({
        where: { ...paymentDateFilter, transactionId: null },
      }),
      (this.prisma as any).payment.count({
        where: {
          ...paymentDateFilter,
          transactionId: null,
          status: 'VERIFIED',
        },
      }),
      (this.prisma as any).payment.count({
        where: {
          ...paymentDateFilter,
          transactionId: null,
          status: 'PENDING',
        },
      }),
      (this.prisma as any).payment.count({
        where: {
          ...paymentDateFilter,
          transactionId: null,
          status: 'UNVERIFIED',
        },
      }),
    ]);

    // Combined totals
    const combinedTotalTransactions = totalTransactions + totalPayments;
    const combinedTotalVerified =
      totalVerifiedTransactions + totalVerifiedPayments;
    const combinedTotalPending =
      totalPendingTransactions + totalPendingPayments;
    const combinedTotalUnsuccessful =
      totalFailedTransactions +
      totalExpiredTransactions +
      totalUnverifiedPayments;

    // Wallet Analytics
    const totalDeposits = await (
      this.prisma as any
    ).walletTransaction.aggregate({
      _sum: { amount: true },
      where: {
        ...walletDateFilter,
        type: 'DEPOSIT',
      },
    });

    // Transaction Type Breakdown (QR, Cash, Bank)
    const [qrCount, cashCount, bankCount] = await Promise.all([
      // QR payments (from Transaction table)
      this.prisma.transaction.count({
        where: transactionDateFilter,
      }),
      // Cash payments (from Payment table with paymentMethod: 'cash')
      (this.prisma as any).payment.count({
        where: {
          ...paymentDateFilter,
          transactionId: null,
          verificationPayload: {
            path: ['paymentMethod'],
            equals: 'cash',
          },
        },
      }),
      // Bank payments (from Payment table with paymentMethod: 'bank')
      (this.prisma as any).payment.count({
        where: {
          ...paymentDateFilter,
          transactionId: null,
          verificationPayload: {
            path: ['paymentMethod'],
            equals: 'bank',
          },
        },
      }),
    ]);

    // Transaction Status Breakdown
    const statusBreakdown = {
      successful: combinedTotalVerified,
      failed: totalFailedTransactions + totalUnverifiedPayments,
      pending: combinedTotalPending,
      expired: totalExpiredTransactions,
    };

    // Provider/Bank Usage Statistics
    const providerStats = await this.getProviderUsageStats(
      transactionDateFilter,
      paymentDateFilter,
    );

    // Get daily transaction amounts and tips
    const dailyData = await this.getDailyTransactionData(
      from,
      to,
      paymentDateFilter,
    );

    return {
      userAnalytics: {
        totalUsers,
        totalMerchants,
      },
      platformTransactions: {
        totalTransactions: combinedTotalTransactions,
        totalVerified: combinedTotalVerified,
        totalPending: combinedTotalPending,
        totalUnsuccessful: combinedTotalUnsuccessful,
        totalTransactionAmount: (totalPaymentAmount as any)._sum?.claimedAmount
          ? Number((totalPaymentAmount as any)._sum.claimedAmount)
          : 0,
        totalTips: totalTips._sum?.tipAmount
          ? Number(totalTips._sum.tipAmount)
          : 0,
      },
      walletAnalytics: {
        totalDeposits: totalDeposits._sum?.amount
          ? Number(totalDeposits._sum.amount)
          : 0,
      },
      transactionTypeBreakdown: {
        qr: qrCount,
        cash: cashCount,
        bank: bankCount,
      },
      transactionStatusBreakdown: statusBreakdown,
      providerUsage: providerStats,
      dailyData,
    };
  }

  /**
   * Get daily transaction amounts and tips grouped by date
   */
  private async getDailyTransactionData(
    from: Date | undefined,
    to: Date | undefined,
    _paymentDateFilter: Prisma.PaymentWhereInput,
  ) {
    // Default to last 30 days if no date range provided
    // Always use current date/time for end date to include today
    const now = new Date();
    const endDate = to || now;

    // Set end date to end of day to ensure we capture all of today's transactions
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate start date (30 days before end date)
    const startDate =
      from || new Date(endOfDay.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Use raw SQL to get all payment data
    // Only count VERIFIED payments for amounts and tips
    const dailyData = await (this.prisma as any).$queryRaw<
      Array<{ date: Date; total_amount: string; total_tips: string }>
    >`
      SELECT 
        DATE(p."createdAt") as date,
        SUM(CAST(p."claimedAmount" AS DECIMAL(12,2))) as total_amount,
        SUM(CAST(COALESCE(p."tipAmount", 0) AS DECIMAL(12,2))) as total_tips
      FROM payment p
      WHERE p."createdAt" >= ${startOfDay}
        AND p."createdAt" <= ${endOfDay}
        AND p."status" = 'VERIFIED'
      GROUP BY DATE(p."createdAt")
      ORDER BY date ASC
    `;

    // Convert to map for easier processing
    const dailyMap = new Map<string, { amount: number; tips: number }>();

    for (const row of dailyData) {
      const dateStr = row.date.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        amount: Number(row.total_amount) || 0,
        tips: Number(row.total_tips) || 0,
      });
    }

    // Convert to array and fill in missing dates with zeros
    // Include all dates from start to end (including today)
    const result: Array<{ date: string; amount: number; tips: number }> = [];
    const currentDate = new Date(startOfDay);

    // Get the date string for end date to ensure we include it
    const endDateStr = endOfDay.toISOString().split('T')[0];

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = dailyMap.get(dateStr) || { amount: 0, tips: 0 };
      result.push({
        date: dateStr,
        amount: data.amount,
        tips: data.tips,
      });

      // Break if we've reached the end date
      if (dateStr === endDateStr) {
        break;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  /**
   * Get provider/bank usage statistics
   */
  private async getProviderUsageStats(
    transactionDateFilter: Prisma.TransactionWhereInput,
    paymentDateFilter: Prisma.PaymentWhereInput,
  ) {
    // Get provider counts from Transaction table
    const transactionProviders = await this.prisma.transaction.groupBy({
      by: ['provider'],
      _count: {
        provider: true,
      },
      where: transactionDateFilter,
    });

    // Get provider counts from Payment table
    // Note: groupBy doesn't support where clause with not: null, so we filter after
    const allPaymentProviders = await (this.prisma as any).payment.groupBy({
      by: ['provider'],
      _count: {
        provider: true,
      },
      where: paymentDateFilter,
    });

    // Filter out null providers
    const paymentProviders = allPaymentProviders.filter(
      (item: any) => item.provider !== null,
    );

    // Combine and aggregate
    const providerMap = new Map<string, number>();

    // Add transaction providers
    transactionProviders.forEach((item) => {
      if (item.provider) {
        const current = providerMap.get(item.provider) || 0;
        providerMap.set(item.provider, current + item._count.provider);
      }
    });

    // Add payment providers
    paymentProviders.forEach((item: any) => {
      if (item.provider) {
        const current = providerMap.get(item.provider) || 0;
        providerMap.set(item.provider, current + item._count.provider);
      }
    });

    // Get custom bank names from Payment verificationPayload
    const paymentsWithCustomBanks = await (this.prisma as any).payment.findMany(
      {
        where: {
          ...paymentDateFilter,
          verificationPayload: {
            path: ['otherBankName'],
            not: null,
          },
        },
        select: {
          verificationPayload: true,
        },
      },
    );

    // Count custom banks
    const customBankMap = new Map<string, number>();
    paymentsWithCustomBanks.forEach((payment: any) => {
      const payload = payment.verificationPayload as Record<string, unknown>;
      const customBank = payload.otherBankName as string | undefined;
      if (customBank) {
        const current = customBankMap.get(customBank) || 0;
        customBankMap.set(customBank, current + 1);
      }
    });

    // Convert to array format
    const providerStats = Array.from(providerMap.entries()).map(
      ([provider, count]) => ({
        provider,
        count,
        isCustom: false,
      }),
    );

    // Add custom banks
    const customBankStats = Array.from(customBankMap.entries()).map(
      ([provider, count]) => ({
        provider,
        count,
        isCustom: true,
      }),
    );

    return [...providerStats, ...customBankStats];
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
