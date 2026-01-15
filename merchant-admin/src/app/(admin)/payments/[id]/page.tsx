"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import TransactionDetailsPage from "@/components/payments/TransactionDetailsPage";
import { useGetTransactionQuery } from "@/lib/services/transactionsServiceApi";
import { useToast } from "@/components/ui/toast/useToast";
import Button from "@/components/ui/button/Button";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import { ChevronLeftIcon } from "@/icons";

export default function TransactionDetailsRoute() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const transactionId = params?.id as string;

  const { data: transaction, isLoading, error } = useGetTransactionQuery(transactionId, {
    skip: !transactionId,
  });

  // Calculate expiresAt (20 minutes from createdAt) for display
  const expiresAt = transaction?.createdAt
    ? new Date(new Date(transaction.createdAt).getTime() + 20 * 60 * 1000).toISOString()
    : undefined;

  // Status now comes directly from backend (EXPIRED is set there)
  const getActualStatus = (): "pending" | "expired" | "verified" | "unconfirmed" => {
    if (!transaction) return "pending";
    return transaction.status.toLowerCase() as "pending" | "expired" | "verified" | "unconfirmed";
  };
  
  const actualStatus = transaction ? getActualStatus() : "pending";

  // Get order and receiver account info from payment
  const payment = transaction?.payments?.[0];
  const order = payment?.order;
  const receiverAccountData = payment?.receiverAccount;

  // Get receiver account info
  const receiverName = receiverAccountData?.receiverName || "EPHREM DEBEBE";
  const receiverAccount = receiverAccountData?.receiverAccount
    ? `****${receiverAccountData.receiverAccount.slice(-4)}`
    : "****23172912";

  // Get order data for amount
  const amount = order?.expectedAmount ? Number(order.expectedAmount) : 0;
  const payerName = "Customer"; // Not stored in database, using default
  const notes = undefined; // Not stored in database

  // Skeleton loading component
  if (isLoading) {
    return <TransactionDetailsSkeleton onBack={() => router.push("/payments")} />;
  }

  if (error || !transaction) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error ? "Failed to load transaction" : "Transaction not found"}
          </p>
          <Button onClick={() => router.push("/payments")} startIcon={<ChevronLeftIcon className="w-4 h-4" />}>
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TransactionDetailsPage
      transactionId={transaction.reference || transaction.id}
      payerName={payerName}
      amount={amount}
      notes={notes}
      status={actualStatus}
      createdAt={transaction.createdAt || undefined}
      expiresAt={expiresAt}
      receiverName={receiverName}
      receiverAccount={receiverAccount}
      verifiedBy={transaction.verifiedBy || undefined}
      onBack={() => router.push("/payments")}
    />
  );
}

// Skeleton loader for transaction details
function TransactionDetailsSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            startIcon={<ChevronLeftIcon className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <Skeleton width={200} height={32} className="mb-2" />
            <Skeleton width={150} height={16} />
          </div>
        </div>
        <Skeleton width={120} height={32} rounded="full" />
      </div>

      {/* Status Card Skeleton */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton width={48} height={48} rounded="full" />
            <div>
              <Skeleton width={100} height={20} className="mb-2" />
              <Skeleton width={150} height={16} />
            </div>
          </div>
          <div className="text-right">
            <Skeleton width={80} height={16} className="mb-2" />
            <Skeleton width={60} height={32} />
          </div>
        </div>
      </div>

      {/* Details Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton width={150} height={24} className="mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton width={100} height={14} className="mb-2" />
                <Skeleton width={120} height={20} />
              </div>
              <div>
                <Skeleton width={100} height={14} className="mb-2" />
                <Skeleton width={150} height={20} />
              </div>
              <div>
                <Skeleton width={100} height={14} className="mb-2" />
                <Skeleton width={180} height={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton width={120} height={24} className="mb-4" />
            <div className="space-y-4">
              <Skeleton width="100%" height={200} />
              <Skeleton width="100%" height={40} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

