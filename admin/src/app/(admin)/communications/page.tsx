"use client";
import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import MessageComposer from "@/components/communications/MessageComposer";
import { Tabs } from "@/components/common/Tabs";

export default function CommunicationsPage() {
  const pathname = usePathname();
  const router = useRouter();

  const navTabs = useMemo(
    () => [
      { id: "compose", label: "Compose Message", path: "/communications" },
      { id: "campaigns", label: "Campaigns", path: "/communications/campaigns" },
      { id: "analytics", label: "Analytics", path: "/communications/analytics" },
      { id: "logs", label: "Email Logs", path: "/communications/logs" },
    ],
    []
  );

  const activeTab =
    navTabs.find((tab) => tab.path === pathname)?.id ?? "compose";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Communications
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Send emails and SMS messages to merchants and users
        </p>
        
        {/* Navigation Tabs */}
        <div className="mt-4">
          <Tabs
            tabs={navTabs.map(({ id, label }) => ({ id, label }))}
            activeTab={activeTab}
            onTabChange={(tabId) => {
              const target = navTabs.find((tab) => tab.id === tabId);
              if (target) router.push(target.path);
            }}
          />
        </div>
      </div>

      <MessageComposer />
    </div>
  );
}