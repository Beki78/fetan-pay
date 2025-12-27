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
import { MoreDotIcon, EyeIcon, DownloadIcon, CheckCircleIcon, TimeIcon } from "@/icons";
import Input from "../form/input/InputField";
import Select from "../form/Select";

// Mock data
interface Payout {
  id: string;
  payoutId: string;
  vendor: {
    id: string;
    name: string;
  };
  tipAmount: number;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  requestedDate: string;
  processedDate?: string;
  paymentMethod: string;
  transactionReference?: string;
}

const mockPayouts: Payout[] = [
  {
    id: "1",
    payoutId: "PO-2024-001234",
    vendor: {
      id: "1",
      name: "John Doe",
    },
    tipAmount: 5000.00,
    status: "Completed",
    requestedDate: "2024-01-10T10:00:00Z",
    processedDate: "2024-01-10T14:30:00Z",
    paymentMethod: "Bank Transfer",
    transactionReference: "TXN-REF-123456",
  },
  {
    id: "2",
    payoutId: "PO-2024-001235",
    vendor: {
      id: "2",
      name: "Jane Smith",
    },
    tipAmount: 7500.00,
    status: "Processing",
    requestedDate: "2024-01-12T09:15:00Z",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "3",
    payoutId: "PO-2024-001236",
    vendor: {
      id: "3",
      name: "Michael Johnson",
    },
    tipAmount: 3000.00,
    status: "Pending",
    requestedDate: "2024-01-14T11:20:00Z",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "4",
    payoutId: "PO-2024-001237",
    vendor: {
      id: "4",
      name: "Sarah Williams",
    },
    tipAmount: 10000.00,
    status: "Completed",
    requestedDate: "2024-01-08T08:00:00Z",
    processedDate: "2024-01-08T12:15:00Z",
    paymentMethod: "Bank Transfer",
    transactionReference: "TXN-REF-123457",
  },
  {
    id: "5",
    payoutId: "PO-2024-001238",
    vendor: {
      id: "5",
      name: "David Brown",
    },
    tipAmount: 2000.00,
    status: "Failed",
    requestedDate: "2024-01-13T15:45:00Z",
    paymentMethod: "Bank Transfer",
  },
];

export default function PayoutTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPayouts = useMemo(() => {
    return mockPayouts.filter((payout) => {
      const matchesSearch =
        payout.payoutId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || payout.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Processing":
        return "warning";
      case "Pending":
        return "error";
      case "Failed":
        return "error";
      default:
        return "default";
    }
  };

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
              { value: "Pending", label: "Pending" },
              { value: "Processing", label: "Processing" },
              { value: "Completed", label: "Completed" },
              { value: "Failed", label: "Failed" },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Payout ID</TableCell>
              <TableCell>Vendor (Service Provider)</TableCell>
              <TableCell>Tip Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Requested Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No payouts found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {payout.payoutId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-700 dark:text-gray-300">
                      {payout.vendor.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      ETB {payout.tipAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-700 dark:text-gray-300">
                      {payout.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-gray-700 dark:text-gray-300">
                        {new Date(payout.requestedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {payout.processedDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Processed: {new Date(payout.processedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color={getStatusColor(payout.status)}>
                      {payout.status === "Completed" && <CheckCircleIcon className="size-3 mr-1" />}
                      {payout.status === "Pending" && <TimeIcon className="size-3 mr-1" />}
                      {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dropdown
                      trigger={
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                          <MoreDotIcon className="text-gray-600 dark:text-gray-400" />
                        </button>
                      }
                    >
                      <DropdownItem>
                        <EyeIcon className="size-4" />
                        View Details
                      </DropdownItem>
                      {payout.status === "Completed" && (
                        <DropdownItem>
                          <DownloadIcon className="size-4" />
                          Download Receipt
                        </DropdownItem>
                      )}
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

