"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import { useGetMerchantsQuery, useSendVerificationReminderMutation, type Merchant } from "@/lib/redux/features/merchantsApi";
import { toast } from "sonner";

export default function UnverifiedMerchantsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useGetMerchantsQuery({ 
    page, 
    pageSize, 
    search: search || undefined,
    status: "UNVERIFIED" // Filter by UNVERIFIED status
  });

  const [sendReminder, { isLoading: isSending }] = useSendVerificationReminderMutation();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "UNVERIFIED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "PENDING":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // TODO: Filter to show only UNVERIFIED merchants when backend is ready
  const merchants = data?.data ?? [];
  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleNotify = async (merchantId: string) => {
    try {
      await sendReminder({ id: merchantId }).unwrap();
      toast.success("Verification reminder sent successfully!");
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast.error(error?.data?.message || "Failed to send verification reminder");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Filter (no status filter for unverified tab) */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, phone, or TIN..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Unverified Merchants
            {data?.total !== undefined && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({data.total} total)
              </span>
            )}
          </h3>
          {search && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Searching for "{search}"
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  ID
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
                  Contact Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Contact Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Owner Email
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
                  Created
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading unverified merchants...
                  </TableCell>
                </TableRow>
              ) : merchants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-gray-400 dark:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm">No unverified merchants found</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        All merchants have verified their email addresses
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                merchants.map((merchant: Merchant) => {
                  const owner = merchant.users.find((u: any) => u.role === "MERCHANT_OWNER");
                  return (
                    <TableRow
                      key={merchant.id}
                      className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                    >
                      <TableCell className="px-5 py-4">
                        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                          {merchant.id.slice(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {merchant.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {merchant.contactEmail ?? "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {merchant.contactPhone ?? "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {owner?.email ?? "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor("UNVERIFIED")}`}>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Awaiting Verification
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(merchant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNotify(merchant.id)}
                          disabled={isSending}
                          className="text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                        >
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          {isSending ? "Sending..." : "Notify"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data?.total || 0)} of {data?.total || 0} merchants
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="disabled:opacity-50"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        page === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              About Unverified Merchants
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
              These merchants have signed up but haven't verified their email address yet. 
              They will automatically move to "Pending Approval" once they verify their email. 
              Use the "Notify" button to send them a reminder email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
