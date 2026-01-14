"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useGetTransactionTrendQuery } from "@/lib/services/dashboardServiceApi";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface RevenueTrendChartProps {
  period?: string;
}

export default function RevenueTrendChart({ period }: RevenueTrendChartProps) {
  const { data: trendData, isLoading, isError } = useGetTransactionTrendQuery(
    period ? { period } : undefined
  );

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
      markers: {
        size: 8,
        strokeWidth: 0,
      },
    },
    colors: ["#9333EA", "#10B981", "#F59E0B", "#EF4444"], // Purple (Total), Green (Verified), Orange (Pending), Red (Failed)
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 350,
      type: "line",
      toolbar: {
        show: true,
        tools: {
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2, 2, 2],
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
    },
    xaxis: {
      type: "category",
      categories: trendData?.categories || [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
          colors: "#6B7280",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: "#6B7280",
        },
        formatter: (val: number) => val.toString(),
      },
    },
  };

  // Use real data from API or fallback to empty data
  const series = trendData?.series || [
    { name: "Total", data: [] },
    { name: "Verified", data: [] },
    { name: "Pending", data: [] },
    { name: "Failed", data: [] },
  ];

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Transaction Trend
            </h3>
          </div>
        </div>
        <div className="h-[350px] bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (isError || !trendData) {
    return (
      <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-5 pt-5 dark:border-red-800 dark:bg-red-900/20 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Transaction Trend
            </h3>
          </div>
        </div>
        <p className="text-red-600 dark:text-red-400">
          Failed to load transaction trend data. Please try again later.
        </p>
      </div>
    );
  }

  return (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Transaction Trend
          </h3>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}

