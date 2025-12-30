"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, DollarLineIcon, CheckCircleIcon, AlertIcon, TimeIcon } from "@/icons";

// Mock data
const mockStats = {
  totalTips: 125450.75,
  pendingPayouts: 23450.25,
  paidPayouts: 102000.50,
  totalVendors: 45,
  totalTransactions: 1247,
  averageTip: 100.60,
};

export default function TipsOverview() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Tips */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-900/20">
          <DollarLineIcon className="text-brand-600 size-6 dark:text-brand-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Tips Collected
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              ETB {mockStats.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {mockStats.totalTransactions} transactions from {mockStats.totalVendors} vendors
            </p>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            +15.2%
          </Badge>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl dark:bg-warning-900/20">
          <TimeIcon className="text-warning-600 size-6 dark:text-warning-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pending Payouts
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              ETB {mockStats.pendingPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Awaiting payout to vendors
            </p>
          </div>
          <Badge color="warning">
            {mockStats.pendingPayouts > 0 ? "Pending" : "None"}
          </Badge>
        </div>
      </div>

      {/* Paid Payouts */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl dark:bg-success-900/20">
          <CheckCircleIcon className="text-success-600 size-6 dark:text-success-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Paid Payouts
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              ETB {mockStats.paidPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Paid to service providers
            </p>
          </div>
          <Badge color="success">
            <CheckCircleIcon />
            Paid
          </Badge>
        </div>
      </div>
    </div>
  );
}

