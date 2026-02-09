"use client";
import React, { useState } from "react";
import UsersStats from "@/components/users/UsersStats";
import UsersTable from "@/components/users/UsersTable";
import UnverifiedMerchantsTable from "@/components/users/UnverifiedMerchantsTable";
import { Tabs, TabPanel } from "@/components/common/Tabs";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("pending");

  const tabs = [
    {
      id: "pending",
      label: "Pending Approval",
      icon: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "unverified",
      label: "Awaiting Verification",
      icon: (
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">Merchants</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review merchant signups and approvals</p>
      </div>

      {/* Stats Cards */}
      <UsersStats />

      {/* Tabs Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Panels */}
        <TabPanel activeTab={activeTab} tabId="pending">
          <UsersTable />
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="unverified">
          <UnverifiedMerchantsTable />
        </TabPanel>
      </div>
    </div>
  );
}
