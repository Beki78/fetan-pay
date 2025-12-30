"use client";
import React from "react";
import Button from "../ui/button/Button";
import { PlusIcon, PieChartIcon, BoltIcon } from "@/icons";
import Link from "next/link";

export default function QuickActions() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Link href="/payments">
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white border-0"
            startIcon={<PlusIcon />}
          >
            New Payment Intent
          </Button>
        </Link>
        <Link href="/analytics">
          <Button
            size="sm"
            variant="outline"
            className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            startIcon={<PieChartIcon />}
          >
            View Analytics
          </Button>
        </Link>
        <Link href="/api-keys">
          <Button
            size="sm"
            variant="outline"
            className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            startIcon={<BoltIcon />}
          >
            View API Key
          </Button>
        </Link>
      </div>
    </div>
  );
}

