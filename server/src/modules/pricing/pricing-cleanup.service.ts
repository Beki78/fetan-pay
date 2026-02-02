import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PricingCleanupService {
  private readonly logger = new Logger(PricingCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every 30 minutes to clean up stale assignments
  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupStaleAssignments() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Delete pending assignments older than 1 hour
      const result = await this.prisma.planAssignment.deleteMany({
        where: {
          isApplied: false,
          assignmentType: 'IMMEDIATE', // Only cleanup immediate assignments
          createdAt: {
            lt: oneHourAgo,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} stale plan assignments`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup stale assignments:', error);
    }
  }

  // Run daily to clean up old billing transactions in PENDING status
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupStaleBillingTransactions() {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      // Update old pending transactions to EXPIRED
      const result = await this.prisma.billingTransaction.updateMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: threeDaysAgo,
          },
        },
        data: {
          status: 'EXPIRED',
          processedAt: new Date(),
          processedBy: 'system-cleanup',
        },
      });

      if (result.count > 0) {
        this.logger.log(`Expired ${result.count} stale billing transactions`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup stale billing transactions:', error);
    }
  }

  // Manual cleanup method for admin use
  async manualCleanup(merchantId?: string) {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const where: any = {
        isApplied: false,
        assignmentType: 'IMMEDIATE',
        createdAt: {
          lt: thirtyMinutesAgo,
        },
      };

      if (merchantId) {
        where.merchantId = merchantId;
      }

      const result = await this.prisma.planAssignment.deleteMany({
        where,
      });

      return {
        message: `Cleaned up ${result.count} stale assignments`,
        count: result.count,
      };
    } catch (error) {
      this.logger.error('Manual cleanup failed:', error);
      throw error;
    }
  }
}
