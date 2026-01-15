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
import { useListVerificationHistoryQuery } from "@/lib/services/paymentsServiceApi";

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
  status: string;
  amount?: number;
  createdAt: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  type: "transaction" | "payment";
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
      status: tx.status,
      createdAt: tx.createdAt || "",
      verifiedAt: tx.verifiedAt,
      verifiedBy: tx.verifiedBy?.name || tx.verifiedBy?.email || null,
      type: "transaction" as const,
    }));

    const paymentRecords: UnifiedRecord[] = (paymentData?.data || []).map((p) => ({
      id: p.id,
      reference: p.reference,
      provider: p.provider,
      status: p.status,
      amount: p.claimedAmount ? Number(p.claimedAmount) : undefined,
      createdAt: p.verifiedAt || "",
      verifiedAt: p.verifiedAt,
      verifiedBy: p.verifiedBy?.name || p.verifiedBy?.email || null,
      type: "payment" as const,
    }));

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
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
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
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" variant="light" color="info">
                        {providerLabels[record.provider] ?? record.provider}
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
                      <Link
                        href={`/payments/${record.id}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                      </Link>
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

