import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AudienceSegmentType } from './dto/create-campaign.dto';

export interface AudienceRecipient {
  email: string;
  name: string;
  merchantId?: string;
  merchantName?: string;
  userId?: string;
  role?: string;
}

@Injectable()
export class AudienceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get count of recipients for an audience segment
   */
  async getAudienceCount(segment: AudienceSegmentType, filters?: Record<string, any>): Promise<number> {
    switch (segment) {
      case AudienceSegmentType.ALL_MERCHANTS:
        return this.getAllMerchantsCount();
      
      case AudienceSegmentType.PENDING_MERCHANTS:
        return this.getPendingMerchantsCount();
      
      case AudienceSegmentType.ACTIVE_MERCHANTS:
        return this.getActiveMerchantsCount();
      
      case AudienceSegmentType.BANNED_USERS:
        return this.getBannedUsersCount();
      
      case AudienceSegmentType.INACTIVE_MERCHANTS:
        return this.getInactiveMerchantsCount();
      
      case AudienceSegmentType.HIGH_VOLUME_MERCHANTS:
        return this.getHighVolumeMerchantsCount();
      
      case AudienceSegmentType.NEW_SIGNUPS:
        return this.getNewSignupsCount();
      
      case AudienceSegmentType.MERCHANT_OWNERS:
        return this.getMerchantOwnersCount();
      
      case AudienceSegmentType.WAITERS:
        return this.getWaitersCount();
      
      case AudienceSegmentType.CUSTOM_FILTER:
        return this.getCustomFilteredCount(filters || {});
      
      default:
        return 0;
    }
  }

  /**
   * Get recipients for an audience segment
   */
  async getAudienceRecipients(
    segment: AudienceSegmentType, 
    filters?: Record<string, any>,
    limit?: number,
    offset?: number
  ): Promise<AudienceRecipient[]> {
    switch (segment) {
      case AudienceSegmentType.ALL_MERCHANTS:
        return this.getAllMerchants(limit, offset);
      
      case AudienceSegmentType.PENDING_MERCHANTS:
        return this.getPendingMerchants(limit, offset);
      
      case AudienceSegmentType.ACTIVE_MERCHANTS:
        return this.getActiveMerchants(limit, offset);
      
      case AudienceSegmentType.BANNED_USERS:
        return this.getBannedUsers(limit, offset);
      
      case AudienceSegmentType.INACTIVE_MERCHANTS:
        return this.getInactiveMerchants(limit, offset);
      
      case AudienceSegmentType.HIGH_VOLUME_MERCHANTS:
        return this.getHighVolumeMerchants(limit, offset);
      
      case AudienceSegmentType.NEW_SIGNUPS:
        return this.getNewSignups(limit, offset);
      
      case AudienceSegmentType.MERCHANT_OWNERS:
        return this.getMerchantOwners(limit, offset);
      
      case AudienceSegmentType.WAITERS:
        return this.getWaiters(limit, offset);
      
      case AudienceSegmentType.CUSTOM_FILTER:
        return this.getCustomFiltered(filters || {}, limit, offset);
      
      default:
        return [];
    }
  }

  private async getAllMerchants(limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where: {
        status: 'ACTIVE',
        email: { not: null },
      },
      include: {
        merchant: {
          select: { id: true, name: true },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return merchantUsers.map((mu: any) => ({
      email: mu.email,
      name: mu.name,
      merchantId: mu.merchant.id,
      merchantName: mu.merchant.name,
      userId: mu.userId,
      role: mu.role,
    }));
  }

  private async getPendingMerchants(limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where: {
        merchant: { status: 'PENDING' },
        role: 'MERCHANT_OWNER',
        email: { not: null },
      },
      include: {
        merchant: {
          select: { id: true, name: true },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return merchantUsers.map((mu: any) => ({
      email: mu.email,
      name: mu.name,
      merchantId: mu.merchant.id,
      merchantName: mu.merchant.name,
      userId: mu.userId,
      role: mu.role,
    }));
  }

  private async getActiveMerchants(limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where: {
        merchant: { status: 'ACTIVE' },
        status: 'ACTIVE',
        email: { not: null },
      },
      include: {
        merchant: {
          select: { id: true, name: true },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return merchantUsers.map((mu: any) => ({
      email: mu.email,
      name: mu.name,
      merchantId: mu.merchant.id,
      merchantName: mu.merchant.name,
      userId: mu.userId,
      role: mu.role,
    }));
  }

  private async getBannedUsers(limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where: {
        user: { banned: true },
        email: { not: null },
      },
      include: {
        merchant: {
          select: { id: true, name: true },
        },
        user: {
          select: { banned: true },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return merchantUsers.map((mu: any) => ({
      email: mu.email,
      name: mu.name,
      merchantId: mu.merchant.id,
      merchantName: mu.merchant.name,
      userId: mu.userId,
      role: mu.role,
    }));
  }

  private async getInactiveMerchants(limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where: {
        merchant: { status: 'ACTIVE' },
        status: 'ACTIVE',
        email: { not: null },
        user: {
          sessions: {
            none: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      },
      include: {
        merchant: {
          select: { id: true, name: true },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return merchantUsers.map((mu: any) => ({
      email: mu.email,
      name: mu.name,
      merchantId: mu.merchant.id,
      merchantName: mu.merchant.name,
      userId: mu.userId,
      role: mu.role,
    }));
  }

  private async getHighVolumeMerchants(limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get merchants with high transaction volume (using payment amounts)
    const highVolumeMerchants = await (this.prisma as any).merchant.findMany({
      where: {
        status: 'ACTIVE',
        payments: {
          some: {
            createdAt: { gte: lastMonth },
            claimedAmount: { gte: 1000 },
          },
        },
      },
      include: {
        users: {
          where: {
            role: 'MERCHANT_OWNER',
            status: 'ACTIVE',
            email: { not: null },
          },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return highVolumeMerchants.flatMap((merchant: any) =>
      merchant.users.map((mu: any) => ({
        email: mu.email,
        name: mu.name,
        merchantId: merchant.id,
        merchantName: merchant.name,
        userId: mu.userId,
        role: mu.role,
      }))
    );
  }

  private async getNewSignups(limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        email: { not: null },
      },
      include: {
        merchant: {
          select: { id: true, name: true },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return merchantUsers.map((mu: any) => ({
      email: mu.email,
      name: mu.name,
      merchantId: mu.merchant.id,
      merchantName: mu.merchant.name,
      userId: mu.userId,
      role: mu.role,
    }));
  }

  private async getMerchantOwners(limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where: {
        role: 'MERCHANT_OWNER',
        status: 'ACTIVE',
        email: { not: null },
      },
      include: {
        merchant: {
          select: { id: true, name: true },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return merchantUsers.map((mu: any) => ({
      email: mu.email,
      name: mu.name,
      merchantId: mu.merchant.id,
      merchantName: mu.merchant.name,
      userId: mu.userId,
      role: mu.role,
    }));
  }

  private async getWaiters(limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where: {
        role: 'WAITER',
        status: 'ACTIVE',
        email: { not: null },
      },
      include: {
        merchant: {
          select: { id: true, name: true },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return merchantUsers.map((mu: any) => ({
      email: mu.email,
      name: mu.name,
      merchantId: mu.merchant.id,
      merchantName: mu.merchant.name,
      userId: mu.userId,
      role: mu.role,
    }));
  }

  private async getCustomFiltered(filters: Record<string, any>, limit?: number, offset?: number): Promise<AudienceRecipient[]> {
    // Build dynamic where clause based on filters
    const where: any = {
      email: { not: null },
    };

    if (filters.merchantStatus) {
      where.merchant = { status: filters.merchantStatus };
    }

    if (filters.userRole) {
      where.role = filters.userRole;
    }

    if (filters.userStatus) {
      where.status = filters.userStatus;
    }

    if (filters.lastLoginDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - filters.lastLoginDays);
      
      where.user = {
        sessions: {
          some: {
            createdAt: { gte: daysAgo },
          },
        },
      };
    }

    const merchantUsers = await (this.prisma as any).merchantUser.findMany({
      where,
      include: {
        merchant: {
          select: { id: true, name: true },
        },
      },
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
    });

    return merchantUsers.map((mu: any) => ({
      email: mu.email,
      name: mu.name,
      merchantId: mu.merchant.id,
      merchantName: mu.merchant.name,
      userId: mu.userId,
      role: mu.role,
    }));
  }

  private buildAudienceQuery(segment: AudienceSegmentType, filters?: Record<string, any>): string {
    // This would return a SQL query string for counting
    // For now, we'll use the individual methods above
    return 'SELECT 1'; // Placeholder
  }

  // Count methods for each audience segment
  private async getAllMerchantsCount(): Promise<number> {
    return await (this.prisma as any).merchantUser.count({
      where: {
        status: 'ACTIVE',
        email: { not: null },
      },
    });
  }

  private async getPendingMerchantsCount(): Promise<number> {
    return await (this.prisma as any).merchantUser.count({
      where: {
        merchant: { status: 'PENDING' },
        role: 'MERCHANT_OWNER',
        email: { not: null },
      },
    });
  }

  private async getActiveMerchantsCount(): Promise<number> {
    return await (this.prisma as any).merchantUser.count({
      where: {
        merchant: { status: 'ACTIVE' },
        status: 'ACTIVE',
        email: { not: null },
      },
    });
  }

  private async getBannedUsersCount(): Promise<number> {
    return await (this.prisma as any).merchantUser.count({
      where: {
        user: { banned: true },
        email: { not: null },
      },
    });
  }

  private async getInactiveMerchantsCount(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await (this.prisma as any).merchantUser.count({
      where: {
        merchant: { status: 'ACTIVE' },
        status: 'ACTIVE',
        email: { not: null },
        user: {
          sessions: {
            none: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      },
    });
  }

  private async getHighVolumeMerchantsCount(): Promise<number> {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Count merchants with high transaction volume (using payment amounts)
    const merchants = await (this.prisma as any).merchant.findMany({
      where: {
        status: 'ACTIVE',
        payments: {
          some: {
            createdAt: { gte: lastMonth },
            claimedAmount: { gte: 1000 },
          },
        },
      },
      include: {
        users: {
          where: {
            role: 'MERCHANT_OWNER',
            status: 'ACTIVE',
            email: { not: null },
          },
        },
      },
    });

    return merchants.reduce((count, merchant) => count + merchant.users.length, 0);
  }

  private async getNewSignupsCount(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await (this.prisma as any).merchantUser.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        email: { not: null },
      },
    });
  }

  private async getMerchantOwnersCount(): Promise<number> {
    return await (this.prisma as any).merchantUser.count({
      where: {
        role: 'MERCHANT_OWNER',
        status: 'ACTIVE',
        email: { not: null },
      },
    });
  }

  private async getWaitersCount(): Promise<number> {
    return await (this.prisma as any).merchantUser.count({
      where: {
        role: 'WAITER',
        status: 'ACTIVE',
        email: { not: null },
      },
    });
  }

  private async getCustomFilteredCount(filters: Record<string, any>): Promise<number> {
    // Build dynamic where clause based on filters
    const where: any = {
      email: { not: null },
    };

    if (filters.merchantStatus) {
      where.merchant = { status: filters.merchantStatus };
    }

    if (filters.userRole) {
      where.role = filters.userRole;
    }

    if (filters.userStatus) {
      where.status = filters.userStatus;
    }

    if (filters.lastLoginDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - filters.lastLoginDays);
      
      where.user = {
        sessions: {
          some: {
            createdAt: { gte: daysAgo },
          },
        },
      };
    }

    return await (this.prisma as any).merchantUser.count({
      where,
    });
  }
}