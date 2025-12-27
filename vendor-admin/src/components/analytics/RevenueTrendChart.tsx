"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function RevenueTrendChart() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"optionOne" | "optionTwo" | "optionThree">("optionOne");

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#465FFF", "#0ba5ec", "#12b76a"], // Brand, Secondary, Success
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 350,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
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
      y: {
        formatter: (val: number) => `ETB ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
    },
    xaxis: {
      type: "category",
      categories: selectedPeriod === "optionOne" 
        ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        : selectedPeriod === "optionTwo"
        ? ["Q1", "Q2", "Q3", "Q4"]
        : ["2021", "2022", "2023", "2024"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val: number) => `ETB ${(val / 1000).toFixed(0)}K`,
      },
    },
  };

  // Mock data based on period
  const getSeriesData = () => {
    if (selectedPeriod === "optionOne") {
      return [
        {
          name: "Total Revenue",
          data: [245000, 289000, 312000, 298000, 345000, 378000, 412000, 389000, 425000, 456000, 489000, 512000],
        },
        {
          name: "Confirmed Revenue",
          data: [234000, 276000, 298000, 284000, 329000, 361000, 393000, 371000, 405000, 435000, 466000, 488000],
        },
        {
          name: "Unconfirmed Revenue",
          data: [11000, 13000, 14000, 14000, 16000, 17000, 19000, 18000, 20000, 21000, 23000, 24000],
        },
      ];
    } else if (selectedPeriod === "optionTwo") {
      return [
        {
          name: "Total Revenue",
          data: [846000, 1041000, 1224000, 1457000],
        },
        {
          name: "Confirmed Revenue",
          data: [808000, 994000, 1169000, 1391000],
        },
        {
          name: "Unconfirmed Revenue",
          data: [38000, 47000, 55000, 66000],
        },
      ];
    } else {
      return [
        {
          name: "Total Revenue",
          data: [1250000, 1890000, 2456000, 3120000],
        },
        {
          name: "Confirmed Revenue",
          data: [1195000, 1805000, 2342000, 2975000],
        },
        {
          name: "Unconfirmed Revenue",
          data: [55000, 85000, 114000, 145000],
        },
      ];
    }
  };

  const series = getSeriesData();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Revenue Trends
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Track revenue growth over time
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            <button
              onClick={() => setSelectedPeriod("optionOne")}
              className={`px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${
                selectedPeriod === "optionOne"
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPeriod("optionTwo")}
              className={`px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${
                selectedPeriod === "optionTwo"
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setSelectedPeriod("optionThree")}
              className={`px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${
                selectedPeriod === "optionThree"
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Annually
            </button>
          </div>
          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export Data
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}

