"use client";
import React from "react";
import Button from "../ui/button/Button";
import { GroupIcon, BoxCubeIcon, LockIcon, PieChartIcon } from "@/icons";
import Link from "next/link";

export default function QuickActions() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Super Admin Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Link href="/vendors">
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white border-0"
            startIcon={<GroupIcon />}
          >
            Manage Vendors
          </Button>
        </Link>
        <Link href="/payment-providers">
          <Button
            size="sm"
            variant="outline"
            className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            startIcon={<LockIcon />}
          >
            Payment Providers
          </Button>
        </Link>
        <Link href="/system-settings">
          <Button
            size="sm"
            variant="outline"
            className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            startIcon={<BoxCubeIcon />}
          >
            System Settings
          </Button>
        </Link>
        <Link href="/system-health">
          <Button
            size="sm"
            variant="outline"
            className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            startIcon={<PieChartIcon />}
          >
            System Health
          </Button>
        </Link>
      </div>
    </div>
  );
}

