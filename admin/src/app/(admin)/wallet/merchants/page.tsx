"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import { Modal } from "@/components/ui/modal";
import {
  useGetMerchantWalletConfigQuery,
  useUpdateMerchantWalletConfigMutation,
  useManualDepositMutation,
} from "@/lib/services/walletServiceApi";
import { useGetMerchantsQuery } from "@/lib/redux/features/merchantsApi";

export default function WalletMerchantsPage() {
  const { data: merchantsData, isLoading: isLoadingMerchants } = useGetMerchantsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [configModalOpen, setConfigModalOpen] = useState<string | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState<string | null>(null);

  const filteredMerchants = useMemo(() => {
    const merchants = merchantsData?.data ?? [];
    if (!searchTerm.trim()) return merchants;
    const term = searchTerm.toLowerCase();
    return merchants.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.contactEmail?.toLowerCase().includes(term) ||
        m.id.toLowerCase().includes(term)
    );
  }, [merchantsData?.data, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          Merchant Wallet Configuration
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage wallet settings for each merchant. Enable/disable wallet and configure charge rates.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <Input
          type="text"
          placeholder="Search merchants by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Merchants List */}
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Merchants ({filteredMerchants.length})
        </h2>

        <div className="bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden border-0">
          {isLoadingMerchants ? (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">Loading…</div>
          ) : filteredMerchants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Wallet Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Charge Rate
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMerchants.map((merchant) => (
                    <MerchantWalletRow
                      key={merchant.id}
                      merchant={merchant}
                      onConfigure={() => setConfigModalOpen(merchant.id)}
                      onDeposit={() => setDepositModalOpen(merchant.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? "No merchants found matching your search." : "No merchants found."}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {configModalOpen && (
        <WalletConfigModal
          merchantId={configModalOpen}
          onClose={() => setConfigModalOpen(null)}
        />
      )}

      {/* Deposit Modal */}
      {depositModalOpen && (
        <DepositModal
          merchantId={depositModalOpen}
          onClose={() => setDepositModalOpen(null)}
        />
      )}
    </div>
  );
}

interface MerchantWalletRowProps {
  merchant: {
    id: string;
    name: string;
    contactEmail?: string | null;
  };
  onConfigure: () => void;
  onDeposit: () => void;
}

function MerchantWalletRow({ merchant, onConfigure, onDeposit }: MerchantWalletRowProps) {
  const { data: config, isLoading } = useGetMerchantWalletConfigQuery(merchant.id, {
    skip: !merchant.id,
  });

  if (isLoading) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
          Loading wallet config...
        </td>
      </tr>
    );
  }

  const walletEnabled = config?.walletEnabled ?? false;
  const balance = config?.walletBalance ?? 0;
  const chargeType = config?.walletChargeType;
  const chargeValue = config?.walletChargeValue;

  const chargeDisplay =
    walletEnabled && chargeType && chargeValue !== null && chargeValue !== undefined
      ? chargeType === "PERCENTAGE"
        ? `${chargeValue}%`
        : `${chargeValue.toFixed(2)} ETB`
      : "-";

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td className="px-4 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{merchant.name}</div>
          {merchant.contactEmail && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{merchant.contactEmail}</div>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        {walletEnabled ? (
          <Badge variant="light" color="success">
            Enabled
          </Badge>
        ) : (
          <Badge variant="light" color="warning">
            Disabled
          </Badge>
        )}
      </td>
      <td className="px-4 py-4">
        <span
          className={`text-sm font-medium ${
            balance >= 0
              ? "text-gray-900 dark:text-white"
              : "text-error-600 dark:text-error-400"
          }`}
        >
          {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
          ETB
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">{chargeDisplay}</span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onConfigure}
            className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs"
          >
            Configure
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDeposit}
            disabled={!walletEnabled}
            className={`px-3 py-1.5 text-xs ${
              walletEnabled
                ? "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50"
            }`}
          >
            Deposit
          </Button>
          <Link href={`/users/${merchant.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs"
            >
              View
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
}

interface WalletConfigModalProps {
  merchantId: string;
  onClose: () => void;
}

function WalletConfigModal({ merchantId, onClose }: WalletConfigModalProps) {
  const { data: config, isLoading } = useGetMerchantWalletConfigQuery(merchantId);
  const [updateConfig, { isLoading: isSaving }] = useUpdateMerchantWalletConfigMutation();

  const [walletEnabled, setWalletEnabled] = useState(false);
  const [chargeType, setChargeType] = useState<"PERCENTAGE" | "FIXED" | null>(null);
  const [chargeValue, setChargeValue] = useState("");
  const [minBalance, setMinBalance] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    if (config) {
      setWalletEnabled(config.walletEnabled);
      setChargeType(config.walletChargeType);
      setChargeValue(config.walletChargeValue?.toString() ?? "");
      setMinBalance(config.walletMinBalance?.toString() ?? "");
    }
  }, [config]);

  const handleSubmit = async () => {
    if (walletEnabled && chargeType && !chargeValue.trim()) {
      setMessage({ type: "error", text: "Charge value is required when wallet is enabled" });
      return;
    }

    setMessage(null);
    try {
      await updateConfig({
        merchantId,
        config: {
          walletEnabled,
          walletChargeType: walletEnabled ? chargeType : null,
          walletChargeValue: walletEnabled && chargeType && chargeValue
            ? parseFloat(chargeValue)
            : null,
          walletMinBalance: minBalance ? parseFloat(minBalance) : null,
        },
      }).unwrap();
      setMessage({ type: "success", text: "Wallet configuration updated successfully" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      setMessage({ type: "error", text: e?.data?.message ?? "Failed to update wallet configuration" });
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={true} onClose={onClose} className="max-w-2xl p-6">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Wallet Configuration
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure wallet settings for this merchant
          </p>
        </div>

        {message && (
          <Alert
            variant={message.type === "success" ? "success" : "error"}
            title={message.type === "success" ? "Success" : "Error"}
            message={message.text}
          />
        )}

        <div className="space-y-4">
          {/* Current Balance */}
          {config && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Balance</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {config.walletBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ETB
              </div>
            </div>
          )}

          {/* Enable Wallet */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Wallet
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow automatic wallet deduction for payment verifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={walletEnabled}
                onChange={(e) => setWalletEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {walletEnabled && (
            <>
              {/* Charge Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Charge Type
                </label>
                <select
                  value={chargeType ?? ""}
                  onChange={(e) =>
                    setChargeType(e.target.value ? (e.target.value as "PERCENTAGE" | "FIXED") : null)
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="">Select charge type</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>

              {/* Charge Value */}
              {chargeType && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Charge Value {chargeType === "PERCENTAGE" ? "(%)" : "(ETB)"}
                  </label>
                  <Input
                    type="number"
                    step={chargeType === "PERCENTAGE" ? 0.1 : 0.01}
                    min="0"
                    value={chargeValue}
                    onChange={(e) => setChargeValue(e.target.value)}
                    placeholder={chargeType === "PERCENTAGE" ? "e.g., 2.5" : "e.g., 10.00"}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {chargeType === "PERCENTAGE"
                      ? "Percentage of payment amount (e.g., 2.5 for 2.5%)"
                      : "Fixed amount in ETB per payment verification"}
                  </p>
                </div>
              )}

              {/* Minimum Balance */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Minimum Balance (Optional)
                </label>
                <Input
                  type="number"
                  step={0.01}
                  min="0"
                  value={minBalance}
                  onChange={(e) => setMinBalance(e.target.value)}
                  placeholder="e.g., 100.00"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional minimum balance threshold
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save Configuration"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface DepositModalProps {
  merchantId: string;
  onClose: () => void;
}

function DepositModal({ merchantId, onClose }: DepositModalProps) {
  const { data: config, isLoading, refetch } = useGetMerchantWalletConfigQuery(merchantId);
  const [deposit, { isLoading: isDepositing }] = useManualDepositMutation();
  const { data: merchantsData } = useGetMerchantsQuery();
  
  const merchant = merchantsData?.data?.find((m) => m.id === merchantId);
  const walletEnabled = config?.walletEnabled ?? false;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletEnabled) {
      setMessage({ type: "error", text: "Wallet must be enabled before depositing funds. Please enable the wallet first." });
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount greater than 0" });
      return;
    }

    setMessage(null);
    try {
      await deposit({
        merchantId,
        amount: amountNum,
        description: description.trim() || undefined,
      }).unwrap();
      setMessage({ type: "success", text: `Successfully deposited ${amountNum.toFixed(2)} ETB` });
      setAmount("");
      setDescription("");
      await refetch();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      setMessage({ type: "error", text: e?.data?.message ?? "Failed to deposit funds" });
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={true} onClose={onClose} className="max-w-lg p-6">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-lg p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Deposit Funds
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {merchant?.name ? `Deposit funds to ${merchant.name}'s wallet` : "Deposit funds to merchant wallet"}
          </p>
        </div>

        {!walletEnabled && (
          <Alert
            variant="error"
            title="Wallet Disabled"
            message="The wallet must be enabled before depositing funds. Please enable the wallet in the configuration first."
          />
        )}

        {message && (
          <Alert
            variant={message.type === "success" ? "success" : "error"}
            title={message.type === "success" ? "Success" : "Error"}
            message={message.text}
          />
        )}

        {config && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Balance</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {config.walletBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ETB
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Amount (ETB) <span className="text-error-500">*</span>
            </label>
            <Input
              type="number"
              step={0.01}
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 1000.00"
              required
              disabled={!walletEnabled}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Initial deposit, promotional credit, etc."
              rows={3}
              disabled={!walletEnabled}
              className="h-auto w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} disabled={isDepositing}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isDepositing || !walletEnabled || !amount}
              className={!walletEnabled ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isDepositing ? "Depositing…" : "Deposit Funds"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

