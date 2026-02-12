"use client";
import { useState } from "react";
import { useGetAdminAnalyticsQuery } from "@/lib/services/adminDashboardApi";
import TransactionOverviewChart from "@/components/analytics/TransactionOverviewChart";
import WalletDepositsChart from "@/components/analytics/WalletDepositsChart";
import TransactionTypeChart from "@/components/analytics/TransactionTypeChart";
import TransactionStatusChart from "@/components/analytics/TransactionStatusChart";
import ProviderUsageChart from "@/components/analytics/ProviderUsageChart";
import DailyTransactionChart from "@/components/analytics/DailyTransactionChart";
import DatePicker from "@/components/common/DatePicker";
import Button from "@/components/ui/button/Button";
import { exportAnalyticsToPDF } from "@/utils/pdfExport";
import "@/styles/datepicker.css";

const formatAmount = (amount: number | undefined | null) => {
  const safeAmount = amount ?? 0;
  return `${safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{
    from?: string;
    to?: string;
  }>({});

  // Convert string dates to Date objects for the date picker
  const fromDate = dateRange.from ? new Date(dateRange.from) : null;
  const toDate = dateRange.to ? new Date(dateRange.to) : null;

  const { data: analytics, isLoading, error } = useGetAdminAnalyticsQuery(
    dateRange.from || dateRange.to ? dateRange : undefined,
  );

  const handleFromDateChange = (date: Date | null) => {
    if (date) {
      setDateRange((prev) => ({
        ...prev,
        from: date.toISOString().split('T')[0],
      }));
    } else {
      setDateRange((prev) => ({
        ...prev,
        from: undefined,
      }));
    }
  };

  const handleToDateChange = (date: Date | null) => {
    if (date) {
      setDateRange((prev) => ({
        ...prev,
        to: date.toISOString().split('T')[0],
      }));
    } else {
      setDateRange((prev) => ({
        ...prev,
        to: undefined,
      }));
    }
  };

  const clearDateFilter = () => {
    setDateRange({});
  };

  const handleExportPDF = async () => {
    if (!analytics) return;

    try {
      await exportAnalyticsToPDF({
        analytics,
        dateRange: dateRange.from || dateRange.to ? dateRange : undefined,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Analytics
          </h1>
          <p className="text-sm text-red-500 dark:text-red-400">
            Failed to load analytics. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {dateRange.from || dateRange.to 
              ? 'Filtered analytics and insights'
              : 'Last 30 days analytics and insights'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap font-medium">
                From:
              </label>
              <DatePicker
                selected={fromDate}
                onChange={handleFromDateChange}
                placeholderText="Select start date"
                maxDate={toDate || new Date()}
                className="w-48"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap font-medium">
                To:
              </label>
              <DatePicker
                selected={toDate}
                onChange={handleToDateChange}
                placeholderText="Select end date"
                minDate={fromDate || undefined}
                maxDate={new Date()}
                className="w-48"
              />
            </div>
            {(dateRange.from || dateRange.to) && (
              <button
                onClick={clearDateFilter}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                  hover:text-gray-800 dark:hover:text-gray-200 
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Export PDF Button */}
          {analytics && (
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export PDF
            </Button>
          )}
        </div>
      </div>

      {/* User Analytics Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          User Analytics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Users
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {analytics.userAnalytics.totalUsers.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              All roles combined
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Merchants
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {analytics.userAnalytics.totalMerchants.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Active merchants
            </p>
          </div>
        </div>
      </div>

      {/* Platform Transactions Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Platform Transactions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Transactions
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {analytics.platformTransactions.totalTransactions.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Verified
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analytics.platformTransactions.totalVerified.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Pending
            </p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {analytics.platformTransactions.totalPending.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Unsuccessful(Expired)
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {analytics.platformTransactions.totalUnsuccessful.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Transaction Amount
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatAmount(
                analytics.platformTransactions.totalTransactionAmount,
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Tips
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatAmount(analytics.platformTransactions.totalTips)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* First Row - Daily Transaction Amount & Tips */}
        {analytics.dailyData && analytics.dailyData.length > 0 && (
          <DailyTransactionChart dailyData={analytics.dailyData} />
        )}

        {/* Second Row - Transaction Overview */}
        <TransactionOverviewChart
          totalTransactions={analytics.platformTransactions.totalTransactions}
          totalMerchants={analytics.userAnalytics.totalMerchants}
          totalVerified={analytics.platformTransactions.totalVerified}
        />

        {/* Third Row - Wallet Deposits */}
        <WalletDepositsChart
          totalDeposits={analytics.walletAnalytics.totalDeposits}
        />

        {/* Third Row - Transaction Type and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionTypeChart
            qr={analytics.transactionTypeBreakdown.qr}
            cash={analytics.transactionTypeBreakdown.cash}
            bank={analytics.transactionTypeBreakdown.bank}
          />
          <TransactionStatusChart
            successful={analytics.transactionStatusBreakdown.successful}
            failed={analytics.transactionStatusBreakdown.failed}
            pending={analytics.transactionStatusBreakdown.pending}
            expired={analytics.transactionStatusBreakdown.expired}
          />
          </div>

        {/* Fourth Row - Provider Usage */}
        <ProviderUsageChart providerUsage={analytics.providerUsage} />
      </div>
    </div>
  );
}
