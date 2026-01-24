"use client";
import React, { useState } from "react";
import PaymentTable from "@/components/payments/PaymentTable";
import AdminPaymentDetailPage from "@/components/payments/AdminPaymentDetailPage";
import Button from "@/components/ui/button/Button";

import type { UnifiedPayment } from "@/lib/services/adminApi";

interface CreatedPaymentIntent {
  transactionId: string;
  payerName: string;
  amount: number;
  notes?: string;
}

export default function PaymentsPage() {
  const [viewingPayment, setViewingPayment] = useState<UnifiedPayment | null>(null);
  const [createdPaymentIntent, setCreatedPaymentIntent] = useState<CreatedPaymentIntent | null>(null);

  const handleView = (payment: UnifiedPayment) => {
    setViewingPayment(payment);
  };

  const handleExport = () => {
    // Mock export functionality
    console.log("Exporting payments...");
    // In real app, this would trigger CSV/Excel/PDF export
  };

  const handleCreatePaymentIntent = (data: { payerName: string; amount: number; notes?: string }) => {
    // Generate a transaction ID (in real app, this would come from the API)
    const randomId = Math.random().toString(36).substring(2, 15).toUpperCase();
    const transactionId = `TXN${randomId}`;
    setCreatedPaymentIntent({
      transactionId,
      payerName: data.payerName,
      amount: data.amount,
      notes: data.notes,
    });
  };

  const handleBackToTransactions = () => {
    setCreatedPaymentIntent(null);
    setViewingPayment(null);
  };

  // Show payment details page if viewing a payment
  if (viewingPayment) {
    return (
      <AdminPaymentDetailPage
        payment={viewingPayment}
        onBack={handleBackToTransactions}
      />
    );
  }

  // Show transaction details page if payment intent was created (keep old component for this)
  if (createdPaymentIntent) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Payment intent created: {createdPaymentIntent.transactionId}
          </p>
        </div>
        <Button onClick={handleBackToTransactions}>Back to Transactions</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PaymentTable 
        onView={handleView} 
        onExport={handleExport}
        onCreatePaymentIntent={handleCreatePaymentIntent}
      />
    </div>
  );
}

