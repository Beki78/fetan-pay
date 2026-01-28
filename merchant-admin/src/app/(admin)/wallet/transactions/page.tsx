"use client";
import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { useGetWalletTransactionsQuery } from "@/lib/services/walletServiceApi";
import Button from "@/components/ui/button/Button";

export default function WalletTransactionsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: transactionsData, isLoading } = useGetWalletTransactionsQuery({
    page,
    pageSize,
  });

  const transactions = transactionsData?.transactions ?? [];
  const total = transactionsData?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = type === "DEPOSIT" || type === "REFUND" ? "+" : "-";
    const color = type === "DEPOSIT" || type === "REFUND" 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";
    return (
      <span className={color}>
        {sign}{Math.abs(amount).toFixed(2)} ETB
      </span>
    );
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return "Deposit";
      case "CHARGE":
        return "Verification Fee";
      case "REFUND":
        return "Refund";
      case "ADJUSTMENT":
        return "Adjustment";
      default:
        return type;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (type) {
      case "DEPOSIT":
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
      case "CHARGE":
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
      case "REFUND":
        return `${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
      case "ADJUSTMENT":
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Wallet Transactions" />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          Transaction History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View all your wallet transactions and charges.
        </p>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No transactions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Your wallet transaction history will appear here
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Balance After
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getTransactionTypeBadge(transaction.type)}>
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-white">
                        <div>
                          {transaction.description && (
                            <p className="font-medium">{transaction.description}</p>
                          )}
                          {transaction.payment && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Payment: {transaction.payment.reference} ({transaction.payment.provider})
                            </p>
                          )}
                          {transaction.walletDeposit && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Deposit: {transaction.walletDeposit.reference} ({transaction.walletDeposit.provider})
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                        {formatAmount(transaction.amount, transaction.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                        {transaction.balanceAfter.toFixed(2)} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={getTransactionTypeBadge(transaction.type)}>
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatAmount(transaction.amount, transaction.type)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Balance: {transaction.balanceAfter.toFixed(2)} ETB
                      </p>
                    </div>
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-gray-800 dark:text-white">
                      {transaction.description}
                    </p>
                  )}
                  {(transaction.payment || transaction.walletDeposit) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.payment && `Payment: ${transaction.payment.reference}`}
                      {transaction.walletDeposit && `Deposit: ${transaction.walletDeposit.reference}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} transactions
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

