"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface DailyTransactionChartProps {
  dailyData?: Array<{
    date: string;
    amount: number;
    tips: number;
  }>;
}

export default function DailyTransactionChart({
  dailyData,
}: DailyTransactionChartProps) {
  // Safety check for undefined or empty data
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Daily Transaction Amount & Tips
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            No data available for the selected date range
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for chart
  const dates = dailyData.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });

  const amounts = dailyData.map((d) => Number(d.amount.toFixed(2)));
  const tips = dailyData.map((d) => Number(d.tips.toFixed(2)));

  const options: ApexOptions = {
    colors: ["#465fff", "#12b76a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 400,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: dates,
      labels: {
        style: {
          fontSize: "12px",
        },
        rotate: -45,
        rotateAlways: false,
      },
      title: {
        text: "Date",
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => {
          return `${val.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })} ETB`;
        },
        style: {
          fontSize: "12px",
        },
      },
      title: {
        text: "Amount (ETB)",
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit, sans-serif",
      fontSize: "14px",
      markers: {
        size: 8,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => {
          return `${val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ETB`;
        },
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  const series = [
    {
      name: "Total Transaction Amount",
      data: amounts,
    },
    {
      name: "Total Tips",
      data: tips,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Daily Transaction Amount & Tips
        </h3>
        <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Daily breakdown of transaction amounts and tips over time
        </p>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={400}
          />
        </div>
      </div>
    </div>
  );
}

