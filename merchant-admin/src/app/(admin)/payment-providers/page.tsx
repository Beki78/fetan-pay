"use client";
import React, { useState } from "react";
import PaymentProvidersList from "@/components/payment-providers/PaymentProvidersList";
import ConfigureProviderModal from "@/components/payment-providers/ConfigureProviderModal";
import { useToast } from "@/components/ui/toast/useToast";

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

  const handleConfigure = (providerId: string, provider?: any) => {
    setSelectedProvider({
      id: providerId,
      accountNumber: provider?.accountNumber,
      accountHolderName: provider?.accountHolderName,
      isEnabled: provider?.status === "enabled" || provider?.status === "disabled",
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
        onEnable={(providerId) => handleSaveConfiguration(providerId, "enable")}
        onDisable={(providerId) => handleSaveConfiguration(providerId, "disable")}
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
        />
      )}
    </div>
  );
}

