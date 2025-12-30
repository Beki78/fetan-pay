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
import { PlusIcon } from "@/icons";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import CreatePaymentIntentModal from "./CreatePaymentIntentModal";

// Mock data
interface Payment {
  id: string;
  type: "payment";
  code: string;
  payer: string;
  receiver: {
    name: string;
    bank: string;
  };
  amount: number;
  status: "expired" | "pending" | "verified" | "unconfirmed";
  date: string;
}

const mockPayments: Payment[] = [
  {
    id: "1",
    type: "payment",
    code: "TXNSF7HPΙВКО8",
    payer: "lemlem toyiba",
    receiver: {
      name: "EPHREM DEBEBE",
      bank: "Commercial Bank of Ethiopia",
    },
    amount: 2143.60,
    status: "expired",
    date: "Dec 27, 06:27 PM",
  },
  {
    id: "2",
    type: "payment",
    code: "TXNHEHWW8EUF2",
    payer: "test test",
    receiver: {
      name: "EPHREM DEBEBE",
      bank: "Commercial Bank of Ethiopia",
    },
    amount: 10.00,
    status: "expired",
    date: "Dec 27, 06:04 PM",
  },
];

const formatAmount = (amount: number) => {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
};

interface PaymentTableProps {
  onView: (payment: Payment) => void;
  onExport: () => void;
  onCreatePaymentIntent?: (data: { payerName: string; amount: number; notes?: string }) => void;
}

export default function PaymentTable({
  onView,
  onExport,
  onCreatePaymentIntent,
}: PaymentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return mockPayments.filter((payment) => {
      const matchesSearch =
        payment.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.payer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.receiver.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "All Types" || payment.type === typeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "All Status" || payment.status === statusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, typeFilter, statusFilter]);

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "verified":
        return "text-green-600 dark:text-green-400";
      case "pending":
        return "text-orange-600 dark:text-orange-400";
      case "expired":
        return "text-gray-500 dark:text-gray-400";
      case "unconfirmed":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Transactions</h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 dark:bg-green-500/10 dark:border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Live</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage your payment intents</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <Input
              type="text"
              placeholder="Search by transaction code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTypeFilter(typeFilter === "All Types" ? "payment" : "All Types")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === "All Types"
                ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "All Status" ? "expired" : "All Status")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "All Status"
                ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            All Status
          </button>
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white border-0"
            startIcon={<PlusIcon />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Payment Intent
          </Button>
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
                  TYPE
                  </TableCell>
                  <TableCell
                    isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                  CODE
                  </TableCell>
                  <TableCell
                    isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                  PAYER
                  </TableCell>
                  <TableCell
                    isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                  RECEIVER
                  </TableCell>
                  <TableCell
                    isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                  AMOUNT
                  </TableCell>
                  <TableCell
                    isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                  STATUS
                  </TableCell>
                  <TableCell
                    isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                  DATE
                  </TableCell>
                  <TableCell
                    isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                  ACTIONS
                  </TableCell>
                </TableRow>
              </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                    No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                  >
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                        {payment.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {payment.code}
                        </span>
                      </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {payment.payer}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                        <div>
                        <span className="block font-semibold text-gray-800 dark:text-white">
                          {payment.receiver.name}
                          </span>
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          {payment.receiver.bank}
                          </span>
                        </div>
                      </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {formatAmount(payment.amount)}
                      </span>
                      </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                      </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {payment.date}
                      </TableCell>
                    <TableCell className="px-5 py-4">
                          <button
                        onClick={() => onView(payment as any)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                          >
                        View
                          </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </div>
      </div>

      {/* Create Payment Intent Modal */}
      <CreatePaymentIntentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(data) => {
          if (onCreatePaymentIntent) {
            onCreatePaymentIntent(data);
          }
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}

