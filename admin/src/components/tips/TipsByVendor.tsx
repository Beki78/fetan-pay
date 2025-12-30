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
import { MoreDotIcon, EyeIcon, GroupIcon } from "@/icons";
import Input from "../form/input/InputField";
import Select from "../form/Select";

// Mock data
interface VendorTip {
  id: string;
  vendor: {
    id: string;
    name: string;
    phone: string;
    employeeId?: string;
  };
  totalTips: number;
  totalTransactions: number;
  averageTip: number;
  pendingPayout: number;
  paidPayout: number;
  status: "Active" | "Inactive";
}

const mockVendorTips: VendorTip[] = [
  {
    id: "1",
    vendor: {
      id: "1",
      name: "John Doe",
      phone: "+251 911 234 567",
      employeeId: "EMP-001",
    },
    totalTips: 12500.75,
    totalTransactions: 125,
    averageTip: 100.01,
    pendingPayout: 2500.15,
    paidPayout: 10000.60,
    status: "Active",
  },
  {
    id: "2",
    vendor: {
      id: "2",
      name: "Jane Smith",
      phone: "+251 912 345 678",
      employeeId: "EMP-002",
    },
    totalTips: 18900.50,
    totalTransactions: 189,
    averageTip: 100.00,
    pendingPayout: 3800.10,
    paidPayout: 15100.40,
    status: "Active",
  },
  {
    id: "3",
    vendor: {
      id: "3",
      name: "Michael Johnson",
      phone: "+251 913 456 789",
      employeeId: "EMP-003",
    },
    totalTips: 8750.25,
    totalTransactions: 87,
    averageTip: 100.58,
    pendingPayout: 1750.05,
    paidPayout: 7000.20,
    status: "Active",
  },
  {
    id: "4",
    vendor: {
      id: "4",
      name: "Sarah Williams",
      phone: "+251 914 567 890",
      employeeId: "EMP-004",
    },
    totalTips: 23400.00,
    totalTransactions: 234,
    averageTip: 100.00,
    pendingPayout: 4680.00,
    paidPayout: 18720.00,
    status: "Active",
  },
  {
    id: "5",
    vendor: {
      id: "5",
      name: "David Brown",
      phone: "+251 915 678 901",
      employeeId: "EMP-005",
    },
    totalTips: 6500.50,
    totalTransactions: 65,
    averageTip: 100.01,
    pendingPayout: 1300.10,
    paidPayout: 5200.40,
    status: "Inactive",
  },
];

export default function TipsByVendor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredVendorTips = useMemo(() => {
    return mockVendorTips.filter((vendorTip) => {
      const matchesSearch =
        vendorTip.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendorTip.vendor.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendorTip.vendor.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || vendorTip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
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
              <TableCell>Vendor (Service Provider)</TableCell>
              <TableCell>Total Tips</TableCell>
              <TableCell>Transactions</TableCell>
              <TableCell>Avg Tip</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendorTips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No vendor tips found
                </TableCell>
              </TableRow>
            ) : (
              filteredVendorTips.map((vendorTip) => (
                <TableRow key={vendorTip.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white/90">
                        {vendorTip.vendor.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {vendorTip.vendor.phone}
                      </div>
                      {vendorTip.vendor.employeeId && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          ID: {vendorTip.vendor.employeeId}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      ETB {vendorTip.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-700 dark:text-gray-300">
                      {vendorTip.totalTransactions}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-700 dark:text-gray-300">
                      ETB {vendorTip.averageTip.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-warning-600 dark:text-warning-400">
                      ETB {vendorTip.pendingPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-success-600 dark:text-success-400">
                      ETB {vendorTip.paidPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={vendorTip.status === "Active" ? "success" : "error"}
                    >
                      {vendorTip.status}
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

