"use client";
import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import Input from "../form/input/InputField";
import { ChevronLeftIcon } from "@/icons";
import { PAYMENT_PAGE_URL } from "@/lib/config";

interface TransactionDetailsPageProps {
  transactionId: string;
  payerName: string;
  amount: number;
  notes?: string;
  status?: "pending" | "expired" | "verified" | "unconfirmed";
  createdAt?: string;
  expiresAt?: string;
  receiverName?: string;
  receiverAccount?: string;
  onBack?: () => void;
}

export default function TransactionDetailsPage({
  transactionId,
  payerName,
  amount,
  notes,
  status = "pending",
  createdAt: propCreatedAt,
  expiresAt: propExpiresAt,
  receiverName: propReceiverName,
  receiverAccount: propReceiverAccount,
  onBack,
}: TransactionDetailsPageProps) {
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20:00 in seconds
  const [copied, setCopied] = useState(false);
  const paymentLink = `${PAYMENT_PAGE_URL}/payment/${transactionId}`;

  // Calculate dates using lazy initialization
  const [createdAt] = useState(() => {
    if (propCreatedAt) return propCreatedAt;
    return new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  const [expiresAt] = useState(() => {
    if (propExpiresAt) return propExpiresAt;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 20 * 60 * 1000);
    return expiryDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  useEffect(() => {
    if (status === "pending") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const receiverName = propReceiverName || "EPHREM DEBEBE";
  const receiverAccount = propReceiverAccount || "****55415444";
  const isExpired = status === "expired";
  const isPending = status === "pending";

  return (
    <div className="space-y-6">
      {/* Success Message - Only show for pending/new transactions */}
      {isPending && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Payment intent created successfully.
          </p>
        </div>
      )}

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
              Transaction Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{transactionId}</p>
          </div>
        </div>
        {isPending && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Listening for updates
            </span>
          </div>
        )}
      </div>

      {/* Status Card */}
      {isExpired ? (
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Expired</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction expired</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 p-6">
          <div className="flex items-center justify-between">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Waiting for payment</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expires in</p>
              <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isExpired ? "lg:grid-cols-3" : "lg:grid-cols-3"} gap-6`}>
        {/* Left Column - Transaction Details */}
        <div className={`${isExpired ? "lg:col-span-2" : "lg:col-span-2"} space-y-6`}>
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Transaction Details
            </h3>
            {isExpired ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expected Payer</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">{payerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Receiver Name</p>
                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                      {receiverName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                    <p className="text-base text-gray-800 dark:text-white">{createdAt}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expected Amount</p>
                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                      {amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} ETB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Receiver Account</p>
                    <p className="text-base text-gray-800 dark:text-white">{receiverAccount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expires At</p>
                    <p className="text-base text-gray-800 dark:text-white">{expiresAt}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expected Payer</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">{payerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Receiver Name</p>
                  <p className="text-base font-semibold text-gray-800 dark:text-white">
                    {receiverName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                  <p className="text-base text-gray-800 dark:text-white">{createdAt}</p>
                </div>
                {notes && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                    <p className="text-base text-gray-800 dark:text-white">{notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expected Amount</p>
                  <p className="text-base font-semibold text-gray-800 dark:text-white">
                    {amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} ETB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Receiver Account</p>
                  <p className="text-base text-gray-800 dark:text-white">{receiverAccount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expires At</p>
                  <p className="text-base text-gray-800 dark:text-white">{expiresAt}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Payment Link & QR Code (only for pending) or Actions (for expired) */}
        {isExpired ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Actions
              </h3>
              <Button
                size="sm"
                onClick={onBack}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
              >
                Back to Transactions
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Link Card */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Payment Link
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share this link with your customer to complete the payment.
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={paymentLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="bg-purple-500 hover:bg-purple-600 text-white border-0 whitespace-nowrap"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Open payment page
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
            </div>

            {/* QR Code Card */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                QR Code
              </h3>
              <div className="flex items-center justify-center w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">QR Code</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

