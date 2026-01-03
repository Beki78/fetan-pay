"use client";

import { useState } from "react";
import TransactionDetails from "@/components/payments/TransactionDetails";
import TransactionsTable from "@/components/payments/TransactionsTable";
import { type TransactionRecord } from "@/lib/services/transactionsServiceApi";

export default function PaymentsPage() {
  const [viewingTransaction, setViewingTransaction] = useState<TransactionRecord | null>(null);
  const selectedId = viewingTransaction?.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Transactions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Live transaction verifications from vendors</p>
      </div>

      {viewingTransaction ? (
        <TransactionDetails
          transaction={viewingTransaction}
          onBack={() => setViewingTransaction(null)}
        />
      ) : (
        <TransactionsTable
          onView={(tx) => setViewingTransaction(tx)}
          selectedId={selectedId}
        />
      )}
    </div>
  );
}

