"use client";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PlusIcon } from "@/icons";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import CreatePaymentIntentModal from "./CreatePaymentIntentModal";
import { useListAllPaymentsQuery, type UnifiedPayment } from "@/lib/services/adminApi";
import { useGetMerchantsQuery } from "@/lib/redux/features/merchantsApi";
import Pagination from "../tables/Pagination";

const formatAmount = (amount: number) => {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProviderName = (provider: string | null) => {
  if (!provider) return "N/A";
  // Check if it's a custom bank name (not in the enum list)
  const providerMap: Record<string, string> = {
    CBE: "Commercial Bank of Ethiopia",
    TELEBIRR: "Telebirr",
    AWASH: "Awash Bank",
    BOA: "Bank of Abyssinia",
    DASHEN: "Dashen Bank",
  };
  // If provider is in the map, return the mapped name, otherwise return as-is (custom bank name)
  return providerMap[provider] || provider;
};

interface PaymentTableProps {
  onView: (payment: UnifiedPayment) => void;
  onExport: () => void;
  onCreatePaymentIntent?: (data: { payerName: string; amount: number; notes?: string }) => void;
}

export default function PaymentTable({
  onView,
  onExport,
  onCreatePaymentIntent,
}: PaymentTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [merchantFilter, setMerchantFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: paymentsData, isLoading, error } = useListAllPaymentsQuery({
    search: searchQuery || undefined,
    merchantId: merchantFilter || undefined,
    paymentType: typeFilter !== "All Types" ? (typeFilter as "QR" | "cash" | "bank") : undefined,
    status: statusFilter !== "All Status" ? statusFilter.toUpperCase() : undefined,
    page,
    pageSize,
  });

  const { data: merchantsData } = useGetMerchantsQuery();
  const merchants = merchantsData?.data ?? [];

  const payments = paymentsData?.data ?? [];
  const totalPages = paymentsData?.totalPages ?? 0;

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "verified":
        return "text-green-600 dark:text-green-400";
      case "pending":
        return "text-orange-600 dark:text-orange-400";
      case "expired":
        return "text-gray-500 dark:text-gray-400";
      case "failed":
      case "unverified":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const getPaymentTypeBadge = (paymentType: string) => {
    const config = {
      QR: { color: "info" as const, label: "QR" },
      cash: { color: "success" as const, label: "Cash" },
      bank: { color: "warning" as const, label: "Bank" },
    };
    const { color, label } = config[paymentType as keyof typeof config] || { color: "info" as const, label: paymentType };
    return (
      <Badge size="sm" color={color}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Transactions</h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 dark:bg-green-500/10 dark:border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Live</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View all payment transactions across all merchants ({paymentsData?.total ?? 0} total)
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <Input
                type="text"
                placeholder="Search by reference, payer..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={merchantFilter}
              onChange={(e) => {
                setMerchantFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">All Merchants</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="All Types">All Types</option>
              <option value="QR">QR Payments</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="All Status">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  TYPE
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  MERCHANT
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  REFERENCE
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  PAYER
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  RECEIVER
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  AMOUNT
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  STATUS
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  DATE
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-5 py-8 text-center text-red-500 dark:text-red-400"
                  >
                    Error loading transactions. Please try again.
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                  >
                    <TableCell className="px-5 py-4">
                      {getPaymentTypeBadge(payment.paymentType)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {payment.merchant?.name || "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {payment.reference}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {payment.payerName || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div>
                        <span className="block font-semibold text-gray-800 dark:text-white">
                          {payment.receiverName || "-"}
                        </span>
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          {payment.provider ? getProviderName(payment.provider) : payment.paymentType === "cash" ? "Cash Payment" : payment.paymentType === "bank" ? "Bank Transfer" : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {formatAmount(payment.amount)}
                        </span>
                        {payment.tipAmount && payment.tipAmount > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                            +{formatAmount(payment.tipAmount)} tip
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <button
                        onClick={() => onView(payment)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                      >
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {paymentsData && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, paymentsData.total)} of {paymentsData.total} transactions
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Create Payment Intent Modal */}
      <CreatePaymentIntentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(data) => {
          if (onCreatePaymentIntent) {
            onCreatePaymentIntent(data);
          }
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}
