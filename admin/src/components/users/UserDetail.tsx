"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import { Modal } from "../ui/modal";
import {
  useApproveMerchantMutation,
  useGetMerchantQuery,
  useMarkMerchantViewedMutation,
  useRejectMerchantMutation,
  useDeactivateUserMutation,
  useActivateUserMutation,
  useNotifyMerchantBanMutation,
  useNotifyMerchantUnbanMutation,
} from "@/lib/redux/features/merchantsApi";
import { useListAllPaymentsQuery } from "@/lib/services/adminApi";
import { useGetMerchantBrandingQuery } from "@/lib/services/brandingApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import MerchantStatsCard from "./MerchantStatsCard";
import MerchantBrandingCard from "../branding/MerchantBrandingCard";
import { authClient } from "@/lib/auth-client";

interface UserDetailProps {
  userId: string;
}

const statusBadge = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "PENDING":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "BANNED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-gray-900 dark:text-white font-medium">{value ?? "-"}</p>
  </div>
);

export default function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter();
  const shouldSkip = !userId;
  const { data: merchant, isLoading, isError, refetch } = useGetMerchantQuery(userId, { skip: shouldSkip });
  const { data: brandingData } = useGetMerchantBrandingQuery(userId, { skip: shouldSkip || !merchant });
  const [approve, { isLoading: approving }] = useApproveMerchantMutation();
  const [reject, { isLoading: rejecting }] = useRejectMerchantMutation();
  const [markViewed] = useMarkMerchantViewedMutation();
  const [deactivateUser, { isLoading: deactivating }] = useDeactivateUserMutation();
  const [activateUser, { isLoading: activating }] = useActivateUserMutation();
  const [notifyBan] = useNotifyMerchantBanMutation();
  const [notifyUnban] = useNotifyMerchantUnbanMutation();
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | "approve" | "reject" | "ban" | "unban">(null);
  const [isBanning, setIsBanning] = useState(false);
  const [isUnbanning, setIsUnbanning] = useState(false);

  useEffect(() => {
    if (!userId) return;
    markViewed({ id: userId }).catch(() => null);
  }, [markViewed, userId]);

  const owner = useMemo(
    () => merchant?.users?.find((u) => u.role === "MERCHANT_OWNER") || null,
    [merchant?.users]
  );

  const handleApprove = async () => {
    if (!merchant) return;
    setError(null);
    try {
      // First, unban all users associated with this merchant using Better Auth admin API
      const userIds = merchant.users
        .map((u: any) => u.userId)
        .filter((id: string | null | undefined) => id != null);

      // Unban all users in parallel
      await Promise.all(
        userIds.map((userId: string) =>
          authClient.admin.unbanUser({ userId })
        )
      );

      // Then approve the merchant (this will activate invited users)
      await approve({ id: merchant.id }).unwrap();
      await refetch();
      setConfirmAction(null);
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Could not approve merchant");
    }
  };

  const handleReject = async () => {
    if (!merchant) return;
    setError(null);
    try {
      // First, ban all users associated with this merchant using Better Auth admin API
      const userIds = merchant.users
        .map((u: any) => u.userId)
        .filter((id: string | null | undefined) => id != null);

      // Ban all users in parallel
      await Promise.all(
        userIds.map((userId: string) =>
          authClient.admin.banUser({
            userId,
            banReason: `Merchant ${merchant.name} rejected by admin`,
          })
        )
      );

      // Then reject the merchant (this will set status to PENDING)
      await reject({ id: merchant.id }).unwrap();
      await refetch();
      setConfirmAction(null);
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Could not reject merchant");
    }
  };

  const handleBanMerchant = async () => {
    if (!merchant) return;
    setError(null);
    setIsBanning(true);
    try {
      // Ban all users associated with this merchant using Better Auth admin API
      const userIds = merchant.users
        .map((u: any) => u.userId)
        .filter((id: string | null | undefined) => id != null);

      // Ban all users in parallel
      await Promise.all(
        userIds.map((userId: string) =>
          authClient.admin.banUser({
            userId,
            banReason: `Merchant ${merchant.name} banned by admin`,
          })
        )
      );

      // Send ban notification email
      try {
        await notifyBan({ id: merchant.id }).unwrap();
      } catch (emailError) {
        console.warn("Failed to send ban notification email:", emailError);
        // Don't fail the ban operation if email fails
      }

      await refetch();
      setConfirmAction(null);
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Could not ban merchant");
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnbanMerchant = async () => {
    if (!merchant) return;
    setError(null);
    setIsUnbanning(true);
    try {
      // Unban all users associated with this merchant using Better Auth admin API
      // This includes the merchant owner and all team members
      const userIds = merchant.users
        .map((u: any) => u.userId)
        .filter((id: string | null | undefined) => id != null);

      // Unban all users in parallel
      await Promise.all(
        userIds.map((userId: string) =>
          authClient.admin.unbanUser({ userId })
        )
      );

      // Send unban notification email
      try {
        await notifyUnban({ id: merchant.id }).unwrap();
      } catch (emailError) {
        console.warn("Failed to send unban notification email:", emailError);
        // Don't fail the unban operation if email fails
      }

      await refetch();
      setConfirmAction(null);
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Could not unban merchant");
    } finally {
      setIsUnbanning(false);
    }
  };

  const handleBanTeamMember = async (memberId: string) => {
    if (!merchant) return;
    setError(null);
    try {
      // Find the user to get their Better Auth userId
      const user = merchant.users?.find((u) => u.id === memberId);
      if (!user || !(user as any).userId) {
        setError("User not found or missing Better Auth ID");
        return;
      }

      // Ban user using Better Auth admin API
      await authClient.admin.banUser({
        userId: (user as any).userId,
        banReason: `Team member banned by admin`,
      });

      await refetch();
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Could not ban team member");
    }
  };

  const handleUnbanTeamMember = async (memberId: string) => {
    if (!merchant) return;
    setError(null);
    try {
      // Find the user to get their Better Auth userId
      const user = merchant.users?.find((u) => u.id === memberId);
      if (!user || !(user as any).userId) {
        setError("User not found or missing Better Auth ID");
        return;
      }

      // Unban user using Better Auth admin API
      await authClient.admin.unbanUser({ userId: (user as any).userId });

      await refetch();
    } catch (e: any) {
      setError(e?.data?.message ?? e?.message ?? "Could not unban team member");
    }
  };

  // Fetch merchant stats from payments API
  // Only fetch successful/verified payments for stats
  const { data: paymentsData } = useListAllPaymentsQuery(
    {
      merchantId: merchant?.id,
      status: "VERIFIED", // Only count verified payments for revenue
      page: 1,
      pageSize: 1000, // Get a large batch to calculate stats
    },
    { skip: !merchant?.id }
  );

  // Calculate stats from payments data
  // Must be called before any conditional returns
  const stats = useMemo(() => {
    if (!merchant) {
      return {
        revenue: 0,
        totalUsers: 0,
        totalTips: 0,
      };
    }

    const payments = paymentsData?.data || [];
    
    // Calculate revenue (sum of all verified payment amounts)
    const revenue = payments.reduce((sum, payment) => {
      // Only count verified/successful payments
      if (payment.status === "VERIFIED" || payment.status === "SUCCESS") {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);

    // Calculate total tips (sum of all tip amounts from verified payments)
    const totalTips = payments.reduce((sum, payment) => {
      // Only count tips from verified/successful payments
      if (payment.status === "VERIFIED" || payment.status === "SUCCESS") {
        return sum + (payment.tipAmount || 0);
      }
      return sum;
    }, 0);

    // Exclude merchant owner from total users count
    const teamMembers = merchant.users?.filter((u) => u.role !== "MERCHANT_OWNER") || [];
    
    return {
      revenue,
      totalUsers: teamMembers.length,
      totalTips,
    };
  }, [merchant, paymentsData]);

  // Early returns for loading/error states (after all hooks)
  if (shouldSkip || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 dark:text-gray-400">
        Loading merchant detail...
      </div>
    );
  }

  if (isError || !merchant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
        <p className="text-gray-700 dark:text-gray-300 font-medium">Merchant not found</p>
        <Link href="/users">
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronLeftIcon className="w-4 h-4" />
            Back to list
          </Button>
        </Link>
      </div>
    );
  }

  const isPending = merchant.status === "PENDING";
  const isActive = merchant.status === "ACTIVE";
  // Check if any user in the merchant is banned (Better Auth banned field)
  const isBanned = merchant.users?.some((u: any) => u.banned === true) ?? false;

  const handleViewTeamMember = (memberId: string) => {
    router.push(`/users/${userId}/team/${memberId}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/users">
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <ChevronLeftIcon className="w-4 h-4" />
              Back to Merchants
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {merchant.name}
              </h1>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBadge(isBanned ? "BANNED" : merchant.status)}`}>
                {isBanned ? "BANNED" : merchant.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {merchant.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isBanned && (
            <Button
              disabled={!isPending || approving || rejecting || isBanning || isUnbanning}
              onClick={() => setConfirmAction("approve")}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {approving ? "Approving..." : "Approve"}
            </Button>
          )}
          {!isBanned && (
            <Button
              disabled={!isPending || rejecting || approving || isBanning || isUnbanning}
              onClick={() => setConfirmAction("reject")}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 disabled:opacity-60"
            >
              {rejecting ? "Rejecting..." : "Reject"}
            </Button>
          )}
          {isActive && !isBanned && (
            <Button
              disabled={approving || rejecting || isBanning || isUnbanning}
              onClick={() => setConfirmAction("ban")}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isBanning ? "Banning..." : "Ban"}
            </Button>
          )}
          {isBanned && (
            <Button
              disabled={approving || rejecting || isBanning || isUnbanning}
              onClick={() => setConfirmAction("unban")}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isUnbanning ? "Unbanning..." : "Unban"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats Card */}
      <MerchantStatsCard
        revenue={stats.revenue}
        totalUsers={stats.totalUsers}
        totalTips={stats.totalTips}
      />

      {/* Branding Card */}
      {brandingData && (
        <MerchantBrandingCard 
          branding={brandingData} 
          merchantName={merchant.name}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/60 space-y-4 col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Merchant details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem label="Merchant name" value={merchant.name} />
            <InfoItem label="TIN" value={merchant.tin} />
            <InfoItem label="Status" value={isBanned ? "BANNED" : merchant.status} />
            <InfoItem label="Contact email" value={merchant.contactEmail} />
            <InfoItem label="Contact phone" value={merchant.contactPhone} />
            <InfoItem label="Source" value={merchant.source} />
            <InfoItem label="Created at" value={new Date(merchant.createdAt).toLocaleString()} />
            <InfoItem label="Approved at" value={merchant.approvedAt ? new Date(merchant.approvedAt).toLocaleString() : null} />
            <InfoItem label="Approved by" value={merchant.approvedBy} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/60 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Owner</h3>
          <InfoItem label="Name" value={owner?.name} />
          <InfoItem label="Email" value={owner?.email} />
          <InfoItem label="Phone" value={owner?.phone} />
          <InfoItem label="Role" value={owner?.role} />
          <InfoItem label="Status" value={owner?.status} />
          <InfoItem
            label="Email verified"
            value={
              owner?.userId
                ? owner?.emailVerified
                  ? "Verified"
                  : "Not verified"
                : "Not linked"
            }
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/60">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team members</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {merchant.users.filter((u) => u.role !== "MERCHANT_OWNER").length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Phone
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Role
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {merchant.users
                .filter((u) => u.role !== "MERCHANT_OWNER") // Exclude owner from team members table
                .map((user) => {
                  const isUserBanned = (user as any).banned === true;
                  return (
                    <TableRow key={user.id} className="bg-white dark:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.name ?? "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.email ?? "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.phone ?? "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.role}</TableCell>
                      <TableCell className="px-5 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBadge(isUserBanned ? "BANNED" : user.status)}`}>
                          {isUserBanned ? "BANNED" : user.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewTeamMember(user.id)}
                            className="text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            Details
                          </Button>
                          {!isUserBanned ? (
                            <Button
                              size="sm"
                              onClick={() => handleBanTeamMember(user.id)}
                              disabled={deactivating || activating}
                              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              Ban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleUnbanTeamMember(user.id)}
                              disabled={deactivating || activating}
                              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              {activating ? "Activating..." : "Unban"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal
        isOpen={!!confirmAction}
        onClose={() => (approving || rejecting ? null : setConfirmAction(null))}
        className="max-w-lg p-6"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {confirmAction === "approve" 
              ? (isBanned ? "Unban merchant" : "Approve merchant")
              : confirmAction === "reject"
              ? "Reject merchant"
              : confirmAction === "ban"
              ? "Ban merchant"
              : "Unban merchant"}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {confirmAction === "approve"
              ? isBanned
                ? `Unban ${merchant.name} and reactivate the merchant account and all associated users?`
                : `Approve ${merchant.name} and activate its invited users?`
              : confirmAction === "reject"
              ? `Reject ${merchant.name} and suspend all of its users?`
              : confirmAction === "ban"
              ? `Ban ${merchant.name}? This will ban all team members and prevent them from accessing the system.`
              : `Unban ${merchant.name}? This will unban all team members and allow them to access the system again.`}
          </p>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={approving || rejecting}
              className="border-gray-300 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            {confirmAction === "approve" ? (
              <Button
                onClick={handleApprove}
                disabled={approving || isBanning || isUnbanning}
                className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                {approving ? "Approving..." : "Confirm approve"}
              </Button>
            ) : confirmAction === "reject" ? (
              <Button
                onClick={handleReject}
                disabled={rejecting || isBanning || isUnbanning}
                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {rejecting ? "Rejecting..." : "Confirm reject"}
              </Button>
            ) : confirmAction === "ban" ? (
              <Button
                onClick={handleBanMerchant}
                disabled={approving || rejecting || isBanning || isUnbanning}
                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isBanning ? "Banning..." : "Confirm Ban"}
              </Button>
            ) : (
              <Button
                onClick={handleUnbanMerchant}
                disabled={approving || rejecting || isBanning || isUnbanning}
                className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                {isUnbanning ? "Unbanning..." : "Confirm Unban"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
