"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, BoltIcon, CheckCircleIcon, AlertIcon, TimeIcon } from "@/icons";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Mock data
const mockAnalytics = {
  totalCalls: 15900,
  successCalls: 15700,
  failedCalls: 200,
  averageResponseTime: 245,
  rateLimitUsed: 75,
  rateLimitTotal: 10000,
  errorRate: 1.26,
};

const usageTrendData = {
  series: [
    {
      name: "API Calls",
      data: [1200, 1350, 1420, 1580, 1650, 1720, 1800],
    },
  ],
  options: {
    chart: {
      type: "line",
      toolbar: { show: false },
      height: 350,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    colors: ["#3B82F6"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
  },
};

const endpointDistributionData = {
  series: [45, 30, 15, 10],
  options: {
    chart: {
      type: "donut",
      height: 350,
    },
    labels: ["/verify", "/list", "/status", "Other"],
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
    legend: {
      position: "bottom",
    },
  },
};

export default function UsageAnalytics() {
  const successRate = mockAnalytics.totalCalls > 0
    ? ((mockAnalytics.successCalls / mockAnalytics.totalCalls) * 100).toFixed(1)
    : "0";

  const rateLimitPercentage = (mockAnalytics.rateLimitUsed / mockAnalytics.rateLimitTotal) * 100;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total API Calls */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-900/20">
            <BoltIcon className="text-brand-600 size-6 dark:text-brand-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total API Calls
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {mockAnalytics.totalCalls.toLocaleString()}
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Last 30 days
              </p>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              +12.5%
            </Badge>
          </div>
        </div>

        {/* Success Rate */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl dark:bg-success-900/20">
            <CheckCircleIcon className="text-success-600 size-6 dark:text-success-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Success Rate
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {successRate}%
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {mockAnalytics.successCalls.toLocaleString()} successful
              </p>
            </div>
            <Badge color="success">
              {successRate}%
            </Badge>
          </div>
        </div>

        {/* Average Response Time */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl dark:bg-warning-900/20">
            <TimeIcon className="text-warning-600 size-6 dark:text-warning-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Avg Response Time
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {mockAnalytics.averageResponseTime}ms
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Last 30 days
              </p>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              -5.2%
            </Badge>
          </div>
        </div>

        {/* Rate Limit Usage */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-info-100 rounded-xl dark:bg-info-900/20">
            <AlertIcon className="text-info-600 size-6 dark:text-info-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Rate Limit Usage
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {rateLimitPercentage.toFixed(1)}%
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {mockAnalytics.rateLimitUsed.toLocaleString()} / {mockAnalytics.rateLimitTotal.toLocaleString()}
              </p>
            </div>
            <Badge color={rateLimitPercentage > 80 ? "error" : rateLimitPercentage > 60 ? "warning" : "success"}>
              {rateLimitPercentage.toFixed(0)}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trend Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Usage Trend (Last 7 Days)
          </h3>
          {typeof window !== "undefined" && (
            <Chart
              options={usageTrendData.options}
              series={usageTrendData.series}
              type="line"
              height={350}
            />
          )}
        </div>

        {/* Endpoint Distribution Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Endpoint Distribution
          </h3>
          {typeof window !== "undefined" && (
            <Chart
              options={endpointDistributionData.options}
              series={endpointDistributionData.series}
              type="donut"
              height={350}
            />
          )}
        </div>
      </div>
    </div>
  );
}

