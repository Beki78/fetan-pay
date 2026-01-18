"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ProviderUsageChartProps {
  providerUsage: Array<{
    provider: string;
    count: number;
    isCustom: boolean;
  }>;
}

const getProviderName = (provider: string) => {
  const providerMap: Record<string, string> = {
    CBE: "Commercial Bank of Ethiopia",
    TELEBIRR: "Telebirr",
    AWASH: "Awash Bank",
    BOA: "Bank of Abyssinia",
    DASHEN: "Dashen Bank",
  };
  return providerMap[provider] || provider;
};

export default function ProviderUsageChart({
  providerUsage,
}: ProviderUsageChartProps) {
  // Sort by count descending and take top 10
  const sortedProviders = [...providerUsage]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const labels = sortedProviders.map((p) => getProviderName(p.provider));
  const series = sortedProviders.map((p) => p.count);

  const options: ApexOptions = {
    colors: [
      "#465fff",
      "#0ba5ec",
      "#12b76a",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#f97316",
      "#6366f1",
    ],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 400,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toLocaleString(),
      offsetX: 0,
      offsetY: 0,
      style: {
        fontSize: "12px",
        fontWeight: 600,
      },
    },
    xaxis: {
      categories: labels,
      title: {
        text: "Number of Transactions",
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: false,
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()} transactions`,
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Provider/Bank Usage
        </h3>
        <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Transaction count by payment provider/bank
        </p>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ReactApexChart
            options={options}
            series={[{ name: "Transactions", data: series }]}
            type="bar"
            height={400}
          />
        </div>
      </div>
    </div>
  );
}

