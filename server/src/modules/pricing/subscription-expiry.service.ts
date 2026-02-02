import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionExpiryService {
  private readonly logger = new Logger(SubscriptionExpiryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Check for subscriptions expiring in 2 days - runs daily at 9 AM
   */
  @Cron('0 9 * * *', {
    name: 'check-expiring-subscriptions',
    timeZone: 'Africa/Addis_Ababa',
  })
  async checkExpiringSubscriptions() {
    this.logger.log('Checking for subscriptions expiring in 2 days...');

    try {
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      twoDaysFromNow.setHours(23, 59, 59, 999); // End of day

      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 2);
      oneDayFromNow.setHours(0, 0, 0, 0); // Start of day

      // Find subscriptions expiring in exactly 2 days
      const expiringSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          endDate: {
            gte: oneDayFromNow,
            lte: twoDaysFromNow,
          },
        },
        include: {
          merchant: {
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          },
          plan: true,
        },
      });

      this.logger.log(
        `Found ${expiringSubscriptions.length} subscriptions expiring in 2 days`,
      );

      for (const subscription of expiringSubscriptions) {
        try {
          const daysLeft = Math.ceil(
            (subscription.endDate!.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          );

          const subscriptionDetails = {
            planName: subscription.plan.name,
            expirationDate: subscription.endDate!,
            daysLeft,
          };

          // Notify merchant
          const ownerUser = subscription.merchant.users.find((u) => u.userId);
          if (ownerUser?.userId) {
            await this.notificationService.notifySubscriptionExpiringSoon(
              subscription.merchantId,
              subscription.merchant.name,
              ownerUser.userId,
              subscriptionDetails,
            );
          } else {
            // Fallback to email if no Better Auth user
            const ownerWithEmail = subscription.merchant.users.find(
              (u) => u.email,
            );
            if (ownerWithEmail?.email) {
              await this.notificationService.notifySubscriptionExpiringSoonByEmail(
                subscription.merchantId,
                subscription.merchant.name,
                ownerWithEmail.email,
                subscriptionDetails,
              );
            }
          }

          // Notify admins
          await this.notificationService.notifyAdminsSubscriptionExpiringSoon(
            subscription.merchantId,
            subscription.merchant.name,
            subscriptionDetails,
          );

          this.logger.log(
            `Sent expiring notification for merchant ${subscription.merchant.name} (${subscription.merchantId})`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send expiring notification for subscription ${subscription.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to check expiring subscriptions:', error);
    }
  }

  /**
   * Check for expired subscriptions - runs daily at 10 AM
   */
  @Cron('0 10 * * *', {
    name: 'check-expired-subscriptions',
    timeZone: 'Africa/Addis_Ababa',
  })
  async checkExpiredSubscriptions() {
    this.logger.log('Checking for expired subscriptions...');

    try {
      const now = new Date();

      // Find subscriptions that expired today or earlier but are still active
      const expiredSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          endDate: {
            lt: now,
          },
        },
        include: {
          merchant: {
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          },
          plan: true,
        },
      });

      this.logger.log(
        `Found ${expiredSubscriptions.length} expired subscriptions`,
      );

      for (const subscription of expiredSubscriptions) {
        try {
          // Update subscription status to expired
          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: SubscriptionStatus.EXPIRED,
            },
          });

          const subscriptionDetails = {
            planName: subscription.plan.name,
            expiredDate: subscription.endDate!,
          };

          // Notify merchant
          const ownerUser = subscription.merchant.users.find((u) => u.userId);
          if (ownerUser?.userId) {
            await this.notificationService.notifySubscriptionExpired(
              subscription.merchantId,
              subscription.merchant.name,
              ownerUser.userId,
              subscriptionDetails,
            );
          } else {
            // Fallback to email if no Better Auth user
            const ownerWithEmail = subscription.merchant.users.find(
              (u) => u.email,
            );
            if (ownerWithEmail?.email) {
              await this.notificationService.notifySubscriptionExpiredByEmail(
                subscription.merchantId,
                subscription.merchant.name,
                ownerWithEmail.email,
                subscriptionDetails,
              );
            }
          }

          // Notify admins
          await this.notificationService.notifyAdminsSubscriptionExpired(
            subscription.merchantId,
            subscription.merchant.name,
            subscriptionDetails,
          );

          this.logger.log(
            `Processed expired subscription for merchant ${subscription.merchant.name} (${subscription.merchantId})`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process expired subscription ${subscription.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to check expired subscriptions:', error);
    }
  }

  /**
   * Manual method to check expiring subscriptions (for testing)
   */
  async manualCheckExpiringSubscriptions() {
    this.logger.log('Manual check for expiring subscriptions triggered');
    await this.checkExpiringSubscriptions();
  }

  /**
   * Manual method to check expired subscriptions (for testing)
   */
  async manualCheckExpiredSubscriptions() {
    this.logger.log('Manual check for expired subscriptions triggered');
    await this.checkExpiredSubscriptions();
  }
}
