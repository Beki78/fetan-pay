"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useGetBillingTransactionsQuery } from "@/lib/redux/features/pricingApi";

interface MerchantDetailTabsProps {
  merchant: any;
  onBanTeamMember: (memberId: string) => void;
  onUnbanTeamMember: (memberId: string) => void;
  deactivating: boolean;
  activating: boolean;
}

const statusBadge = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "PENDING":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "BANNED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export default function MerchantDetailTabs({
  merchant,
  onBanTeamMember,
  onUnbanTeamMember,
  deactivating,
  activating,
}: MerchantDetailTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("team");

  // Fetch subscription history
  const { data: transactionsResponse, isLoading: transactionsLoading } = useGetBillingTransactionsQuery({
    merchantId: merchant.id,
    page: 1,
    limit: 50
  });

  const transactions = transactionsResponse?.data || [];

  const tabs = [
    {
      id: "team",
      label: `Team Members (${merchant.users.filter((u: any) => u.role !== "MERCHANT_OWNER").length})`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: "subscription",
      label: `Subscription History (${transactions.length})`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const handleViewTeamMember = (memberId: string) => {
    router.push(`/users/${merchant.id}/team/${memberId}`);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/60">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
      </div>

      {/* Team Members Tab */}
      <TabPanel activeTab={activeTab} tabId="team">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Phone
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Role
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {merchant.users
                .filter((u: any) => u.role !== "MERCHANT_OWNER")
                .map((user: any) => {
                  const isUserBanned = user.banned === true;
                  return (
                    <TableRow key={user.id} className="bg-white dark:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.name ?? "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.email ?? "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.phone ?? "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.role}</TableCell>
                      <TableCell className="px-5 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBadge(isUserBanned ? "BANNED" : user.status)}`}>
                          {isUserBanned ? "BANNED" : user.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewTeamMember(user.id)}
                            className="text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            Details
                          </Button>
                          {!isUserBanned ? (
                            <Button
                              size="sm"
                              onClick={() => onBanTeamMember(user.id)}
                              disabled={deactivating || activating}
                              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              Ban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => onUnbanTeamMember(user.id)}
                              disabled={deactivating || activating}
                              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              {activating ? "Activating..." : "Unban"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </TabPanel>

      {/* Subscription History Tab */}
      <TabPanel activeTab={activeTab} tabId="subscription">
        <div className="overflow-x-auto">
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Loading subscription history...</div>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">No subscription history found</div>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                  <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                    Transaction ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                    Plan
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                    Amount
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                    Period
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                    Payment Method
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                    Date
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction: any) => {
                  // Determine subscription status based on billing period and transaction status
                  const now = new Date();
                  const periodEnd = new Date(transaction.billingPeriodEnd);
                  const isExpired = periodEnd < now;
                  const isVerified = transaction.status === "VERIFIED";
                  
                  let subscriptionStatus = "PENDING";
                  let statusColor: "success" | "warning" | "secondary" | "danger" = "warning";
                  
                  if (isVerified) {
                    if (isExpired) {
                      subscriptionStatus = "EXPIRED";
                      statusColor = "secondary";
                    } else {
                      subscriptionStatus = "ACTIVE";
                      statusColor = "success";
                    }
                  } else if (transaction.status === "FAILED") {
                    subscriptionStatus = "FAILED";
                    statusColor = "danger";
                  }
                  
                  return (
                    <TableRow key={transaction.id} className="bg-white dark:bg-gray-800/50">
                      <TableCell className="px-5 py-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          {transaction.transactionId}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.plan.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.currency} {transaction.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge 
                          color={statusColor} 
                          size="sm"
                        >
                          {subscriptionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(transaction.billingPeriodStart).toLocaleDateString()} - {new Date(transaction.billingPeriodEnd).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.paymentMethod || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </TabPanel>
    </div>
  );
}
