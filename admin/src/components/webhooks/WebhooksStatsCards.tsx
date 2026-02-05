"use client";
import React from "react";
import { PaperPlaneIcon, CheckCircleIcon, AlertIcon, GroupIcon } from "@/icons";
import { useGetWebhookStatsQuery } from "@/lib/services/adminWebhooksServiceApi";

export default function WebhooksStatsCards() {
  const { data: stats, isLoading, error } = useGetWebhookStatsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertIcon className="w-5 h-5" />
            <span className="text-sm">Failed to load webhook statistics</span>
          </div>
        </div>
      </div>
    );
  }

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
          {stats.totalMerchants.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Active merchants
        </p>
      </div>

      {/* Webhooks Created */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
            <PaperPlaneIcon className="text-purple-600 dark:text-purple-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Webhooks Created</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {stats.totalActiveWebhooks.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {stats.webhookAdoptionRate}% of merchants
        </p>
      </div>

      {/* Successful Deliveries */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
            <CheckCircleIcon className="text-green-600 dark:text-green-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Successful</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {stats.successfulDeliveries.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Webhook deliveries
        </p>
      </div>

      {/* Failed Deliveries */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
            <AlertIcon className="text-red-600 dark:text-red-400 size-5" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
        </div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {stats.failedDeliveries.toLocaleString()}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Webhook deliveries
        </p>
      </div>
    </div>
  );
}