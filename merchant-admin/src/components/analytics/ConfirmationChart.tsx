"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useGetStatusDistributionQuery } from "@/lib/services/dashboardServiceApi";
import { useSubscription } from "@/hooks/useSubscription";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ConfirmationChartProps {
  period?: string;
}

export default function ConfirmationChart({ period }: ConfirmationChartProps) {
  const { canAccessFeature } = useSubscription();
  const hasAdvancedAnalytics = canAccessFeature('advancedAnalytics');
  
  const { data: statusData, isLoading, isError } =
    useGetStatusDistributionQuery(
      period ? { period } : undefined,
      { skip: !hasAdvancedAnalytics } // Don't fetch if user doesn't have access
    );

  // Compute labels and colors based on available data
  const labels = statusData
    ? ["Verified", "Pending", "Failed"].filter((label) => {
        if (label === "Verified") return statusData.verified > 0;
        if (label === "Pending") return statusData.pending > 0;
        if (label === "Failed") return statusData.failed > 0;
        return false;
      })
    : ["Expired"];

  const colors = statusData
    ? [
        ...(statusData.verified > 0 ? ["#10B981"] : []), // Green for Verified
        ...(statusData.pending > 0 ? ["#F59E0B"] : []), // Orange for Pending
        ...(statusData.failed > 0 ? ["#EF4444"] : []), // Red for Failed
      ]
    : ["#9CA3AF"]; // Gray fallback

  const options: ApexOptions = {
    colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    labels,
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
              formatter: () => String(statusData?.total || 0),
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

  const series = statusData
    ? [
        statusData.verified,
        statusData.pending,
        statusData.failed,
      ].filter((val) => val > 0)
    : [0];

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Status Distribution
            </h3>
          </div>
        </div>
        <div className="h-[300px] bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (isError || !statusData || statusData.total === 0) {
    // Don't show error messages - show empty state with empty chart
    const emptyOptions: ApexOptions = {
      colors: ["#E5E7EB"], // Light gray for empty state
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "donut",
        height: 300,
        toolbar: {
          show: false,
        },
      },
      labels: ["No Data"],
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
      },
      dataLabels: {
        enabled: false,
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
                formatter: () => "0",
              },
            },
          },
        },
      },
      tooltip: {
        enabled: false,
      },
    };

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
              options={emptyOptions}
              series={[1]}
              type="donut"
              height={300}
            />
          </div>
        </div>
      </div>
    );
  }

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

