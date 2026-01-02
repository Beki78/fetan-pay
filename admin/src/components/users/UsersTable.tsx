"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import Button from "../ui/button/Button";

// Mock user data
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentPlan: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  totalTransactions: number;
}

const mockUsers: User[] = [
  {
    id: "USR001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    currentPlan: "Premium",
    status: "active",
    joinDate: "2024-01-15",
    totalTransactions: 245
  },
  {
    id: "USR002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    currentPlan: "Intermediate",
    status: "active",
    joinDate: "2024-02-20",
    totalTransactions: 89
  },
  {
    id: "USR003",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
    currentPlan: "Enterprise",
    status: "active",
    joinDate: "2023-12-10",
    totalTransactions: 567
  },
  {
    id: "USR004",
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@example.com",
    currentPlan: "Early Access",
    status: "pending",
    joinDate: "2024-01-28",
    totalTransactions: 12
  },
  {
    id: "USR005",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@example.com",
    currentPlan: "Premium",
    status: "inactive",
    joinDate: "2023-11-05",
    totalTransactions: 156
  },
];

export default function UsersTable() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 dark:text-green-400";
      case "inactive":
        return "text-red-600 dark:text-red-400";
      case "pending":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Users</h3>
        {/* <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0">
          + Add User
        </Button> */}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
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
                  First Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Last Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Current Plan
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
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Transactions
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                mockUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                  >
                    <TableCell className="px-5 py-4">
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {user.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {user.firstName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {user.lastName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {user.currentPlan}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">
                      {user.totalTransactions}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Link href={`/users/${user.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                        >
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
