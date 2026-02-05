import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../database/prisma.service';
import { SubscriptionService } from '../services/subscription.service';

// Metadata key for the decorator
export const SUBSCRIPTION_PROTECTION_KEY = 'subscription_protection';

// Interface for protection configuration
export interface SubscriptionProtectionConfig {
  feature: string; // Feature name (e.g., 'api_keys', 'webhooks', 'team_members')
  action?: 'create' | 'read' | 'update' | 'delete'; // Action type (default: 'create')
  customCheck?: (
    merchantId: string,
    currentUsage: any,
    limits: any,
  ) => Promise<boolean>;
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get protection configuration from decorator
    const protectionConfig =
      this.reflector.getAllAndOverride<SubscriptionProtectionConfig>(
        SUBSCRIPTION_PROTECTION_KEY,
        [context.getHandler(), context.getClass()],
      );

    // If no protection configured, allow access
    if (!protectionConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const merchantId = await this.extractMerchantId(request);

    if (!merchantId) {
      throw new ForbiddenException('Merchant ID not found');
    }

    // Check if subscription is expired first
    const isExpired =
      await this.subscriptionService.isSubscriptionExpired(merchantId);
    if (isExpired) {
      const daysRemaining =
        await this.subscriptionService.getDaysRemaining(merchantId);
      const isInTrial = await this.subscriptionService.isInTrial(merchantId);

      if (isInTrial && daysRemaining !== null && daysRemaining <= 0) {
        throw new ForbiddenException(
          'Your 7-day free trial has expired. Please upgrade to a paid plan to continue using FetanPay services.',
        );
      } else if (!isInTrial) {
        throw new ForbiddenException(
          'Your subscription has expired. Please renew your subscription to continue using FetanPay services.',
        );
      }
    }

    // Check subscription limits
    const canAccess = await this.checkSubscriptionLimits(
      merchantId,
      protectionConfig,
    );

    if (!canAccess) {
      const subscription =
        await this.subscriptionService.getMerchantSubscription(merchantId);
      const planName = subscription?.plan?.name || 'Free';

      // Generate specific error message based on feature
      let errorMessage: string;
      let currentUsage: number | undefined;
      let limit: number | undefined;

      if (protectionConfig.feature === 'verifications_monthly') {
        const rawUsage = await this.getCurrentFeatureUsage(
          merchantId,
          protectionConfig.feature,
        );
        currentUsage = this.getNumericValue(rawUsage);
        const planLimits = (subscription?.plan as any)?.limits || {};
        limit = planLimits[protectionConfig.feature];

        // Check if feature is not defined in plan (feature disabled)
        if (limit === undefined) {
          errorMessage = `Payment verification is not available in your ${planName} plan. Please upgrade your plan to access payment verification features.`;
        } else {
          // Feature is defined but limit reached
          errorMessage = `You have reached the maximum number of verifications for your ${planName} plan (${currentUsage}/${limit}). Each API call to /payments/verify counts as one verification, regardless of success or failure. Please upgrade your plan to continue verifying payments.`;
        }
      } else if (protectionConfig.feature === 'team_members') {
        currentUsage = await this.getCurrentFeatureUsage(
          merchantId,
          protectionConfig.feature,
        );
        const planLimits = (subscription?.plan as any)?.limits || {};
        limit = planLimits[protectionConfig.feature] || 2;

        errorMessage = `You have reached the maximum number of team members for your ${planName} plan (${currentUsage}/${limit}). Please upgrade your plan to add more team members.`;
      } else if (protectionConfig.feature === 'custom_branding') {
        errorMessage = `Custom branding is not available in your ${planName} plan. Please upgrade your plan to customize your branding.`;
      } else if (protectionConfig.feature === 'advanced_analytics') {
        errorMessage = `Advanced analytics is not available in your ${planName} plan. Please upgrade your plan to access detailed analytics and reporting.`;
      } else if (protectionConfig.feature === 'bank_accounts') {
        currentUsage = await this.getCurrentFeatureUsage(
          merchantId,
          protectionConfig.feature,
        );
        const planLimits = (subscription?.plan as any)?.limits || {};
        limit = planLimits[protectionConfig.feature] || 2;

        errorMessage = `You have reached the maximum number of bank accounts for your ${planName} plan (${currentUsage}/${limit}). Please upgrade your plan to add more bank accounts.`;
      } else if (protectionConfig.feature === 'payment_providers') {
        currentUsage = await this.getCurrentFeatureUsage(
          merchantId,
          protectionConfig.feature,
        );
        const planLimits = (subscription?.plan as any)?.limits || {};
        limit = planLimits[protectionConfig.feature] || 2;

        errorMessage = `You have reached the maximum number of payment providers for your ${planName} plan (${currentUsage}/${limit}). Please upgrade your plan to add more payment providers.`;
      } else if (protectionConfig.feature === 'tips') {
        errorMessage = `Tips feature is not available in your ${planName} plan. Please upgrade your plan to enable tips collection.`;
      } else {
        // Generic message for other features
        errorMessage = `This feature is not available in your ${planName} plan. Please upgrade to access this feature.`;
      }

      throw new ForbiddenException({
        message: errorMessage,
        feature: protectionConfig.feature,
        currentPlan: planName,
        currentUsage,
        limit,
        upgradeRequired: true,
      });
    }

    return true;
  }

