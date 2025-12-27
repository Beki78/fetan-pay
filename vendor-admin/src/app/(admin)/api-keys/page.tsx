"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ApiKeyManagement from "@/components/api/ApiKeyManagement";
import UsageLogs from "@/components/api/UsageLogs";
import ApiDocumentation from "@/components/api/ApiDocumentation";
import UsageAnalytics from "@/components/api/UsageAnalytics";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import { BoltIcon, ListIcon, DocsIcon, PieChartIcon } from "@/icons";

export default function ApiKeysPage() {
  const [activeTab, setActiveTab] = useState("keys");

  const tabs = [
    {
      id: "keys",
      label: "API Keys",
      icon: <BoltIcon />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <PieChartIcon />,
    },
    {
      id: "logs",
      label: "Usage Logs",
      icon: <ListIcon />,
    },
    {
      id: "docs",
      label: "Documentation",
      icon: <DocsIcon />,
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="API Management" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Panels */}
        <TabPanel activeTab={activeTab} tabId="keys">
          <ComponentCard
            title="API Key Management"
            desc="Generate, manage, and monitor your API keys. You can have up to 2 active keys at a time."
          >
            <ApiKeyManagement />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="analytics">
          <ComponentCard
            title="Usage Analytics"
            desc="Monitor API usage, performance metrics, and rate limit status"
          >
            <UsageAnalytics />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="logs">
          <ComponentCard
            title="Usage Logs"
            desc="View detailed logs of all API calls, including request/response details"
          >
            <UsageLogs />
          </ComponentCard>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="docs">
          <ApiDocumentation />
        </TabPanel>
      </div>
    </div>
  );
}

