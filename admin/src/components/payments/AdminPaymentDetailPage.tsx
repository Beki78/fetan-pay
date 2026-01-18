"use client";
import React from "react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { ChevronLeftIcon } from "@/icons";
import { BASE_URL } from "@/lib/config";
import type { UnifiedPayment } from "@/lib/services/adminApi";

interface AdminPaymentDetailPageProps {
  payment: UnifiedPayment;
  onBack: () => void;
}

const getProviderName = (provider: string | null) => {
  if (!provider) return "N/A";
  // Check if it's a custom bank name (not in the enum list)
  const providerMap: Record<string, string> = {
    CBE: "Commercial Bank of Ethiopia",
    TELEBIRR: "Telebirr",
    AWASH: "Awash Bank",
    BOA: "Bank of Abyssinia",
    DASHEN: "Dashen Bank",
  };
  // If provider is in the map, return the mapped name, otherwise return as-is (custom bank name)
  return providerMap[provider] || provider;
};

const formatAmount = (amount: number) => {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getStatusBadge = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  const config = {
    verified: { color: "success" as const, label: "Verified" },
    pending: { color: "warning" as const, label: "Pending" },
    expired: { color: "info" as const, label: "Expired" },
    failed: { color: "error" as const, label: "Failed" },
    unverified: { color: "error" as const, label: "Unverified" },
  };
  const { color, label } = config[normalizedStatus as keyof typeof config] || {
    color: "info" as const,
    label: status,
  };
  return <Badge color={color}>{label}</Badge>;
};

const getPaymentTypeBadge = (paymentType: string) => {
  const config = {
    QR: { color: "info" as const, label: "QR Payment" },
    cash: { color: "success" as const, label: "Cash" },
    bank: { color: "warning" as const, label: "Bank Transfer" },
  };
  const { color, label } = config[paymentType as keyof typeof config] || {
    color: "info" as const,
    label: paymentType,
  };
  return <Badge color={color}>{label}</Badge>;
};

export default function AdminPaymentDetailPage({
  payment,
  onBack,
}: AdminPaymentDetailPageProps) {
  const isVerified = payment.status.toLowerCase() === "verified";
  const isPending = payment.status.toLowerCase() === "pending";
  const isExpired = payment.status.toLowerCase() === "expired";
  const isFailed = payment.status.toLowerCase() === "failed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              Payment Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reference: {payment.reference}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(payment.status)}
          {getPaymentTypeBadge(payment.paymentType)}
        </div>
      </div>

      {/* Status Card */}
      {isVerified ? (
        <div className="rounded-xl bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Verified</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment has been successfully verified
                {payment.verifiedAt && ` on ${formatDate(payment.verifiedAt)}`}
              </p>
            </div>
          </div>
        </div>
      ) : isPending ? (
        <div className="rounded-xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Pending</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Waiting for payment verification
              </p>
            </div>
          </div>
        </div>
      ) : isExpired ? (
        <div className="rounded-xl bg-gray-500/10 dark:bg-gray-500/20 border border-gray-500/20 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-500/20 rounded-full">
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Expired</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This payment has expired
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Failed</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment verification failed
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Information */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Transaction Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction ID</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{payment.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                  {payment.reference}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Type</p>
                <div className="mt-1">{getPaymentTypeBadge(payment.paymentType)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Source Type</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {payment.type}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(payment.createdAt)}
                </p>
              </div>
              {payment.verifiedAt && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified At</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(payment.verifiedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Payment Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatAmount(payment.amount)}
                  </p>
                </div>
                {payment.tipAmount && payment.tipAmount > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tip Amount</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatAmount(payment.tipAmount)}
                    </p>
                  </div>
                )}
              </div>
              {payment.payerName && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payer Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.payerName}
                  </p>
                </div>
              )}
              {payment.provider && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Provider / Bank</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getProviderName(payment.provider)}
                  </p>
                </div>
              )}
              {payment.receiverName && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Receiver Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.receiverName}
                  </p>
                </div>
              )}
              {payment.receiverAccount && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Receiver Account</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                    {payment.receiverAccount}
                  </p>
                </div>
              )}
              {payment.note && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-900 dark:text-white">{payment.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Merchant Information */}
          {payment.merchant && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Merchant Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Merchant Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.merchant.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Merchant ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                    {payment.merchant.id}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Verification Information */}
          {payment.verifiedBy && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Verified By
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.verifiedBy.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.verifiedBy.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {payment.verifiedBy.role.replace(/_/g, " ").toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                    {payment.verifiedBy.id}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Additional Info & Actions */}
        <div className="space-y-6">
          {/* Receipt */}
          {payment.receiptUrl && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Receipt
              </h3>
              <div className="space-y-3">
                {(() => {
                  const receiptUrl = payment.receiptUrl!.startsWith("http")
                    ? payment.receiptUrl!
                    : `${BASE_URL}${payment.receiptUrl!.startsWith("/") ? "" : "/"}${payment.receiptUrl!}`;
                  return (
                    <>
                      <img
                        src={receiptUrl}
                        alt="Payment receipt"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent && !parent.querySelector(".receipt-error")) {
                            const errorDiv = document.createElement("div");
                            errorDiv.className = "receipt-error text-sm text-gray-500 dark:text-gray-400 text-center py-4";
                            errorDiv.textContent = "Receipt image not available";
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        Open full size
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* QR Code (if available) */}
          {payment.qrUrl && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                QR Code / Payment Link
              </h3>
              <div className="space-y-3">
                <a
                  href={payment.qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors break-all"
                >
                  {payment.qrUrl}
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Actions</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              Back to Transactions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

