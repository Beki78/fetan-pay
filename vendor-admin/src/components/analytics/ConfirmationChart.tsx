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

export default function ConfirmationChart() {
  const [isOpen, setIsOpen] = useState(false);

  const options: ApexOptions = {
    colors: ["#12b76a", "#f59e0b", "#ef4444"], // Success, Warning, Error
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    labels: ["Confirmed", "Submitted", "Unconfirmed"],
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit, sans-serif",
      fontSize: "12px",
      markers: {
        width: 8,
        height: 8,
        radius: 4,
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
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
              formatter: (val: string) => {
                const num = parseInt(val);
                if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
                return num.toString();
              },
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => "1,247",
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

  const series = [1189, 13, 45]; // Confirmed, Submitted, Unconfirmed

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Confirmation Status
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Distribution of payment confirmations
          </p>
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

