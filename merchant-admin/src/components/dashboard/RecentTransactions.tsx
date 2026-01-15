"use client";
import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import { useListTransactionsQuery } from "@/lib/services/transactionsServiceApi";
import { useListVerificationHistoryQuery } from "@/lib/services/paymentsServiceApi";

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
  UNVERIFIED: "bg-red-500/10 text-red-700 dark:text-red-200",
};

// Unified record type for display
interface UnifiedRecord {
  id: string;
  reference: string;
  provider: string;
  status: string;
  createdAt: string;
  type: 'transaction' | 'payment';
}

export default function RecentTransactions() {
  const { data: txData, isLoading: txLoading, isError: txError } = useListTransactionsQuery({ page: 1, pageSize: 10 });
  const { data: paymentData, isLoading: paymentLoading, isError: paymentError } = useListVerificationHistoryQuery({ page: 1, pageSize: 10 });

  const isLoading = txLoading || paymentLoading;
  const isError = txError || paymentError;

  // Merge and sort both datasets
  const mergedRecords = useMemo(() => {
    // Map transactions - status now comes directly from backend (EXPIRED is set there)
    const txRecords: UnifiedRecord[] = (txData?.data || []).map((tx) => ({
      id: tx.id,
      reference: tx.reference,
      provider: tx.provider,
      status: tx.status,
      createdAt: tx.createdAt || '',
      type: 'transaction' as const,
    }));

    // Map payments
    const paymentRecords: UnifiedRecord[] = (paymentData?.data || []).map((p) => ({
      id: p.id,
      reference: p.reference,
      provider: p.provider,
      status: p.status,
      createdAt: p.verifiedAt || '',
      type: 'payment' as const,
    }));

    // Merge, sort by date desc, take first 5
    return [...txRecords, ...paymentRecords]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [txData, paymentData]);

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
              {mergedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                mergedRecords.map((record) => (
                  <TableRow
                    key={`${record.type}-${record.id}`}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                  >
                    <TableCell className="px-5 py-4">
                      <Link
                        href={`/payments/${record.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        {record.reference}
                      </Link>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {providerNames[record.provider] || record.provider}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColors[record.status] || statusColors.PENDING}`}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 text-sm">
                      {record.createdAt ? new Date(record.createdAt).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

