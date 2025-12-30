"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import TopUpModal from "@/components/wallet/TopUpModal";
import CompletePaymentModal from "@/components/wallet/CompletePaymentModal";
import { AlertIcon } from "@/icons";

export default function WalletPage() {
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isCompletePaymentModalOpen, setIsCompletePaymentModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [topUpReference, setTopUpReference] = useState<string | null>(null);
  const [pendingTopUp, setPendingTopUp] = useState<{
    reference: string;
    amount: number;
    expiresAt: Date;
  } | null>(null);

  const currentBalance = 0.00;
  const verificationFee = 2;
  const verificationsRemaining = Math.floor(currentBalance / verificationFee);
  const totalFeesPaid = 0.00;
  const totalTopUps = 0.00;

  const handleTopUp = (amount: number) => {
    setSelectedAmount(amount);
    setIsTopUpModalOpen(true);
  };

  const handleContinueToPayment = (amount: number) => {
    // Generate a reference ID
    const reference = `TU_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    setTopUpReference(reference);
    setPendingTopUp({
      reference,
      amount,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });
    setIsTopUpModalOpen(false);
    setIsCompletePaymentModalOpen(true);
  };

  const handleVerifyPayment = (reference: string) => {
    // Handle payment verification
    console.log("Verifying payment with reference:", reference);
    // In real app, this would call an API
    setPendingTopUp(null);
    setIsCompletePaymentModalOpen(false);
    // Show success message
  };

  const handleCancelTopUp = () => {
    setPendingTopUp(null);
    setTopUpReference(null);
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {topUpReference && pendingTopUp && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Top-up request created! Pay {pendingTopUp.amount.toFixed(2)} ETB and submit your CBE reference.
          </p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          Wallet
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your verification credits.
        </p>
      </div>

      {/* Current Balance Card */}
      <div className="rounded-xl bg-blue-500 dark:bg-blue-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100 dark:text-blue-200 mb-2">
              Current Balance
            </p>
            <h2 className="text-4xl font-bold text-white mb-2">
              {currentBalance.toFixed(2)} ETB
            </h2>
            <p className="text-sm text-blue-100 dark:text-blue-200">
              ≈ {verificationsRemaining} verifications remaining
            </p>
          </div>
          <button
            onClick={() => handleTopUp(100)}
            className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 dark:bg-white dark:text-blue-600 dark:hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors"
          >
            Top Up
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verification Fee */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Verification Fee
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {verificationFee} ETB
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Per successful verification
          </p>
        </div>

        {/* Total Fees Paid */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Total Fees Paid
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {totalFeesPaid.toFixed(2)} ETB
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All time
          </p>
        </div>

        {/* Total Top-ups */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Total Top-ups
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {totalTopUps.toFixed(2)} ETB
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All time
          </p>
        </div>
      </div>

      {/* Pending Top-up Card */}
      {pendingTopUp && (
        <div className="rounded-xl border-2 border-orange-500/50 bg-orange-500/10 dark:bg-orange-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Pending Top-up
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {pendingTopUp.reference}
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {pendingTopUp.amount.toFixed(2)} ETB
              </h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {formatTimeRemaining(pendingTopUp.expiresAt)}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setIsCompletePaymentModalOpen(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white border-0 mr-2"
              >
                Complete Payment
              </Button>
              <Button
                size="sm"
                onClick={handleCancelTopUp}
                variant="outline"
                className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Low Balance Warning */}
      {currentBalance < verificationFee && (
        <div className="rounded-xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 p-6">
          <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-500/20 rounded-full shrink-0">
              <AlertIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                Low Balance Warning
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your balance is running low. Top up to continue verifying payments without interruption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
          Transaction History
        </h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
        </div>
      </div>

      {/* Modals */}
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onContinue={handleContinueToPayment}
      />

      {pendingTopUp && topUpReference && (
        <CompletePaymentModal
          isOpen={isCompletePaymentModalOpen}
          onClose={() => setIsCompletePaymentModalOpen(false)}
          amount={pendingTopUp.amount}
          reference={topUpReference}
          expiresAt={pendingTopUp.expiresAt}
          onVerify={handleVerifyPayment}
        />
      )}
    </div>
  );
}

