"use client";
import React from "react";
import { DollarLineIcon, GroupIcon, TaskIcon } from "@/icons";

interface MerchantStatsCardProps {
  revenue?: number;
  totalUsers?: number;
  totalTips?: number;
}

export default function MerchantStatsCard({
  revenue = 0,
  totalUsers = 0,
  totalTips = 0,
}: MerchantStatsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
      {/* Revenue */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
            <DollarLineIcon className="text-green-600 dark:text-green-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          All-time revenue
        </p>
      </div>

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
          Team members
        </p>
      </div>

      {/* Total Tips */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
            <TaskIcon className="text-purple-600 dark:text-purple-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Tips</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {totalTips.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tips collected
        </p>
      </div>
    </div>
  );
}

