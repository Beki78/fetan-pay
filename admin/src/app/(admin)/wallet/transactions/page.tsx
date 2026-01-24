"use client";

import React, { useState, useMemo } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import { Modal } from "@/components/ui/modal";
import {
  useGetWalletTransactionsQuery,
  type WalletTransaction,
} from "@/lib/services/walletServiceApi";
import { useGetMerchantsQuery } from "@/lib/redux/features/merchantsApi";

export default function WalletTransactionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [merchantFilter, setMerchantFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);

  const { data: transactionsData, isLoading } = useGetWalletTransactionsQuery({
    merchantId: merchantFilter || undefined,
    page,
    pageSize,
  });

  const { data: merchantsData } = useGetMerchantsQuery();
  const merchants = merchantsData?.data ?? [];

  const filteredTransactions = useMemo(() => {
    if (!transactionsData?.transactions) return [];
    if (!typeFilter) return transactionsData.transactions;
    return transactionsData.transactions.filter((t) => t.type === typeFilter);
  }, [transactionsData, typeFilter]);

  const totalPages = transactionsData
    ? Math.ceil(transactionsData.total / transactionsData.pageSize)
    : 0;

  const transactionTypeBadge = (type: WalletTransaction["type"]) => {
    const config = {
      DEPOSIT: { color: "success" as const, label: "Deposit" },
      CHARGE: { color: "error" as const, label: "Charge" },
      REFUND: { color: "info" as const, label: "Refund" },
      ADJUSTMENT: { color: "warning" as const, label: "Adjustment" },
    };
    const { color, label } = config[type];
    return (
      <Badge variant="light" color={color}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          Wallet Transactions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View all wallet transactions across all merchants. Filter by merchant, type, or date range.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-200">
              Filter by Merchant
            </label>
            <select
              value={merchantFilter}
              onChange={(e) => {
                setMerchantFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">All Merchants</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-200">
              Filter by Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="CHARGE">Charge</option>
              <option value="REFUND">Refund</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setMerchantFilter("");
                setTypeFilter("");
                setPage(1);
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Transactions ({transactionsData?.total ?? 0})
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden border-0">
          {isLoading ? (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">Loading…</div>
          ) : filteredTransactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Merchant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Balance Before
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Balance After
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {transaction.merchant?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3">{transactionTypeBadge(transaction.type)}</td>
                        <td
                          className={`px-4 py-3 text-sm font-medium ${
                            transaction.amount >= 0
                              ? "text-success-600 dark:text-success-400"
                              : "text-error-600 dark:text-error-400"
                          }`}
                        >
                          {transaction.amount >= 0 ? "+" : ""}
                          {transaction.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          ETB
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {transaction.balanceBefore.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          ETB
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {transaction.balanceAfter.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          ETB
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {transaction.description || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTransaction(transaction);
                            }}
                            className="text-xs"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {page} of {totalPages}
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
          ) : (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
              No transactions found.
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}

interface TransactionDetailModalProps {
  transaction: WalletTransaction;
  onClose: () => void;
}

function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Transaction Details
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">ID: {transaction.id}</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {transaction.type}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(transaction.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</div>
              <div
                className={`text-sm font-medium ${
                  transaction.amount >= 0
                    ? "text-success-600 dark:text-success-400"
                    : "text-error-600 dark:text-error-400"
                }`}
              >
                {transaction.amount >= 0 ? "+" : ""}
                {transaction.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ETB
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Merchant</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {transaction.merchant?.name || "Unknown"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance Before</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {transaction.balanceBefore.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ETB
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance After</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {transaction.balanceAfter.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ETB
              </div>
            </div>
          </div>

          {transaction.description && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</div>
              <div className="text-sm text-gray-900 dark:text-white">{transaction.description}</div>
            </div>
          )}

          {transaction.payment && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Related Payment
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Reference: </span>
                  <span className="text-gray-900 dark:text-white">{transaction.payment.reference}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Provider: </span>
                  <span className="text-gray-900 dark:text-white">{transaction.payment.provider}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Amount: </span>
                  <span className="text-gray-900 dark:text-white">
                    {transaction.payment.claimedAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    ETB
                  </span>
                </div>
              </div>
            </div>
          )}

          {transaction.walletDeposit && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Related Deposit
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Reference: </span>
                  <span className="text-gray-900 dark:text-white">
                    {transaction.walletDeposit.reference}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Provider: </span>
                  <span className="text-gray-900 dark:text-white">
                    {transaction.walletDeposit.provider}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Amount: </span>
                  <span className="text-gray-900 dark:text-white">
                    {transaction.walletDeposit.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    ETB
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

