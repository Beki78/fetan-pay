"use client";
import React, { useState } from "react";
import TransactionMetrics from "@/components/analytics/TransactionMetrics";
import RevenueTrendChart from "@/components/analytics/RevenueTrendChart";
import ConfirmationChart from "@/components/analytics/ConfirmationChart";
import Button from "@/components/ui/button/Button";
import { BoltIcon } from "@/icons";

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 7 Days");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Basic transaction analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full">
              <BoltIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
    <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                Unlock Advanced Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get detailed insights, trend analysis, forecasting, and export capabilities with a premium plan.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white border-0 whitespace-nowrap"
          >
            Upgrade Now
          </Button>
        </div>
      </div>

        {/* Transaction Metrics */}
        <TransactionMetrics />

      {/* Charts Grid - One Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Trend */}
        <div className="lg:col-span-1">
            <RevenueTrendChart />
          </div>

        {/* Status Distribution */}
        <div className="lg:col-span-1">
            <ConfirmationChart />
        </div>
      </div>
    </div>
  );
}

