"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import AlertBanner from "@/components/ui/alert/AlertBanner";
import TopUpModal from "@/components/wallet/TopUpModal";
import CompletePaymentModal from "@/components/wallet/CompletePaymentModal";
import BankSelectionModal from "@/components/wallet/BankSelectionModal";
import MerchantApprovalStatus from "@/components/common/MerchantApprovalStatus";
import { useGetWalletBalanceQuery, useGetWalletTransactionsQuery, useGetDepositReceiversQuery, useVerifyDepositMutation, useGetWalletConfigQuery, useGetPendingDepositsQuery, useCreatePendingDepositMutation } from "@/lib/services/walletServiceApi";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { DollarLineIcon } from "@/icons";
import Link from "next/link";
import { toast } from "sonner";
import type { WalletDepositReceiverAccount } from "@/lib/services/walletServiceApi";

export default function WalletPage() {
  // All hooks must be called at the top level, before any early returns
  const router = useRouter();
  const { status: accountStatus, isLoading: isStatusLoading } = useAccountStatus();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isBankSelectionModalOpen, setIsBankSelectionModalOpen] = useState(false);
  const [isCompletePaymentModalOpen, setIsCompletePaymentModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedReceiver, setSelectedReceiver] = useState<WalletDepositReceiverAccount | null>(null);
  const [pendingTopUp, setPendingTopUp] = useState<{
    amount: number;
    receiver: WalletDepositReceiverAccount;
    expiresAt: Date;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Wallet functionality hooks - must be called before early returns
  const { data: walletBalance, isLoading: isBalanceLoading } = useGetWalletBalanceQuery();
  const { data: walletConfig, isLoading: isConfigLoading } = useGetWalletConfigQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useGetWalletTransactionsQuery({
    page: 1,
    pageSize: 5, // Show only recent 5 transactions
  });
  const { data: depositReceivers } = useGetDepositReceiversQuery();
  const { data: pendingDeposits, refetch: refetchPendingDeposits } = useGetPendingDepositsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds to refresh data
  });
  const [verifyDeposit, { isLoading: isVerifying }] = useVerifyDepositMutation();
  const [createPendingDeposit, { isLoading: isCreatingDeposit }] = useCreatePendingDepositMutation();

  // Real-time countdown timer - updates every second - must be called before early returns
  useEffect(() => {
    // Only start the timer if there are pending deposits
    if (!pendingDeposits || pendingDeposits.length === 0) {
      return;
    }

    // Update time every second for real-time countdown
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingDeposits]);

  // Show approval status if merchant is not approved
  if (isStatusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (accountStatus === "pending") {
    return <MerchantApprovalStatus />;
  }

  const balance = walletBalance?.balance ?? 0;
  const recentTransactions = transactionsData?.transactions ?? [];
  const totalTransactions = transactionsData?.total ?? 0;

  // Calculate statistics from transactions
  const totalFeesPaid = recentTransactions
    .filter((t) => t.type === "CHARGE")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const totalTopUps = Number(
    recentTransactions
      .filter((t) => t.type === "DEPOSIT")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  ) || 0;

  // Get verification fee from merchant wallet configuration
  const getVerificationFee = () => {
    if (!walletConfig) {
      return "0 ETB"; // Not configured
    }

    if (!walletConfig.walletChargeType || walletConfig.walletChargeValue === null) {
      return "0 ETB"; // Not configured
    }

    if (walletConfig.walletChargeType === "PERCENTAGE") {
      return "Variable"; // Percentage-based charges vary by payment amount
    } else {
      // Fixed amount
      return `${walletConfig.walletChargeValue.toFixed(2)} ETB`;
    }
  };

  const verificationFee = getVerificationFee();
  const feeAmount = walletConfig?.walletChargeType === "FIXED" && walletConfig?.walletChargeValue !== null && walletConfig.walletChargeValue > 0
    ? walletConfig.walletChargeValue
    : 0; // 0 when not configured or percentage

  const verificationsRemaining = walletConfig?.walletChargeType === "PERCENTAGE" || feeAmount === 0
    ? "N/A"
    : Math.floor(balance / feeAmount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = type === "DEPOSIT" || type === "REFUND" ? "+" : "-";
    const color = type === "DEPOSIT" || type === "REFUND" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    return (
      <span className={color}>
        {sign}{Math.abs(amount).toFixed(2)} ETB
      </span>
    );
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return "Deposit";
      case "CHARGE":
        return "Verification Fee";
      case "REFUND":
        return "Refund";
      case "ADJUSTMENT":
        return "Adjustment";
      default:
        return type;
    }
  };

  const handleTopUp = () => {
    setIsTopUpModalOpen(true);
  };

  const handleContinueToPayment = (amount: number) => {
    const activeReceivers = (depositReceivers ?? []).filter((r) => r.status === "ACTIVE");
    
    if (activeReceivers.length === 0) {
      toast.error("No deposit accounts available", {
        description: "Please contact support to set up deposit accounts.",
      });
      return;
    }

    // If only one receiver, create deposit directly; otherwise show selection modal
    if (activeReceivers.length === 1) {
      const receiver = activeReceivers[0];
      handleBankSelect(receiver);
      setIsTopUpModalOpen(false);
    } else {
      // Multiple receivers - show selection modal
      setSelectedAmount(amount);
      setIsTopUpModalOpen(false);
      setIsBankSelectionModalOpen(true);
    }
  };

  const handleBankSelect = async (receiver: WalletDepositReceiverAccount) => {
    if (!selectedAmount) return;
    
    try {
      // Create pending deposit in backend
      const deposit = await createPendingDeposit({
        amount: selectedAmount,
        provider: receiver.provider,
        receiverAccountId: receiver.id,
      }).unwrap();

      setSelectedReceiver(receiver);
      setPendingTopUp({
        amount: selectedAmount,
        receiver,
        expiresAt: new Date(deposit.expiresAt || Date.now() + 30 * 60 * 1000),
      });
      setIsBankSelectionModalOpen(false);
      setIsCompletePaymentModalOpen(true);
      refetchPendingDeposits();
    } catch (error: any) {
      toast.error("Failed to create deposit request", {
        description: error?.data?.message || error?.message || "Please try again",
      });
    }
  };

  const handleVerifyPayment = async (reference: string) => {
    if (!selectedReceiver || !selectedAmount) {
      toast.error("Missing payment information");
      return;
    }

    try {
      const result = await verifyDeposit({
        provider: selectedReceiver.provider,
        reference: reference.trim(),
      }).unwrap();

      if (result.success && result.status === "VERIFIED") {
        toast.success("Deposit verified successfully!", {
          description: `Your wallet has been credited with ${result.amount?.toFixed(2) ?? "0.00"} ETB`,
        });
        setPendingTopUp(null);
        setSelectedAmount(null);
        setSelectedReceiver(null);
        setIsCompletePaymentModalOpen(false);
        refetchPendingDeposits();
      } else {
        toast.error("Deposit verification failed", {
          description: result.error || "The transaction reference could not be verified",
        });
      }
    } catch (error: any) {
      console.error("Verify deposit error:", error);
      toast.error("Verification failed", {
        description: error?.data?.message || error?.message || "An error occurred while verifying the deposit",
      });
    }
  };

  const handleCancelTopUp = () => {
    setPendingTopUp(null);
    setSelectedAmount(null);
    setSelectedReceiver(null);
    setIsCompletePaymentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Wallet
            </h1>
            {walletConfig && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  walletConfig.walletEnabled
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {walletConfig.walletEnabled ? "Enabled" : "Disabled"}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your verification credits.
          </p>
        </div>
      </div>

      {/* Current Balance Card */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100 dark:text-blue-200 mb-2">
              Current Balance
            </p>
            {isBalanceLoading ? (
              <div className="h-10 w-32 bg-blue-400/30 rounded animate-pulse"></div>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-white mb-2">
                  {balance.toFixed(2)} ETB
                </h2>
                {verificationFee !== "Variable" && (
                  <p className="text-sm text-blue-100 dark:text-blue-200">
                    ≈ {verificationsRemaining} verifications remaining
                  </p>
                )}
              </>
            )}
          </div>
          <Button
            onClick={handleTopUp}
            className="bg-white hover:bg-gray-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg border border-white/20"
          >
            <span className="text-blue-600 font-semibold">Top Up</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verification Fee */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your Verification Fee
            </p>
            {walletConfig && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  walletConfig.walletEnabled
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {walletConfig.walletEnabled ? "Active" : "Inactive"}
              </span>
            )}
          </div>
          {isConfigLoading || isTransactionsLoading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {verificationFee}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {walletConfig?.walletEnabled
                  ? walletConfig.walletChargeType === "PERCENTAGE"
                    ? "Percentage-based"
                    : "Fixed rate"
                  : "Wallet disabled"}
              </p>
            </>
          )}
        </div>

        {/* Total Fees Paid */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Total Fees Paid
          </p>
          {isTransactionsLoading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {totalFeesPaid.toFixed(2)} ETB
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All time
              </p>
            </>
          )}
        </div>

        {/* Total Top-ups */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Total Top-ups
          </p>
          {isTransactionsLoading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {typeof totalTopUps === 'number' ? totalTopUps.toFixed(2) : '0.00'} ETB
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All time
              </p>
            </>
          )}
        </div>
      </div>

      {/* Low Balance Warning */}
      {balance < 10 && balance > 0 && (
        <AlertBanner
          variant="warning"
          title="Low Balance Warning"
          message="Your balance is running low. Top up to continue verifying payments without interruption."
          action={{
            label: "Top Up",
            onClick: handleTopUp,
          }}
        />
      )}

      {/* Pending Deposits */}
      {pendingDeposits && pendingDeposits.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Pending Deposits
          </h3>
          <div className="space-y-3">
            {pendingDeposits.map((deposit) => {
              const expiresAt = new Date(deposit.expiresAt);
              // Use currentTime state for real-time countdown
              const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - currentTime.getTime()) / 1000));
              const isExpired = timeRemaining <= 0;
              const minutes = Math.floor(timeRemaining / 60);
              const seconds = timeRemaining % 60;
              const timeString = isExpired ? "Expired" : `${minutes}:${seconds.toString().padStart(2, "0")}`;

              return (
                <div
                  key={deposit.id}
                  onClick={() => {
                    setSelectedReceiver(deposit.receiverAccount);
                    setSelectedAmount(deposit.amount);
                    setPendingTopUp({
                      amount: deposit.amount,
                      receiver: deposit.receiverAccount,
                      expiresAt,
                    });
                    setIsCompletePaymentModalOpen(true);
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isExpired
                      ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                      : "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {deposit.amount.toFixed(2)} ETB - {deposit.provider}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            isExpired
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}
                        >
                          {isExpired ? "Expired" : "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {deposit.receiverAccount.receiverLabel || deposit.receiverAccount.receiverName || deposit.receiverAccount.receiverAccount}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold mb-1 ${
                        isExpired ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
                      }`}>
                        {timeString}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isExpired ? "Click to see details" : "Click to complete"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onContinue={handleContinueToPayment}
      />

      {selectedAmount && depositReceivers && (
        <BankSelectionModal
          isOpen={isBankSelectionModalOpen}
          onClose={() => {
            setIsBankSelectionModalOpen(false);
            setSelectedAmount(null);
          }}
          receivers={depositReceivers}
          selectedAmount={selectedAmount}
          onSelect={handleBankSelect}
        />
      )}

      {pendingTopUp && selectedReceiver && (
        <CompletePaymentModal
          isOpen={isCompletePaymentModalOpen}
          onClose={handleCancelTopUp}
          amount={pendingTopUp.amount}
          receiver={selectedReceiver}
          expiresAt={pendingTopUp.expiresAt}
          onVerify={handleVerifyPayment}
          isVerifying={isVerifying}
        />
      )}

      {/* Recent Transactions */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Transactions
          </h3>
          {totalTransactions > 5 && (
            <Link href="/wallet/transactions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>

        {isTransactionsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
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
            <p className="text-gray-500 dark:text-gray-400 mb-2">No transactions yet</p>
            <Button size="sm" className="mt-4" onClick={handleTopUp}>
              Top Up Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const isPositive = transaction.type === "DEPOSIT" || transaction.type === "REFUND";
              const Icon = isPositive ? (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
              );

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {Icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {transaction.description || getTransactionTypeLabel(transaction.type)}
                      </span>
                      {transaction.payment && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          - {transaction.payment.reference}
                        </span>
                      )}
                      {transaction.walletDeposit && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          - {transaction.walletDeposit.reference}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold mb-1">
                      {formatAmount(transaction.amount, transaction.type)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Balance: {typeof transaction.balanceAfter === 'number' 
                        ? transaction.balanceAfter.toFixed(2) 
                        : (Number(transaction.balanceAfter) || 0).toFixed(2)} ETB
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
