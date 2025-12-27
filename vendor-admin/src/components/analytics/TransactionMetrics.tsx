"use client";
import React from "react";

// Mock data
const mockMetrics = {
  totalTransactions: 3,
  verified: 0,
  successRate: 0,
  totalAmount: 0.00,
};

export default function TransactionMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Transactions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Total Transactions
        </p>
        <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
          {mockMetrics.totalTransactions}
        </h4>
      </div>

      {/* Verified */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Verified
        </p>
        <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">
          {mockMetrics.verified}
        </h4>
      </div>

      {/* Success Rate */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Success Rate
        </p>
        <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {mockMetrics.successRate}%
        </h4>
      </div>

      {/* Total Amount */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Total Amount
        </p>
        <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
          {mockMetrics.totalAmount.toFixed(2)} ETB
        </h4>
      </div>
    </div>
  );
}

