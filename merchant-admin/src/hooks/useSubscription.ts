import { useMemo } from 'react';
import { useGetMerchantSubscriptionQuery } from '@/lib/services/pricingServiceApi';
import { useSession } from './useSession';

export interface SubscriptionFeatures {
  customBranding: boolean;
  apiKeys: number;
  webhooks: number;
  teamMembers: number;
  bankAccounts: number;
  paymentProviders: number;
  verificationsMonthly: number;
  advancedAnalytics: boolean;
  exportFunctionality: boolean;
  transactionHistoryDays: number;
  tips: boolean;
}

export interface UseSubscriptionReturn {
  subscription: any;
  plan: any;
  features: SubscriptionFeatures;
  isLoading: boolean;
  error: any;
  canAccessFeature: (feature: keyof SubscriptionFeatures) => boolean;
  getFeatureLimit: (feature: keyof SubscriptionFeatures) => number | boolean;
  isFeatureUnlimited: (feature: keyof SubscriptionFeatures) => boolean;
  isInTrial: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  trialEndDate: Date | null;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useSession();
  
  // Get merchantId from session
  const merchantId = useMemo(() => {
    const meta = (user as any)?.metadata;
    if (meta?.merchantId) return meta.merchantId as string;
    if (meta?.merchant?.id) return meta.merchant.id as string;
    if ((user as any)?.merchantId) return (user as any).merchantId as string;
    if ((user as any)?.merchant?.id) return (user as any).merchant.id as string;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("merchantId");
      if (stored) return stored;
    }
    return null;
  }, [user]);

  const {
    data: subscriptionResponse,
    isLoading,
    error,
  } = useGetMerchantSubscriptionQuery(merchantId ?? "", {
    skip: !merchantId,
  });

  const subscription = subscriptionResponse?.subscription;

  const plan = subscription?.plan;

  // Extract features from plan limits with defaults for free plan
  const features: SubscriptionFeatures = useMemo(() => {
    const limits = plan?.limits || {};
    const planFeatures = plan?.features || [];
    
    // Debug logging
    console.log('useSubscription - Plan data:', { 
      planName: plan?.name, 
      limits, 
      features: planFeatures,
      paymentProvidersLimit: limits.payment_providers,
      bankAccountsLimit: limits.bank_accounts,
    });
    
    // Check both limits object and features array for custom branding
    const hasCustomBranding = limits.custom_branding === true || 
                             planFeatures.some(feature => 
                               feature.toLowerCase().includes('custom branding') || 
                               feature.toLowerCase().includes('branding')
                             );
    
    // Check both limits object and features array for advanced analytics
    const hasAdvancedAnalytics = limits.advanced_analytics === true || 
                               planFeatures.some(feature => 
                                 feature.toLowerCase().includes('advanced analytics') || 
                                 feature.toLowerCase().includes('analytics')
                               );
    
    console.log('useSubscription - Custom branding check:', {
      fromLimits: limits.custom_branding,
      fromFeatures: planFeatures.some(feature => 
        feature.toLowerCase().includes('custom branding') || 
        feature.toLowerCase().includes('branding')
      ),
      finalResult: hasCustomBranding
    });
    
    console.log('useSubscription - Advanced analytics check:', {
      fromLimits: limits.advanced_analytics,
      fromFeatures: planFeatures.some(feature => 
        feature.toLowerCase().includes('advanced analytics') || 
        feature.toLowerCase().includes('analytics')
      ),
      finalResult: hasAdvancedAnalytics
    });
    
    // Check both limits object and features array for tips
    const hasTips = limits.tips === true || 
                   planFeatures.some(feature => 
                     feature.toLowerCase().includes('tips collection') || 
                     feature.toLowerCase().includes('tips')
                   );
    
    console.log('useSubscription - Tips check:', {
      fromLimits: limits.tips,
      fromFeatures: planFeatures.some(feature => 
        feature.toLowerCase().includes('tips collection') || 
        feature.toLowerCase().includes('tips')
      ),
      planFeatures: planFeatures,
      finalResult: hasTips
    });

    // Check both limits object and features array for team members
    // For team members, we need the actual limit number, not just a boolean
    const teamMembersLimit = limits.team_members !== undefined 
      ? limits.team_members 
      : planFeatures.some(feature => 
          feature.toLowerCase().includes('team members') || 
          feature.toLowerCase().includes('team member')
        ) 
      ? 2 // Default if feature is enabled but no limit specified
      : 2; // Default fallback
    
    console.log('useSubscription - Team members check:', {
      fromLimits: limits.team_members,
      fromFeatures: planFeatures.some(feature => 
        feature.toLowerCase().includes('team members') || 
        feature.toLowerCase().includes('team member')
      ),
      planFeatures: planFeatures,
      finalTeamMembersLimit: teamMembersLimit
    });
    
    return {
      customBranding: hasCustomBranding,
      apiKeys: limits.api_keys ?? 2,
      webhooks: limits.webhooks ?? 1,
      teamMembers: teamMembersLimit,
      bankAccounts: limits.bank_accounts ?? 2,
      // Use payment_providers if set, otherwise unlimited (undefined means feature disabled/unlimited)
      paymentProviders: limits.payment_providers !== undefined ? limits.payment_providers : -1,
      verificationsMonthly: limits.verifications_monthly ?? 100,
      advancedAnalytics: hasAdvancedAnalytics,
      exportFunctionality: limits.export_functionality ?? false,
      tips: hasTips,
      transactionHistoryDays: limits.transaction_history_days ?? 30,
    };
  }, [plan?.limits, plan?.features]);

  // Calculate trial information
  const trialInfo = useMemo(() => {
    if (!subscription) {
      return {
        isInTrial: false,
        isExpired: true,
        daysRemaining: null,
        trialEndDate: null,
      };
    }

    const isFreePlan = plan?.name === 'Free';
    const hasEndDate = subscription.endDate !== null;
    const isActive = subscription.status === 'ACTIVE';
    const isExpiredStatus = subscription.status === 'EXPIRED';

    // Check if subscription is expired
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    const now = new Date();
    const isExpiredByDate = endDate && endDate <= now;

    // Calculate days remaining
    let daysRemaining = null;
    if (endDate) {
      const diffTime = endDate.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return {
      isInTrial: isFreePlan && hasEndDate && isActive,
      isExpired: isExpiredStatus || isExpiredByDate || false,
      daysRemaining,
      trialEndDate: endDate,
    };
  }, [subscription, plan]);

  const canAccessFeature = (feature: keyof SubscriptionFeatures): boolean => {
    // If subscription is expired, deny access to all features
    if (trialInfo.isExpired) {
      return false;
    }

    const featureValue = features[feature];
    
    // For boolean features, return the boolean value
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    
    // For numeric features, return true if > 0 or unlimited (-1)
    if (typeof featureValue === 'number') {
      return featureValue > 0 || featureValue === -1;
    }
    
    return false;
  };

  const getFeatureLimit = (feature: keyof SubscriptionFeatures): number | boolean => {
    return features[feature];
  };

  const isFeatureUnlimited = (feature: keyof SubscriptionFeatures): boolean => {
    const featureValue = features[feature];
    return typeof featureValue === 'number' && featureValue === -1;
  };

  return {
    subscription,
    plan,
    features,
    isLoading,
    error,
    canAccessFeature,
    getFeatureLimit,
    isFeatureUnlimited,
    isInTrial: trialInfo.isInTrial,
    isExpired: trialInfo.isExpired,
    daysRemaining: trialInfo.daysRemaining,
    trialEndDate: trialInfo.trialEndDate,
  };
};