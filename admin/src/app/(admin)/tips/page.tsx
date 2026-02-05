"use client";
import { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import { DollarLineIcon, GroupIcon, TableIcon, CheckCircleIcon } from "@/icons";
import { 
  useGetAdminTipsSummaryQuery, 
  useListAllTipsQuery, 
  useGetTipsAnalyticsQuery,
  useGetTipsByMerchantQuery 
} from "@/lib/services/tipsApi";
import TipsOverview from "@/components/tips/TipsOverview";
import TipsByVendor from "@/components/tips/TipsByVendor";
import TipsByTransaction from "@/components/tips/TipsByTransaction";
import PayoutTracking from "@/components/tips/PayoutTracking";

interface DateRange {
  from?: string;
  to?: string;
}

export default function TipsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange>({});

  // Fetch tips data
  const { data: tipsSummary, isLoading: isSummaryLoading } = useGetAdminTipsSummaryQuery(dateRange);
  const { data: tipsAnalytics, isLoading: isAnalyticsLoading } = useGetTipsAnalyticsQuery(dateRange);
  const { data: tipsByMerchant, isLoading: isByMerchantLoading } = useGetTipsByMerchantQuery(dateRange);
  const { data: allTips, isLoading: isAllTipsLoading } = useListAllTipsQuery({
    ...dateRange,
    page: 1,
    pageSize: 50,
  });

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const clearDateRange = () => {
    setDateRange({});
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <DollarLineIcon />,
    },
    {
      id: "by-vendor",
      label: "Tips by Vendor",
      icon: <GroupIcon />,
    },
    {
      id: "by-transaction",
      label: "Tips by Transaction",
      icon: <TableIcon />,
    },
    {
      id: "payouts",
      label: "Payout Tracking",
      icon: <CheckCircleIcon />,
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Tips Management" />
      
      {/* Date Range Filter */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
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
          {(dateRange.from || dateRange.to) && (
            <button
              onClick={clearDateRange}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Panels */}
        <TabPanel activeTab={activeTab} tabId="overview">
          <div className="mt-6">
            <TipsOverview 
              summary={tipsSummary}
              analytics={tipsAnalytics}
              isLoading={isSummaryLoading || isAnalyticsLoading}
            />
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="by-vendor">
          <ComponentCard
            title="Tips by Vendor"
            desc="Track tips collected by each service provider (waiter, shop assistant, etc.) for later payout"
          >
            <TipsByVendor 
              data={tipsByMerchant}
              isLoading={isByMerchantLoading}
            />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="by-transaction">
          <ComponentCard
            title="Tips by Transaction"
            desc="View tip details for each transaction and which service provider received the tip"
          >
            <TipsByTransaction 
              data={allTips}
              isLoading={isAllTipsLoading}
            />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="payouts">
          <ComponentCard
            title="Payout Tracking"
            desc="Track and manage tip payouts to service providers (waiters, shop assistants, etc.)"
          >
            <PayoutTracking 
              data={allTips}
              isLoading={isAllTipsLoading}
            />
          </ComponentCard>
        </TabPanel>
      </div>
    </div>
  );
}

