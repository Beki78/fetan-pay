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
import Input from "../form/input/InputField";

interface Transaction {
  id: string;
  code: string;
  payer: string;
  amount: number;
  status: "pending" | "verified" | "expired" | "unconfirmed";
  date: string;
  verifiedBy?: string;
}

interface UserTransactionHistoryProps {
  userId: string;
}

// Mock transaction data for the user
const mockTransactions: Transaction[] = [
  {
    id: "1",
    code: "TXN1234567890",
    payer: "Customer A",
    amount: 5000.00,
    status: "verified",
    date: "2024-01-15T10:30:00Z",
    verifiedBy: "John Doe",
  },
  {
    id: "2",
    code: "TXN0987654321",
    payer: "Customer B",
    amount: 2500.00,
    status: "verified",
    date: "2024-01-14T15:20:00Z",
    verifiedBy: "John Doe",
  },
  {
    id: "3",
    code: "TXN1122334455",
    payer: "Customer C",
    amount: 1500.00,
    status: "pending",
    date: "2024-01-13T09:15:00Z",
  },
  {
    id: "4",
    code: "TXN5566778899",
    payer: "Customer D",
    amount: 7500.00,
    status: "verified",
    date: "2024-01-12T14:30:00Z",
    verifiedBy: "John Doe",
  },
  {
    id: "5",
    code: "TXN9988776655",
    payer: "Customer E",
    amount: 3200.00,
    status: "expired",
    date: "2024-01-11T11:45:00Z",
  },
];

const formatAmount = (amount: number) => {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: Transaction["status"]) => {
  switch (status) {
    case "verified":
      return "success";
    case "pending":
      return "warning";
    case "expired":
      return "error";
    case "unconfirmed":
      return "error";
    default:
      return "error";
  }
};

export default function UserTransactionHistory({
  userId,
}: UserTransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Transaction["status"]>("All");

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((transaction) => {
      const matchesSearch =
        transaction.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.payer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search by transaction code or payer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "All" | Transaction["status"])
            }
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="All">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="unconfirmed">Unconfirmed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Transaction Code
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Payer
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Amount
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
                    Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Verified By
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {transaction.code}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90">
                        {transaction.payer}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90 font-semibold">
                        {formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {transaction.verifiedBy ? (
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {transaction.verifiedBy}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <p>
          Showing {filteredTransactions.length} of {mockTransactions.length} transactions
        </p>
      </div>
    </div>
  );
}

