"use client";
import React, { useState } from "react";
import PaymentTable from "@/components/payments/PaymentTable";
import TransactionDetailsPage from "@/components/payments/TransactionDetailsPage";

interface Payment {
  id: string;
  type: "payment";
  code: string;
  payer: string;
  receiver: {
    name: string;
    bank: string;
  };
  amount: number;
  status: "expired" | "pending" | "verified" | "unconfirmed";
  date: string;
}

interface CreatedPaymentIntent {
  transactionId: string;
  payerName: string;
  amount: number;
  notes?: string;
}

interface ViewingTransaction {
  transactionId: string;
  payerName: string;
  amount: number;
  notes?: string;
  status: "expired" | "pending" | "verified" | "unconfirmed";
  createdAt: string;
  expiresAt: string;
  receiverName: string;
  receiverAccount: string;
}

export default function PaymentsPage() {
  const [viewingTransaction, setViewingTransaction] = useState<ViewingTransaction | null>(null);
  const [createdPaymentIntent, setCreatedPaymentIntent] = useState<CreatedPaymentIntent | null>(null);

  const handleView = (payment: Payment) => {
    // Parse the date - format is "Dec 27, 06:27 PM"
    // We'll use current year and parse the date
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Try to parse the date string, if it fails use current date
    let createdDate: Date;
    try {
      // Format: "Dec 27, 06:27 PM" -> "Dec 27, 2025, 06:27 PM"
      const dateStr = payment.date;
      const monthMap: { [key: string]: string } = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
        "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
        "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
      };
      
      // Simple parsing - extract month, day, time
      const parts = dateStr.split(", ");
      if (parts.length >= 2) {
        const monthDay = parts[0].split(" ");
        const time = parts[1];
        const month = monthDay[0];
        const day = monthDay[1];
        
        // Convert to ISO format for parsing
        const monthNum = monthMap[month] || "12";
        const isoDate = `${currentYear}-${monthNum}-${day.padStart(2, "0")} ${time}`;
        createdDate = new Date(isoDate);
      } else {
        createdDate = now;
      }
    } catch {
      createdDate = now;
    }
    
    // Create expiresAt (20 minutes after created)
    const expiresDate = new Date(createdDate.getTime() + 20 * 60 * 1000);
    
    setViewingTransaction({
      transactionId: payment.code,
      payerName: payment.payer,
      amount: payment.amount,
      status: payment.status,
      createdAt: createdDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      expiresAt: expiresDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      receiverName: payment.receiver.name,
      receiverAccount: "****55415444",
    });
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
    setViewingTransaction(null);
  };

  // Show transaction details page if viewing a transaction
  if (viewingTransaction) {
    return (
      <TransactionDetailsPage
        transactionId={viewingTransaction.transactionId}
        payerName={viewingTransaction.payerName}
        amount={viewingTransaction.amount}
        notes={viewingTransaction.notes}
        status={viewingTransaction.status}
        createdAt={viewingTransaction.createdAt}
        expiresAt={viewingTransaction.expiresAt}
        receiverName={viewingTransaction.receiverName}
        receiverAccount={viewingTransaction.receiverAccount}
        onBack={handleBackToTransactions}
      />
    );
  }

  // Show transaction details page if payment intent was created
  if (createdPaymentIntent) {
    return (
      <TransactionDetailsPage
        transactionId={createdPaymentIntent.transactionId}
        payerName={createdPaymentIntent.payerName}
        amount={createdPaymentIntent.amount}
        notes={createdPaymentIntent.notes}
        status="pending"
        onBack={handleBackToTransactions}
      />
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

