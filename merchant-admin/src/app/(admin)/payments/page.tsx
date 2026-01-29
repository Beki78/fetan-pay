"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import UnifiedTransactionsTable from "@/components/payments/UnifiedTransactionsTable";
import CreatePaymentIntentModal from "@/components/payments/CreatePaymentIntentModal";
import MerchantApprovalStatus from "@/components/common/MerchantApprovalStatus";
import { useCreateOrderMutation, TransactionProvider } from "@/lib/services/paymentsServiceApi";
import { transactionsServiceApi } from "@/lib/services/transactionsServiceApi";
import { useAppDispatch } from "@/lib/store";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { useToast } from "@/components/ui/toast/useToast";

export default function PaymentsPage() {
  // All hooks must be called at the top level, before any early returns
  const { status: accountStatus, isLoading: isStatusLoading } = useAccountStatus();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createOrder] = useCreateOrderMutation();
  const { showToast } = useToast();

  // Show loading spinner while checking account status
  if (isStatusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show approval status if merchant is not approved
  if (accountStatus === "pending") {
    return <MerchantApprovalStatus />;
  }

  const handleCreateTransaction = async (data: { payerName: string; amount: number; notes?: string; provider?: TransactionProvider }) => {
    try {
      const result = await createOrder({
        expectedAmount: data.amount,
        currency: "ETB",
        provider: data.provider,
        payerName: data.payerName,
      }).unwrap();

      // Close modal
      setIsCreateModalOpen(false);
      
      // Invalidate transactions cache to refresh the list
      dispatch(
        transactionsServiceApi.util.invalidateTags([{ type: 'Transaction', id: 'LIST' }])
      );
      
      showToast("Payment intent created successfully", "success");
      
      // Navigate to details page
      router.push(`/payments/${result.transaction.reference}`);
    } catch (error: any) {
      showToast(
        error?.data?.message || error?.message || "Failed to create payment intent",
        "error"
      );
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Payments</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All transactions and verifications
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          startIcon={<PlusIcon className="w-4 h-4" />}
        >
          Add Transaction
        </Button>
      </div>

      {/* Unified Table - No tabs */}
      <UnifiedTransactionsTable />

      <CreatePaymentIntentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTransaction}
      />
    </div>
  );
}

