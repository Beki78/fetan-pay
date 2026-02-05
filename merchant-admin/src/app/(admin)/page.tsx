"use client";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import Subscription from "@/components/dashboard/Subscription";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import MerchantApprovalStatus from "@/components/common/MerchantApprovalStatus";
import { useGetDashboardStatsQuery } from "@/lib/services/dashboardServiceApi";
import { useSession } from "@/hooks/useSession";
import { useAccountStatus } from "@/hooks/useAccountStatus";

export default function Dashboard() {
  const { data: dashboardStats, isLoading: isStatsLoading } = useGetDashboardStatsQuery();
  const { user } = useSession();
  const { status: accountStatus, isLoading: isStatusLoading } = useAccountStatus();

  // Show loading spinner while checking account status
  if (isStatusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show approval status if merchant is not approved
  if (accountStatus === "pending") {
    return <MerchantApprovalStatus />;
  }

  // Mock subscription data - In production, this would come from API/context
  // Set hasActiveSubscription to false to show "No Active Subscription" banner
  const hasActiveSubscription = false; // Change to true to show subscription details
  const verificationsUsed = 0;
  const verificationsLimit = 100;
  const daysRemaining = 1;
  const planName = "Free";

  // Get owner name from dashboard stats or fallback to user name
  const ownerName = dashboardStats?.ownerName || user?.name || "User";
  const merchantName = dashboardStats?.merchantName || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isStatsLoading ? (
            "Loading..."
          ) : (
            `Welcome back, ${ownerName}${merchantName ? `'s ${merchantName}` : ""}`
          )}
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
