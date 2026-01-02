"use client";
import React from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SystemHealth from "@/components/dashboard/SystemHealth";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">Super Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Platform overview and system management</p>
      </div>

      {/* Platform Metrics */}
      <DashboardMetrics />

      

      {/* Quick Actions */}
      {/* <QuickActions /> */}

      {/* Recent Platform Activities */}
      <RecentTransactions />
    </div>
  );
}