  private async extractMerchantId(request: any): Promise<string | null> {
    // Try to get merchant ID from various sources

    // 1. From route parameters
    if (request.params?.merchantId) {
      return request.params.merchantId;
    }

    // 2. From API key authentication (set by ApiKeyGuard)
    if (request.authType === 'api_key' && request.merchantId) {
      return request.merchantId;
    }

    // 3. From user session (if user is a merchant user)
    if (request.user?.id) {
      const merchantUser = await this.prisma.merchantUser.findFirst({
        where: { userId: request.user.id, status: 'ACTIVE' },
        select: { merchantId: true },
      });
      if (merchantUser) {
        return merchantUser.merchantId;
      }
    }

    // 4. From request body
    if (request.body?.merchantId) {
      return request.body.merchantId;
    }

    return null;
  }

  private async checkSubscriptionLimits(
    merchantId: string,
    config: SubscriptionProtectionConfig,
  ): Promise<boolean> {
    try {
      // Get merchant's active subscription and plan
      const subscription =
        await this.subscriptionService.getMerchantSubscription(merchantId);

      if (!subscription?.plan) {
        // No subscription found, use free plan limits
        return this.checkFreePlanLimits(merchantId, config);
      }

      const planLimits = (subscription.plan as any).limits as any;

      // If custom check function provided, use it
      if (config.customCheck) {
        const currentUsage =
          await this.subscriptionService.getCurrentUsage(merchantId);
        return await config.customCheck(merchantId, currentUsage, planLimits);
      }

      // Standard limit checking
      return await this.checkStandardLimits(
        merchantId,
        config.feature,
        planLimits,
        subscription.plan,
      );
    } catch (error) {
      console.error('Error checking subscription limits:', error);
      // On error, deny access for safety
      return false;
    }
  }

  private async checkFreePlanLimits(
    merchantId: string,
    config: SubscriptionProtectionConfig,
  ): Promise<boolean> {
    // Default free plan limits
    const freePlanLimits = {
      verifications_monthly: 100,
      team_members: 2,
      bank_accounts: 2,
      payment_providers: 2,
      tips: false,
      custom_branding: false,
      advanced_analytics: false,
      export_functionality: false,
    };

    return await this.checkStandardLimits(
      merchantId,
      config.feature,
      freePlanLimits,
      null, // No plan object for free plan
    );
  }

  private async checkStandardLimits(
    merchantId: string,
    feature: string,
    limits: any,
    plan?: any,
  ): Promise<boolean> {
    // Get feature limit from plan
    const featureLimit = limits[feature];

    // If feature not defined in limits, check features array for boolean features
    if (featureLimit === undefined) {
      // For certain features, also check the features array
      if (
        feature === 'tips' ||
        feature === 'custom_branding' ||
        feature === 'advanced_analytics'
      ) {
        const planFeatures = plan?.features || [];
        const featureNames = {
          tips: ['tips collection', 'tips'],
          custom_branding: ['custom branding', 'branding'],
          advanced_analytics: ['advanced analytics', 'analytics'],
        };

        const searchTerms = featureNames[feature] || [];
        const hasFeature = planFeatures.some((planFeature) =>
          searchTerms.some((term) =>
            planFeature.toLowerCase().includes(term.toLowerCase()),
          ),
        );

        return hasFeature;
      }

      // For numerical features like verifications_monthly, if not defined = feature disabled
      if (
        feature === 'verifications_monthly' ||
        feature === 'api_calls_daily' ||
        feature === 'team_members' ||
        feature === 'bank_accounts' ||
        feature === 'payment_providers'
      ) {
        return false; // Feature not available in this plan
      }

      return true; // Allow access if not defined for other features
    }

    // If feature is boolean (feature toggle)
    if (typeof featureLimit === 'boolean') {
      return featureLimit;
    }

    // If feature is unlimited (-1 or null)
    if (featureLimit === -1 || featureLimit === null) {
      return true;
    }

    // If feature is numerical limit, check current usage
    if (typeof featureLimit === 'number') {
      const currentUsage = await this.getCurrentFeatureUsage(
        merchantId,
        feature,
      );
      return currentUsage < featureLimit;
    }

    // Default: allow access
    return true;
  }

  private getNumericValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    } else if (typeof value === 'object' && value && 'increment' in value) {
      return value.increment;
    }
    return 0;
  }

  private async getCurrentFeatureUsage(
    merchantId: string,
    feature: string,
  ): Promise<number> {
    switch (feature) {
      case 'team_members':
        // Count only employees, exclude the merchant owner
        return await this.prisma.merchantUser.count({
          where: {
            merchantId,
            status: 'ACTIVE',
            role: { not: 'MERCHANT_OWNER' }, // Exclude the owner from team members count
          },
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
        const usage =
          await this.subscriptionService.getCurrentUsage(merchantId);
        const verificationUsage = usage.verifications_monthly;
        // Handle both number and object formats
        if (typeof verificationUsage === 'number') {
          return verificationUsage;
        } else if (
          typeof verificationUsage === 'object' &&
          verificationUsage &&
          'increment' in verificationUsage
        ) {
          return (verificationUsage as any).increment;
        }
        return 0;

      default:
        return 0;
    }
  }
}
