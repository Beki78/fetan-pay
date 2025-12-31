"use client";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon, PencilIcon, TrashBinIcon, UserCircleIcon, CheckCircleIcon } from "@/icons";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";

// Mock data
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: "Active" | "Inactive" | "Pending";
  paymentVerified: boolean;
  lastActive: string;
  transactions: number;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+251 911 234 567",
    role: "Sales Representative",
    department: "Sales",
    status: "Active",
    paymentVerified: true,
    lastActive: "2024-01-15T10:30:00Z",
    transactions: 245,
    avatar: "/images/user/user-01.png",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+251 922 345 678",
    role: "Waiter",
    department: "Service",
    status: "Active",
    paymentVerified: true,
    lastActive: "2024-01-14T15:20:00Z",
    transactions: 189,
    avatar: "/images/user/user-02.png",
  },
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael.j@example.com",
    phone: "+251 933 456 789",
    role: "Cashier",
    department: "Finance",
    status: "Pending",
    paymentVerified: false,
    lastActive: "2024-01-10T09:15:00Z",
    transactions: 156,
    avatar: "/images/user/user-03.png",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "+251 944 567 890",
    role: "Manager",
    department: "Operations",
    status: "Active",
    paymentVerified: true,
    lastActive: "2024-01-15T11:45:00Z",
    transactions: 312,
    avatar: "/images/user/user-04.png",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+251 955 678 901",
    role: "Sales Representative",
    department: "Sales",
    status: "Inactive",
    paymentVerified: false,
    lastActive: "2024-01-13T14:30:00Z",
    transactions: 278,
    avatar: "/images/user/user-05.png",
  },
];

const formatLastActive = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

interface UserTableProps {
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onView: (user: User) => void;
}

export default function UserTable({
  onEdit,
  onDelete,
  onView,
}: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Pending">("All");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get unique roles for filter
  const roles = useMemo(() => {
    const uniqueRoles = Array.from(
      new Set(mockUsers.map((u) => u.role))
    );
    return ["All", ...uniqueRoles];
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [searchQuery, statusFilter, roleFilter]);

  const handleDropdownToggle = (userId: string) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "All" | "Active" | "Inactive" | "Pending")
            }
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    User
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Contact
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Role
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Department
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Payment Verified
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Transactions
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Last Active
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {user.avatar ? (
                              <Image
                                width={40}
                                height={40}
                                src={user.avatar}
                                alt={user.name}
                                className="object-cover"
                              />
                            ) : (
                              <UserCircleIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {user.name}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              ID: {user.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div>
                          <span className="block text-gray-800 text-theme-sm dark:text-white/90">
                            {user.email}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {user.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.role}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.department}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge
                          size="sm"
                          color={
                            user.status === "Active"
                              ? "success"
                              : user.status === "Pending"
                              ? "warning"
                              : "error"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {user.paymentVerified ? (
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-success-500" />
                            <span className="text-success-500 text-theme-sm font-medium">Verified</span>
                          </div>
                        ) : (
                          <Badge size="sm" color="warning">
                            Not Verified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {user.transactions}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatLastActive(user.lastActive)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div className="relative">
                          <button
                            onClick={() => handleDropdownToggle(user.id)}
                            className="dropdown-toggle flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <MoreDotIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </button>
                          <Dropdown
                            isOpen={openDropdown === user.id}
                            onClose={() => setOpenDropdown(null)}
                          >
                            <DropdownItem
                              onClick={() => {
                                onView(user);
                                setOpenDropdown(null);
                              }}
                              className="dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center gap-2">
                                <UserCircleIcon className="w-4 h-4" />
                                View Details
                              </div>
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                onEdit(user);
                                setOpenDropdown(null);
                              }}
                              className="dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center gap-2">
                                <PencilIcon className="w-4 h-4" />
                                Edit
                              </div>
                            </DropdownItem>
                            {!user.paymentVerified && (
                              <DropdownItem
                                onClick={() => {
                                  // Handle payment verification
                                  console.log("Verify payment for:", user.id);
                                  setOpenDropdown(null);
                                }}
                                className="dark:text-gray-300 dark:hover:bg-gray-800"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Verify Payment
                                </div>
                              </DropdownItem>
                            )}
                            <DropdownItem
                              onClick={() => {
                                onDelete(user.id);
                                setOpenDropdown(null);
                              }}
                              className="text-error-500 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"
                            >
                              <div className="flex items-center gap-2">
                                <TrashBinIcon className="w-4 h-4" />
                                {user.status === "Active"
                                  ? "Deactivate"
                                  : "Delete"}
                              </div>
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <p>
          Showing {filteredUsers.length} of {mockUsers.length} users
        </p>
      </div>
    </div>
  );
}

