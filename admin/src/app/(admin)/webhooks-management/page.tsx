"use client";
import React, { useState } from "react";
import WebhooksTable from "@/components/webhooks/WebhooksTable";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import WebhooksStatsCards from "@/components/webhooks/WebhooksStatsCards";

export default function WebhooksManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Webhooks Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage merchant webhook configurations and IP whitelisting
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <WebhooksStatsCards />

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "Inactive")}
              className="h-11 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:focus:border-brand-800"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <Button
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Webhooks Table */}
      <WebhooksTable 
        searchQuery={searchQuery}
        statusFilter={statusFilter}
      />
    </div>
  );
}