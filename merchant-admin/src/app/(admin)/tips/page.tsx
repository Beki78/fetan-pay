"use client";

import { useState } from "react";
import { 
  useGetTipsSummaryQuery, 
  useListTipsQuery,
  type TransactionProvider,
  type PaymentVerificationStatus 
} from "@/lib/services/paymentsServiceApi";
import { useGetPaymentProvidersQuery } from "@/lib/services/paymentProvidersServiceApi";
import { useSubscription } from "@/hooks/useSubscription";
import { formatNumberWithCommas } from "@/lib/utils";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/components/ui/toast/useToast";

interface DateRange {
  from?: string;
  to?: string;
}

interface FilterState {
  provider?: TransactionProvider;
  status?: PaymentVerificationStatus;
  phone?: string;
  name?: string;
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

  // Fetch payment providers
  const { data: providersData } = useGetPaymentProvidersQuery();
  const providers = providersData?.providers || [];

  const {
    data: tipsSummary,
    isLoading: isSummaryLoading,
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
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (key === 'provider' || key === 'status') {
      setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value as any }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value || undefined }));
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setDateRange({});
    setFilters({});
    setCurrentPage(1);
  };

  const hasActiveFilters = dateRange.from || dateRange.to || filters.provider || filters.status || filters.phone || filters.name;

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

        <div className="p-6 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by phone or name..."
                value={filters.phone || filters.name || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters(prev => ({
                    ...prev,
                    phone: value.match(/^\d/) ? value : undefined,
                    name: !value.match(/^\d/) && value ? value : undefined,
                  }));
                  setCurrentPage(1);
                }}
                className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filters.provider || 'all'}
                onChange={(e) => handleFilterChange('provider', e.target.value)}
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="all">All Providers</option>
                {providers
                  .filter(p => p.status === 'ACTIVE')
                  .map(provider => (
                    <option key={provider.code} value={provider.code}>
                      {provider.name}
                    </option>
                  ))}
              </select>
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="all">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
              <input
                type="date"
                value={dateRange.from || ""}
                onChange={(e) => handleDateRangeChange({ ...dateRange, from: e.target.value })}
                placeholder="From date"
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
              <input
                type="date"
                value={dateRange.to || ""}
                onChange={(e) => handleDateRangeChange({ ...dateRange, to: e.target.value })}
                placeholder="To date"
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
              )}
            </div>
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
                      Customer
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
                  {tipsData.data.map((tip) => {
                    const payload = tip.verificationPayload as any;
                    const customerName = payload?.name || '-';
                    const customerPhone = payload?.phone || '-';
                    
                    return (
                      <tr key={tip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {tip.reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex flex-col">
                            <span>{customerName}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">{customerPhone}</span>
                          </div>
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Results count */}
            {tipsData?.data?.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {tipsData.data.length} of {tipsData.total} tips
                </p>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}