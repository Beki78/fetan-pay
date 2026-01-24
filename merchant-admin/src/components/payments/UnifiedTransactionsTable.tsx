"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Link from "next/link";
import { useListTransactionsQuery } from "@/lib/services/transactionsServiceApi";
import { useListVerificationHistoryQuery, type TransactionProvider } from "@/lib/services/paymentsServiceApi";
import { STATIC_ASSETS_BASE_URL } from "@/lib/config";
import { ExternalLink } from "lucide-react";

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

const providerLabels: Record<string, string> = {
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
  EXPIRED: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  UNVERIFIED: "bg-red-500/10 text-red-700 dark:text-red-200",
};

interface UnifiedRecord {
  id: string;
  reference: string;
  provider: string;
  displayProvider: string; // Display name (e.g., "Cash" for cash transactions)
  status: string;
  amount?: number;
  tipAmount?: number;
  createdAt: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  type: "transaction" | "payment";
  receiptUrl?: string; // Receipt URL for bank transactions
  paymentMethod?: string; // 'cash' or 'bank'
}

export default function UnifiedTransactionsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const pageSize = 20;

  const { data: txData, isLoading: txLoading } = useListTransactionsQuery({ page: 1, pageSize: 100 });
  const { data: paymentData, isLoading: paymentLoading } = useListVerificationHistoryQuery({ page: 1, pageSize: 100 });

  const isLoading = txLoading || paymentLoading;

  // Merge and process data
  const allRecords = useMemo(() => {
    const txRecords: UnifiedRecord[] = (txData?.data || []).map((tx) => ({
      id: tx.id,
      reference: tx.reference,
      provider: tx.provider,
      displayProvider: providerLabels[tx.provider] ?? tx.provider,
      status: tx.status,
      createdAt: tx.createdAt || "",
      verifiedAt: tx.verifiedAt,
      verifiedBy: tx.verifiedBy?.name || tx.verifiedBy?.email || null,
      type: "transaction" as const,
    }));

    const paymentRecords: UnifiedRecord[] = (paymentData?.data || []).map((p) => {
      // Extract payment method and receipt URL from verificationPayload
      let displayProvider = providerLabels[p.provider] ?? p.provider;
      let receiptUrl: string | undefined;
      let paymentMethod: string | undefined;
      
      if (p.verificationPayload && typeof p.verificationPayload === 'object') {
        const payload = p.verificationPayload as Record<string, unknown>;
        paymentMethod = payload.paymentMethod as string | undefined;
        
        if (payload.paymentMethod === 'cash') {
          displayProvider = 'Cash';
        } else if (payload.otherBankName && typeof payload.otherBankName === 'string') {
          displayProvider = payload.otherBankName;
        }
        
        // Check for uploaded receipt (manually logged transactions)
        if (payload.receiptUrl && typeof payload.receiptUrl === 'string') {
          receiptUrl = `${STATIC_ASSETS_BASE_URL}${payload.receiptUrl}`;
        }
      }

      // If no uploaded receipt, try to generate bank receipt URL from provider + reference
      // Only for bank transactions (not cash)
      if (!receiptUrl && paymentMethod !== 'cash') {
        receiptUrl = getBankReceiptUrl(
          p.provider as TransactionProvider | null | undefined,
          p.reference,
          paymentMethod
        );
      }

      return {
        id: p.id,
        reference: p.reference,
        provider: p.provider,
        displayProvider,
        status: p.status,
        amount: p.claimedAmount ? Number(p.claimedAmount) : undefined,
        tipAmount: p.tipAmount ? Number(p.tipAmount) : undefined,
        createdAt: p.verifiedAt || "",
        verifiedAt: p.verifiedAt,
        verifiedBy: p.verifiedBy?.name || p.verifiedBy?.email || null,
        type: "payment" as const,
        receiptUrl,
        paymentMethod,
      };
    });

    // Merge and sort by date desc
    return [...txRecords, ...paymentRecords].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [txData, paymentData]);

  // Filter records
  const filteredRecords = useMemo(() => {
    let records = allRecords;

    if (statusFilter !== "All") {
      records = records.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      records = records.filter((r) =>
        r.reference.toLowerCase().includes(query)
      );
    }

    return records;
  }, [allRecords, statusFilter, search]);

  // Paginate
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="EXPIRED">Expired</option>
            <option value="FAILED">Failed</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Reference
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Amount
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Tip
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Provider
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Date
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Verified By
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((record) => (
                  <TableRow
                    key={`${record.type}-${record.id}`}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
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
                      {record.amount
                        ? `${record.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB`
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {record.tipAmount
                        ? <span className="text-green-600 dark:text-green-400">{`+${record.tipAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB`}</span>
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" variant="light" color="info">
                        {record.displayProvider}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColors[record.status] || statusColors.PENDING}`}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 text-sm">
                      {record.createdAt ? new Date(record.createdAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 text-sm">
                      {record.verifiedBy || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/payments/${record.id}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View
                        </Link>
                        {record.paymentMethod !== 'cash' && record.receiptUrl && (
                          <a
                            href={record.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            View Receipt
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

