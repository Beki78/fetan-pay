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

