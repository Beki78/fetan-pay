"use client";
import React from "react";
import UsersStats from "@/components/users/UsersStats";
import UsersTable from "@/components/users/UsersTable";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">Merchants</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review merchant signups and approvals</p>
      </div>

      {/* Stats Cards (can be updated later for merchant KPIs) */}
      <UsersStats />

      {/* Merchants Table */}
      <UsersTable />
    </div>
  );
}
