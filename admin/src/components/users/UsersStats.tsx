"use client";
import React from "react";
import { GroupIcon, TaskIcon, TimeIcon } from "@/icons";
import { useGetAdminAnalyticsQuery } from "@/lib/services/adminDashboardApi";
import { useGetMerchantsQuery } from "@/lib/redux/features/merchantsApi";

export default function UsersStats() {
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetAdminAnalyticsQuery();
  const { data: merchantsData, isLoading: isLoadingMerchants } = useGetMerchantsQuery({ status: "PENDING" });

  const totalUsers = analytics?.userAnalytics?.totalUsers ?? 0;
  const totalMerchants = analytics?.userAnalytics?.totalMerchants ?? 0;
  const totalTransactions = analytics?.platformTransactions?.totalTransactions ?? 0;
  const totalPending = merchantsData?.total ?? 0;

  const isLoading = isLoadingAnalytics || isLoadingMerchants;

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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Users */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
            <GroupIcon className="text-blue-600 dark:text-blue-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {totalUsers.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          All platform users
        </p>
      </div>

      {/* Total Merchants */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
            <GroupIcon className="text-purple-600 dark:text-purple-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Merchants</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {totalMerchants.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Registered merchants
        </p>
      </div>

      {/* Total Transactions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
            <TaskIcon className="text-green-600 dark:text-green-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {totalTransactions.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Across all merchants
        </p>
      </div>

      {/* Total Pending */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg">
            <TimeIcon className="text-orange-600 dark:text-orange-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Pending Actions</span>
        </div>
        <h4 className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
          {totalPending.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Awaiting approval
        </p>
      </div>
    </div>
  );
}
