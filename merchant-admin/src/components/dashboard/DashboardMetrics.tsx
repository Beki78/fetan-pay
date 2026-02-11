"use client";
import React from "react";
import { BoxIcon, CheckCircleIcon, TimeIcon, DollarLineIcon } from "@/icons";
import { useGetDashboardStatsQuery } from "@/lib/services/dashboardServiceApi";
import { useGetWalletBalanceQuery } from "@/lib/services/walletServiceApi";

export default function DashboardMetrics() {
  const { data: dashboardStats, isLoading, isError } = useGetDashboardStatsQuery();
  const { data: walletBalance, isLoading: isWalletLoading } = useGetWalletBalanceQuery();

  // Use real data from API or fallback to 0
  const metrics = {
    totalTransactions: dashboardStats?.metrics?.totalTransactions ?? 0,
    verified: dashboardStats?.metrics?.verified ?? 0,
    pending: dashboardStats?.metrics?.pending ?? 0,
    walletBalance: walletBalance?.balance ?? 0,
  };

  if (isLoading || isWalletLoading) {
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
    // Don't show error messages on dashboard - just show empty state
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BoxIcon, label: "Total Transactions", value: "0" },
          { icon: CheckCircleIcon, label: "Verified", value: "0", color: "green" },
          { icon: TimeIcon, label: "Pending", value: "0", color: "orange" },
          { icon: DollarLineIcon, label: "Wallet Balance", value: "0.00 ETB", color: "blue" },
        ].map((metric, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                metric.color === 'green' ? 'bg-green-500/10 dark:bg-green-500/20' :
                metric.color === 'orange' ? 'bg-orange-500/10 dark:bg-orange-500/20' :
                metric.color === 'blue' ? 'bg-blue-500/10 dark:bg-blue-500/20' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                <metric.icon className={`size-5 ${
                  metric.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  metric.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                  metric.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  'text-gray-600 dark:text-gray-300'
                }`} />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
            </div>
            <h4 className={`text-2xl font-semibold ${
              metric.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'
            }`}>
              {metric.value}
            </h4>
          </div>
        ))}
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
            <CheckCircleIcon className="text-green-600 dark:text-green-400 " />
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

