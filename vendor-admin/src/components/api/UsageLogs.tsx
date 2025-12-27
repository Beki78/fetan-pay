"use client";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon, EyeIcon, DownloadIcon } from "@/icons";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";

// Mock data
interface UsageLog {
  id: string;
  apiKeyId: string;
  apiKeyName: string;
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  ipAddress: string;
  timestamp: string;
  requestBody?: string;
  responseBody?: string;
}

const mockUsageLogs: UsageLog[] = [
  {
    id: "1",
    apiKeyId: "1",
    apiKeyName: "Production Key",
    endpoint: "/api/v1/payments/verify",
    method: "POST",
    statusCode: 200,
    duration: 245,
    ipAddress: "192.168.1.100",
    timestamp: "2024-01-15T14:30:00Z",
  },
  {
    id: "2",
    apiKeyId: "1",
    apiKeyName: "Production Key",
    endpoint: "/api/v1/payments/verify",
    method: "POST",
    statusCode: 400,
    duration: 120,
    ipAddress: "192.168.1.100",
    timestamp: "2024-01-15T14:25:00Z",
  },
  {
    id: "3",
    apiKeyId: "2",
    apiKeyName: "Development Key",
    endpoint: "/api/v1/payments/list",
    method: "GET",
    statusCode: 200,
    duration: 89,
    ipAddress: "192.168.1.101",
    timestamp: "2024-01-15T13:20:00Z",
  },
  {
    id: "4",
    apiKeyId: "1",
    apiKeyName: "Production Key",
    endpoint: "/api/v1/payments/verify",
    method: "POST",
    statusCode: 500,
    duration: 1500,
    ipAddress: "192.168.1.100",
    timestamp: "2024-01-15T12:15:00Z",
  },
  {
    id: "5",
    apiKeyId: "2",
    apiKeyName: "Development Key",
    endpoint: "/api/v1/payments/verify",
    method: "POST",
    statusCode: 200,
    duration: 198,
    ipAddress: "192.168.1.101",
    timestamp: "2024-01-15T11:10:00Z",
  },
];

export default function UsageLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [apiKeyFilter, setApiKeyFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<UsageLog | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const filteredLogs = useMemo(() => {
    return mockUsageLogs.filter((log) => {
      const matchesSearch =
        log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "success" && log.statusCode >= 200 && log.statusCode < 300) ||
        (statusFilter === "error" && log.statusCode >= 400);
      const matchesApiKey = apiKeyFilter === "all" || log.apiKeyId === apiKeyFilter;
      return matchesSearch && matchesStatus && matchesApiKey;
    });
  }, [searchQuery, statusFilter, apiKeyFilter]);

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "success";
    if (statusCode >= 400 && statusCode < 500) return "error";
    if (statusCode >= 500) return "error";
    return "default";
  };

  const handleViewDetails = (log: UsageLog) => {
    setSelectedLog(log);
    openModal();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Search by endpoint or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "success", label: "Success (2xx)" },
              { value: "error", label: "Error (4xx/5xx)" },
            ]}
            className="w-48"
          />
          <Select
            value={apiKeyFilter}
            onChange={(value) => setApiKeyFilter(value)}
            options={[
              { value: "all", label: "All API Keys" },
              { value: "1", label: "Production Key" },
              { value: "2", label: "Development Key" },
            ]}
            className="w-48"
          />
        </div>
        <Button size="sm" variant="outline" startIcon={<DownloadIcon />}>
          Export Logs
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>API Key</TableCell>
              <TableCell>Endpoint</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No usage logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {log.apiKeyName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs text-gray-700 dark:text-gray-300">
                      {log.endpoint}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={log.method === "GET" ? "success" : log.method === "POST" ? "warning" : "default"}
                    >
                      {log.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge color={getStatusColor(log.statusCode)}>
                      {log.statusCode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {log.duration}ms
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {log.ipAddress}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dropdown
                      trigger={
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                          <MoreDotIcon className="text-gray-600 dark:text-gray-400" />
                        </button>
                      }
                    >
                      <DropdownItem onClick={() => handleViewDetails(log)}>
                        <EyeIcon className="size-4" />
                        View Details
                      </DropdownItem>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Log Detail Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-5 lg:p-6">
        {selectedLog && (
          <>
            <h4 className="font-semibold text-gray-800 mb-6 text-title-sm dark:text-white/90">
              Request Details
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Endpoint</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {selectedLog.method} {selectedLog.endpoint}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status Code</p>
                <Badge color={getStatusColor(selectedLog.statusCode)}>
                  {selectedLog.statusCode}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {selectedLog.duration}ms
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">IP Address</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {selectedLog.ipAddress}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Timestamp</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {new Date(selectedLog.timestamp).toLocaleString("en-US")}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

