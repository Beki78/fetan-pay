"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MessageComposer from "@/components/communications/MessageComposer";

export default function CommunicationsPage() {
  const pathname = usePathname();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Communications
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Send emails and SMS messages to merchants and users
        </p>
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mt-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            href="/communications"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              pathname === '/communications'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Compose Message
          </Link>
          <Link
            href="/communications/campaigns"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              pathname === '/communications/campaigns'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Campaigns
          </Link>
          <Link
            href="/communications/analytics"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              pathname === '/communications/analytics'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Analytics
          </Link>
          <Link
            href="/communications/logs"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              pathname === '/communications/logs'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Email Logs
          </Link>
        </div>
      </div>

      <MessageComposer />
    </div>
  );
}