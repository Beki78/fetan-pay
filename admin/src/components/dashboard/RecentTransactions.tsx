"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import { CheckCircleIcon, AlertIcon, UserIcon, BoxCubeIcon } from "@/icons";

// Mock data for platform activities
interface PlatformActivity {
  id: string;
  type: "vendor_signup" | "payment_verified" | "system_alert" | "vendor_action";
  description: string;
  vendor?: string;
  timestamp: string;
  status: "success" | "warning" | "info";
}

const mockActivities: PlatformActivity[] = [
  {
    id: "1",
    type: "vendor_signup",
    description: "New vendor registered: TechCorp Solutions",
    vendor: "TechCorp Solutions",
    timestamp: "2 minutes ago",
    status: "success"
  },
  {
    id: "2",
    type: "payment_verified",
    description: "Large transaction verified: TXN-2024-001",
    vendor: "Global Traders Ltd",
    timestamp: "5 minutes ago",
    status: "success"
  },
  {
    id: "3",
    type: "system_alert",
    description: "Payment verification service response time degraded",
    timestamp: "12 minutes ago",
    status: "warning"
  },
  {
    id: "4",
    type: "vendor_action",
    description: "Vendor updated API settings",
    vendor: "Digital Commerce Inc",
    timestamp: "18 minutes ago",
    status: "info"
  },
  {
    id: "5",
    type: "payment_verified",
    description: "Bulk payment verification completed (25 transactions)",
    vendor: "Retail Chain Plus",
    timestamp: "25 minutes ago",
    status: "success"
  }
];

export default function RecentTransactions() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="text-green-600 dark:text-green-400 size-4" />;
      case "warning":
        return <AlertIcon className="text-orange-600 dark:text-orange-400 size-4" />;
      case "info":
        return <UserIcon className="text-blue-600 dark:text-blue-400 size-4" />;
      default:
        return <CheckCircleIcon className="text-gray-600 dark:text-gray-400 size-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vendor_signup":
        return <UserIcon className="text-blue-600 dark:text-blue-400 size-4" />;
      case "payment_verified":
        return <CheckCircleIcon className="text-green-600 dark:text-green-400 size-4" />;
      case "system_alert":
        return <AlertIcon className="text-orange-600 dark:text-orange-400 size-4" />;
      case "vendor_action":
        return <BoxCubeIcon className="text-purple-600 dark:text-purple-400 size-4" />;
      default:
        return <CheckCircleIcon className="text-gray-600 dark:text-gray-400 size-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Platform Activities</h3>
        <Link href="/system-logs" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          View all logs
        </Link>
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
                  Activity
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Vendor
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
                  Time
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No recent activities
                  </TableCell>
                </TableRow>
              ) : (
                mockActivities.map((activity) => (
                  <TableRow
                    key={activity.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(activity.type)}
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {activity.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 text-sm">
                      {activity.vendor || "System"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.status)}
                        <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                          {activity.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {activity.timestamp}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

