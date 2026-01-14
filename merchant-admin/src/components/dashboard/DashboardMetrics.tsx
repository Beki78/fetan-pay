"use client";
import React from "react";
import { BoxIcon, CheckCircleIcon, TimeIcon, DollarLineIcon } from "@/icons";
import { useGetDashboardStatsQuery } from "@/lib/services/dashboardServiceApi";

export default function DashboardMetrics() {
  const { data: dashboardStats, isLoading, isError } = useGetDashboardStatsQuery();

  // Use real data from API or fallback to 0
  const metrics = dashboardStats?.metrics || {
    totalTransactions: 0,
    verified: 0,
    pending: 0,
    walletBalance: 0,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50 animate-pulse"
          >
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">
          Failed to load dashboard metrics. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Transactions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <BoxIcon className="text-gray-600 dark:text-gray-300 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {metrics.totalTransactions}
        </h4>
      </div>

      {/* Verified */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
            <CheckCircleIcon className="text-green-600 dark:text-green-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Verified</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {metrics.verified}
        </h4>
      </div>

      {/* Pending */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg">
            <TimeIcon className="text-orange-600 dark:text-orange-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {metrics.pending}
        </h4>
      </div>

      {/* Wallet Balance */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
            <DollarLineIcon className="text-blue-600 dark:text-blue-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Wallet Balance</span>
        </div>
        <h4 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
          {metrics.walletBalance.toFixed(2)} ETB
        </h4>
      </div>
    </div>
  );
}

