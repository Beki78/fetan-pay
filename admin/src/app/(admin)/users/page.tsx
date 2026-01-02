"use client";
import React from "react";
import UsersStats from "@/components/users/UsersStats";
import UsersTable from "@/components/users/UsersTable";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">Users Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage and monitor all platform users</p>
      </div>

      {/* Stats Cards */}
      <UsersStats />

      {/* Users Table */}
      <UsersTable />
    </div>
  );
}
