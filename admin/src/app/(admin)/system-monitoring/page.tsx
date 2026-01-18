"use client";

import React, { useEffect, useState } from "react";
import { useGetSystemMetricsQuery } from "@/lib/services/systemMonitoringApi";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";

export default function SystemMonitoringPage() {
  const { data: metrics, isLoading, error, refetch } = useGetSystemMetricsQuery();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-2">Loading system metrics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.data?.message ?? "Failed to load system metrics";
    return (
      <div className="space-y-6">
        <Alert variant="error" title="Error" message={errorMessage} />
      </div>
    );
  }

  if (!metrics) return null;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "error";
    if (percentage >= 70) return "warning";
    return "success";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            System Monitoring
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time system performance metrics and resource usage
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh
          </label>
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
            </select>
          )}
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* System Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={`${metrics.cpu.usage.toFixed(2)}%`}
          subtitle={`${metrics.cpu.cores} cores`}
          color={getStatusColor(metrics.cpu.usage)}
          details={metrics.cpu.model}
        />
        <MetricCard
          title="Memory Usage"
          value={metrics.formatted.memory.percentage}
          subtitle={`${metrics.formatted.memory.used} / ${metrics.formatted.memory.total}`}
          color={getStatusColor(metrics.memory.percentage)}
          details={`Free: ${metrics.formatted.memory.free}`}
        />
        <MetricCard
          title="Disk Usage"
          value={metrics.formatted.disk.percentage}
          subtitle={`${metrics.formatted.disk.used} / ${metrics.formatted.disk.total}`}
          color={getStatusColor(metrics.disk.percentage)}
          details={`Free: ${metrics.formatted.disk.free}`}
        />
        <MetricCard
          title="System Uptime"
          value={metrics.formatted.system.uptime}
          subtitle={metrics.formatted.system.hostname}
          color="info"
          details={`Process: ${metrics.formatted.system.processUptime}`}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">CPU Information</h2>
          <div className="space-y-3">
            <InfoRow label="Model" value={metrics.cpu.model} />
            <InfoRow label="Cores" value={metrics.cpu.cores.toString()} />
            <InfoRow label="Usage" value={`${metrics.cpu.usage.toFixed(2)}%`} />
            <InfoRow
              label="Load Average"
              value={`${metrics.cpu.loadAverage.map((v) => v.toFixed(2)).join(", ")}`}
            />
          </div>
        </div>

        {/* Memory Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Memory Information</h2>
          <div className="space-y-3">
            <InfoRow label="Total" value={metrics.formatted.memory.total} />
            <InfoRow label="Used" value={metrics.formatted.memory.used} />
            <InfoRow label="Free" value={metrics.formatted.memory.free} />
            <InfoRow label="Usage" value={metrics.formatted.memory.percentage} />
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className={`h-2.5 rounded-full ${
                    metrics.memory.percentage >= 90
                      ? "bg-error-500"
                      : metrics.memory.percentage >= 70
                      ? "bg-warning-500"
                      : "bg-success-500"
                  }`}
                  style={{ width: `${Math.min(100, metrics.memory.percentage)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Disk Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Disk Information</h2>
          <div className="space-y-3">
            <InfoRow label="Total" value={metrics.formatted.disk.total || "N/A"} />
            <InfoRow label="Used" value={metrics.formatted.disk.used || "N/A"} />
            <InfoRow label="Free" value={metrics.formatted.disk.free || "N/A"} />
            <InfoRow label="Usage" value={metrics.formatted.disk.percentage || "N/A"} />
            {metrics.disk.total > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className={`h-2.5 rounded-full ${
                      metrics.disk.percentage >= 90
                        ? "bg-error-500"
                        : metrics.disk.percentage >= 70
                        ? "bg-warning-500"
                        : "bg-success-500"
                    }`}
                    style={{ width: `${Math.min(100, metrics.disk.percentage)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Information</h2>
          <div className="space-y-3">
            <InfoRow label="Platform" value={metrics.system.platform} />
            <InfoRow label="Architecture" value={metrics.system.arch} />
            <InfoRow label="Hostname" value={metrics.system.hostname} />
            <InfoRow label="Node Version" value={metrics.system.nodeVersion} />
            <InfoRow label="System Uptime" value={metrics.formatted.system.uptime} />
            <InfoRow label="Process Uptime" value={metrics.formatted.system.processUptime} />
          </div>
        </div>

        {/* Process Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Process Information</h2>
          <div className="space-y-3">
            <InfoRow label="PID" value={metrics.process.pid.toString()} />
            <InfoRow label="RSS Memory" value={metrics.formatted.process.memoryUsage.rss} />
            <InfoRow label="Heap Total" value={metrics.formatted.process.memoryUsage.heapTotal} />
            <InfoRow label="Heap Used" value={metrics.formatted.process.memoryUsage.heapUsed} />
            <InfoRow label="External" value={metrics.formatted.process.memoryUsage.external} />
          </div>
        </div>

        {/* Network Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Network Interfaces</h2>
          <div className="space-y-4">
            {metrics.network.interfaces.length > 0 ? (
              metrics.network.interfaces.map((iface, idx) => (
                <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">{iface.name}</div>
                  <div className="text-sm space-y-1">
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">IP:</span> {iface.address}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Netmask:</span> {iface.netmask}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">MAC:</span> {iface.mac}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">No network interfaces found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: "success" | "warning" | "error" | "info";
  details?: string;
}

function MetricCard({ title, value, subtitle, color, details }: MetricCardProps) {
  const colorClasses = {
    success: "text-success-600 dark:text-success-400",
    warning: "text-warning-600 dark:text-warning-400",
    error: "text-error-600 dark:text-error-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</div>
      <div className={`text-3xl font-bold mb-1 ${colorClasses[color]}`}>{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</div>
      {details && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">{details}</div>
      )}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

