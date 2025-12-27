"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentSummaryCards from "@/components/payments/PaymentSummaryCards";
import PaymentTable from "@/components/payments/PaymentTable";
import PaymentDetailModal from "@/components/payments/PaymentDetailModal";

interface Payment {
  id: string;
  transactionId: string;
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  paymentMethod: string;
  status: "Submitted" | "Confirmed" | "Unconfirmed";
  submittedAt: string;
  confirmedAt?: string;
  bank: string;
  receiverAccount: string;
  senderAccount: string;
  confirmationDetails?: {
    transactionExists: boolean;
    paymentSuccess: boolean;
    amountMatched: boolean;
    receiverMatched: boolean;
    source: string;
    failureReason?: string;
  };
}

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  const handleExport = () => {
    // Mock export functionality
    console.log("Exporting payments...");
    // In real app, this would trigger CSV/Excel/PDF export
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Payment Management" />
      <div className="space-y-6">
        {/* Summary Cards */}
        <PaymentSummaryCards />

        {/* Payment Table */}
        <ComponentCard
          title="All Payments"
          desc="View and manage all payment transactions. System automatically confirms payments - you cannot manually approve or reject."
        >
          <PaymentTable onView={handleView} onExport={handleExport} />
        </ComponentCard>
      </div>

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />
    </div>
  );
}

