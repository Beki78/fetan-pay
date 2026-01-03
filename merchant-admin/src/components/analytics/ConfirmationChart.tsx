"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function ConfirmationChart() {

  const options: ApexOptions = {
    colors: ["#9CA3AF"], // Gray for Expired
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    labels: ["Expired"],
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit, sans-serif",
      fontSize: "12px",
      markers: {
        size: 8,
        strokeWidth: 0,
      },
      formatter: function(seriesName: string, opts: any) {
        return seriesName + " " + opts.w.globals.series[opts.seriesIndex];
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "12px",
        fontWeight: 600,
        colors: ["#6B7280"],
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280",
            },
            value: {
              show: false,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => "3",
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} payments`,
      },
    },
  };

  const series = [3]; // Expired

  return (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Status Distribution
          </h3>
        </div>
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

