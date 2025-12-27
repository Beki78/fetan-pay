"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CurrentPlan from "@/components/billing/CurrentPlan";
import UsageLimits from "@/components/billing/UsageLimits";
import PlanComparison from "@/components/billing/PlanComparison";
import PaymentHistory from "@/components/billing/PaymentHistory";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import { ShootingStarIcon, BoxIconLine, BoxCubeIcon, FileIcon } from "@/icons";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("subscription");

  const tabs = [
    {
      id: "subscription",
      label: "Current Plan",
      icon: <ShootingStarIcon />,
    },
    {
      id: "usage",
      label: "Usage & Limits",
      icon: <BoxIconLine />,
    },
    {
      id: "plans",
      label: "Available Plans",
      icon: <BoxCubeIcon />,
    },
    {
      id: "history",
      label: "Payment History",
      icon: <FileIcon />,
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Billing & Plans" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Panels */}
        <TabPanel activeTab={activeTab} tabId="subscription">
          <ComponentCard
            title="Subscription"
            desc="Manage your current subscription plan and billing information"
          >
            <CurrentPlan />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="usage">
          <ComponentCard
            title="Usage & Limits"
            desc="Monitor your current usage against your plan limits"
          >
            <UsageLimits />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="plans">
          <ComponentCard
            title="Available Plans"
            desc="Compare plans and upgrade or downgrade your subscription"
          >
            <PlanComparison />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="history">
          <ComponentCard
            title="Payment History"
            desc="View and download your subscription invoices"
          >
            <PaymentHistory />
          </ComponentCard>
        </TabPanel>
      </div>
    </div>
  );
}

