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
   */
  async getMerchantSubscription(merchantId: string) {
    // First, try to find an active subscription
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
      return subscription;
    }

    // If no subscription found, check if merchant exists and is active
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, status: true },
    });

    if (!merchant || merchant.status !== 'ACTIVE') {
      return null; // Merchant doesn't exist or is not active
    }

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

    // Return a virtual subscription for the free plan
    return {
      id: `virtual-free-${merchantId}`,
      merchantId,
      planId: freePlan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: null,
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
}
