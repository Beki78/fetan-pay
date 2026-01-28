"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { PlusIcon, TrashBinIcon, LockIcon, CheckCircleIcon, AlertIcon } from "@/icons";
import { toast } from "sonner";
import {
  useGetIPWhitelistingStatusQuery,
  useGetCurrentIPQuery,
  useCreateIPAddressMutation,
  useDeleteIPAddressMutation,
  useEnableIPWhitelistingMutation,
  useDisableIPWhitelistingMutation,
  type IPAddress,
} from "@/lib/services/ipAddressesServiceApi";

export default function IPWhitelistManager() {
  const { data: ipStatus, isLoading, refetch } = useGetIPWhitelistingStatusQuery();
  const { data: currentIP } = useGetCurrentIPQuery();
  const [createIPAddress, { isLoading: isCreating }] = useCreateIPAddressMutation();
  const [deleteIPAddress, { isLoading: isDeleting }] = useDeleteIPAddressMutation();
  const [enableWhitelisting, { isLoading: isEnabling }] = useEnableIPWhitelistingMutation();
  const [disableWhitelisting, { isLoading: isDisabling }] = useDisableIPWhitelistingMutation();

  const [newIP, setNewIP] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const validateIP = (ip: string): boolean => {
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // IPv4 CIDR validation
    const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
    // IPv6 validation (basic)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    // IPv6 CIDR validation (basic)
    const ipv6CidrRegex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\/(?:[0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/;

    return ipv4Regex.test(ip) || ipv4CidrRegex.test(ip) || ipv6Regex.test(ip) || ipv6CidrRegex.test(ip);
  };

  const handleToggleWhitelisting = async () => {
    try {
      if (ipStatus?.enabled) {
        await disableWhitelisting().unwrap();
        toast.success("IP whitelisting disabled successfully");
      } else {
        await enableWhitelisting().unwrap();
        toast.success("IP whitelisting enabled successfully");
      }
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update IP whitelisting status");
    }
  };

  const addIP = async () => {
    if (!newIP.trim()) {
      toast.error("Please enter an IP address");
      return;
    }

    if (!validateIP(newIP.trim())) {
      toast.error("Please enter a valid IP address or CIDR range (e.g., 192.168.1.100 or 192.168.1.0/24)");
      return;
    }

    // Check for duplicates (only among active IPs)
    if (ipStatus?.ipAddresses.some(ip => ip.ipAddress === newIP.trim() && ip.status === 'ACTIVE')) {
      toast.error("This IP address is already added");
      return;
    }

    try {
      await createIPAddress({
        ipAddress: newIP.trim(),
        description: newDescription.trim() || undefined,
      }).unwrap();
      
      setNewIP("");
      setNewDescription("");
      toast.success("IP address added successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add IP address");
    }
  };

  const removeIP = async (id: string, status: string) => {
    if (status === 'INACTIVE') {
      toast.error("Cannot delete disabled IP addresses. Contact admin to enable it first.");
      return;
    }

    try {
      await deleteIPAddress(id).unwrap();
      toast.success("IP address removed successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove IP address");
    }
  };

  const addCurrentIP = async () => {
    if (!currentIP?.ip) {
      toast.error("Unable to detect your current IP address");
      return;
    }

    if (ipStatus?.ipAddresses.some(ip => ip.ipAddress === currentIP.ip && ip.status === 'ACTIVE')) {
      toast.info("Your current IP is already in the list");
      return;
    }

    try {
      await createIPAddress({
        ipAddress: currentIP.ip,
        description: "My current IP",
      }).unwrap();
      
      toast.success("Your current IP address added successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add current IP address");
    }
  };

  const getIPType = (ip: string): string => {
    if (ip.includes('/')) {
      return 'CIDR Range';
    } else if (ip.includes(':')) {
      return 'IPv6';
    } else {
      return 'IPv4';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600 dark:text-gray-300">Loading IP whitelisting settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <LockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            IP Address Whitelisting
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Restrict API access to specific IP addresses for enhanced security
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ipStatus?.enabled || false}
              onChange={handleToggleWhitelisting}
              disabled={isEnabling || isDisabling}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Enable IP Address Whitelisting
            </span>
          </label>
          <Button
            size="sm"
            onClick={handleToggleWhitelisting}
            disabled={isEnabling || isDisabling}
            className={`${
              ipStatus?.enabled 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-green-500 hover:bg-green-600"
            } text-white border-0`}
          >
            {isEnabling || isDisabling ? "Updating..." : ipStatus?.enabled ? "Disable" : "Enable"}
          </Button>
        </div>
        {!ipStatus?.enabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
            When disabled, API requests can be made from any IP 
          </p>
        )}
      </div>

      {ipStatus?.enabled && (
        <>
          {/* Add IP Address Form */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Add IP Address
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IP Address or CIDR Range
                </label>
                <Input
                  type="text"
                  placeholder="192.168.1.100 or 192.168.1.0/24"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Office network, Production server"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={addIP}
                  disabled={isCreating}
                  startIcon={<PlusIcon className="w-4 h-4" />}
                  className="bg-purple-500 hover:bg-purple-600 text-white border-0"
                >
                  {isCreating ? "Adding..." : "Add IP"}
                </Button>
                {currentIP?.ip && (
                  <Button
                    size="sm"
                    onClick={addCurrentIP}
                    disabled={isCreating}
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                  >
                    Add My IP ({currentIP.ip})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* IP Address List */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Allowed IP Addresses ({ipStatus?.ipAddresses.length || 0})
            </h3>
            
            {!ipStatus?.ipAddresses || ipStatus.ipAddresses.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <LockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No IP addresses added yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Add IP addresses to restrict API access
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {ipStatus.ipAddresses.map((ipAddr) => (
                  <div
                    key={ipAddr.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {ipAddr.status === 'ACTIVE' ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertIcon className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          {ipAddr.ipAddress}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                          {getIPType(ipAddr.ipAddress)}
                        </span>
                        {ipAddr.status === 'INACTIVE' && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                            Disabled by Admin
                          </span>
                        )}
                      </div>
                      {ipAddr.description && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          - {ipAddr.description}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeIP(ipAddr.id, ipAddr.status)}
                      disabled={isDeleting || ipAddr.status === 'INACTIVE'}
                      startIcon={<TrashBinIcon className="w-4 h-4" />}
                      className={`${
                        ipAddr.status === 'INACTIVE'
                          ? "text-gray-400 border-gray-200 cursor-not-allowed dark:text-gray-500 dark:border-gray-600"
                          : "text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                      }`}
                    >
                      {ipAddr.status === 'INACTIVE' ? 'Disabled' : 'Remove'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  IP Whitelisting Information
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• API requests will only be accepted from the specified IP addresses</li>
                  <li>• Supports IPv4, IPv6, and CIDR notation (e.g., 192.168.1.0/24)</li>
                  <li>• Changes take effect immediately for new API requests</li>
                  <li>• Make sure to include all necessary IP addresses to avoid access issues</li>
                  <li>• If you get locked out, contact support or disable from another allowed IP</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}