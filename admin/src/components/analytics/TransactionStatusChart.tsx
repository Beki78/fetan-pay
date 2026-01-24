"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface TransactionStatusChartProps {
  successful: number;
  failed: number;
  pending: number;
  expired: number;
}

export default function TransactionStatusChart({
  successful,
  failed,
  pending,
  expired,
}: TransactionStatusChartProps) {
  const options: ApexOptions = {
    colors: ["#12b76a", "#ef4444", "#f59e0b", "#6b7280"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    labels: ["Successful", "Failed", "Pending", "Expired"],
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit, sans-serif",
      fontSize: "12px",
      markers: {
        size: 8,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "12px",
        fontWeight: 600,
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: "16px",
              fontWeight: 700,
              formatter: (val: string) => {
                const total = successful + failed + pending + expired;
                const value = Math.round((parseFloat(val) / 100) * total);
                return value.toLocaleString();
              },
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
              formatter: () => {
                const total = successful + failed + pending + expired;
                return total.toLocaleString();
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()} transactions`,
      },
    },
  };

  const series = [successful, failed, pending, expired];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Transaction Status Distribution
        </h3>
        <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Breakdown by transaction status
        </p>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[300px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

