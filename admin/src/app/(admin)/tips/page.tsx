"use client";
import { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import { DollarLineIcon, TableIcon } from "@/icons";
import { 
  useGetAdminTipsSummaryQuery, 
  useListAllTipsQuery, 
  useGetTipsAnalyticsQuery,
  useGetTipsByMerchantQuery 
} from "@/lib/services/tipsApi";
import TipsOverview from "@/components/tips/TipsOverview";
import TipsByVendor from "@/components/tips/TipsByVendor";
import TipsByTransaction from "@/components/tips/TipsByTransaction";
import "@/styles/datepicker.css";

interface DateRange {
  from?: string;
  to?: string;
}

export default function TipsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange>({});

  // Convert string dates to Date objects for the date picker
  const fromDate = dateRange.from ? new Date(dateRange.from) : null;
  const toDate = dateRange.to ? new Date(dateRange.to) : null;

  // Fetch tips data
  const { data: tipsSummary, isLoading: isSummaryLoading } = useGetAdminTipsSummaryQuery(dateRange);
  const { data: tipsAnalytics, isLoading: isAnalyticsLoading } = useGetTipsAnalyticsQuery(dateRange);
  const { data: tipsByMerchant, isLoading: isByMerchantLoading } = useGetTipsByMerchantQuery(dateRange);
  const { data: allTips, isLoading: isAllTipsLoading } = useListAllTipsQuery({
    ...dateRange,
    page: 1,
    pageSize: 50,
  });

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

  const clearDateRange = () => {
    setDateRange({});
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview & Analytics",
      icon: <DollarLineIcon />,
    },
    {
      id: "transactions",
      label: "Transactions & Payouts",
      icon: <TableIcon />,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Tips Management
      </h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Panels */}
        <TabPanel activeTab={activeTab} tabId="overview">
          <div className="mt-6 space-y-6">
            <TipsOverview 
              summary={tipsSummary}
              analytics={tipsAnalytics}
              isLoading={isSummaryLoading || isAnalyticsLoading}
            />
            
            {/* Tips by Vendor Section */}
            <ComponentCard
              title="Tips by Merchant"
              desc="Track tips collected by each merchant for analysis and reporting"
            >
              <TipsByVendor 
                data={tipsByMerchant}
                isLoading={isByMerchantLoading}
                dateRange={dateRange}
                onFromDateChange={handleFromDateChange}
                onToDateChange={handleToDateChange}
                onClearDates={clearDateRange}
              />
            </ComponentCard>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="transactions">
          <ComponentCard
            title="All Tip Transactions"
            desc="Complete list of tip transactions with payment details and payout status"
          >
            <TipsByTransaction 
              data={allTips}
              isLoading={isAllTipsLoading}
              dateRange={dateRange}
              onFromDateChange={handleFromDateChange}
              onToDateChange={handleToDateChange}
              onClearDates={clearDateRange}
            />
          </ComponentCard>
        </TabPanel>
      </div>
    </div>
  );
}

