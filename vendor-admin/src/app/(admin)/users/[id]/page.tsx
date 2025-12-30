"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import UserModal from "@/components/users/UserModal";
import UserTransactionHistory from "@/components/users/UserTransactionHistory";
import Image from "next/image";
import {
  ChevronLeftIcon,
  PencilIcon,
  UserCircleIcon,
  CheckCircleIcon,
  CloseIcon,
} from "@/icons";

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
  createdAt: string;
  lastLogin?: string;
}

// Mock data - In production, fetch from API
const mockUser: User = {
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
  createdAt: "2023-06-15T08:00:00Z",
  lastLogin: "2024-01-15T10:30:00Z",
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 500);
  }, [userId]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedUser: User) => {
    // Update user data
    setUser({ ...user!, ...updatedUser });
    setIsEditModalOpen(false);
    // In production, make API call here
    console.log("Updating user:", updatedUser);
  };

  const handleDeactivate = () => {
    if (user) {
      setUser({ ...user, status: "Inactive" });
      setIsDeactivateModalOpen(false);
      // In production, make API call here
      console.log("Deactivating user:", user.id);
    }
  };

  const handleActivate = () => {
    if (user) {
      setUser({ ...user, status: "Active" });
      setIsActivateModalOpen(false);
      // In production, make API call here
      console.log("Activating user:", user.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400 mb-4">User not found</p>
        <Button onClick={() => router.push("/users")} variant="outline">
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="User Details" />
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/users")}
            startIcon={<ChevronLeftIcon className="w-4 h-4" />}
          >
            Back
          </Button>
          <div className="flex items-center gap-3">
            {user.status === "Active" ? (
              <Button
                variant="outline"
                onClick={() => setIsDeactivateModalOpen(true)}
                className="border-error-300 text-error-600 hover:bg-error-50 dark:border-error-800 dark:text-error-400 dark:hover:bg-error-900/20"
              >
                <CloseIcon className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsActivateModalOpen(true)}
                className="border-success-300 text-success-600 hover:bg-success-50 dark:border-success-800 dark:text-success-400 dark:hover:bg-success-900/20"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Activate
              </Button>
            )}
            <Button onClick={handleEdit} startIcon={<PencilIcon className="w-4 h-4" />}>
              Edit User
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        <ComponentCard title="User Information">
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <Image
                    width={80}
                    height={80}
                    src={user.avatar}
                    alt={user.name}
                    className="object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {user.name}
                  </h2>
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
                  {user.paymentVerified && (
                    <Badge size="sm" color="success">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Payment Verified
                    </Badge>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user.phone}
                </p>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  User ID
                </label>
                <p className="text-gray-800 dark:text-white/90">{user.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Role
                </label>
                <p className="text-gray-800 dark:text-white/90">{user.role}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Department
                </label>
                <p className="text-gray-800 dark:text-white/90">{user.department}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Payment Status
                </label>
                {user.paymentVerified ? (
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-success-500" />
                    <span className="text-success-500 font-medium">Verified</span>
                  </div>
                ) : (
                  <Badge size="sm" color="warning">
                    Not Verified
                  </Badge>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Account Created
                </label>
                <p className="text-gray-800 dark:text-white/90">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Last Active
                </label>
                <p className="text-gray-800 dark:text-white/90">
                  {formatLastActive(user.lastActive)}
                </p>
              </div>

              {user.lastLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Last Login
                  </label>
                  <p className="text-gray-800 dark:text-white/90">
                    {formatDate(user.lastLogin)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Total Transactions
                </label>
                <p className="text-gray-800 dark:text-white/90 font-semibold">
                  {user.transactions}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Activity Summary */}
        <ComponentCard title="Activity Summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Transactions
              </p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                {user.transactions}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
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
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Payment Verified
              </p>
              {user.paymentVerified ? (
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span className="text-success-500 font-medium">Yes</span>
                </div>
              ) : (
                <span className="text-warning-500 font-medium">No</span>
              )}
            </div>
          </div>
        </ComponentCard>

        {/* Transaction History */}
        <ComponentCard title="Transaction History">
          <UserTransactionHistory userId={user.id} />
        </ComponentCard>
      </div>

      {/* Edit User Modal */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        user={user}
        mode="edit"
      />

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        className="max-w-[400px] m-4"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
              <CloseIcon className="w-6 h-6 text-error-600 dark:text-error-400" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Deactivate User
              </h4>
            </div>
          </div>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to deactivate <strong>{user.name}</strong>? This will
            prevent them from accessing the system. You can reactivate them later.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDeactivateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeactivate}
              className="bg-error-500 hover:bg-error-600"
            >
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Activate Confirmation Modal */}
      <Modal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        className="max-w-[400px] m-4"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Activate User
              </h4>
            </div>
          </div>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to activate <strong>{user.name}</strong>? This will
            restore their access to the system.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsActivateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleActivate}
              className="bg-success-500 hover:bg-success-600"
            >
              Activate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

