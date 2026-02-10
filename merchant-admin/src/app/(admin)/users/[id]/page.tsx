"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import UserModal from "@/components/users/UserModal";
import UserTransactionHistory from "@/components/users/UserTransactionHistory";
import {
  ChevronLeftIcon,
  PencilIcon,
  UserCircleIcon,
  CheckCircleIcon,
  CloseIcon,
} from "@/icons";
import { useSession } from "@/hooks/useSession";
import { authClient } from "@/lib/auth-client";
import {
  type MerchantUser,
  useGetMerchantUserQuery,
} from "@/lib/services/merchantUsersServiceApi";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const { user: sessionUser } = useSession();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const merchantId = (() => {
    const meta = (sessionUser as any)?.metadata;
    if (meta?.merchantId) return meta.merchantId as string;
    if (meta?.merchant?.id) return meta.merchant.id as string;
    if ((sessionUser as any)?.merchantId) return (sessionUser as any).merchantId as string;
    if ((sessionUser as any)?.merchant?.id) return (sessionUser as any).merchant.id as string;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("merchantId");
      if (stored) return stored;
    }
    return null;
  })();

  const {
    data: user,
    isFetching: isLoading,
    isError,
    refetch,
  } = useGetMerchantUserQuery(
    { merchantId: merchantId ?? "", id: userId },
    { skip: !merchantId || !userId },
  );

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedUser?: MerchantUser) => {
    if (!updatedUser) return;
    refetch();
  };

  const handleBan = async () => {
    if (!user) return;
    
    setError(null);
    setIsProcessing(true);
    
    try {
      // Check if user has a Better Auth userId
      if (!(user as any).userId) {
        setError("User not found or missing Better Auth ID");
        return;
      }

      // Ban user using Better Auth admin API
      await authClient.admin.banUser({
        userId: (user as any).userId,
        banReason: `User banned by merchant admin`,
      });

      setIsBanModalOpen(false);
      await refetch();
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Could not ban user");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnban = async () => {
    if (!user) return;
    
    setError(null);
    setIsProcessing(true);
    
    try {
      // Check if user has a Better Auth userId
      if (!(user as any).userId) {
        setError("User not found or missing Better Auth ID");
        return;
      }

      // Unban user using Better Auth admin API
      await authClient.admin.unbanUser({ userId: (user as any).userId });

      setIsUnbanModalOpen(false);
      await refetch();
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Could not unban user");
    } finally {
      setIsProcessing(false);
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

  // Get user ban status from Better Auth User model
  const isBanned = (user as any)?.user?.banned ?? false;
  const banReason = (user as any)?.user?.banReason;
  
  // Determine effective status: banned takes precedence over MerchantUser status
  const getEffectiveStatus = () => {
    if (isBanned) return "BANNED";
    return user?.status || "UNKNOWN";
  };

  const effectiveStatus = getEffectiveStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (isError || !user) {
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
            {isBanned ? (
              <Button
                variant="outline"
                onClick={() => setIsUnbanModalOpen(true)}
                disabled={isProcessing}
                className="border-success-300 text-success-600 hover:bg-success-50 dark:border-success-800 dark:text-success-400 dark:hover:bg-success-900/20"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Unban User
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsBanModalOpen(true)}
                disabled={isProcessing || user.status === "INVITED"}
                className="border-error-300 text-error-600 hover:bg-error-50 dark:border-error-800 dark:text-error-400 dark:hover:bg-error-900/20"
              >
                <CloseIcon className="w-4 h-4 mr-2" />
                Ban User
              </Button>
            )}
            <Button onClick={handleEdit} startIcon={<PencilIcon className="w-4 h-4" />}>
              Edit User
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
            <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
          </div>
        )}

        {/* User Profile Card */}
        <ComponentCard title="User Information">
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {user.name}
                  </h2>
                  <Badge
                    size="sm"
                    color={
                      effectiveStatus === "BANNED"
                        ? "error"
                        : effectiveStatus === "ACTIVE"
                        ? "success"
                        : effectiveStatus === "INVITED"
                        ? "warning"
                        : "error"
                    }
                  >
                    {effectiveStatus}
                  </Badge>
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
                  Account Status
                </label>
                <p className="text-gray-800 dark:text-white/90">{effectiveStatus}</p>
              </div>

              {isBanned && banReason && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Ban Reason
                  </label>
                  <p className="text-error-600 dark:text-error-400">{banReason}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Account Created
                </label>
                <p className="text-gray-800 dark:text-white/90">
                  {formatDate((user.createdAt ?? new Date().toISOString()) as string)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Last Updated
                </label>
                <p className="text-gray-800 dark:text-white/90">
                  {formatDate(
                    (user.updatedAt ?? user.createdAt ?? new Date().toISOString()) as string,
                  )}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Activity Summary */}
        {/* <ComponentCard title="Activity Summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Member ID
              </p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                {user.id}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <Badge
                size="sm"
                color={
                  user.status === "ACTIVE"
                    ? "success"
                    : user.status === "INVITED"
                    ? "warning"
                    : "error"
                }
              >
                {user.status}
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Role
              </p>
              <span className="text-gray-800 dark:text-white/90 font-medium">{user.role}</span>
            </div>
          </div>
        </ComponentCard> */}

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
        merchantId={merchantId}
        user={user}
        mode="edit"
      />

      {/* Ban Confirmation Modal */}
      <Modal
        isOpen={isBanModalOpen}
        onClose={() => !isProcessing && setIsBanModalOpen(false)}
        className="max-w-[400px] m-4"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
              <CloseIcon className="w-6 h-6 text-error-600 dark:text-error-400" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Ban User
              </h4>
            </div>
          </div>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to ban <strong>{user.name}</strong>? This will
            immediately prevent them from accessing the system. You can unban them later.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBanModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleBan}
              disabled={isProcessing}
              className="bg-error-500 hover:bg-error-600"
            >
              {isProcessing ? "Banning..." : "Ban User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unban Confirmation Modal */}
      <Modal
        isOpen={isUnbanModalOpen}
        onClose={() => !isProcessing && setIsUnbanModalOpen(false)}
        className="max-w-[400px] m-4"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Unban User
              </h4>
            </div>
          </div>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to unban <strong>{user.name}</strong>? This will
            restore their access to the system.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsUnbanModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUnban}
              disabled={isProcessing}
              className="bg-success-500 hover:bg-success-600"
            >
              {isProcessing ? "Unbanning..." : "Unban User"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

