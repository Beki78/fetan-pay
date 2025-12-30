"use client";
import React from "react";
import { TimeIcon } from "@/icons";

type AccountStatus = "pending" | "active";

interface PendingBannerProps {
  status: AccountStatus;
}

interface StatusPillProps {
  status: AccountStatus;
}

/**
 * Sidebar banner shown only when account status is pending.
 */
export const PendingApprovalBanner: React.FC<PendingBannerProps> = ({
  status,
}) => {
  if (status !== "pending") return null;

  return (
    <div className="mb-6 rounded-lg border border-orange-500/30 bg-orange-500/10 dark:border-orange-500/40 dark:bg-orange-500/15 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 dark:bg-orange-500/25 flex-shrink-0">
          <TimeIcon className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="flex-1 space-y-0.5 min-w-0">
          <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 leading-tight">
            Pending Approval
          </p>
          <p className="text-xs text-orange-600/90 dark:text-orange-400/80 leading-relaxed">
            Limited features
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Header pill for account status.
 * - pending → orange pill
 * - active  → green "Live" pill
 */
export const AccountStatusPill: React.FC<StatusPillProps> = ({ status }) => {
  if (status === "pending") {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 dark:border-orange-500/40 dark:bg-orange-500/15 px-2.5 py-1">
        <span className="h-2 w-2 rounded-full bg-orange-500 dark:bg-orange-400 animate-pulse flex-shrink-0" />
        <span className="text-xs font-medium text-orange-700 dark:text-orange-300 leading-none">
          Pending
        </span>
      </div>
    );
  }

  // Active / live state
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 dark:border-green-500/30 dark:bg-green-500/15 px-2.5 py-1">
      <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse flex-shrink-0" />
      <span className="text-xs font-medium text-green-600 dark:text-green-400 leading-none">
        Live
      </span>
    </div>
  );
};


