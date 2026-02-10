"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, DollarLineIcon, CheckCircleIcon, AlertIcon, TimeIcon } from "@/icons";

interface TipsOverviewProps {
  summary?: {
    count: number;
    totalTipAmount: string | null;
  };
  analytics?: {
    totalTips: number;
    totalCount: number;
    averageTip: number;
    byProvider: Array<{
      provider: string;
      totalTips: number;
      count: number;
    }>;
  };
  isLoading?: boolean;
}

export default function TipsOverview({ summary, analytics, isLoading }: TipsOverviewProps) {
  const totalTips = summary?.totalTipAmount ? parseFloat(summary.totalTipAmount) : 0;
  const tipCount = summary?.count || 0;
  const averageTip = analytics?.averageTip || (tipCount > 0 ? totalTips / tipCount : 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Tips */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-900/20">
          <DollarLineIcon className="text-brand-600 size-6 dark:text-brand-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Tips Collected
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              ETB {totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {tipCount} transactions across all merchants
            </p>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            Live
          </Badge>
        </div>
      </div>

      {/* Average Tip */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
          <svg className="text-blue-600 size-6 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Average Tip Amount
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              ETB {averageTip.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Per transaction
            </p>
          </div>
          <Badge color="info">
            Avg
          </Badge>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl dark:bg-success-900/20">
          <CheckCircleIcon className="text-success-600 size-6 dark:text-success-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tip Transactions
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {tipCount.toLocaleString('en-US')}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Verified tip transactions
            </p>
          </div>
          <Badge color="success">
            <CheckCircleIcon />
            Verified
          </Badge>
        </div>
      </div>
    </div>
  );
}

