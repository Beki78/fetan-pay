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
import Badge from "../ui/badge/Badge";
import { useListAllPaymentsQuery, type UnifiedPayment } from "@/lib/services/adminApi";

const formatAmount = (amount: number) => {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProviderName = (provider: string | null) => {
  if (!provider) return "N/A";
  const providerMap: Record<string, string> = {
    CBE: "Commercial Bank of Ethiopia",
    TELEBIRR: "Telebirr",
    AWASH: "Awash Bank",
    BOA: "Bank of Abyssinia",
    DASHEN: "Dashen Bank",
  };
  return providerMap[provider] || provider;
};

const getStatusBadge = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  const config = {
    verified: { color: "success" as const, label: "Verified" },
    pending: { color: "warning" as const, label: "Pending" },
    expired: { color: "info" as const, label: "Expired" },
    failed: { color: "error" as const, label: "Failed" },
    unverified: { color: "error" as const, label: "Unverified" },
  };
  const { color, label } = config[normalizedStatus as keyof typeof config] || {
    color: "info" as const,
    label: status,
  };
  return <Badge size="sm" color={color}>{label}</Badge>;
};

const getPaymentTypeBadge = (paymentType: string) => {
  const config = {
    QR: { color: "info" as const, label: "QR" },
    cash: { color: "success" as const, label: "Cash" },
    bank: { color: "warning" as const, label: "Bank" },
  };
  const { color, label } = config[paymentType as keyof typeof config] || {
    color: "info" as const,
    label: paymentType,
  };
  return <Badge size="sm" color={color}>{label}</Badge>;
};

export default function RecentTransactions() {
  const { data: paymentsData, isLoading } = useListAllPaymentsQuery({
    page: 1,
    pageSize: 5,
  });

  const recentPayments = paymentsData?.data ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
        <Link href="/payments" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          View all transactions
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
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Merchant
                </TableCell>
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
                  Amount
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
                  Time
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading recent transactions...
                  </TableCell>
                </TableRow>
              ) : recentPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No recent transactions
                  </TableCell>
                </TableRow>
              ) : (
                recentPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                  >
                    <TableCell className="px-5 py-4">
                      {getPaymentTypeBadge(payment.paymentType)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 text-sm">
                      {payment.merchant?.name || "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {payment.reference}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 text-sm">
                      {payment.provider ? getProviderName(payment.provider) : payment.paymentType === "cash" ? "Cash Payment" : "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-white text-sm">
                          {formatAmount(payment.amount)}
                        </span>
                        {payment.tipAmount && payment.tipAmount > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                            +{formatAmount(payment.tipAmount)} tip
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(payment.createdAt)}
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

