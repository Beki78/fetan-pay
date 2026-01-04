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
import { MoreDotIcon, EyeIcon, DollarLineIcon } from "@/icons";
import Input from "../form/input/InputField";
import Select from "../form/Select";

// Mock data
interface TransactionTip {
  id: string;
  transactionId: string;
  vendor: {
    id: string;
    name: string;
  };
  tipAmount: number;
  transactionAmount: number;
  date: string;
  status: "Pending" | "Approved" | "Paid";
}

const mockTransactionTips: TransactionTip[] = [
  {
    id: "1",
    transactionId: "TXN-2024-001234",
    vendor: {
      id: "1",
      name: "John Doe",
    },
    tipAmount: 100.00,
    transactionAmount: 5000.00,
    date: "2024-01-15T10:30:00Z",
    status: "Paid",
  },
  {
    id: "2",
    transactionId: "TXN-2024-001235",
    vendor: {
      id: "2",
      name: "Jane Smith",
    },
    tipAmount: 150.00,
    transactionAmount: 7500.00,
    date: "2024-01-15T09:15:00Z",
    status: "Approved",
  },
  {
    id: "3",
    transactionId: "TXN-2024-001236",
    vendor: {
      id: "3",
      name: "Michael Johnson",
    },
    tipAmount: 50.00,
    transactionAmount: 2500.00,
    date: "2024-01-15T08:45:00Z",
    status: "Pending",
  },
  {
    id: "4",
    transactionId: "TXN-2024-001237",
    vendor: {
      id: "1",
      name: "John Doe",
    },
    tipAmount: 200.00,
    transactionAmount: 10000.00,
    date: "2024-01-14T16:20:00Z",
    status: "Paid",
  },
  {
    id: "5",
    transactionId: "TXN-2024-001238",
    vendor: {
      id: "4",
      name: "Sarah Williams",
    },
    tipAmount: 75.00,
    transactionAmount: 3750.00,
    date: "2024-01-14T14:10:00Z",
    status: "Approved",
  },
  {
    id: "6",
    transactionId: "TXN-2024-001239",
    vendor: {
      id: "2",
      name: "Jane Smith",
    },
    tipAmount: 120.00,
    transactionAmount: 6000.00,
    date: "2024-01-14T12:30:00Z",
    status: "Paid",
  },
];

export default function TipsByTransaction() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenuTipId, setOpenMenuTipId] = useState<string | null>(null);

  const filteredTransactionTips = useMemo(() => {
    return mockTransactionTips.filter((transactionTip) => {
      const matchesSearch =
        transactionTip.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transactionTip.vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || transactionTip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Approved":
        return "warning";
      case "Pending":
        return "error";
      default:
        return "light";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Search transactions..."
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
              { value: "Approved", label: "Approved" },
              { value: "Paid", label: "Paid" },
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
              <TableCell>Transaction ID</TableCell>
              <TableCell>Vendor (Service Provider)</TableCell>
              <TableCell>Transaction Amount</TableCell>
              <TableCell>Tip Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactionTips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No transaction tips found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactionTips.map((transactionTip) => (
                <TableRow key={transactionTip.id}>
                  <TableCell>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {transactionTip.transactionId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-700 dark:text-gray-300">
                      {transactionTip.vendor.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      ETB {transactionTip.transactionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarLineIcon className="size-4 text-brand-600 dark:text-brand-400" />
                      <span className="font-medium text-brand-600 dark:text-brand-400">
                        ETB {transactionTip.tipAmount.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-700 dark:text-gray-300">
                      {new Date(transactionTip.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge color={getStatusColor(transactionTip.status)}>
                      {transactionTip.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <button
                        type="button"
                        className="dropdown-toggle p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() =>
                          setOpenMenuTipId((prev) =>
                            prev === transactionTip.id ? null : transactionTip.id
                          )
                        }
                        aria-haspopup="menu"
                        aria-expanded={openMenuTipId === transactionTip.id}
                      >
                        <MoreDotIcon className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <Dropdown
                        isOpen={openMenuTipId === transactionTip.id}
                        onClose={() => setOpenMenuTipId(null)}
                      >
                        <DropdownItem
                          onClick={() => {
                            setOpenMenuTipId(null);
                          }}
                        >
                          <EyeIcon className="size-4" />
                          View Details
                        </DropdownItem>
                      </Dropdown>
                    </div>
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

