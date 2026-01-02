"use client";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import ActiveSessions from "@/components/profile/ActiveSessions";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import React, { useState } from "react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");

  const tabs = [
    {
      id: "personal",
      label: "Personal Info",
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "security",
      label: "Security",
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      id: "sessions",
      label: "Active Sessions",
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
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Profile & Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your profile, business information, and account settings
        </p>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Panels */}
        <TabPanel activeTab={activeTab} tabId="personal">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
            <UserInfoCard />
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="security">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
            <ChangePasswordForm />
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="sessions">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
            <ActiveSessions />
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
