"use client";
import React from "react";
import Image from "next/image";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { InfoIcon } from "@/icons";
import { useGetPaymentProvidersQuery } from "@/lib/services/paymentProvidersServiceApi";
import { useGetActiveReceiverAccountsQuery } from "@/lib/services/paymentsServiceApi";

interface PaymentProvider {
  id: string;
  name: string;
  type: string;
  imagePath: string;
  status: "disabled" | "enabled" | "coming-soon" | "not-configured";
  accountNumber?: string;
  accountHolderName?: string;
}

interface PaymentProvidersListProps {
  onConfigure: (providerId: string, provider?: PaymentProvider) => void;
  onEnable?: (providerId: string) => void;
  onDisable?: (providerId: string) => void;
}

export default function PaymentProvidersList({
  onConfigure,
  onEnable,
  onDisable,
}: PaymentProvidersListProps) {
  const { data, isLoading } = useGetPaymentProvidersQuery();
  const { data: receiverAccountsData, isLoading: isLoadingReceivers } =
    useGetActiveReceiverAccountsQuery();

  const receiverAccounts = receiverAccountsData?.data ?? [];

  const getReceiverStatus = (providerCode: string): 'ACTIVE' | 'INACTIVE' | null => {
    const code = providerCode.toUpperCase();
    const active = receiverAccounts.find((x) => x.provider === code && x.status === 'ACTIVE');
    if (active) return 'ACTIVE';
    const inactive = receiverAccounts.find((x) => x.provider === code && x.status === 'INACTIVE');
    if (inactive) return 'INACTIVE';
    return null;
  };

  const providers: PaymentProvider[] = (data?.providers ?? []).map((p) => {
    const receiverStatus = getReceiverStatus(p.code);

    const status:
      | "disabled"
      | "enabled"
      | "coming-soon"
      | "not-configured" =
      p.status === "COMING_SOON"
        ? "coming-soon"
        : p.status === "DISABLED"
        ? "disabled"
        : receiverStatus === 'ACTIVE'
        ? "enabled"
        : receiverStatus === 'INACTIVE'
        ? "disabled"
        : "not-configured"; // ACTIVE but not yet configured at merchant level

    // Logo is a local file under /public/images/banks
    const logoKey = (p.logoUrl ?? "").trim();
    const imagePath = logoKey ? `/images/banks/${logoKey}` : "/images/banks/CBE.png";

    return {
      id: p.code.toLowerCase(),
      name: p.name,
      type: "Payment provider",
      imagePath,
      status,
    };
  });

  const getStatusBadge = (status: PaymentProvider["status"]) => {
    switch (status) {
      case "disabled":
        return (
          <Badge variant="light" color="warning">
            Disabled
          </Badge>
        );
      case "enabled":
        return (
          <Badge variant="light" color="success">
            Active
          </Badge>
        );
      case "coming-soon":
        return (
          <Badge variant="light" color="light">
            Coming Soon
          </Badge>
        );
      case "not-configured":
        return (
          <Badge variant="light" color="warning">
            Not Configured
          </Badge>
        );
    }
  };

  const getProviderDetails = (provider: PaymentProvider) => {
    if (provider.status === "not-configured") {
      return `${provider.type} · Click Configure to set up`;
    }
    if (provider.accountNumber) {
      const masked = provider.accountNumber.length > 4
        ? `****${provider.accountNumber.slice(-4)}`
        : provider.accountNumber;
      return `${provider.type} · ${masked}`;
    }
    return provider.type;
  };

  return (
    <div className="space-y-6">
      {/* Available Providers Section */}
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Available Providers
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enable and configure payment providers for your business
        </p>

        {/* Providers List */}
        <div className="bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden border-0">
          {isLoading || isLoadingReceivers ? (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
              Loading providers…
            </div>
          ) : providers.length ? (
            providers.map((provider, index) => (
            <div
              key={provider.id}
              className={`px-4 py-4 ${
                index !== providers.length - 1
                  ? "border-b border-gray-200 dark:border-gray-700"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Provider Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-700 overflow-hidden shrink-0">
                    <Image
                      src={provider.imagePath}
                      alt={provider.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white truncate">
                        {provider.name}
                      </h3>
                      {getStatusBadge(provider.status)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getProviderDetails(provider)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {provider.status === "enabled" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onConfigure(provider.id, provider)}
                        className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onDisable?.(provider.id)}
                        className="bg-red-500 hover:bg-red-600 text-white border-0 px-3 py-1.5 text-xs"
                      >
                        Disable
                      </Button>
                    </>
                  )}
                  {provider.status === "disabled" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onConfigure(provider.id, provider)}
                        className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onEnable?.(provider.id)}
                        className="bg-purple-500 hover:bg-purple-600 text-white border-0 px-3 py-1.5 text-xs"
                      >
                        Enable
                      </Button>
                    </>
                  )}
                  {provider.status === "not-configured" && (
                    <Button
                      size="sm"
                      onClick={() => onConfigure(provider.id, provider)}
                      className="bg-purple-500 hover:bg-purple-600 text-white border-0 px-3 py-1.5 text-xs"
                    >
                      Configure
                    </Button>
                  )}
                </div>
              </div>
            </div>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
              No providers configured yet.
            </div>
          )}
        </div>
      </div>

      {/* Information Box */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 shrink-0">
            <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              How Payment Providers Work
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              When you create a payment intent via API, you can specify which provider to use. Customers will see the payment details for that provider and can verify their payment using the provider's reference number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

