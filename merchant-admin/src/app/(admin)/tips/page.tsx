"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import TipsOverview from "@/components/tips/TipsOverview";
import TipsByVendor from "@/components/tips/TipsByVendor";
import TipsByTransaction from "@/components/tips/TipsByTransaction";
import PayoutTracking from "@/components/tips/PayoutTracking";
import MerchantApprovalStatus from "@/components/common/MerchantApprovalStatus";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import { DollarLineIcon, GroupIcon, TableIcon, CheckCircleIcon } from "@/icons";
import { useAccountStatus } from "@/hooks/useAccountStatus";

export default function TipsPage() {
  const { status: accountStatus, isLoading: isStatusLoading } = useAccountStatus();
  const [activeTab, setActiveTab] = useState("overview");

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
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Panels */}
        <TabPanel activeTab={activeTab} tabId="overview">
          <div className="mt-6">
            <TipsOverview />
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="by-vendor">
          <ComponentCard
            title="Tips by Vendor"
            desc="Track tips collected by each service provider (waiter, shop assistant, etc.) for later payout"
          >
            <TipsByVendor />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="by-transaction">
          <ComponentCard
            title="Tips by Transaction"
            desc="View tip details for each transaction and which service provider received the tip"
          >
            <TipsByTransaction />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="payouts">
          <ComponentCard
            title="Payout Tracking"
            desc="Track and manage tip payouts to service providers (waiters, shop assistants, etc.)"
          >
            <PayoutTracking />
          </ComponentCard>
        </TabPanel>
      </div>
    </div>
  );
}

