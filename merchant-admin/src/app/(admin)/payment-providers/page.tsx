"use client";
import React, { useState } from "react";
import PaymentProvidersList from "@/components/payment-providers/PaymentProvidersList";
import ConfigureProviderModal from "@/components/payment-providers/ConfigureProviderModal";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { LockIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import {
  type TransactionProvider,
  useDisableActiveReceiverAccountMutation,
  useEnableLastReceiverAccountMutation,
  useGetActiveReceiverAccountsQuery,
  useSetActiveReceiverAccountMutation,
} from "@/lib/services/paymentsServiceApi";

interface ProviderData {
  id: string;
  accountNumber?: string;
  accountHolderName?: string;
  isEnabled?: boolean;
}

export default function PaymentProvidersPage() {
  const [configureModalOpen, setConfigureModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const { getFeatureLimit, isFeatureUnlimited, plan } = useSubscription();

  const { data: receiverAccountsData, refetch: refetchReceiverAccounts } = useGetActiveReceiverAccountsQuery();
  const [setActiveReceiverAccount] = useSetActiveReceiverAccountMutation();
  const [disableActiveReceiverAccount] = useDisableActiveReceiverAccountMutation();
  const [enableLastReceiverAccount] = useEnableLastReceiverAccountMutation();

  const receiverAccounts = receiverAccountsData?.data ?? [];
  
  // Get payment providers limit
  const paymentProvidersLimit = getFeatureLimit('paymentProviders') as number;
  const isUnlimited = isFeatureUnlimited('paymentProviders');
  const currentProvidersCount = receiverAccounts.filter(acc => acc.status === 'ACTIVE').length;

  const providerToTransactionProvider = (providerId: string): TransactionProvider | null => {
    switch (providerId.toLowerCase()) {
      case "cbe":
        return "CBE";
      case "telebirr":
        return "TELEBIRR";
      case "awash":
        return "AWASH";
      case "boa":
        return "BOA";
      case "dashen":
        return "DASHEN";
      default:
        return null;
    }
  };

  const handleConfigure = (providerId: string, provider?: any) => {
    const txProvider = providerToTransactionProvider(providerId);
    const existing = txProvider
      ? receiverAccounts
          .filter((x) => x.provider === txProvider)
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt as any).getTime() -
              new Date(a.createdAt as any).getTime(),
          )[0]
      : undefined;

    // Check if user can add/enable more providers
    // Use > instead of >= to allow the full limit (e.g., limit of 2 means you can have 2 providers)
    if (!isUnlimited && currentProvidersCount >= paymentProvidersLimit) {
      // Allow editing existing ACTIVE providers, but not adding new ones or enabling INACTIVE ones
      if (!existing) {
        // No existing configuration - this would be a new provider
        toast.warning(
          `You have reached the maximum number of payment providers for your ${plan?.name || 'current'} plan (${currentProvidersCount}/${paymentProvidersLimit}). To add more providers, please upgrade your plan.`,
          { duration: 5000 }
        );
        return;
      } else if (existing.status !== 'ACTIVE') {
        // Existing configuration but currently inactive - enabling would exceed limit
        toast.warning(
          `You have reached the maximum number of payment providers for your ${plan?.name || 'current'} plan (${currentProvidersCount}/${paymentProvidersLimit}). To enable more providers, please upgrade your plan.`,
          { duration: 5000 }
        );
        return;
      }
      // If existing and ACTIVE, allow editing (no additional provider count)
    }

    setSelectedProvider({
      id: providerId,
      accountNumber: existing?.receiverAccount ?? provider?.accountNumber,
      accountHolderName: existing?.receiverName ?? provider?.accountHolderName,
      isEnabled:
        existing?.status === "ACTIVE"
          ? true
          : existing
            ? false
            : provider?.status === "enabled" || provider?.status === "disabled",
    });
    setConfigureModalOpen(true);
  };

  const handleCloseModal = () => {
    setConfigureModalOpen(false);
    setSelectedProvider(null);
  };

  const handleSaveConfiguration = (providerId: string, action: "enable" | "disable" | "save") => {
    const providerName = providerId === "cbe" ? "CBE" : providerId.toUpperCase();
    
    if (action === "disable") {
      toast.success(`Provider ${providerName} disabled`);
    } else if (action === "enable") {
      toast.success(`Provider ${providerName} enabled`);
    } else {
      toast.success(`Provider ${providerName} configured successfully`);
    }
  };

  const handleDisableProvider = async (providerId: string) => {
    const provider = providerToTransactionProvider(providerId);
    if (!provider) {
      toast.error(`Unknown provider: ${providerId}`);
      return;
    }

    try {
      await disableActiveReceiverAccount({ provider }).unwrap();
      toast.success(`Provider ${providerId.toUpperCase()} disabled`);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to disable provider");
    }
  };

  const handleEnableProvider = (providerId: string) => {
    const provider = providerToTransactionProvider(providerId);
    if (!provider) {
      toast.error(`Unknown provider: ${providerId}`);
      return;
    }

    // Check if enabling this provider would exceed the limit
    // Use > instead of >= to allow the full limit (e.g., limit of 2 means you can have 2 providers)
    if (!isUnlimited && currentProvidersCount >= paymentProvidersLimit) {
      toast.warning(
        `You have reached the maximum number of payment providers for your ${plan?.name || 'current'} plan (${currentProvidersCount}/${paymentProvidersLimit}). Please upgrade your plan to enable more providers.`,
        { duration: 5000 }
      );
      return;
    }

    enableLastReceiverAccount({ provider })
      .unwrap()
      .then(() => {
        toast.success(`Provider ${providerId.toUpperCase()} enabled`);
      })
      .catch((e: any) => {
        // Handle subscription limit error from backend
        if (e?.status === 403 && e?.data?.upgradeRequired) {
          toast.warning(
            e.data.message || `Payment provider limit reached for your ${plan?.name || 'current'} plan. Please upgrade to enable more providers.`,
            { duration: 5000 }
          );
        } else {
          toast.error(e?.data?.message ?? "Failed to enable provider");
        }
      });
  };

  const handleSubmitConfiguration = async (input: {
    providerId: string;
    accountNumber: string;
    accountHolderName: string;
    isEnabled: boolean;
  }) => {
    const provider = providerToTransactionProvider(input.providerId);
    if (!provider) {
      const errorMsg = `Unknown provider: ${input.providerId}`;
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Trim and validate inputs
      const trimmedAccountNumber = input.accountNumber.trim();
      const trimmedAccountHolderName = input.accountHolderName.trim();

      if (!trimmedAccountNumber || !trimmedAccountHolderName) {
        const errorMsg = "Account number and holder name are required";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Call the API
      await setActiveReceiverAccount({
        provider,
        receiverAccount: trimmedAccountNumber,
        receiverName: trimmedAccountHolderName,
        receiverLabel: `${provider} Merchant Receiver`,
        enabled: input.isEnabled,
      }).unwrap();

      // Refetch to get updated data
      await refetchReceiverAccounts();

      // Show success message
      toast.success("Payment provider updated successfully");

      // Close modal after a short delay to allow toast to be visible
      setTimeout(() => {
        handleCloseModal();
      }, 100);
    } catch (e: any) {
      // Handle subscription limit error from backend
      if (e?.status === 403 && e?.data?.upgradeRequired) {
        const errorMessage = e.data.message || `Payment provider limit reached for your ${plan?.name || 'current'} plan. Please upgrade to enable more providers.`;
        toast.warning(errorMessage, { duration: 5000 });
      } else {
        // Extract error message
        const errorMessage =
          e?.data?.message ||
          e?.message ||
          "Failed to update payment provider. Please try again.";

        // Show error toast
        toast.error(errorMessage);
      }

      // Re-throw so modal can display the error
      throw e;
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription Protection Banner */}
      {!isUnlimited && currentProvidersCount >= paymentProvidersLimit && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <LockIcon className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Payment Provider Limit Reached
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You have reached the maximum number of payment providers for your <strong>{plan?.name || 'current'}</strong> plan 
                ({currentProvidersCount}/{paymentProvidersLimit}). You can edit existing providers, but to add new ones, please upgrade your plan.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/billing'}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Upgrade Plan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = '/billing'}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Payment Providers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure which payment methods your customers can use
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Active Providers: {currentProvidersCount}
            {!isUnlimited && (
              <span className="text-gray-700 dark:text-gray-300">
                /{paymentProvidersLimit}
              </span>
            )}
          </div>
          {!isUnlimited && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {plan?.name || 'Current'} Plan Limit
            </div>
          )}
        </div>
      </div>

      {/* Payment Providers List */}
      <PaymentProvidersList
        onConfigure={handleConfigure}
        onEnable={handleEnableProvider}
        onDisable={handleDisableProvider}
      />

      {/* Configure Modal */}
      {selectedProvider && (
        <ConfigureProviderModal
          isOpen={configureModalOpen}
          onClose={handleCloseModal}
          providerId={selectedProvider.id}
          initialData={{
            accountNumber: selectedProvider.accountNumber,
            accountHolderName: selectedProvider.accountHolderName,
            isEnabled: selectedProvider.isEnabled,
          }}
          onSave={handleSaveConfiguration}
          onSubmit={handleSubmitConfiguration}
        />
      )}
    </div>
  );
}

