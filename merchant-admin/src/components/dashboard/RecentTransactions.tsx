"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import { useListTransactionsQuery, TransactionRecord } from "@/lib/services/transactionsServiceApi";

const providerNames: Record<string, string> = {
  CBE: "CBE",
  TELEBIRR: "Telebirr",
  AWASH: "Awash",
  BOA: "BOA",
  DASHEN: "Dashen",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-200",
  VERIFIED: "bg-green-500/10 text-green-700 dark:text-green-200",
  FAILED: "bg-red-500/10 text-red-700 dark:text-red-200",
  EXPIRED: "bg-red-500/10 text-red-700 dark:text-red-200",
};

// Helper function to get actual status (check if PENDING transactions are expired)
const getActualStatus = (tx: TransactionRecord): string => {
  if (tx.status !== 'PENDING') {
    return tx.status;
  }
  
  // If PENDING, check if it's actually expired (> 20 minutes old)
  if (tx.createdAt) {
    const createdAt = new Date(tx.createdAt);
    const now = new Date();
    const expiryTime = new Date(createdAt.getTime() + 20 * 60 * 1000); // 20 minutes
    
    if (now > expiryTime) {
      return 'EXPIRED';
    }
  }
  
  return tx.status;
};

export default function RecentTransactions() {
  const { data, isLoading, isError } = useListTransactionsQuery({ page: 1, pageSize: 5 });

  const transactions = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">Failed to load transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
        <Link href="/payments" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          View all
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Reference
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Provider
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Created
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => {
                  const displayStatus = getActualStatus(tx);
                  return (
                    <TableRow
                      key={tx.id}
                      className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                    >
                      <TableCell className="px-5 py-4">
                        <Link
                          href={`/payments/${tx.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          {tx.reference}
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {providerNames[tx.provider] || tx.provider}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColors[displayStatus] || statusColors.PENDING}`}>
                          {displayStatus}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 text-sm">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

