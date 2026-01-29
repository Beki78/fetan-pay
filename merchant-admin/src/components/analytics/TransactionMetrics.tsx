"use client";
import { useGetAnalyticsMetricsQuery } from "@/lib/services/dashboardServiceApi";

interface TransactionMetricsProps {
  period?: string;
}

export default function TransactionMetrics({ period }: TransactionMetricsProps) {
  const { data: metrics, isLoading, isError } = useGetAnalyticsMetricsQuery(
    period ? { period } : undefined
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !metrics) {
    // Don't show error messages on analytics - just show empty state with zero values
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Revenue */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Total Revenue
          </p>
          <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">
            0.00 ETB
          </h4>
        </div>

        {/* Total Users */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Total Users
          </p>
          <h4 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            0
          </h4>
        </div>

        {/* Total Tips */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Total Tips
          </p>
          <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            0.00 ETB
          </h4>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Revenue */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Total Revenue
        </p>
        <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">
          {metrics.totalRevenue.toFixed(2)} ETB
        </h4>
      </div>

      {/* Total Users */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Total Users
        </p>
        <h4 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {metrics.totalUsers}
        </h4>
      </div>

      {/* Total Tips */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Total Tips
        </p>
        <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {metrics.totalTips.toFixed(2)} ETB
        </h4>
      </div>
    </div>
  );
}

