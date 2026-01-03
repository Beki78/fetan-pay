"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { DownloadIcon, EyeIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";

// Mock data
interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  plan: string;
  billingPeriod: string;
  paymentMethod: string;
  downloadUrl?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    date: "2024-01-15",
    amount: 199.0,
    status: "Paid",
    plan: "Growth Plan",
    billingPeriod: "Jan 2024",
    paymentMethod: "Credit Card •••• 4242",
    downloadUrl: "#",
  },
  {
    id: "2",
    invoiceNumber: "INV-2023-012",
    date: "2023-12-15",
    amount: 199.0,
    status: "Paid",
    plan: "Growth Plan",
    billingPeriod: "Dec 2023",
    paymentMethod: "Credit Card •••• 4242",
    downloadUrl: "#",
  },
  {
    id: "3",
    invoiceNumber: "INV-2023-011",
    date: "2023-11-15",
    amount: 199.0,
    status: "Paid",
    plan: "Growth Plan",
    billingPeriod: "Nov 2023",
    paymentMethod: "Credit Card •••• 4242",
    downloadUrl: "#",
  },
  {
    id: "4",
    invoiceNumber: "INV-2023-010",
    date: "2023-10-15",
    amount: 199.0,
    status: "Paid",
    plan: "Growth Plan",
    billingPeriod: "Oct 2023",
    paymentMethod: "Credit Card •••• 4242",
    downloadUrl: "#",
  },
  {
    id: "5",
    invoiceNumber: "INV-2023-009",
    date: "2023-09-15",
    amount: 199.0,
    status: "Paid",
    plan: "Growth Plan",
    billingPeriod: "Sep 2023",
    paymentMethod: "Credit Card •••• 4242",
    downloadUrl: "#",
  },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatAmount = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

export default function PaymentHistory() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownToggle = (invoiceId: string) => {
    setOpenDropdown(openDropdown === invoiceId ? null : invoiceId);
  };

  const handleDownload = (invoice: Invoice) => {
    console.log("Downloading invoice:", invoice.invoiceNumber);
    // Mock download functionality
  };

  const handleView = (invoice: Invoice) => {
    console.log("Viewing invoice:", invoice.invoiceNumber);
    // Mock view functionality
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          Payment History
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View and download your subscription invoices
        </p>
      </div>

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
                    Invoice #
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
                    Plan
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
                    Status
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
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {invoice.invoiceNumber}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(invoice.date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div>
                        <span className="block text-gray-800 text-theme-sm dark:text-white/90">
                          {invoice.plan}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {invoice.billingPeriod}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90 font-medium">
                      {formatAmount(invoice.amount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {invoice.paymentMethod}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={
                          invoice.status === "Paid"
                            ? "success"
                            : invoice.status === "Pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="relative">
                        <button
                          onClick={() => handleDropdownToggle(invoice.id)}
                          className="dropdown-toggle flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <MoreDotIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                        <Dropdown
                          isOpen={openDropdown === invoice.id}
                          onClose={() => setOpenDropdown(null)}
                        >
                          <DropdownItem
                            onClick={() => {
                              handleView(invoice);
                              setOpenDropdown(null);
                            }}
                            className="dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center gap-2">
                              <EyeIcon className="w-4 h-4" />
                              View Invoice
                            </div>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              handleDownload(invoice);
                              setOpenDropdown(null);
                            }}
                            className="dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center gap-2">
                              <DownloadIcon className="w-4 h-4" />
                              Download PDF
                            </div>
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <p>Showing {mockInvoices.length} invoices</p>
        <Button size="sm" variant="outline">
          View All Invoices
        </Button>
      </div>
    </div>
  );
}

