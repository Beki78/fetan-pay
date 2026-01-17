"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import TransactionDetailsPage from "@/components/payments/TransactionDetailsPage";
import VerificationDetailsPage from "@/components/payments/VerificationDetailsPage";
import { useGetTransactionQuery } from "@/lib/services/transactionsServiceApi";
import { useGetPaymentClaimQuery, type TransactionProvider } from "@/lib/services/paymentsServiceApi";
import Button from "@/components/ui/button/Button";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import { ChevronLeftIcon } from "@/icons";
import { STATIC_ASSETS_BASE_URL } from "@/lib/config";

/**
 * Generate bank receipt URL based on provider and transaction reference
 * Returns undefined if provider is not supported or if it's a cash transaction
 */
function getBankReceiptUrl(
  provider: TransactionProvider | null | undefined,
  reference: string | null | undefined,
  paymentMethod: string | undefined
): string | undefined {
  // Only generate URL for bank transactions
  if (paymentMethod === 'cash' || !provider || !reference) {
    return undefined;
  }

  const ref = reference.trim();
  if (!ref) return undefined;

  switch (provider) {
    case 'CBE':
      return `https://apps.cbe.com.et/?id=${encodeURIComponent(ref)}`;
    case 'TELEBIRR':
      return `https://transactioninfo.ethiotelecom.et/receipt/${encodeURIComponent(ref)}`;
    case 'BOA':
      return `https://cs.bankofabyssinia.com/slip/?trx=${encodeURIComponent(ref)}`;
    case 'AWASH':
      return `https://awashpay.awashbank.com:8225/${encodeURIComponent(ref)}`;
    case 'DASHEN':
      return `https://receipt.dashensuperapp.com/receipt/${encodeURIComponent(ref)}`;
    default:
      return undefined;
  }
}

export default function TransactionDetailsRoute() {
  const params = useParams();
  const router = useRouter();
  const recordId = params?.id as string;

  // Try to fetch as Transaction first
  const { data: transaction, isLoading: txLoading, error: txError } = useGetTransactionQuery(recordId, {
    skip: !recordId,
  });

  // If transaction not found, try to fetch as Payment
  const shouldFetchPayment = !txLoading && (txError || !transaction);
  const { data: paymentData, isLoading: paymentLoading, error: paymentError } = useGetPaymentClaimQuery(
    { paymentId: recordId },
    { skip: !shouldFetchPayment }
  );

  const isLoading = txLoading || (shouldFetchPayment && paymentLoading);
  const payment = paymentData?.payment;

  // Determine which data source we have
  const hasTransaction = !!transaction;
  const hasPayment = !!payment;

  // Extract data based on source
  let displayData: {
    id: string;
    reference: string;
    status: string;
    createdAt?: string;
    amount: number;
    receiverName: string;
    receiverAccount: string;
    verifiedBy?: any;
    provider?: string;
  } | null = null;

  if (hasTransaction) {
    const txPayment = transaction.payments?.[0];
    const order = txPayment?.order;
    const receiverAccountData = txPayment?.receiverAccount;

    displayData = {
      id: transaction.id,
      reference: transaction.reference,
      status: transaction.status,
      createdAt: transaction.createdAt,
      amount: order?.expectedAmount ? Number(order.expectedAmount) : 0,
      receiverName: receiverAccountData?.receiverName || "N/A",
      receiverAccount: receiverAccountData?.receiverAccount
        ? `****${receiverAccountData.receiverAccount.slice(-4)}`
        : "N/A",
      verifiedBy: transaction.verifiedBy,
      provider: transaction.provider,
    };
  } else if (hasPayment) {
    displayData = {
      id: payment.id,
      reference: payment.reference,
      status: payment.status,
      createdAt: payment.verifiedAt || undefined,
      amount: payment.claimedAmount ? Number(payment.claimedAmount) : 0,
      receiverName: payment.receiverAccount?.receiverName || "N/A",
      receiverAccount: payment.receiverAccount?.receiverAccount
        ? `****${payment.receiverAccount.receiverAccount.slice(-4)}`
        : "N/A",
      verifiedBy: payment.verifiedBy,
      provider: payment.provider,
    };
  }

  // Calculate expiresAt (20 minutes from createdAt) for display
  const expiresAt = displayData?.createdAt
    ? new Date(new Date(displayData.createdAt).getTime() + 20 * 60 * 1000).toISOString()
    : undefined;

  // Map status to display format
  const getActualStatus = (): "pending" | "expired" | "verified" | "unconfirmed" => {
    if (!displayData) return "pending";
    const status = displayData.status.toLowerCase();
    if (status === "unverified") return "unconfirmed";
    return status as "pending" | "expired" | "verified" | "unconfirmed";
  };

  const actualStatus = displayData ? getActualStatus() : "pending";

  // Skeleton loading component
  if (isLoading) {
    return <TransactionDetailsSkeleton onBack={() => router.push("/payments")} />;
  }

  if (!displayData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Transaction or payment not found
          </p>
          <Button onClick={() => router.push("/payments")} startIcon={<ChevronLeftIcon className="w-4 h-4" />}>
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  // Show different detail page based on record type
  if (hasPayment) {
    // Extract receipt URL from verificationPayload
    let receiptUrl: string | undefined;
    let paymentMethod: string | undefined;
    
    if (payment!.verificationPayload && typeof payment!.verificationPayload === 'object') {
      const payload = payment!.verificationPayload as Record<string, unknown>;
      paymentMethod = payload.paymentMethod as string | undefined;
      
      // Check for uploaded receipt (manually logged transactions)
      if (payload.receiptUrl && typeof payload.receiptUrl === 'string') {
        receiptUrl = `${STATIC_ASSETS_BASE_URL}${payload.receiptUrl}`;
      }
    }

    // If no uploaded receipt, try to generate bank receipt URL from provider + reference
    // Only for bank transactions (not cash)
    if (!receiptUrl && paymentMethod !== 'cash') {
      receiptUrl = getBankReceiptUrl(
        payment!.provider as TransactionProvider | null | undefined,
        payment!.reference,
        paymentMethod
      );
    }

    return (
      <VerificationDetailsPage
        reference={displayData.reference}
        provider={displayData.provider || "CBE"}
        amount={displayData.amount}
        tipAmount={payment!.tipAmount ? Number(payment!.tipAmount) : undefined}
        status={payment!.status}
        verifiedAt={payment!.verifiedAt || undefined}
        receiverName={displayData.receiverName}
        receiverAccount={displayData.receiverAccount}
        verifiedBy={displayData.verifiedBy}
        receiptUrl={receiptUrl}
        onBack={() => router.push("/payments")}
      />
    );
  }

  return (
    <TransactionDetailsPage
      transactionId={displayData.reference || displayData.id}
      payerName="Customer"
      amount={displayData.amount}
      notes={undefined}
      status={actualStatus}
      createdAt={displayData.createdAt || undefined}
      expiresAt={expiresAt}
      receiverName={displayData.receiverName}
      receiverAccount={displayData.receiverAccount}
      verifiedBy={displayData.verifiedBy || undefined}
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

