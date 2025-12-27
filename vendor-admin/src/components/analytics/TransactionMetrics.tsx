"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, DollarLineIcon, CheckCircleIcon, AlertIcon, GroupIcon } from "@/icons";

// Mock data
const mockMetrics = {
  totalPayments: 1247,
  totalRevenue: 2456789.50,
  confirmedPayments: 1189,
  unconfirmedPayments: 45,
  submittedPayments: 13,
  averageTransaction: 1970.25,
  totalVendors: 25,
  activeVendors: 22,
  revenueGrowth: 12.5,
  paymentGrowth: 8.3,
  confirmationRate: 95.3,
};

export default function TransactionMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Payments */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Payments
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {mockMetrics.totalPayments.toLocaleString()}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Avg: ETB {mockMetrics.averageTransaction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            +{mockMetrics.paymentGrowth}%
          </Badge>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-900/20">
          <DollarLineIcon className="text-brand-600 size-6 dark:text-brand-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Revenue
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              ETB {mockMetrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This month
            </p>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            +{mockMetrics.revenueGrowth}%
          </Badge>
        </div>
      </div>

      {/* Confirmation Rate */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl dark:bg-success-900/20">
          <CheckCircleIcon className="text-success-600 size-6 dark:text-success-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Confirmation Rate
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {mockMetrics.confirmationRate}%
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {mockMetrics.confirmedPayments} confirmed
            </p>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            +2.1%
          </Badge>
        </div>
      </div>

      {/* Active Vendors */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Active Vendors
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {mockMetrics.activeVendors}/{mockMetrics.totalVendors}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {Math.round((mockMetrics.activeVendors / mockMetrics.totalVendors) * 100)}% active
            </p>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            +3
          </Badge>
        </div>
      </div>
    </div>
  );
}

