"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const formatAmount = (amount: number | undefined | null) => {
  const safeAmount = amount ?? 0;
  return `${safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
};

interface WalletDepositsChartProps {
  totalDeposits: number;
}

export default function WalletDepositsChart({
  totalDeposits,
}: WalletDepositsChartProps) {
  const options: ApexOptions = {
    colors: ["#12b76a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) =>
        `${(val / 1000).toFixed(1)}K ETB`,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Total Wallet Deposits"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    yaxis: {
      title: {
        text: "Amount (ETB)",
      },
      labels: {
        formatter: (val: number) => `${(val / 1000).toFixed(0)}K`,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) =>
          `${val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ETB`,
      },
    },
  };

  const series = [
    {
      name: "Deposits",
      data: [totalDeposits],
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
      {/* Wallet Analytics Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Wallet Analytics
        </h3>
        <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Deposits
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatAmount(totalDeposits)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Total wallet deposits across all merchants
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
          Deposits Visualization
        </h4>
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[300px]">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

