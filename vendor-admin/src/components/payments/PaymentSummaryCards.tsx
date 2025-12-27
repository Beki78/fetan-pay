"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, DollarLineIcon, CheckCircleIcon, AlertIcon } from "@/icons";

// Mock data
const mockStats = {
  totalPayments: 1247,
  totalAmount: 2456789.50,
  confirmed: 1189,
  unconfirmed: 45,
  submitted: 13,
  confirmedPercentage: 95.3,
  unconfirmedPercentage: 3.6,
  submittedPercentage: 1.1,
};

export default function PaymentSummaryCards() {
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
              {mockStats.totalPayments.toLocaleString()}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ETB {mockStats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            +12.5%
          </Badge>
        </div>
      </div>

      {/* Confirmed */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl dark:bg-success-900/20">
          <CheckCircleIcon className="text-success-600 size-6 dark:text-success-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Confirmed
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {mockStats.confirmed.toLocaleString()}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {mockStats.confirmedPercentage}% success rate
            </p>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {mockStats.confirmedPercentage}%
          </Badge>
        </div>
      </div>

      {/* Unconfirmed */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-error-100 rounded-xl dark:bg-error-900/20">
          <AlertIcon className="text-error-600 size-6 dark:text-error-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Unconfirmed
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {mockStats.unconfirmed}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {mockStats.unconfirmedPercentage}% failure rate
            </p>
          </div>
          <Badge color="error">
            <ArrowDownIcon className="text-error-500" />
            {mockStats.unconfirmedPercentage}%
          </Badge>
        </div>
      </div>

      {/* Submitted */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl dark:bg-warning-900/20">
          <AlertIcon className="text-warning-600 size-6 dark:text-warning-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Submitted
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {mockStats.submitted}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Pending confirmation
            </p>
          </div>
          <Badge color="warning">
            {mockStats.submittedPercentage}%
          </Badge>
        </div>
      </div>
    </div>
  );
}

