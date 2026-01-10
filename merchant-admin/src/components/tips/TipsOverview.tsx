"use client";
import React, { useMemo } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, DollarLineIcon, CheckCircleIcon, AlertIcon, TimeIcon } from "@/icons";
import { useGetTipsSummaryQuery } from "@/lib/services/paymentsServiceApi";

export default function TipsOverview() {
  // Fetch total tips
  const { data: totalTipsData, isLoading: totalLoading } = useGetTipsSummaryQuery({});

  const stats = useMemo(() => {
    const totalTips = totalTipsData?.totalTipAmount ? Number(totalTipsData.totalTipAmount) : 0;
    const totalCount = totalTipsData?.count || 0;
    
    return {
      totalTips,
      totalTransactions: totalCount,
      // For now, pending and paid are the same as total (payout tracking not implemented yet)
      pendingPayouts: totalTips,
      paidPayouts: 0,
      averageTip: totalCount > 0 ? totalTips / totalCount : 0,
    };
  }, [totalTipsData]);

  if (totalLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
          >
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-5" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }
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
              ETB {stats.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {stats.totalTransactions} transaction{stats.totalTransactions !== 1 ? 's' : ''} with tips
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
              ETB {stats.pendingPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Awaiting payout to vendors
            </p>
          </div>
          <Badge color="warning">
            {stats.pendingPayouts > 0 ? "Pending" : "None"}
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
              ETB {stats.paidPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

