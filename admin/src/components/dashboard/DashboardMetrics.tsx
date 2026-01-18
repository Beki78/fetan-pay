"use client";
import React from "react";
import { GroupIcon, CheckCircleIcon, DollarLineIcon, PieChartIcon } from "@/icons";
import { useGetAdminAnalyticsQuery } from "@/lib/services/adminDashboardApi";

export default function DashboardMetrics() {
  const { data: analytics, isLoading } = useGetAdminAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50 animate-pulse"
          >
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = analytics || {
    userAnalytics: { totalMerchants: 0 },
    platformTransactions: { totalTransactions: 0, totalVerified: 0 },
    totalTips: 0,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Merchants */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
            <GroupIcon className="text-blue-600 dark:text-blue-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Merchants</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {metrics.userAnalytics.totalMerchants.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Active merchants
        </p>
      </div>

      {/* Total Transactions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
            <PieChartIcon className="text-purple-600 dark:text-purple-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {metrics.platformTransactions.totalTransactions.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          All transactions
        </p>
      </div>

      {/* Total Verified */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
            <CheckCircleIcon className="text-green-600 dark:text-green-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Verified</span>
        </div>
        <h4 className="text-2xl font-semibold text-green-600 dark:text-green-400">
          {metrics.platformTransactions.totalVerified.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Verified transactions
        </p>
      </div>

      {/* Total Tips */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg">
            <DollarLineIcon className="text-yellow-600 dark:text-yellow-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Tips</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {metrics.totalTips.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ETB
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Total tips collected
        </p>
      </div>
    </div>
  );
}

