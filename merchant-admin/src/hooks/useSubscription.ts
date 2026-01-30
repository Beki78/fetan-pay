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
    
    return {
      customBranding: hasCustomBranding,
      apiKeys: limits.api_keys ?? 2,
      webhooks: limits.webhooks ?? 1,
      teamMembers: limits.team_members ?? 2,
      bankAccounts: limits.bank_accounts ?? 2,
      // Use payment_providers if set, otherwise fall back to bank_accounts (they're the same thing)
      paymentProviders: limits.payment_providers !== undefined ? limits.payment_providers : (limits.bank_accounts ?? 2),
      verificationsMonthly: limits.verifications_monthly ?? 100,
      advancedAnalytics: hasAdvancedAnalytics,
      exportFunctionality: limits.export_functionality ?? false,
      transactionHistoryDays: limits.transaction_history_days ?? 30,
    };
  }, [plan?.limits, plan?.features]);

  const canAccessFeature = (feature: keyof SubscriptionFeatures): boolean => {
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
  };
};