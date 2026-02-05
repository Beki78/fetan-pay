"use client";
import { useState } from "react";
import TransactionMetrics from "@/components/analytics/TransactionMetrics";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import ConfirmationChart from "@/components/analytics/ConfirmationChart";
import MerchantApprovalStatus from "@/components/common/MerchantApprovalStatus";
import Button from "@/components/ui/button/Button";
import { BoltIcon, LockIcon } from "@/icons";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/components/ui/toast/useToast";

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 7 Days");
  const { status: accountStatus, isLoading: isStatusLoading } = useAccountStatus();
  const { canAccessFeature, plan } = useSubscription();
  const { showToast, ToastComponent } = useToast();

  // Check if user has access to advanced analytics
  const hasAdvancedAnalytics = canAccessFeature('advancedAnalytics');

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

  return (
    <div className="space-y-6">
      <ToastComponent />
      
      {/* Subscription Protection Banner */}
      {!hasAdvancedAnalytics && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <LockIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Advanced Analytics Not Available
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Advanced analytics features are not included in your current <strong>{plan?.name || 'Free'}</strong> plan. 
                Upgrade to unlock detailed insights, trend analysis, forecasting, and export capabilities.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/billing'}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Upgrade Plan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = '/billing'}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hasAdvancedAnalytics ? "Advanced transaction analytics and insights" : "Basic transaction analytics"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            disabled={!hasAdvancedAnalytics}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      {/* Upgrade Banner for users without advanced analytics */}
      {!hasAdvancedAnalytics && (
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
              onClick={() => window.location.href = '/billing'}
              className="bg-purple-500 hover:bg-purple-600 text-white border-0 whitespace-nowrap"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Metrics - Always available */}
      <TransactionMetrics period={selectedPeriod} />

      {/* Advanced Analytics - Protected */}
      {hasAdvancedAnalytics ? (
        <>
          {/* Statistics Chart - Full Width */}
          <StatisticsChart period={selectedPeriod} />

          {/* Status Distribution Chart */}
          <ConfirmationChart period={selectedPeriod} />
        </>
      ) : (
        <div className="space-y-6">
          {/* Locked Statistics Chart */}
          <div className="relative">
            <div className="opacity-30 pointer-events-none">
              <StatisticsChart period={selectedPeriod} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
              <div className="text-center">
                <LockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Advanced Charts Locked
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Upgrade to access detailed trend analysis
                </p>
                <Button
                  size="sm"
                  onClick={() => showToast({
                    type: 'warning',
                    message: 'Please upgrade your plan to access advanced analytics',
                    duration: 4000,
                  })}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>

          {/* Locked Status Distribution Chart */}
          <div className="relative">
            <div className="opacity-30 pointer-events-none">
              <ConfirmationChart period={selectedPeriod} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
              <div className="text-center">
                <LockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status Distribution Locked
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Upgrade to access detailed status breakdowns
                </p>
                <Button
                  size="sm"
                  onClick={() => showToast({
                    type: 'warning',
                    message: 'Please upgrade your plan to access advanced analytics',
                    duration: 4000,
                  })}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

