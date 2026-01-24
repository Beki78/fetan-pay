"use client";
import React from "react";
import Button from "../ui/button/Button";
import { ChevronLeftIcon, CheckCircleIcon } from "@/icons";
import { ExternalLink } from "lucide-react";

interface VerificationDetailsPageProps {
  reference: string;
  provider: string;
  amount: number;
  tipAmount?: number;
  status: "VERIFIED" | "UNVERIFIED" | "PENDING";
  verifiedAt?: string;
  receiverName?: string;
  receiverAccount?: string;
  verifiedBy?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    user?: {
      name?: string;
      email?: string;
    } | null;
  } | null;
  receiptUrl?: string;
  onBack?: () => void;
}


const providerLabels: Record<string, string> = {
  CBE: "Commercial Bank of Ethiopia",
  TELEBIRR: "Telebirr",
  AWASH: "Awash Bank",
  BOA: "Bank of Abyssinia",
  DASHEN: "Dashen Bank",
};

export default function VerificationDetailsPage({
  reference,
  provider,
  amount,
  tipAmount,
  status,
  verifiedAt,
  receiverName,
  receiverAccount,
  verifiedBy,
  receiptUrl,
  onBack,
}: VerificationDetailsPageProps) {
  const isVerified = status === "VERIFIED";
  const isUnverified = status === "UNVERIFIED";

  const verifierName = verifiedBy?.name || verifiedBy?.user?.name || verifiedBy?.email || verifiedBy?.user?.email || "Unknown";
  const verifierRole = verifiedBy?.role || "Staff";

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
              Verification Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{reference}</p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      {isVerified ? (
        <div className="rounded-xl bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Verified</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment successfully verified
              </p>
            </div>
          </div>
        </div>
      ) : isUnverified ? (
        <div className="rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Unverified</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment verification failed
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Pending</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Awaiting verification
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Payment Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reference</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">{reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Provider</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {providerLabels[provider] || provider}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                  <p className="text-base font-semibold text-green-600 dark:text-green-400">
                    {amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                  </p>
                </div>
                {tipAmount && tipAmount > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tip</p>
                    <p className="text-base font-semibold text-purple-600 dark:text-purple-400">
                      +{tipAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                    </p>
                  </div>
                )}
                {receiptUrl && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Receipt</p>
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Receipt
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {receiverName && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Receiver Name</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">{receiverName}</p>
                  </div>
                )}
                {receiverAccount && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Receiver Account</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">{receiverAccount}</p>
                  </div>
                )}
                {verifiedAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Verified At</p>
                    <p className="text-base text-gray-800 dark:text-white">
                      {new Date(verifiedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Verifier Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Verified By
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 rounded-full">
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    {verifierName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{verifierName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{verifierRole}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Actions
            </h3>
            <Button
              size="sm"
              onClick={onBack}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
            >
              Back to Payments
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

