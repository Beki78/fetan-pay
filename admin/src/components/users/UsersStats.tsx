"use client";
import React from "react";
import { GroupIcon,  DollarLineIcon, TaskIcon, TimeIcon  } from "@/icons";

// Platform user statistics
const userStats = {
  totalUsers: 1247,
  totalTransactions: 15890,
  totalPurchasedPlans: 834,
  totalPending: 23,
};

export default function UsersStats() {
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
          {userStats.totalUsers.toLocaleString()}
        </h4>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          +12% from last month
        </p>
      </div>

      {/* Total Transactions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
            <TaskIcon className="text-purple-600 dark:text-purple-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {userStats.totalTransactions.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Across all users
        </p>
      </div>

      {/* Total Purchased Plans */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
            <DollarLineIcon className="text-green-600 dark:text-green-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Purchased Plans</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {userStats.totalPurchasedPlans}
        </h4>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          Active subscriptions
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
          {userStats.totalPending}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Awaiting approval
        </p>
      </div>
    </div>
  );
}
