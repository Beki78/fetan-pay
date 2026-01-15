"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import UnifiedTransactionsTable from "@/components/payments/UnifiedTransactionsTable";
import CreatePaymentIntentModal from "@/components/payments/CreatePaymentIntentModal";
import { useCreateOrderMutation } from "@/lib/services/paymentsServiceApi";
import { transactionsServiceApi } from "@/lib/services/transactionsServiceApi";
import { useAppDispatch } from "@/lib/store";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { useToast } from "@/components/ui/toast/useToast";

export default function PaymentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createOrder] = useCreateOrderMutation();
  const { showToast } = useToast();

  const handleCreateTransaction = async (data: { payerName: string; amount: number; notes?: string }) => {
    try {
      const result = await createOrder({
        expectedAmount: data.amount,
        currency: "ETB",
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

