"use client";
import React from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import Subscription from "@/components/dashboard/Subscription";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTransactions from "@/components/dashboard/RecentTransactions";

export default function Dashboard() {
  // Mock subscription data - In production, this would come from API/context
  // Set hasActiveSubscription to false to show "No Active Subscription" banner
  const hasActiveSubscription = false; // Change to true to show subscription details
  const verificationsUsed = 0;
  const verificationsLimit = 100;
  const daysRemaining = 1;
  const planName = "Free";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, ephrem debebe&apos;s Business
        </p>
      </div>

      {/* Summary Cards */}
      <DashboardMetrics />

      {/* Subscription Component */}
      <Subscription
        hasActiveSubscription={hasActiveSubscription}
        verificationsUsed={verificationsUsed}
        verificationsLimit={verificationsLimit}
        daysRemaining={daysRemaining}
        planName={planName}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
