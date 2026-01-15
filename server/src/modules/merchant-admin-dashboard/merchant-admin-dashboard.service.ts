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

    // Get payment statistics (verified payments are stored in Payment table)
    const paymentStats = await Promise.all([
      // Total payments (all verification attempts)
      (this.prisma as any).payment.count({
        where: { merchantId: membership.merchantId },
      }),
      // Verified payments
      (this.prisma as any).payment.count({
        where: {
          merchantId: membership.merchantId,
          status: 'VERIFIED',
        },
      }),
      // Pending payments
      (this.prisma as any).payment.count({
        where: {
          merchantId: membership.merchantId,
          status: 'PENDING',
        },
      }),
    ]);

    // Calculate wallet balance (sum of all verified payment amounts for this merchant)
    const walletBalanceResult = await (this.prisma as any).payment.aggregate({
      where: {
        merchantId: membership.merchantId,
        status: 'VERIFIED',
      },
      _sum: {
        claimedAmount: true,
      },
    });

    const walletBalance = walletBalanceResult._sum?.claimedAmount
      ? Number(walletBalanceResult._sum.claimedAmount)
      : 0;

    return {
      merchantName: merchant.name,
      ownerName,
      metrics: {
        totalTransactions: paymentStats[0],
        verified: paymentStats[1],
        pending: paymentStats[2],
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

    // Get transaction counts
    const [totalTransactions, verifiedCount] = await Promise.all([
      (this.prisma as any).transaction.count({ where }),
      (this.prisma as any).transaction.count({
        where: { ...where, status: 'VERIFIED' },
      }),
    ]);

    // Calculate success rate
    const successRate =
      totalTransactions > 0
        ? Math.round((verifiedCount / totalTransactions) * 100)
        : 0;

    // Get total amount from verified payments
    const totalAmountResult = await (this.prisma as any).payment.aggregate({
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
      },
    });

    const totalAmount = totalAmountResult._sum?.claimedAmount
      ? Number(totalAmountResult._sum.claimedAmount)
      : 0;

    return {
      totalTransactions,
      verified: verifiedCount,
      successRate,
      totalAmount,
    };
  }

  async getTransactionTrend(req: Request, period?: string) {
    const membership = await this.requireMembership(req);
    const { from, to } = this.getDateRange(period);

    // Get all payments in the date range (payments contain actual verification data)
    const payments = await (this.prisma as any).payment.findMany({
      where: {
        merchantId: membership.merchantId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const dateMap = new Map<
      string,
      { total: number; verified: number; pending: number; unverified: number }
    >();

    payments.forEach((payment: { createdAt: Date; status: string }) => {
      const dateKey = payment.createdAt.toISOString().split('T')[0];
      const date = new Date(dateKey);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dateMap.has(formattedDate)) {
        dateMap.set(formattedDate, {
          total: 0,
          verified: 0,
          pending: 0,
          unverified: 0,
        });
      }

      const counts = dateMap.get(formattedDate)!;
      counts.total++;
      if (payment.status === 'VERIFIED') counts.verified++;
      else if (payment.status === 'PENDING') counts.pending++;
      else if (payment.status === 'UNVERIFIED') counts.unverified++;
    });

    // Convert to arrays for chart
    const categories = Array.from(dateMap.keys());
    const totalData = Array.from(dateMap.values()).map((v) => v.total);
    const verifiedData = Array.from(dateMap.values()).map((v) => v.verified);
    const pendingData = Array.from(dateMap.values()).map((v) => v.pending);
    const unverifiedData = Array.from(dateMap.values()).map(
      (v) => v.unverified,
    );

    return {
      categories,
      series: [
        { name: 'Total', data: totalData },
        { name: 'Verified', data: verifiedData },
        { name: 'Pending', data: pendingData },
        { name: 'Unverified', data: unverifiedData },
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
