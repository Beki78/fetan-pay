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
  type: "payment" | "wallet";
  code: string;
  payer: string;
  receiver?: {
    name: string;
    bank: string;
  };
  amount: number;
  status: "expired" | "pending" | "verified" | "unconfirmed" | "debit" | "credit";
  date: string;
  verifiedBy?: string;
}

const mockPayments: Payment[] = [
  {
    id: "1",
    type: "wallet",
    code: "TXNWKQGGQGF9I",
    payer: "Verification Fee",
    amount: -2.00,
    status: "debit",
    date: "Dec 30, 08:30 PM",
  },
  {
    id: "2",
    type: "payment",
    code: "TXNWKQGGQGF9I",
    payer: "Bamlak",
    receiver: {
      name: "ENGIDAGET ENDESHAW DEBEB",
      bank: "Commercial Bank of Ethiopia",
    },
    amount: 320.00,
    status: "verified",
    date: "Dec 30, 08:28 PM",
    verifiedBy: "John Doe",
  },
  {
    id: "3",
    type: "payment",
    code: "TXNW5LDOJVAD1",
    payer: "Bamlak Feleke",
    receiver: {
      name: "ENGIDAGET ENDESHAW DEBEB",
      bank: "Commercial Bank of Ethiopia",
    },
    amount: 300.00,
    status: "pending",
    date: "Dec 30, 08:24 PM",
  },
  {
    id: "4",
    type: "payment",
    code: "TXNSW8PMTXFV7",
    payer: "bamlak",
    receiver: {
      name: "ENGIDAGET ENDESHAW DEBEB",
      bank: "Commercial Bank of Ethiopia",
    },
    amount: 250.00,
    status: "expired",
    date: "Dec 30, 07:31 PM",
  },
  {
    id: "5",
    type: "payment",
    code: "TXNQC7NBBXB10",
    payer: "Bamlak",
    receiver: {
      name: "ENGIDAGET ENDESHAW DEBEB",
      bank: "Commercial Bank of Ethiopia",
    },
    amount: 150.00,
    status: "expired",
    date: "Dec 30, 07:20 PM",
  },
  {
    id: "6",
    type: "wallet",
    code: "TXN4DX0V9JNVL",
    payer: "Verification Fee",
    amount: -2.00,
    status: "debit",
    date: "Dec 30, 07:18 PM",
  },
  {
    id: "7",
    type: "payment",
    code: "TXN4DX0V9JNVL",
    payer: "Bamlak",
    receiver: {
      name: "ENGIDAGET ENDESHAW DEBEB",
      bank: "Commercial Bank of Ethiopia",
    },
    amount: 160.00,
    status: "verified",
    date: "Dec 30, 07:16 PM",
    verifiedBy: "John Doe",
  },
  {
    id: "8",
    type: "wallet",
    code: "TOPUP",
    payer: "Wallet Top-up",
    amount: 10.00,
    status: "credit",
    date: "Dec 30, 04:24 PM",
  },
  {
    id: "9",
    type: "payment",
    code: "TXNOLCGV3KWUB",
    payer: "Bamlak",
    receiver: {
      name: "ENGIDAGET ENDESHAW DEBEB",
      bank: "Commercial Bank of Ethiopia",
    },
    amount: 150.00,
    status: "expired",
    date: "Dec 30, 03:19 PM",
  },
  {
    id: "10",
    type: "payment",
    code: "TXNCY5ANBKVE3",
    payer: "Qui consequatur Ven",
    receiver: {
      name: "ENGIDAGET ENDESHAW DEBEB",
      bank: "Commercial Bank of Ethiopia",
    },
    amount: 48.00,
    status: "expired",
    date: "Dec 27, 10:50 PM",
  },
  {
    id: "11",
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
    id: "12",
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

const formatAmount = (amount: number, type?: "payment" | "wallet") => {
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  if (type === "wallet") {
    const sign = amount >= 0 ? "+" : "-";
    return `${sign} ${formatted} ETB`;
  }
  
  return `${formatted} ETB`;
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
        (payment.receiver && payment.receiver.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
      case "debit":
        return "text-red-600 dark:text-red-400";
      case "credit":
        return "text-green-600 dark:text-green-400";
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
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="All Types">All Types</option>
            <option value="payment">Payment</option>
            <option value="wallet">Wallet</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="All Status">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="unconfirmed">Unconfirmed</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
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
                  VERIFIED BY
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
                      colSpan={9}
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
                        {payment.receiver ? (
                          <div>
                            <span className="block font-semibold text-gray-800 dark:text-white">
                              {payment.receiver.name}
                            </span>
                            <span className="block text-sm text-gray-500 dark:text-gray-400">
                              {payment.receiver.bank}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`font-semibold ${
                        payment.type === "wallet" 
                          ? payment.amount >= 0 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                          : "text-gray-800 dark:text-white"
                      }`}>
                        {formatAmount(payment.amount, payment.type)}
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
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {payment.verifiedBy ? (
                        <span className="font-medium text-gray-800 dark:text-white">
                          {payment.verifiedBy}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                      </TableCell>
                    <TableCell className="px-5 py-4">
                      {payment.type === "payment" ? (
                        <button
                          onClick={() => onView(payment as any)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                        >
                          View
                        </button>
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

