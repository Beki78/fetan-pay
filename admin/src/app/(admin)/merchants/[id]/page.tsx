"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftIcon, UserCircleIcon, CalenderIcon, DollarLineIcon } from "@/icons";

// Mock merchant data
const mockMerchant = {
  id: "USR001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  currentPlan: "Starter",
  status: "active",
  joinDate: "2024-01-15",
  totalTransactions: 245,
  lastActivity: "2024-01-29",
  totalRevenue: 5220, // ETB
  planHistory: [
    {
      id: "1",
      planName: "Starter",
      startDate: "2024-01-15",
      endDate: null,
      amount: 1740,
      status: "Active",
      duration: "15 days",
      paymentReference: "FT24001234567"
    },
    {
      id: "2",
      planName: "Free",
      startDate: "2023-12-01",
      endDate: "2024-01-15",
      amount: 0,
      status: "Completed",
      duration: "45 days",
      paymentReference: "—"
    }
  ],
  subscriptionStats: {
    totalUpgrades: 1,
    totalDowngrades: 0,
    totalRevenue: 1740,
    averageMonthlySpend: 1740,
    planDuration: 15 // days on current plan
  }
};

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [merchantStatus, setMerchantStatus] = useState(mockMerchant.status);

  const merchantId = params.id as string;

  const handleGoBack = () => {
    router.push("/plan-stats");
  };

  const handleToggleStatus = () => {
    const newStatus = merchantStatus === "active" ? "disabled" : "active";
    setMerchantStatus(newStatus);
    console.log(`Merchant ${merchantId} status changed to:`, newStatus);
  };

  const handleChangePlan = () => {
    router.push(`/merchants/${merchantId}/change-plan`);
  };

  const handlePlanAssignment = (assignment: any) => {
    console.log("Plan assigned:", assignment);
    // This function is no longer needed since we navigate to a page
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "disabled":
        return "error";
      case "pending":
        return "warning";
      default:
        return "light";
    }
  };

  const getPlanStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Completed":
        return "info";
      case "Cancelled":
        return "error";
      default:
        return "light";
    }
  };

  return (
    <div>
      <PageBreadcrumb 
        pageTitle={`${mockMerchant.firstName} ${mockMerchant.lastName}`}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Plan Stats
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Merchant Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage merchant subscription details
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              className={merchantStatus === "active" ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}
            >
              {merchantStatus === "active" ? "Disable Plan" : "Enable Plan"}
            </Button>
            <Button
              variant="outline"
              onClick={handleChangePlan}
            >
              Change Plan
            </Button>
          </div>
        </div>

        {/* Merchant Overview */}
        <ComponentCard
          title="Merchant Overview"
          desc="Basic information and current status"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {mockMerchant.firstName} {mockMerchant.lastName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {mockMerchant.email}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  ID: {mockMerchant.id}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockMerchant.totalTransactions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ETB {mockMerchant.subscriptionStats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockMerchant.subscriptionStats.planDuration} days
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">On Current Plan</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                <Badge color="info" size="sm">
                  {mockMerchant.currentPlan}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <Badge color={getStatusColor(merchantStatus)} size="sm">
                  {merchantStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Join Date</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(mockMerchant.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Subscription Statistics */}
        <ComponentCard
          title="Subscription Statistics"
          desc="Overview of subscription activity and revenue"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockMerchant.subscriptionStats.totalUpgrades}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Plan Upgrades</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockMerchant.subscriptionStats.totalDowngrades}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Plan Downgrades</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ETB {mockMerchant.subscriptionStats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ETB {mockMerchant.subscriptionStats.averageMonthlySpend.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg Monthly Spend</div>
            </div>
          </div>
        </ComponentCard>

        {/* Plan History */}
        <ComponentCard
          title="Plan History"
          desc="Complete history of plan changes and payments"
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                  <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Plan
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Duration
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Payment Reference
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockMerchant.planHistory.map((plan) => (
                    <TableRow
                      key={plan.id}
                      className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                    >
                      <TableCell className="px-5 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {plan.planName}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(plan.startDate).toLocaleDateString()}
                          {plan.endDate && (
                            <>
                              {" - "}
                              {new Date(plan.endDate).toLocaleDateString()}
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {plan.duration}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          ETB {plan.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {plan.paymentReference}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge color={getPlanStatusColor(plan.status)} size="sm">
                          {plan.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}