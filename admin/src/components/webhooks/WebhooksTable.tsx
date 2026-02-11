"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { CheckCircleIcon, AlertIcon, PaperPlaneIcon, LockIcon, EyeIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { useGetMerchantsWithWebhookStatsQuery } from "@/lib/services/adminWebhooksServiceApi";

interface WebhooksTableProps {
  searchQuery: string;
  statusFilter: "All" | "Active" | "Inactive";
}

export default function WebhooksTable({ searchQuery, statusFilter }: WebhooksTableProps) {
  const router = useRouter();
  
  const { data: merchants = [], isLoading, error } = useGetMerchantsWithWebhookStatsQuery({
    search: searchQuery || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSuccessRate = (successful: number, failed: number) => {
    const total = successful + failed;
    if (total === 0) return "N/A";
    return `${((successful / total) * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading merchants...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertIcon className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">Failed to load merchants</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Merchant
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Webhook URL
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  IP Addresses
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Deliveries
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Success Rate
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Last Delivery
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {merchants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No merchants found
                  </TableCell>
                </TableRow>
              ) : (
                merchants.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white text-sm">
                          {merchant.merchantName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {merchant.merchantEmail}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      {merchant.webhookUrl ? (
                        <div className="flex items-center gap-2">
                          <PaperPlaneIcon className=" text-purple-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm text-gray-800 dark:text-white truncate max-w-[200px]" title={merchant.webhookUrl}>
                              {merchant.webhookUrl}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {merchant.webhooksCount} webhook{merchant.webhooksCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          No webhook configured
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={merchant.status === "Active" ? "success" : "secondary"}
                      >
                        {merchant.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-start">
                      {merchant.ipAddresses.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <LockIcon className=" text-blue-500 shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                              {merchant.ipAddresses.length} IP{merchant.ipAddresses.length !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {merchant.ipAddresses.slice(0, 2).join(", ")}
                              {merchant.ipAddresses.length > 2 && ` +${merchant.ipAddresses.length - 2} more`}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          No IP restrictions
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <CheckCircleIcon className=" text-green-500" />
                          <span className="text-sm text-gray-800 dark:text-white">
                            {merchant.successfulDeliveries.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertIcon className=" text-red-500" />
                          <span className="text-sm text-gray-800 dark:text-white">
                            {merchant.failedDeliveries.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {getSuccessRate(merchant.successfulDeliveries, merchant.failedDeliveries)}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(merchant.lastDelivery)}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/webhooks-management/${merchant.id}`)}
                        startIcon={<EyeIcon className="" />}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}