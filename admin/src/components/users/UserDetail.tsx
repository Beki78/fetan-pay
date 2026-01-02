"use client";
import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import { ChevronLeftIcon, MailIcon, CalenderIcon, PlugInIcon, TaskIcon, BoxCubeIcon } from "@/icons";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

// Mock user data
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentPlan: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  totalTransactions: number;
  totalVendors: number;
  planPurchasedDate: string;
  planExpiryDate: string;
  lastLogin: string;
  address?: {
    street: string;
    city: string;
    country: string;
  };
}

// Mock vendor data
interface Vendor {
  id: string;
  username: string;
  totalTransactions: number;
  status: "active" | "inactive";
  joinDate: string;
}

// Mock transaction data
interface Transaction {
  id: string;
  code: string;
  amount: number;
  status: "confirmed" | "pending" | "unconfirmed";
  date: string;
  vendor: string;
}

const mockUsers: User[] = [
  {
    id: "USR001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+251 911 123 456",
    currentPlan: "Premium",
    status: "active",
    joinDate: "2024-01-15",
    totalTransactions: 245,
    totalVendors: 12,
    planPurchasedDate: "2024-01-15",
    planExpiryDate: "2025-01-15",
    lastLogin: "2024-01-28",
    address: {
      street: "123 Main St",
      city: "Addis Ababa",
      country: "Ethiopia"
    }
  },
  {
    id: "USR002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+251 922 987 654",
    currentPlan: "Intermediate",
    status: "active",
    joinDate: "2024-02-20",
    totalTransactions: 89,
    totalVendors: 5,
    planPurchasedDate: "2024-02-20",
    planExpiryDate: "2025-02-20",
    lastLogin: "2024-01-27",
    address: {
      street: "456 Oak Ave",
      city: "Addis Ababa",
      country: "Ethiopia"
    }
  },
];

const mockVendors: Vendor[] = [
  {
    id: "VND001",
    username: "techcorp_vendor",
    totalTransactions: 45,
    status: "active",
    joinDate: "2024-01-20"
  },
  {
    id: "VND002",
    username: "digital_store",
    totalTransactions: 32,
    status: "active",
    joinDate: "2024-01-25"
  },
  {
    id: "VND003",
    username: "retail_plus",
    totalTransactions: 28,
    status: "active",
    joinDate: "2024-02-01"
  },
  {
    id: "VND004",
    username: "commerce_hub",
    totalTransactions: 19,
    status: "inactive",
    joinDate: "2024-02-10"
  },
  {
    id: "VND005",
    username: "market_place",
    totalTransactions: 67,
    status: "active",
    joinDate: "2024-01-30"
  }
];

const mockTransactions: Transaction[] = [
  {
    id: "TXN001",
    code: "TXNVMSUQ18DKW",
    amount: 1500.00,
    status: "confirmed",
    date: "2024-01-28",
    vendor: "techcorp_vendor"
  },
  {
    id: "TXN002",
    code: "TXNABC123XYZ",
    amount: 2500.00,
    status: "confirmed",
    date: "2024-01-27",
    vendor: "digital_store"
  },
  {
    id: "TXN003",
    code: "TXNDEF456UVW",
    amount: 800.00,
    status: "pending",
    date: "2024-01-26",
    vendor: "retail_plus"
  },
  {
    id: "TXN004",
    code: "TXNGHI789OPQ",
    amount: 3200.00,
    status: "confirmed",
    date: "2024-01-25",
    vendor: "market_place"
  },
  {
    id: "TXN005",
    code: "TXNJkl012RST",
    amount: 950.00,
    status: "unconfirmed",
    date: "2024-01-24",
    vendor: "commerce_hub"
  }
];

interface UserDetailProps {
  userId: string;
}

export default function UserDetail({ userId }: UserDetailProps) {
  const [activeTab, setActiveTab] = useState<"detail" | "vendors" | "transactions">("detail");

  // Find the user by ID directly instead of using useEffect
  const user = mockUsers.find(u => u.id === userId) || null;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-2">Loading user...</div>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            If this takes too long, the user ID &quot;{userId}&quot; might not exist.
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 dark:text-green-400";
      case "pending":
        return "text-orange-600 dark:text-orange-400";
      case "unconfirmed":
        return "text-red-600 dark:text-red-400";
      case "active":
        return "text-green-600 dark:text-green-400";
      case "inactive":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "unconfirmed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              User ID: {user.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            Edit User
          </Button>
          <Button
            variant="outline"
            className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900/20"
          >
            Suspend User
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white border-0"
          >
            Delete User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Current Plan */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
              <PlugInIcon className="text-blue-600 dark:text-blue-400 size-5" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
            {user.currentPlan}
          </h4>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Active
          </p>
        </div>

        {/* Total Transactions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
              <TaskIcon className="text-purple-600 dark:text-purple-400 size-5" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
            {user.totalTransactions}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            All time
          </p>
        </div>

        {/* Total Vendors */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
              <BoxCubeIcon className="text-green-600 dark:text-green-400 size-5" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Vendors</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
            {user.totalVendors}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Associated vendors
          </p>
        </div>

        {/* Plan Expiry */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg">
              <CalenderIcon className="text-orange-600 dark:text-orange-400 size-5" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Plan Expires</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
            {new Date(user.planExpiryDate).toLocaleDateString()}
          </h4>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            45 days left
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("detail")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "detail"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Detail
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "vendors"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Vendors ({user.totalVendors})
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "transactions"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Transactions ({user.totalTransactions})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "detail" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Basic Information
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Name
                        </label>
                        <p className="text-gray-900 dark:text-white">{user.firstName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Name
                        </label>
                        <p className="text-gray-900 dark:text-white">{user.lastName}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <div className="flex items-center gap-2">
                        <MailIcon className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900 dark:text-white">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <p className="text-gray-900 dark:text-white">{user.phone}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Join Date
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Login
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan & Subscription Details */}
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Plan & Subscription
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Plan
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">{user.currentPlan}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Purchased Date
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(user.planPurchasedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(user.planExpiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : user.status === 'pending'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                {user.address && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Address Information
                    </h3>

                    <div className="space-y-2">
                      <p className="text-gray-900 dark:text-white">{user.address.street}</p>
                      <p className="text-gray-900 dark:text-white">{user.address.city}</p>
                      <p className="text-gray-900 dark:text-white">{user.address.country}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "vendors" && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                    <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        ID
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        Username
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        Total Transactions
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        Join Date
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockVendors.map((vendor) => (
                      <TableRow
                        key={vendor.id}
                        className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                      >
                        <TableCell className="px-5 py-4">
                          <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                            {vendor.id}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                          {vendor.username}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">
                          {vendor.totalTransactions}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(vendor.status)}`}>
                            {vendor.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(vendor.joinDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                    <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        Transaction Code
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        Amount
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        Vendor
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                      >
                        Date
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                      >
                        <TableCell className="px-5 py-4">
                          <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                            {transaction.code}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">
                          {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                          {transaction.vendor}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
