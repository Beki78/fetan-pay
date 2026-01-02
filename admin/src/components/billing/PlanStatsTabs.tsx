"use client";
import React, { useState } from "react";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import Button from "../ui/button/Button";

// Mock data - same plans as in PlanComparison
const plans = [
  {
    id: "early-access",
    name: "Early Access (Limited)",
    price: 20,
    billingCycle: "7 days",
    description: "Our early access limited offer plan.",
    userCount: 45,
  },
  {
    id: "intermediate",
    name: "Intermediate",
    price: 1200,
    billingCycle: "30 days",
    description: "Ideal for growing businesses with moderate verification needs.",
    userCount: 234,
  },
  {
    id: "premium",
    name: "Premium",
    price: 6000,
    billingCycle: "30 days",
    description: "For high-volume businesses requiring maximum verifications and features.",
    userCount: 156,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 20000,
    billingCycle: "30 days",
    description: "For companies which has many customers",
    userCount: 89,
  },
];

// Mock users for each plan
const planUsers = {
  "early-access": [
    {
      id: "USR045",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@example.com",
      currentPlan: "Early Access (Limited)",
      status: "active",
      joinDate: "2024-01-10",
      totalTransactions: 15
    },
    {
      id: "USR046",
      firstName: "Bob",
      lastName: "Smith",
      email: "bob.smith@example.com",
      currentPlan: "Early Access (Limited)",
      status: "active",
      joinDate: "2024-01-12",
      totalTransactions: 8
    },
  ],
  "intermediate": [
    {
      id: "USR001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      currentPlan: "Intermediate",
      status: "active",
      joinDate: "2024-01-15",
      totalTransactions: 245
    },
    {
      id: "USR002",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      currentPlan: "Intermediate",
      status: "active",
      joinDate: "2024-02-20",
      totalTransactions: 89
    },
  ],
  "premium": [
    {
      id: "USR003",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@example.com",
      currentPlan: "Premium",
      status: "active",
      joinDate: "2023-12-10",
      totalTransactions: 567
    },
  ],
  "enterprise": [
    {
      id: "USR004",
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah.williams@example.com",
      currentPlan: "Enterprise",
      status: "active",
      joinDate: "2023-11-05",
      totalTransactions: 1234
    },
  ],
};

interface PlanTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  userCount: number;
}

export default function PlanStatsTabs() {
  const [activeTab, setActiveTab] = useState("early-access");

  const tabs: PlanTab[] = plans.map(plan => ({
    id: plan.id,
    label: `${plan.name} (${plan.userCount})`,
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
    userCount: plan.userCount,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 dark:text-green-400";
      case "inactive":
        return "text-red-600 dark:text-red-400";
      case "pending":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const renderUserTable = (planId: string) => {
    const users = planUsers[planId as keyof typeof planUsers] || [];

    return (
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="bg-gray-50 dark:bg-gray-800/80">
                <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  ID
                </th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  First Name
                </th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Last Name
                </th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Email
                </th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Join Date
                </th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Transactions
                </th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No users found for this plan
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {user.id}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {user.firstName}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {user.lastName}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">
                      {user.totalTransactions}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`/users/${user.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Plan Statistics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monitor user distribution and activity across different plans
        </p>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Panels */}
        {plans.map((plan) => (
          <TabPanel key={plan.id} activeTab={activeTab} tabId={plan.id}>
            <div className="space-y-6">
              {/* Plan Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                  </div>
                  <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    {plan.userCount}
                  </h4>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    On {plan.name} plan
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</span>
                  </div>
                  <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    ETB {(plan.price * plan.userCount).toLocaleString()}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Estimated monthly
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Transactions</span>
                  </div>
                  <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    {Math.round((planUsers[plan.id as keyof typeof planUsers].reduce((sum, user) => sum + user.totalTransactions, 0) / Math.max(planUsers[plan.id as keyof typeof planUsers].length, 1)))}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Per user on this plan
                  </p>
                </div>
              </div>

              {/* Users Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Users on {plan.name}
                  </h3>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0">
                    Export Users
                  </Button>
                </div>
                {renderUserTable(plan.id)}
              </div>
            </div>
          </TabPanel>
        ))}
      </div>
    </div>
  );
}
