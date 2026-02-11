"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircleIcon,
  AlertIcon,
  LockIcon,
  ArrowLeftIcon,
  TrashBinIcon,
  PaperPlaneIcon,
  CloseIcon,
} from "@/icons";
import {
  useGetMerchantWebhookDetailsQuery,
  useGetMerchantRequestLogsQuery,
  useDisableIPAddressMutation,
  useEnableIPAddressMutation,
} from "@/lib/services/adminWebhooksServiceApi";
import { toast } from "sonner";

export default function WebhookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.id as string;
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    ipId: string;
    ipAddress: string;
    action: 'disable' | 'enable';
  }>({
    isOpen: false,
    ipId: "",
    ipAddress: "",
    action: 'disable',
  });

  // API queries
  const { data: merchant, isLoading: merchantLoading, error: merchantError } = useGetMerchantWebhookDetailsQuery(merchantId);
  const { data: requestLogs = [], isLoading: logsLoading } = useGetMerchantRequestLogsQuery({
    merchantId,
    limit: 50,
  });
  
  // Mutations
  const [disableIPAddress, { isLoading: isDisabling }] = useDisableIPAddressMutation();
  const [enableIPAddress, { isLoading: isEnabling }] = useEnableIPAddressMutation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSuccessRate = () => {
    if (!merchant) return "0%";
    const { successfulRequests, totalRequests } = merchant.stats;
    if (totalRequests === 0) return "0%";
    return `${((successfulRequests / totalRequests) * 100).toFixed(1)}%`;
  };

  const handleDisableIP = (ipId: string, ipAddress: string) => {
    setConfirmModal({
      isOpen: true,
      ipId,
      ipAddress,
      action: 'disable',
    });
  };

  const handleEnableIP = (ipId: string, ipAddress: string) => {
    setConfirmModal({
      isOpen: true,
      ipId,
      ipAddress,
      action: 'enable',
    });
  };

  const confirmAction = async () => {
    try {
      if (confirmModal.action === 'disable') {
        await disableIPAddress({
          merchantId,
          ipId: confirmModal.ipId,
        }).unwrap();
        toast.success("IP address disabled successfully");
      } else {
        await enableIPAddress({
          merchantId,
          ipId: confirmModal.ipId,
        }).unwrap();
        toast.success("IP address enabled successfully");
      }
      
      setConfirmModal({ isOpen: false, ipId: "", ipAddress: "", action: 'disable' });
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${confirmModal.action} IP address`);
    }
  };

  // Loading state
  if (merchantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading merchant details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (merchantError || !merchant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertIcon className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Merchant Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The requested merchant details could not be found.
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            startIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {merchant.merchantName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {merchant.merchantEmail}
            </p>
          </div>
        </div>
        <Badge
          size="md"
          color={merchant.status === "Active" ? "success" : "secondary"}
        >
          {merchant.status}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PaperPlaneIcon className=" text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {merchant.stats.totalRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className=" text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Successful Requests</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {merchant.stats.successfulRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertIcon className=" text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed Requests</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {merchant.stats.failedRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <LockIcon className=" text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">IP Addresses</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {merchant.stats.totalIpAddresses}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook URL Info */}
      {merchant.webhookUrl && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Webhook Configuration
          </h2>
          <div className="flex items-center gap-3">
            <PaperPlaneIcon className=" text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Webhook URL</p>
              <p className="text-sm font-mono text-gray-800 dark:text-white break-all">
                {merchant.webhookUrl}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Success Rate:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {getSuccessRate()}
            </span>
          </div>
        </div>
      )}

      {/* IP Addresses Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          IP Address Whitelist ({merchant.ipAddresses.length})
        </h2>
        
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  IP Address
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Last Used
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {merchant.ipAddresses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No IP addresses configured
                  </TableCell>
                </TableRow>
              ) : (
                merchant.ipAddresses.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="px-4 py-3 text-start">
                      <span className="font-mono text-sm text-gray-800 dark:text-white">
                        {ip.ipAddress}
                      </span>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {ip.description || "No description"}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={ip.status === "ACTIVE" ? "success" : "secondary"}
                      >
                        {ip.status === "ACTIVE" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-start">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(ip.lastUsed)}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {ip.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisableIP(ip.id, ip.ipAddress)}
                            disabled={isDisabling || isEnabling}
                            startIcon={<TrashBinIcon className="w-4 h-4" />}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                          >
                            Disable
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEnableIP(ip.id, ip.ipAddress)}
                            disabled={isDisabling || isEnabling}
                            startIcon={<CheckCircleIcon className="w-4 h-4" />}
                            className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                          >
                            Enable
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Request Logs Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Recent Request Logs
        </h2>
        
        {logsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading logs...</span>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                    >
                      Timestamp
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                    >
                      IP Address
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                    >
                      Method & Endpoint
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                    >
                      Response Time
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                    >
                      User Agent
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {requestLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No request logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requestLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="px-4 py-3 text-start">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(log.timestamp)}
                          </span>
                        </TableCell>
                        
                        <TableCell className="px-4 py-3 text-start">
                          <span className="font-mono text-sm text-gray-800 dark:text-white">
                            {log.ipAddress}
                          </span>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-start">
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded mr-2">
                              {log.method}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {log.endpoint}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-start">
                          <div className="flex items-center gap-2">
                            {log.status === "Success" ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertIcon className="w-4 h-4 text-red-500" />
                            )}
                            <Badge
                              size="sm"
                              color={log.status === "Success" ? "success" : "error"}
                            >
                              {log.status}
                            </Badge>
                          </div>
                          {log.errorMessage && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                              {log.errorMessage}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-start">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {log.responseTime > 0 ? `${log.responseTime}ms` : "-"}
                          </span>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-start">
                          <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={log.userAgent}>
                            {log.userAgent}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {confirmModal.action === 'disable' ? 'Disable' : 'Enable'} IP Address
              </h3>
              <button
                onClick={() => setConfirmModal({ isOpen: false, ipId: "", ipAddress: "", action: 'disable' })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <CloseIcon className="" />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to {confirmModal.action} the IP address{" "}
              <span className="font-mono font-semibold">{confirmModal.ipAddress}</span>?
              {confirmModal.action === 'disable' 
                ? " This will prevent any requests from this IP address."
                : " This will allow requests from this IP address again."
              }
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmModal({ isOpen: false, ipId: "", ipAddress: "", action: 'disable' })}
                disabled={isDisabling || isEnabling}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={isDisabling || isEnabling}
                className={`${
                  confirmModal.action === 'disable' 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-green-500 hover:bg-green-600"
                } text-white border-0`}
              >
                {isDisabling || isEnabling 
                  ? `${confirmModal.action === 'disable' ? 'Disabling' : 'Enabling'}...` 
                  : `${confirmModal.action === 'disable' ? 'Disable' : 'Enable'} IP`
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}