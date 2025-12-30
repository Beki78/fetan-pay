"use client";
import React from "react";
import Link from "next/link";
import { AlertIcon, CheckCircleIcon, InfoIcon } from "@/icons";

export type AlertVariant = "warning" | "error" | "success" | "info";

interface AlertBannerProps {
  variant: AlertVariant;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export default function AlertBanner({
  variant,
  title,
  message,
  action,
  className = "",
}: AlertBannerProps) {
  // Variant-specific styles
  const variantStyles = {
    warning: {
      container: "bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/20 dark:border-orange-500/30",
      iconBg: "bg-orange-500/20 dark:bg-orange-500/30",
      icon: "text-orange-600 dark:text-orange-400",
      title: "text-gray-800 dark:text-white",
      message: "text-gray-600 dark:text-gray-400",
      button: "bg-orange-500 hover:bg-orange-600 text-white border-0",
    },
    error: {
      container: "bg-red-500/10 dark:bg-red-500/20 border-red-500/20 dark:border-red-500/30",
      iconBg: "bg-red-500/20 dark:bg-red-500/30",
      icon: "text-red-600 dark:text-red-400",
      title: "text-gray-800 dark:text-white",
      message: "text-gray-600 dark:text-gray-400",
      button: "bg-red-500 hover:bg-red-600 text-white border-0",
    },
    success: {
      container: "bg-green-500/10 dark:bg-green-500/20 border-green-500/20 dark:border-green-500/30",
      iconBg: "bg-green-500/20 dark:bg-green-500/30",
      icon: "text-green-600 dark:text-green-400",
      title: "text-gray-800 dark:text-white",
      message: "text-gray-600 dark:text-gray-400",
      button: "bg-green-500 hover:bg-green-600 text-white border-0",
    },
    info: {
      container: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20 dark:border-blue-500/30",
      iconBg: "bg-blue-500/20 dark:bg-blue-500/30",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-gray-800 dark:text-white",
      message: "text-gray-600 dark:text-gray-400",
      button: "bg-blue-500 hover:bg-blue-600 text-white border-0",
    },
  };

  // Icon component based on variant
  const getIcon = () => {
    const iconClass = `w-5 h-5 ${variantStyles[variant].icon}`;
    switch (variant) {
      case "success":
        return <CheckCircleIcon className={iconClass} />;
      case "error":
      case "warning":
        return <AlertIcon className={iconClass} />;
      case "info":
        return <InfoIcon className={iconClass} />;
    }
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-xl border p-6 ${styles.container} ${className}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${styles.iconBg}`}
        >
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold mb-1 ${styles.title}`}>
            {title}
          </h3>
          <p className={`text-sm ${styles.message}`}>{message}</p>
        </div>

        {/* Action Button */}
        {action && (
          <div className="shrink-0">
            {action.href ? (
              <Link href={action.href}>
                <button
                  onClick={action.onClick}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.button}`}
                >
                  {action.label}
                </button>
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.button}`}
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

