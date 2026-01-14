"use client";
import React from "react";
import { useGetAnalyticsMetricsQuery } from "@/lib/services/dashboardServiceApi";

interface TransactionMetricsProps {
  period?: string;
}

export default function TransactionMetrics({ period }: TransactionMetricsProps) {
  const { data: metrics, isLoading, isError } = useGetAnalyticsMetricsQuery(
    period ? { period } : undefined
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">
          Failed to load analytics metrics. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Transactions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Total Transactions
        </p>
        <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
          {metrics.totalTransactions}
        </h4>
      </div>

      {/* Verified */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Verified
        </p>
        <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">
          {metrics.verified}
        </h4>
      </div>

      {/* Success Rate */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Success Rate
        </p>
        <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {metrics.successRate}%
        </h4>
      </div>

      {/* Total Amount */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Total Amount
        </p>
        <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
          {metrics.totalAmount.toFixed(2)} ETB
        </h4>
      </div>
    </div>
  );
}

