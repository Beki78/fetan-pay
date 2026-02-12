"use client";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { CheckCircleIcon, TimeIcon } from "@/icons";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { ListTipsResponse } from "@/lib/services/tipsApi";

interface PayoutTrackingProps {
  data?: ListTipsResponse;
  isLoading?: boolean;
}

export default function PayoutTracking({ data, isLoading }: PayoutTrackingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const tips = data?.data || [];

  const filteredPayouts = useMemo(() => {
    return tips.filter((tip) => {
      const matchesSearch =
        tip.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tip.merchant?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || tip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tips, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "success";
      case "PENDING":
        return "warning";
      case "UNVERIFIED":
        return "error";
      default:
        return "light";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "Completed";
      case "PENDING":
        return "Processing";
      case "UNVERIFIED":
        return "Pending";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading payouts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Search payouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "PENDING", label: "Pending" },
              { value: "VERIFIED", label: "Completed" },
              { value: "UNVERIFIED", label: "Failed" },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Reference
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Merchant
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Tip Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Provider
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No payouts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayouts.map((tip) => (
                  <TableRow
                    key={tip.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {tip.reference}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {tip.merchant?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {tip.merchant?.contactEmail || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        ETB {Number(tip.tipAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {tip.provider}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="text-sm">
                        <div className="text-gray-600 dark:text-gray-400">
                          {new Date(tip.createdAt).toLocaleDateString()}
                        </div>
                        {tip.verifiedAt && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Verified: {new Date(tip.verifiedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge color={getStatusColor(tip.status)}>
                        {tip.status === "VERIFIED" && <CheckCircleIcon className="mr-1" />}
                        {tip.status === "PENDING" && <TimeIcon className="mr-1" />}
                        {getStatusLabel(tip.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          // Handle view details
                        }}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Details
                      </button>
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

