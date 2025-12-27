"use client";
import React, { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-md text-sm whitespace-nowrap transition-all ${
              isActive
                ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.icon && <span className="flex items-center">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

interface TabPanelProps {
  children: ReactNode;
  activeTab: string;
  tabId: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  activeTab,
  tabId,
}) => {
  if (activeTab !== tabId) return null;
  return <div className="mt-6">{children}</div>;
};

