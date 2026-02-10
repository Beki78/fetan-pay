import { Injectable, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';
import { MerchantUsersService } from '../merchant-users/merchant-users.service';

@Injectable()
export class MerchantAdminDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantUsersService: MerchantUsersService,
  ) {}

  private async requireMembership(req: Request) {
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

  async getDashboardStats(req: Request) {
    const membership = await this.requireMembership(req);

    // Get merchant info including owner name
    const merchant = await (this.prisma as any).merchant.findUnique({
      where: { id: membership.merchantId },
      select: {
        id: true,
        name: true,
        users: {
          where: {
            role: 'MERCHANT_OWNER',
            status: 'ACTIVE',
          },
          select: {
            name: true,
            email: true,
          },
          take: 1,
        },
      },
    });

    if (!merchant) {
      throw new ForbiddenException('Merchant not found');
    }

    // Get owner name (fallback to first user name or merchant name)
    const ownerName =
      merchant.users?.[0]?.name ||
      merchant.users?.[0]?.email?.split('@')[0] ||
      merchant.name;

    // First, mark expired transactions (PENDING and older than 20 minutes)
    const expiryThreshold = new Date(Date.now() - 20 * 60 * 1000);
    await (this.prisma as any).transaction.updateMany({
      where: {
        merchantId: membership.merchantId,
        status: 'PENDING',
        createdAt: { lt: expiryThreshold },
      },
      data: { status: 'EXPIRED' },
    });

    // Get MERGED statistics from both Transaction and Payment tables
    const [
      // Transaction table counts
      txTotal,
      txVerified,
      txPending,
      // Payment table counts
      paymentTotal,
      paymentVerified,
      paymentPending,
      // Wallet balance
      walletBalanceResult,
    ] = await Promise.all([
      // Transaction: Total
      (this.prisma as any).transaction.count({
        where: { merchantId: membership.merchantId },
      }),
      // Transaction: Verified
      (this.prisma as any).transaction.count({
        where: {
          merchantId: membership.merchantId,
          status: 'VERIFIED',
        },
      }),
      // Transaction: Pending (now only truly pending, expired ones are marked)
      (this.prisma as any).transaction.count({
        where: {
          merchantId: membership.merchantId,
          status: 'PENDING',
        },
      }),
      // Payment: Total
      (this.prisma as any).payment.count({
        where: { merchantId: membership.merchantId },
      }),
      // Payment: Verified
      (this.prisma as any).payment.count({
        where: {
          merchantId: membership.merchantId,
          status: 'VERIFIED',
        },
      }),
      // Payment: Pending
      (this.prisma as any).payment.count({
        where: {
          merchantId: membership.merchantId,
          status: 'PENDING',
        },
      }),
      // Wallet balance (sum of verified payments)
      (this.prisma as any).payment.aggregate({
        where: {
          merchantId: membership.merchantId,
          status: 'VERIFIED',
        },
        _sum: {
          claimedAmount: true,
        },
      }),
    ]);

    const walletBalance = walletBalanceResult._sum?.claimedAmount
      ? Number(walletBalanceResult._sum.claimedAmount)
      : 0;

    return {
      merchantName: merchant.name,
      ownerName,
      metrics: {
        // Merged counts from both tables
        totalTransactions: txTotal + paymentTotal,
        verified: txVerified + paymentVerified,
        pending: txPending + paymentPending,
        walletBalance,
      },
    };
  }

  private getDateRange(period?: string): { from: Date; to: Date } {
    const now = new Date();
    const to = new Date(now);
    let from: Date;

    switch (period) {
      case 'Last 7 Days':
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        break;
      case 'Last 30 Days':
        from = new Date(now);
        from.setDate(from.getDate() - 30);
        break;
      case 'Last 90 Days':
        from = new Date(now);
        from.setDate(from.getDate() - 90);
        break;
      case 'Last Year':
        from = new Date(now);
        from.setFullYear(from.getFullYear() - 1);
        break;
      default:
        // Default to last 30 days
        from = new Date(now);
        from.setDate(from.getDate() - 30);
    }

    // Set time to start of day for 'from' and end of day for 'to'
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    return { from, to };
  }

  async getAnalyticsMetrics(req: Request, period?: string) {
    const membership = await this.requireMembership(req);
    const { from, to } = this.getDateRange(period);

    const where = {
      merchantId: membership.merchantId,
      createdAt: {
        gte: from,
        lte: to,
      },
    };

    // Get MERGED counts from both Transaction and Payment tables
    const [
      txTotal,
      txVerified,
      paymentTotal,
      paymentVerified,
      paymentAggregateResult,
      totalUsersCount,
    ] = await Promise.all([
      // Transaction counts
      (this.prisma as any).transaction.count({ where }),
      (this.prisma as any).transaction.count({
        where: { ...where, status: 'VERIFIED' },
      }),
      // Payment counts
      (this.prisma as any).payment.count({ where }),
      (this.prisma as any).payment.count({
        where: { ...where, status: 'VERIFIED' },
      }),
      // Total amount and tips from verified payments
      (this.prisma as any).payment.aggregate({
        where: {
          merchantId: membership.merchantId,
          status: 'VERIFIED',
          createdAt: {
            gte: from,
            lte: to,
          },
        },
        _sum: {
          claimedAmount: true,
          tipAmount: true,
        },
      }),
      // Total users for this merchant (excluding merchant owner)
      (this.prisma as any).merchantUser.count({
        where: {
          merchantId: membership.merchantId,
          role: { not: 'MERCHANT_OWNER' },
        },
      }),
    ]);

    // Merged totals
    const totalTransactions = txTotal + paymentTotal;
    const verifiedCount = txVerified + paymentVerified;

    // Calculate success rate
    const successRate =
      totalTransactions > 0
        ? Math.round((verifiedCount / totalTransactions) * 100)
        : 0;

    const totalAmount = paymentAggregateResult._sum?.claimedAmount
      ? Number(paymentAggregateResult._sum.claimedAmount)
      : 0;

    const totalTips = paymentAggregateResult._sum?.tipAmount
      ? Number(paymentAggregateResult._sum.tipAmount)
      : 0;

    return {
      totalTransactions,
      verified: verifiedCount,
      successRate,
      totalRevenue: totalAmount,
      totalUsers: totalUsersCount,
      totalTips,
    };
  }

  async getStatisticsTrend(req: Request, period?: string) {
    const membership = await this.requireMembership(req);
    const { from, to } = this.getDateRange(period);

    // Get payments with amounts and tips for revenue and tips trend
    const payments = await (this.prisma as any).payment.findMany({
      where: {
        merchantId: membership.merchantId,
        status: 'VERIFIED',
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        createdAt: true,
        claimedAmount: true,
        tipAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get user creation dates (exclude MERCHANT_OWNER)
    const users = await (this.prisma as any).merchantUser.findMany({
      where: {
        merchantId: membership.merchantId,
        role: { not: 'MERCHANT_OWNER' },
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const dateMap = new Map<
      string,
      { revenue: number; users: number; tips: number }
    >();

    // Process payments for revenue and tips
    payments.forEach(
      (p: { createdAt: Date; claimedAmount: unknown; tipAmount: unknown }) => {
        const dateKey = p.createdAt.toISOString().split('T')[0];
        const date = new Date(dateKey);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        if (!dateMap.has(formattedDate)) {
          dateMap.set(formattedDate, { revenue: 0, users: 0, tips: 0 });
        }
        const data = dateMap.get(formattedDate)!;
        data.revenue += p.claimedAmount ? Number(p.claimedAmount) : 0;
        data.tips += p.tipAmount ? Number(p.tipAmount) : 0;
      },
    );

    // Process users
    users.forEach((u: { createdAt: Date }) => {
      const dateKey = u.createdAt.toISOString().split('T')[0];
      const date = new Date(dateKey);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dateMap.has(formattedDate)) {
        dateMap.set(formattedDate, { revenue: 0, users: 0, tips: 0 });
      }
      const data = dateMap.get(formattedDate)!;
      data.users += 1;
    });

    const categories = Array.from(dateMap.keys());
    const revenueData = Array.from(dateMap.values()).map((v) => v.revenue);
    const usersData = Array.from(dateMap.values()).map((v) => v.users);
    const tipsData = Array.from(dateMap.values()).map((v) => v.tips);

    return {
      categories,
      series: [
        { name: 'Revenue', data: revenueData },
        { name: 'Users', data: usersData },
        { name: 'Tips', data: tipsData },
      ],
    };
  }

  async getStatusDistribution(req: Request, period?: string) {
    const membership = await this.requireMembership(req);
    const { from, to } = this.getDateRange(period);

    const where = {
      merchantId: membership.merchantId,
      createdAt: {
        gte: from,
        lte: to,
      },
    };

    // Query from Payment table (where actual verification data is stored)
    const [verified, pending, unverified] = await Promise.all([
      (this.prisma as any).payment.count({
        where: { ...where, status: 'VERIFIED' },
      }),
      (this.prisma as any).payment.count({
        where: { ...where, status: 'PENDING' },
      }),
      (this.prisma as any).payment.count({
        where: { ...where, status: 'UNVERIFIED' },
      }),
    ]);

    return {
      verified,
      pending,
      failed: unverified, // Map UNVERIFIED to failed for frontend compatibility
      total: verified + pending + unverified,
    };
  }
}
