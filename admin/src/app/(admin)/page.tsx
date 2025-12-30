"use client";
import React from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import SubscriptionAlert from "@/components/dashboard/SubscriptionAlert";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTransactions from "@/components/dashboard/RecentTransactions";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, bamlake</p>
      </div>

      {/* Summary Cards */}
      <DashboardMetrics />

      {/* Subscription Alert */}
      <SubscriptionAlert />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
