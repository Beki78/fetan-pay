import { useMemo } from "react";
import { useGetMerchantSubscriptionQuery } from "@/lib/services/subscriptionServiceApi";
import { useSession } from "./useSession";

export interface SubscriptionFeatures {
  tips: boolean;
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
  const { user, membership } = useSession();

  // Get merchantId from session
  const merchantId = useMemo(() => {
    // The membership response structure is: { membership: { merchant: { id: string } } }
    // So we need to access membership.membership.merchant.id
    const actualMembership = (membership as any)?.membership;

    // First try to get from the correct membership structure
    if (actualMembership?.merchant?.id) {
      return actualMembership.merchant.id as string;
    }

    // Fallback to direct membership access (in case structure is different)
    if (membership?.merchant?.id) {
      return membership.merchant.id as string;
    }

    if (membership?.merchantId) {
      return membership.merchantId as string;
    }

    // Then try user metadata
    const meta = (user as any)?.metadata;
    if (meta?.merchantId) {
      return meta.merchantId as string;
    }
    if (meta?.merchant?.id) {
      return meta.merchant.id as string;
    }
    if ((user as any)?.merchantId) {
      return (user as any).merchantId as string;
    }
    if ((user as any)?.merchant?.id) {
      return (user as any).merchant.id as string;
    }

    // Finally try localStorage as fallback
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("merchantId");
      if (stored) {
        return stored;
      }
    }

    return null;
  }, [user, membership]);

  const {
    data: subscriptionResponse,
    isLoading,
    error,
  } = useGetMerchantSubscriptionQuery(merchantId ?? "", {
    skip: !merchantId,
  });

  const subscription = subscriptionResponse?.subscription;
  const plan = subscription?.plan;

  console.log("🔍 [useSubscription] Subscription data:", {
    subscription,
    plan,
    planLimits: plan?.limits,
    planFeatures: plan?.features,
    rawSubscriptionResponse: subscriptionResponse,
    subscriptionResponseKeys: subscriptionResponse
      ? Object.keys(subscriptionResponse)
      : null,
  });

  // Extract features from plan limits with defaults for free plan
  const features: SubscriptionFeatures = useMemo(() => {
    const limits = plan?.limits || {};
    const planFeatures = plan?.features || [];

    console.log("🔍 [useSubscription] Features extraction debug:", {
      limits,
      planFeatures,
      limitsKeys: Object.keys(limits),
      limitsHasTips: limits.tips,
      limitsHasTipsType: typeof limits.tips,
      limitsHasTipsValue: limits.tips === true,
    });

    // Check both limits object and features array for tips
    const hasTips =
      limits.tips === true ||
      planFeatures.some(
        (feature) =>
          feature.toLowerCase().includes("tips collection") ||
          feature.toLowerCase().includes("tips"),
      );

    console.log("🔍 [useSubscription] Tips check detailed:", {
      limitsObject: limits,
      planFeatures: planFeatures,
      limitsHasTips: limits.tips,
      limitsHasTipsStrictCheck: limits.tips === true,
      featuresHasTips: planFeatures.some(
        (feature) =>
          feature.toLowerCase().includes("tips collection") ||
          feature.toLowerCase().includes("tips"),
      ),
      finalHasTips: hasTips,
    });

    // Check both limits object and features array for custom branding
    const hasCustomBranding =
      limits.custom_branding === true ||
      planFeatures.some(
        (feature) =>
          feature.toLowerCase().includes("custom branding") ||
          feature.toLowerCase().includes("branding"),
      );

    // Check both limits object and features array for advanced analytics
    const hasAdvancedAnalytics =
      limits.advanced_analytics === true ||
      planFeatures.some(
        (feature) =>
          feature.toLowerCase().includes("advanced analytics") ||
          feature.toLowerCase().includes("analytics"),
      );

    return {
      tips: hasTips,
      customBranding: hasCustomBranding,
      apiKeys: limits.api_keys ?? 2,
      webhooks: limits.webhooks ?? 1,
      teamMembers: limits.team_members ?? 2,
      bankAccounts: limits.bank_accounts ?? 2,
      paymentProviders:
        limits.payment_providers !== undefined
          ? limits.payment_providers
          : (limits.bank_accounts ?? 2),
      verificationsMonthly: limits.verifications_monthly ?? 100,
      advancedAnalytics: hasAdvancedAnalytics,
      exportFunctionality: limits.export_functionality ?? false,
      transactionHistoryDays: limits.transaction_history_days ?? 30,
    };
  }, [plan?.limits, plan?.features]);

  const canAccessFeature = (feature: keyof SubscriptionFeatures): boolean => {
    const featureValue = features[feature];

    // For boolean features, return the boolean value
    if (typeof featureValue === "boolean") {
      return featureValue;
    }

    // For numeric features, return true if > 0 or unlimited (-1)
    if (typeof featureValue === "number") {
      return featureValue > 0 || featureValue === -1;
    }

    return false;
  };

  const getFeatureLimit = (
    feature: keyof SubscriptionFeatures,
  ): number | boolean => {
    return features[feature];
  };

  const isFeatureUnlimited = (feature: keyof SubscriptionFeatures): boolean => {
    const featureValue = features[feature];
    return typeof featureValue === "number" && featureValue === -1;
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
