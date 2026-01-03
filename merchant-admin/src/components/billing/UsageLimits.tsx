"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Mock data
const mockUsage = {
  verifications: {
    used: 7845,
    limit: 10000,
    percentage: 78.45,
  },
  apiCalls: {
    used: 12450,
    limit: 50000,
    percentage: 24.9,
  },
  storage: {
    used: 2.5,
    limit: 10,
    percentage: 25,
  },
  overage: 0,
};

export default function UsageLimits() {
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 200,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "70%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "24px",
            fontWeight: "600",
            offsetY: -10,
            color: "#1D2939",
            formatter: function (val) {
              return val.toFixed(1) + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465fff"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Usage"],
  };

  const series = [mockUsage.verifications.percentage];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-6">
        {/* <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          Usage & Limits
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monitor your current usage against plan limits
        </p> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="w-full max-w-[200px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={200}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Verifications Used
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {mockUsage.verifications.used.toLocaleString()} / {mockUsage.verifications.limit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {mockUsage.verifications.limit - mockUsage.verifications.used} remaining this month
            </p>
          </div>
        </div>

        {/* Usage Details */}
        <div className="space-y-4">
          {/* API Calls */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                API Calls
              </span>
              <Badge
                size="sm"
                color={mockUsage.apiCalls.percentage > 80 ? "warning" : "success"}
              >
                {mockUsage.apiCalls.percentage.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                <div
                  className={`h-full transition-all ${
                    mockUsage.apiCalls.percentage > 80
                      ? "bg-warning-500"
                      : "bg-success-500"
                  }`}
                  style={{ width: `${mockUsage.apiCalls.percentage}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mockUsage.apiCalls.used.toLocaleString()} / {mockUsage.apiCalls.limit.toLocaleString()} calls
            </p>
          </div>

          {/* Storage */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Storage
              </span>
              <Badge size="sm" color="success">
                {mockUsage.storage.percentage}%
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: `${mockUsage.storage.percentage}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mockUsage.storage.used} GB / {mockUsage.storage.limit} GB used
            </p>
          </div>

          {/* Overage */}
          {mockUsage.overage > 0 && (
            <div className="p-4 rounded-lg border border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning-800 dark:text-warning-300">
                    Overage Charges
                  </p>
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                    You've exceeded your plan limit
                  </p>
                </div>
                <p className="text-lg font-bold text-warning-800 dark:text-warning-300">
                  ${mockUsage.overage.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

