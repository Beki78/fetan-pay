"use client";
import React from "react";
import Link from "next/link";
import Badge from "../ui/badge/Badge";
import { ArrowRightIcon } from "@/icons";
import AlertBanner from "../ui/alert/AlertBanner";

interface SubscriptionProps {
  hasActiveSubscription?: boolean;
  verificationsUsed?: number;
  verificationsLimit?: number;
  daysRemaining?: number;
  planName?: string;
}

export default function Subscription({
  hasActiveSubscription = false,
  verificationsUsed = 0,
  verificationsLimit = 100,
  daysRemaining = 1,
  planName = "Free",
}: SubscriptionProps) {
  const usagePercentage = verificationsLimit > 0 
    ? Math.min((verificationsUsed / verificationsLimit) * 100, 100)
    : 0;

  // If no active subscription, show alert
  if (!hasActiveSubscription) {
    return (
      <AlertBanner
        variant="warning"
        title="No Active Subscription"
        message="Subscribe to a plan to start verifying payments via API."
        action={{
          label: "View Plans",
          href: "/billing",
        }}
        className="border-2 border-dashed"
      />
    );
  }

  // Active subscription view
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Subscription
          </h3>
          
          {/* Verifications Used */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Verifications Used
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {verificationsUsed} / {verificationsLimit}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 dark:bg-purple-400 transition-all duration-300"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          {/* Days Remaining */}
          {/* <div className="mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Days Remaining{" "}
              <span className="font-medium text-gray-800 dark:text-white">
                {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
              </span>
            </span>
          </div> */}

          {/* Manage Subscription Link */}
          <Link
            href="/billing"
            className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            Manage Subscription
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Plan Badge */}
        <div className="ml-6 shrink-0 flex items-start">
          <Badge
            color={planName === "Free" ? "success" : "primary"}
            size="sm"
          >
            {planName}
          </Badge>
        </div>
      </div>
    </div>
  );
}

