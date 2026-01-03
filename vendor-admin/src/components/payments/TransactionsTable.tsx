"use client";

import { useMemo, useState } from "react";
import {
  useListTransactionsQuery,
  type TransactionRecord,
  type TransactionProvider,
  type TransactionStatus,
} from "@/lib/services/transactionsServiceApi";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const providerLabels: Record<TransactionProvider, string> = {
  CBE: "CBE",
  TELEBIRR: "Telebirr",
  AWASH: "Awash",
  BOA: "Bank of Abyssinia",
  DASHEN: "Dashen",
};

const statusColors: Record<TransactionStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-200",
  VERIFIED: "bg-green-500/10 text-green-700 dark:text-green-200",
  FAILED: "bg-red-500/10 text-red-700 dark:text-red-200",
};

interface TransactionsTableProps {
  onView: (transaction: TransactionRecord) => void;
  selectedId?: string;
}

export default function TransactionsTable({ onView, selectedId }: TransactionsTableProps) {
  const [providerFilter, setProviderFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, error } = useListTransactionsQuery({
    provider: providerFilter === "All" ? undefined : (providerFilter as TransactionProvider),
    status: statusFilter === "All" ? undefined : (statusFilter as TransactionStatus),
    page,
    pageSize,
  });

  const transactions = useMemo(() => data?.data ?? [], [data]);

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const query = search.toLowerCase();
    return transactions.filter((tx) =>
      tx.reference.toLowerCase().includes(query) || tx.qrUrl.toLowerCase().includes(query)
    );
  }, [transactions, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search by reference or URL"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="All">All Providers</option>
            <option value="CBE">CBE</option>
            <option value="TELEBIRR">Telebirr</option>
            <option value="AWASH">Awash</option>
            <option value="BOA">BOA</option>
            <option value="DASHEN">Dashen</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="All">All Status</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Reference
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Provider
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Created
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Verified At
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(isLoading || isFetching) && (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isFetching && error && (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-6 text-center text-red-500">
                    {"status" in error && error.status === 0
                      ? "Network error"
                      : "data" in error && (error as any).data?.message
                        ? (error as any).data.message
                        : "Failed to load transactions"}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isFetching && !error && filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isFetching && !error &&
                filteredTransactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className={`bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors ${selectedId === tx.id ? "ring-2 ring-brand-500/40" : ""}`}
                  >
                    <TableCell className="px-5 py-4">
                      <span className="font-semibold text-blue-600 dark:text-blue-300">{tx.reference}</span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" variant="light" color="info">
                        {providerLabels[tx.provider] ?? tx.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColors[tx.status]}`}>
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {tx.verifiedAt ? new Date(tx.verifiedAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Button size="sm" variant="outline" onClick={() => onView(tx)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}