"use client";

import { useMemo, useState } from "react";
import Badge from "../ui/badge/Badge";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import {
  type PaymentRecord,
  type PaymentVerificationStatus,
  type TransactionProvider,
  useListVerificationHistoryQuery,
} from "@/lib/services/paymentsServiceApi";

const providerLabels: Record<TransactionProvider, string> = {
  CBE: "CBE",
  TELEBIRR: "Telebirr",
  AWASH: "Awash",
  BOA: "Bank of Abyssinia",
  DASHEN: "Dashen",
};

function statusColor(status: PaymentVerificationStatus) {
  switch (status) {
    case "VERIFIED":
      return "success";
    case "UNVERIFIED":
      return "warning";
    case "PENDING":
      return "info";
    default:
      return "info";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function getVerifierLabel(payment: PaymentRecord) {
  const by = payment.verifiedBy;
  if (!by) return "—";
  const name = by.name ?? by.user?.name;
  const email = by.email ?? by.user?.email;
  return name?.trim() || email?.trim() || "—";
}

export interface VerificationHistoryTableProps {
  onView?: (payment: PaymentRecord) => void;
  selectedId?: string;
  verifiedByUserId?: string;
}

export default function VerificationHistoryTable({
  onView,
  selectedId,
  verifiedByUserId,
}: VerificationHistoryTableProps) {
  const [providerFilter, setProviderFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, error } = useListVerificationHistoryQuery({
    provider: providerFilter === "All" ? undefined : (providerFilter as TransactionProvider),
    status: statusFilter === "All" ? undefined : (statusFilter as PaymentVerificationStatus),
    reference: search.trim() ? search.trim() : undefined,
    page,
    pageSize,
  });

  const payments = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    if (!verifiedByUserId) return payments;
    return payments.filter((p) => p.verifiedById === verifiedByUserId);
  }, [payments, verifiedByUserId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search by reference"
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
            <option value="UNVERIFIED">Unverified</option>
            <option value="PENDING">Pending</option>
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
                  Amount
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Tip
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Verified By
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Provider
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Status
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
                  <TableCell colSpan={8} className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    Loading verification history...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isFetching && error && (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-6 text-center text-red-500">
                    {"status" in (error as any) && (error as any).status === 0
                      ? "Network error"
                      : "data" in (error as any) && (error as any).data?.message
                        ? (error as any).data.message
                        : "Failed to load verification history"}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isFetching && !error && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    No verification history found
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isFetching && !error &&
                filtered.map((p) => {
                  const claimedAmount = Number(p.claimedAmount || 0);
                  const tipAmount = p.tipAmount ? Number(p.tipAmount) : null;
                  const verifierRole = p.verifiedBy?.role;
                  const isWaiter = verifierRole === "WAITER";

                  return (
                    <TableRow
                      key={p.id}
                      className={`bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors ${selectedId === p.id ? "ring-2 ring-brand-500/40" : ""}`}
                    >
                      <TableCell className="px-5 py-4">
                        <span className="font-semibold text-blue-600 dark:text-blue-300">
                          {p.reference}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">
                          {claimedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {tipAmount ? (
                          <div className="flex items-center gap-2">
                            <Badge size="sm" variant="light" color="success">
                              {tipAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                            </Badge>
                            {isWaiter && (
                              <span className="text-xs text-gray-500 dark:text-gray-400" title="Verified by waiter">
                                👤
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col gap-1">
                          <span>{getVerifierLabel(p)}</span>
                          {p.verifiedBy?.role && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {p.verifiedBy.role}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" variant="light" color="info">
                          {providerLabels[p.provider] ?? p.provider}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={statusColor(p.status)}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {formatDate(p.verifiedAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView?.(p)}
                          disabled={!onView}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
