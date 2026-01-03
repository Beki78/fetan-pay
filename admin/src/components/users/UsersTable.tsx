"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import Link from "next/link";
import { useGetMerchantsQuery } from "@/lib/redux/features/merchantsApi";

export default function UsersTable() {
  const { data, isLoading } = useGetMerchantsQuery({ page: 1, pageSize: 20 });

  const merchants = data?.data ?? [];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "PENDING":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "SUSPENDED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Merchants</h3>
        {/* <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0">
          + Add User
        </Button> */}
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
                  Owner (invite)
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
                    Loading merchants...
                  </TableCell>
                </TableRow>
              ) : merchants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No merchants found
                  </TableCell>
                </TableRow>
              ) : (
                merchants.map((merchant) => {
                  const owner = merchant.users.find((u) => u.role === "MERCHANT_OWNER");
                  return (
                  <TableRow
                    key={merchant.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                  >
                    <TableCell className="px-5 py-4">
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {merchant.id}
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
                      {owner?.email ?? owner?.name ?? "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(merchant.status)}`}>
                        {merchant.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(merchant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Link href={`/users/${merchant.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                        >
                          View detail
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
