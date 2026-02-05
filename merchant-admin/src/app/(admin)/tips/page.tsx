"use client";

import React, { useState } from "react";
import { useGetTipsSummaryQuery, useListTipsQuery } from "@/lib/services/paymentsServiceApi";
import { useSubscription } from "@/hooks/useSubscription";
import { formatNumberWithCommas } from "@/lib/utils";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/components/ui/toast/useToast";

interface DateRange {
  from?: string;
  to?: string;
}

interface FilterState {
  provider?: string;
  status?: string;
}

export default function TipsPage() {
  const { canAccessFeature } = useSubscription();
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [filters, setFilters] = useState<FilterState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Check if user can access tips feature
  const canAccessTips = canAccessFeature('tips');

  const {
    data: tipsSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useGetTipsSummaryQuery(dateRange, {
    skip: !canAccessTips,
  });

  const {
    data: tipsData,
    isLoading: isTipsLoading,
    error: tipsError,
  } = useListTipsQuery(
    {
      ...dateRange,
      ...filters,
      page: currentPage,
      pageSize,
    },
    {
      skip: !canAccessTips,
    }
  );

  // Handle access denied
  if (!canAccessTips) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
       
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Tips Feature Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The tips collection feature is not included in your current plan. Upgrade to access this feature.
          </p>
          <Button
            onClick={() => {
              showToast("Feature not available - Tips collection is not included in your current plan. Please upgrade to access this feature.", "warning");
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Upgrade Plan
          </Button>
        </div>
      </div>
    );
  }

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const clearDateRange = () => {
    setDateRange({});
    setCurrentPage(1);
  };

  const formatCurrency = (amount: string | number | null | undefined): string => {
    if (!amount) return "0.00";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return formatNumberWithCommas(numAmount.toFixed(2));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      VERIFIED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      UNVERIFIED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusColors[status as keyof typeof statusColors] || statusColors.PENDING
        }`}
      >
        {status}
      </span>
    );
  };

  const totalPages = tipsData ? Math.ceil(tipsData.total / pageSize) : 0;

  // Filter handlers
  const handleProviderFilter = (provider: string) => {
    setFilters(prev => ({ ...prev, provider: provider === 'all' ? undefined : provider }));
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status === 'all' ? undefined : status }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setDateRange({});
    setFilters({});
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
         
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tips</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track and manage customer tips
            </p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From:
            </label>
            <input
              type="date"
              value={dateRange.from || ""}
              onChange={(e) =>
                handleDateRangeChange({ ...dateRange, from: e.target.value })
              }
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To:
            </label>
            <input
              type="date"
              value={dateRange.to || ""}
              onChange={(e) =>
                handleDateRangeChange({ ...dateRange, to: e.target.value })
              }
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Provider:
            </label>
            <select
              value={filters.provider || 'all'}
              onChange={(e) => handleProviderFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Providers</option>
              <option value="CBE">CBE</option>
              <option value="TELEBIRR">Telebirr</option>
              <option value="BOA">Bank of Abyssinia</option>
              <option value="AWASH">Awash Bank</option>
              <option value="DASHEN">Dashen Bank</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
          </div>
          {(dateRange.from || dateRange.to || filters.provider || filters.status) && (
            <Button
              onClick={clearAllFilters}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tips
              </p>
              {isSummaryLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(tipsSummary?.totalTipAmount)} ETB
                </p>
              )}
            </div>
         
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tips Count
              </p>
              {isSummaryLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tipsSummary?.count || 0}
                </p>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* Tips List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Tips
          </h3>
        </div>

        {isTipsLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : tipsError ? (
          <div className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400">
              Error loading tips data. Please try again.
            </p>
          </div>
        ) : !tipsData?.data?.length ? (
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">No tips recorded yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Tips will appear here after payment verifications with tip amounts
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Payment Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tip Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Verified By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {tipsData.data.map((tip) => (
                    <tr key={tip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {tip.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {tip.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(tip.claimedAmount)} ETB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(tip.tipAmount)} ETB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(tip.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(tip.verifiedAt || tip.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {tip.verifiedBy?.name || tip.verifiedBy?.email || "System"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, tipsData.total)} of {tipsData.total} tips
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}