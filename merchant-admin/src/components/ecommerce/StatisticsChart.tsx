"use client";
import { useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useGetStatisticsTrendQuery } from "@/lib/services/dashboardServiceApi";
import { useSubscription } from "@/hooks/useSubscription";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface StatisticsChartProps {
  period?: string;
}

export default function StatisticsChart({ period }: StatisticsChartProps) {
  const { canAccessFeature } = useSubscription();
  const hasAdvancedAnalytics = canAccessFeature('advancedAnalytics');
  
  const { data: trendData, isLoading, isError } = useGetStatisticsTrendQuery(
    period ? { period } : undefined,
    { skip: !hasAdvancedAnalytics } // Don't fetch if user doesn't have access
  );

  // Deep clone the data to avoid "object is not extensible" error from ApexCharts
  // RTK Query returns frozen objects which ApexCharts tries to mutate
  const { categories, series } = useMemo(() => {
    const defaultSeries = [
      { name: "Revenue", data: [] as number[] },
      { name: "Users", data: [] as number[] },
      { name: "Tips", data: [] as number[] },
    ];
    
    if (!trendData) {
      return { categories: [] as string[], series: defaultSeries };
    }
    
    // Deep clone to make objects mutable
    return {
      categories: [...(trendData.categories || [])],
      series: (trendData.series || defaultSeries).map(s => ({
        name: s.name,
        data: [...(s.data || [])],
      })),
    };
  }, [trendData]);

  const options: ApexOptions = useMemo(() => ({
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#10B981", "#3B82F6", "#9333EA"], // Green (Revenue), Blue (Users), Purple (Tips)
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
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
      shared: true,
      intersect: false,
    },
    xaxis: {
      type: "category",
      categories: categories,
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
      },
    },
  }), [categories]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Revenue, Users, and Tips trend
          </p>
        </div>
        <div className="h-[310px] bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (isError) {
    // Don't show error messages on analytics - just show empty state with empty chart
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Revenue, Users, and Tips trend
          </p>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px] xl:min-w-full">
            <ReactApexChart
              options={options}
              series={[
                { name: "Revenue", data: [] },
                { name: "Users", data: [] },
                { name: "Tips", data: [] },
              ]}
              type="area"
              height={310}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Statistics
        </h3>
        <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Revenue, Users, and Tips trend
        </p>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}
