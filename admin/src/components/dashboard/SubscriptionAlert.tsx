"use client";
import React from "react";
import Button from "../ui/button/Button";
import { AlertIcon } from "@/icons";
import Link from "next/link";

export default function SubscriptionAlert() {
  return (
    <div className="rounded-xl border-2 border-dashed border-orange-500/50 bg-orange-500/5 p-5 dark:border-orange-500/50 dark:bg-orange-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/20 dark:bg-yellow-500/20 rounded-lg">
            <AlertIcon className="text-yellow-600 dark:text-yellow-400 size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              No Active Subscription. Subscribe to a plan to start verifying payments via API.
            </p>
          </div>
        </div>
        <Link href="/billing">
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white border-0"
          >
            View Plans
          </Button>
        </Link>
      </div>
    </div>
  );
}

