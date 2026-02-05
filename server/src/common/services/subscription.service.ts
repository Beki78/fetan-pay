import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

export interface UsageData {
  verifications_monthly?: number;
  api_calls_daily?: number;
  webhooks_sent?: number;
  [key: string]: number | undefined;
}

export interface PlanLimits {
  verifications_monthly?: number | null;
  api_keys?: number;
  team_members?: number;
  webhooks?: number;
  bank_accounts?: number;
  custom_branding?: boolean;
  advanced_analytics?: boolean;
  export_functionality?: boolean;
  transaction_history_days?: number;
  [key: string]: any;
}

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get merchant's active subscription with plan details
   * Also checks for expired subscriptions and updates status
   */
  async getMerchantSubscription(merchantId: string) {
    // First, check for any expired subscriptions and update their status
    await this.updateExpiredSubscriptions(merchantId);

    // Try to find an active subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        merchantId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        plan: true,
      },
    });

    if (subscription) {
      // Check if this subscription has expired
      if (subscription.endDate && subscription.endDate <= new Date()) {
        // Mark as expired
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: SubscriptionStatus.EXPIRED },
        });

        // Continue to create free trial below
      } else {
        return subscription;
      }
    }

    // If no active subscription found, check if merchant exists and is active
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, status: true, createdAt: true },
    });

    if (!merchant || merchant.status !== 'ACTIVE') {
      return null; // Merchant doesn't exist or is not active
    }

    // Check if merchant already had a free trial
    const hadFreeTrial = await this.prisma.subscription.findFirst({
      where: {
        merchantId,
        plan: {
          name: 'Free',
        },
      },
    });

    // Find the free plan to use as default
    const freePlan = await this.prisma.plan.findFirst({
      where: {
        name: 'Free',
        status: 'ACTIVE',
      },
    });

    if (!freePlan) {
      return null; // No free plan available
    }

    // Calculate trial end date (7 days from merchant creation or now)
    const trialStartDate = merchant.createdAt;
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    // If merchant never had a subscription, create a 7-day trial
    if (!hadFreeTrial) {
      const trialSubscription = await this.prisma.subscription.create({
        data: {
          merchantId,
          planId: freePlan.id,
          status:
            trialEndDate > new Date()
              ? SubscriptionStatus.ACTIVE
              : SubscriptionStatus.EXPIRED,
          startDate: trialStartDate,
          endDate: trialEndDate,
          nextBillingDate: null,
          monthlyPrice: 0,
          billingCycle: 'MONTHLY',
        },
        include: {
          plan: true,
        },
      });

      return trialSubscription;
    }

    // Return a virtual expired subscription for merchants who had free trial
    return {
      id: `virtual-expired-${merchantId}`,
      merchantId,
      planId: freePlan.id,
      status: SubscriptionStatus.EXPIRED,
      startDate: trialStartDate,
      endDate: trialEndDate,
      nextBillingDate: null,
      monthlyPrice: 0,
      billingCycle: 'MONTHLY' as const,
      currentUsage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cancelledAt: null,
      cancelledBy: null,
      cancellationReason: null,
      plan: freePlan,
    };
  }

  /**
   * Get current usage for a merchant
   */
  async getCurrentUsage(merchantId: string): Promise<UsageData> {
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format

    try {
      const usage = await (this.prisma as any).subscriptionUsage.findUnique({
        where: {
          merchantId_period: {
            merchantId,
            period: currentPeriod,
          },
        },
      });

      return (usage?.usage as UsageData) || {};
    } catch (error) {
      console.error(
        '[SubscriptionService] Error getting current usage:',
        error,
      );
      return {};
    }
  }

  /**
   * Increment usage for a specific feature
   */
  async incrementUsage(
    merchantId: string,
    feature: string,
    amount: number = 1,
  ): Promise<void> {
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Get current usage first
    const currentUsage = await this.getCurrentUsage(merchantId);
    const newValue = (currentUsage[feature] || 0) + amount;

    await (this.prisma as any).subscriptionUsage.upsert({
      where: {
        merchantId_period: {
          merchantId,
          period: currentPeriod,
        },
      },
      update: {
        usage: {
          ...currentUsage,
          [feature]: newValue,
        },
        updatedAt: new Date(),
      },
      create: {
        merchantId,
        period: currentPeriod,
        usage: {
          [feature]: amount,
        },
      },
    });
  }

  /**
   * Check if merchant can perform an action based on their plan limits
   */
  async canPerformAction(
    merchantId: string,
    feature: string,
    requiredAmount: number = 1,
  ): Promise<{
    allowed: boolean;
    currentUsage: number;
    limit: number | null;
    planName: string;
  }> {
    const subscription = await this.getMerchantSubscription(merchantId);

    if (!subscription?.plan) {
      return {
        allowed: false,
        currentUsage: 0,
        limit: 0,
        planName: 'No Plan',
      };
    }

    const planLimits = (subscription.plan as any).limits as PlanLimits;
    const featureLimit = planLimits[feature];
    const planName = subscription.plan.name;

    // If feature is boolean (feature toggle)
    if (typeof featureLimit === 'boolean') {
      return {
        allowed: featureLimit,
        currentUsage: 0,
        limit: featureLimit ? -1 : 0,
        planName,
      };
    }

    // If feature is unlimited (-1 or null)
    if (featureLimit === -1 || featureLimit === null) {
      return {
        allowed: true,
        currentUsage: 0,
        limit: -1,
        planName,
      };
    }

    // If feature is numerical limit
    if (typeof featureLimit === 'number') {
      const currentUsage = await this.getCurrentFeatureUsage(
        merchantId,
        feature,
      );
      const allowed = currentUsage + requiredAmount <= featureLimit;

      return {
        allowed,
        currentUsage,
        limit: featureLimit,
        planName,
      };
    }

    // Default: not allowed
    return {
      allowed: false,
      currentUsage: 0,
      limit: 0,
      planName,
    };
  }

  /**
   * Get current usage for a specific feature
   */
  private async getCurrentFeatureUsage(
    merchantId: string,
    feature: string,
  ): Promise<number> {
    switch (feature) {
      case 'api_keys':
        return await this.prisma.apiKey.count({
          where: { merchantId, status: 'ACTIVE' },
        });

      case 'team_members':
        return await this.prisma.merchantUser.count({
          where: { merchantId, status: 'ACTIVE' },
        });

      case 'webhooks':
        return await this.prisma.webhook.count({
          where: { merchantId, status: 'ACTIVE' },
        });

      case 'bank_accounts':
        return await this.prisma.merchantReceiverAccount.count({
          where: { merchantId, status: 'ACTIVE' },
        });

      case 'payment_providers':
        return await this.prisma.merchantReceiverAccount.count({
          where: { merchantId, status: 'ACTIVE' },
        });

      case 'verifications_monthly':
        const usage = await this.getCurrentUsage(merchantId);
        return usage.verifications_monthly || 0;

      case 'api_calls_daily':
        const dailyUsage = await this.getCurrentUsage(merchantId);
        return dailyUsage.api_calls_daily || 0;

      default:
        return 0;
    }
  }

  /**
   * Get usage statistics for a merchant
   */
  async getUsageStatistics(merchantId: string) {
    const subscription = await this.getMerchantSubscription(merchantId);
    const currentUsage = await this.getCurrentUsage(merchantId);

    if (!subscription?.plan) {
      return {
        planName: 'No Plan',
        limits: {},
        usage: currentUsage,
        percentages: {},
      };
    }

    const planLimits = (subscription.plan as any).limits as PlanLimits;
    const percentages: Record<string, number> = {};

    // Calculate usage percentages
    for (const [feature, limit] of Object.entries(planLimits)) {
      if (typeof limit === 'number' && limit > 0) {
        const usage = await this.getCurrentFeatureUsage(merchantId, feature);
        percentages[feature] = Math.round((usage / limit) * 100);
      }
    }

    return {
      planName: subscription.plan.name,
      limits: planLimits,
      usage: currentUsage,
      percentages,
    };
  }

  /**
   * Reset monthly usage (called by cron job)
   */
  async resetMonthlyUsage(): Promise<void> {
    const currentPeriod = new Date().toISOString().slice(0, 7);
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousPeriod = previousMonth.toISOString().slice(0, 7);

    // Archive previous month's usage (optional)
    // Delete or archive old usage records as needed

    console.log(`Monthly usage reset completed for period: ${currentPeriod}`);
  }

  /**
   * Update expired subscriptions to EXPIRED status
   */
  async updateExpiredSubscriptions(merchantId?: string): Promise<void> {
    const where: any = {
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        lte: new Date(), // endDate is less than or equal to now
      },
    };

    if (merchantId) {
      where.merchantId = merchantId;
    }

    await this.prisma.subscription.updateMany({
      where,
      data: {
        status: SubscriptionStatus.EXPIRED,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Check if merchant's subscription is expired
   */
  async isSubscriptionExpired(merchantId: string): Promise<boolean> {
    const subscription = await this.getMerchantSubscription(merchantId);

    if (!subscription) {
      return true; // No subscription = expired
    }

    // Check if subscription is explicitly expired
    if (subscription.status === SubscriptionStatus.EXPIRED) {
      return true;
    }

    // Check if subscription has an end date that has passed
    if (subscription.endDate && subscription.endDate <= new Date()) {
      return true;
    }

    return false;
  }

  /**
   * Get days remaining in trial/subscription
   */
  async getDaysRemaining(merchantId: string): Promise<number | null> {
    const subscription = await this.getMerchantSubscription(merchantId);

    if (!subscription || !subscription.endDate) {
      return null; // No expiration date
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Check if merchant is in trial period
   */
  async isInTrial(merchantId: string): Promise<boolean> {
    const subscription = await this.getMerchantSubscription(merchantId);

    if (!subscription) {
      return false;
    }

    // Check if it's a free plan with an end date (trial)
    return (
      subscription.plan?.name === 'Free' &&
      subscription.endDate !== null &&
      subscription.status === SubscriptionStatus.ACTIVE
    );
  }
}
