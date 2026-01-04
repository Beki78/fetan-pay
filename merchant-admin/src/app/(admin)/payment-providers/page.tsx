"use client";
import React, { useState } from "react";
import PaymentProvidersList from "@/components/payment-providers/PaymentProvidersList";
import ConfigureProviderModal from "@/components/payment-providers/ConfigureProviderModal";
import { useToast } from "@/components/ui/toast/useToast";
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
  const { showToast, ToastComponent } = useToast();

  const { data: receiverAccountsData } = useGetActiveReceiverAccountsQuery();
  const [setActiveReceiverAccount] = useSetActiveReceiverAccountMutation();
  const [disableActiveReceiverAccount] = useDisableActiveReceiverAccountMutation();
  const [enableLastReceiverAccount] = useEnableLastReceiverAccountMutation();

  const receiverAccounts = receiverAccountsData?.data ?? [];

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
      showToast(`Provider ${providerName} disabled`, "success");
    } else if (action === "enable") {
      showToast(`Provider ${providerName} enabled`, "success");
    } else {
      showToast(`Provider ${providerName} configured successfully`, "success");
    }
  };

  const handleDisableProvider = async (providerId: string) => {
    const provider = providerToTransactionProvider(providerId);
    if (!provider) {
      showToast(`Unknown provider: ${providerId}`, "error");
      return;
    }

    try {
      await disableActiveReceiverAccount({ provider }).unwrap();
      showToast(`Provider ${providerId.toUpperCase()} disabled`, "success");
    } catch (e: any) {
      showToast(e?.data?.message ?? "Failed to disable provider", "error");
    }
  };

  const handleEnableProvider = (providerId: string) => {
    const provider = providerToTransactionProvider(providerId);
    if (!provider) {
      showToast(`Unknown provider: ${providerId}`, "error");
      return;
    }

    enableLastReceiverAccount({ provider })
      .unwrap()
      .then(() => {
        showToast(`Provider ${providerId.toUpperCase()} enabled`, "success");
      })
      .catch((e: any) => {
        showToast(e?.data?.message ?? "Failed to enable provider", "error");
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
      throw new Error(`Unknown provider: ${input.providerId}`);
    }

    await setActiveReceiverAccount({
      provider,
      receiverAccount: input.accountNumber,
      receiverName: input.accountHolderName,
      receiverLabel: `${provider} Merchant Receiver`,
      enabled: input.isEnabled,
    }).unwrap();

    showToast("Receiver account saved", "success");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <ToastComponent />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          Payment Providers
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure which payment methods your customers can use
        </p>
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

