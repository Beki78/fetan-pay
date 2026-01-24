"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface TransactionTypeChartProps {
  qr: number;
  cash: number;
  bank: number;
}

export default function TransactionTypeChart({
  qr,
  cash,
  bank,
}: TransactionTypeChartProps) {
  const options: ApexOptions = {
    colors: ["#465fff", "#12b76a", "#f59e0b"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    labels: ["QR Payments", "Cash", "Bank Transfer"],
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
          labels: {
            show: false,
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

  const series = [qr, cash, bank];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Transaction Type Distribution
        </h3>
        <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Breakdown by payment type (QR, Cash, Bank)
        </p>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[300px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="pie"
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

