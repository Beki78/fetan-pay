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
import { MoreDotIcon, EyeIcon, DownloadIcon, CheckCircleIcon, AlertIcon } from "@/icons";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";

// Mock data
interface Payment {
  id: string;
  transactionId: string;
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  paymentMethod: string;
  status: "Submitted" | "Confirmed" | "Unconfirmed";
  submittedAt: string;
  confirmedAt?: string;
  bank: string;
  receiverAccount: string;
  senderAccount: string;
  confirmationDetails?: {
    transactionExists: boolean;
    paymentSuccess: boolean;
    amountMatched: boolean;
    receiverMatched: boolean;
    source: string;
    failureReason?: string;
  };
}

const mockPayments: Payment[] = [
  {
    id: "1",
    transactionId: "TXN-2024-001234",
    vendor: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    amount: 15000.00,
    paymentMethod: "Bank Transfer",
    status: "Confirmed",
    submittedAt: "2024-01-15T10:30:00Z",
    confirmedAt: "2024-01-15T10:31:15Z",
    bank: "CBE",
    receiverAccount: "1000123456789",
    senderAccount: "2000987654321",
    confirmationDetails: {
      transactionExists: true,
      paymentSuccess: true,
      amountMatched: true,
      receiverMatched: true,
      source: "CBE API",
    },
  },
  {
    id: "2",
    transactionId: "TXN-2024-001235",
    vendor: {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
    },
    amount: 8500.50,
    paymentMethod: "Bank Transfer",
    status: "Confirmed",
    submittedAt: "2024-01-15T09:15:00Z",
    confirmedAt: "2024-01-15T09:16:30Z",
    bank: "Awash Bank",
    receiverAccount: "1000123456789",
    senderAccount: "2000111222333",
    confirmationDetails: {
      transactionExists: true,
      paymentSuccess: true,
      amountMatched: true,
      receiverMatched: true,
      source: "Awash Bank API",
    },
  },
  {
    id: "3",
    transactionId: "TXN-2024-001236",
    vendor: {
      id: "3",
      name: "Michael Johnson",
      email: "michael.j@example.com",
    },
    amount: 25000.00,
    paymentMethod: "Bank Transfer",
    status: "Unconfirmed",
    submittedAt: "2024-01-15T08:45:00Z",
    bank: "BOA",
    receiverAccount: "1000123456789",
    senderAccount: "2000444555666",
    confirmationDetails: {
      transactionExists: false,
      paymentSuccess: false,
      amountMatched: false,
      receiverMatched: false,
      source: "BOA API",
      failureReason: "Transaction not found in bank records",
    },
  },
  {
    id: "4",
    transactionId: "TXN-2024-001237",
    vendor: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    amount: 12000.00,
    paymentMethod: "Bank Transfer",
    status: "Submitted",
    submittedAt: "2024-01-15T11:20:00Z",
    bank: "Telebirr",
    receiverAccount: "1000123456789",
    senderAccount: "2000777888999",
  },
  {
    id: "5",
    transactionId: "TXN-2024-001238",
    vendor: {
      id: "4",
      name: "Sarah Williams",
      email: "sarah.w@example.com",
    },
    amount: 18500.75,
    paymentMethod: "Bank Transfer",
    status: "Confirmed",
    submittedAt: "2024-01-14T16:30:00Z",
    confirmedAt: "2024-01-14T16:31:45Z",
    bank: "CBE",
    receiverAccount: "1000123456789",
    senderAccount: "2000123456789",
    confirmationDetails: {
      transactionExists: true,
      paymentSuccess: true,
      amountMatched: true,
      receiverMatched: true,
      source: "CBE API",
    },
  },
  {
    id: "6",
    transactionId: "TXN-2024-001239",
    vendor: {
      id: "5",
      name: "David Brown",
      email: "david.brown@example.com",
    },
    amount: 9500.00,
    paymentMethod: "Bank Transfer",
    status: "Unconfirmed",
    submittedAt: "2024-01-14T14:15:00Z",
    bank: "Awash Bank",
    receiverAccount: "1000123456789",
    senderAccount: "2000555666777",
    confirmationDetails: {
      transactionExists: true,
      paymentSuccess: true,
      amountMatched: false,
      receiverMatched: true,
      source: "Awash Bank API",
      failureReason: "Amount mismatch: Expected 9500.00, Found 9000.00",
    },
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (amount: number) => {
  return `ETB ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface PaymentTableProps {
  onView: (payment: Payment) => void;
  onExport: () => void;
}

export default function PaymentTable({
  onView,
  onExport,
}: PaymentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Submitted" | "Confirmed" | "Unconfirmed"
  >("All");
  const [vendorFilter, setVendorFilter] = useState<string>("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get unique vendors for filter
  const vendors = useMemo(() => {
    const uniqueVendors = Array.from(
      new Set(mockPayments.map((p) => p.vendor.id))
    );
    return [
      "All",
      ...uniqueVendors.map((id) => {
        const vendor = mockPayments.find((p) => p.vendor.id === id)?.vendor;
        return { id, name: vendor?.name || "" };
      }),
    ];
  }, []);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return mockPayments.filter((payment) => {
      const matchesSearch =
        payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.vendor.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      const matchesVendor =
        vendorFilter === "All" || payment.vendor.id === vendorFilter;

      const matchesPaymentMethod =
        paymentMethodFilter === "All" ||
        payment.paymentMethod === paymentMethodFilter;

      const matchesDate =
        (!dateFrom || new Date(payment.submittedAt) >= new Date(dateFrom)) &&
        (!dateTo || new Date(payment.submittedAt) <= new Date(dateTo));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesVendor &&
        matchesPaymentMethod &&
        matchesDate
      );
    });
  }, [
    searchQuery,
    statusFilter,
    vendorFilter,
    paymentMethodFilter,
    dateFrom,
    dateTo,
  ]);

  const handleDropdownToggle = (paymentId: string) => {
    setOpenDropdown(openDropdown === paymentId ? null : paymentId);
  };

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "Confirmed":
        return (
          <Badge size="sm" color="success">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "Unconfirmed":
        return (
          <Badge size="sm" color="error">
            <AlertIcon className="w-3 h-3 mr-1" />
            Unconfirmed
          </Badge>
        );
      case "Submitted":
        return (
          <Badge size="sm" color="warning">
            Submitted
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by Transaction ID, Vendor name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "All" | "Submitted" | "Confirmed" | "Unconfirmed"
                )
              }
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="All">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Unconfirmed">Unconfirmed</option>
            </select>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              {vendors.map((vendor) => (
                <option
                  key={typeof vendor === "string" ? vendor : vendor.id}
                  value={typeof vendor === "string" ? vendor : vendor.id}
                >
                  {typeof vendor === "string" ? vendor : vendor.name}
                </option>
              ))}
            </select>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="All">All Methods</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="QR Code">QR Code</option>
            </select>
            <Button size="sm" variant="outline" onClick={onExport}>
              <DownloadIcon className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
        {/* Date Range */}
        <div className="flex items-center gap-3">
          <Input
            type="date"
            placeholder="From Date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="max-w-[180px]"
          />
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <Input
            type="date"
            placeholder="To Date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="max-w-[180px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Transaction ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Vendor
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
                    Payment Method
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Bank
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
                    Submitted
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {payment.transactionId}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div>
                          <span className="block text-gray-800 text-theme-sm dark:text-white/90">
                            {payment.vendor.name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {payment.vendor.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90 font-medium">
                        {formatAmount(payment.amount)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {payment.paymentMethod}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {payment.bank}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(payment.submittedAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div className="relative">
                          <button
                            onClick={() => handleDropdownToggle(payment.id)}
                            className="dropdown-toggle flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <MoreDotIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </button>
                          <Dropdown
                            isOpen={openDropdown === payment.id}
                            onClose={() => setOpenDropdown(null)}
                          >
                            <DropdownItem
                              onClick={() => {
                                onView(payment);
                                setOpenDropdown(null);
                              }}
                              className="dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center gap-2">
                                <EyeIcon className="w-4 h-4" />
                                View Details
                              </div>
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
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <p>
          Showing {filteredPayments.length} of {mockPayments.length} payments
        </p>
      </div>
    </div>
  );
}

