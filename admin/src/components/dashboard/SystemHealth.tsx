"use client";
import React from "react";
import { CheckCircleIcon, AlertIcon, ErrorIcon, TimeIcon } from "@/icons";

interface SystemService {
  name: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  uptime: string;
  responseTime: string;
}

const systemServices: SystemService[] = [
  {
    name: "Payment Verification API",
    status: "operational",
    uptime: "99.9%",
    responseTime: "120ms"
  },
  {
    name: "Database",
    status: "operational",
    uptime: "99.8%",
    responseTime: "45ms"
  },
  {
    name: "Bank Integrations",
    status: "degraded",
    uptime: "97.2%",
    responseTime: "350ms"
  },
  {
    name: "Notification Service",
    status: "operational",
    uptime: "99.5%",
    responseTime: "85ms"
  },
  {
    name: "Analytics Engine",
    status: "maintenance",
    uptime: "98.7%",
    responseTime: "200ms"
  },
  {
    name: "Backup System",
    status: "operational",
    uptime: "100%",
    responseTime: "15ms"
  }
];

export default function SystemHealth() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircleIcon className="text-green-600 dark:text-green-400 size-4" />;
      case "degraded":
        return <AlertIcon className="text-orange-600 dark:text-orange-400 size-4" />;
      case "down":
        return <ErrorIcon className="text-red-600 dark:text-red-400 size-4" />;
      case "maintenance":
        return <TimeIcon className="text-blue-600 dark:text-blue-400 size-4" />;
      default:
        return <CheckCircleIcon className="text-gray-600 dark:text-gray-400 size-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-600 dark:text-green-400";
      case "degraded":
        return "text-orange-600 dark:text-orange-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      case "maintenance":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-50 dark:bg-green-900/20";
      case "degraded":
        return "bg-orange-50 dark:bg-orange-900/20";
      case "down":
        return "bg-red-50 dark:bg-red-900/20";
      case "maintenance":
        return "bg-blue-50 dark:bg-blue-900/20";
      default:
        return "bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">System Health</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemServices.map((service, index) => (
          <div
            key={index}
            className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50 ${getStatusBg(service.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(service.status)}
                <span className="font-medium text-gray-800 dark:text-white text-sm">
                  {service.name}
                </span>
              </div>
              <span className={`text-xs font-medium capitalize ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Uptime: {service.uptime}</span>
              <span>Response: {service.responseTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
