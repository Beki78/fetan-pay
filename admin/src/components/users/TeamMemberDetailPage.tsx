"use client";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import { Modal } from "../ui/modal";
import { 
  useGetMerchantQuery, 
  useDeactivateUserMutation, 
  useActivateUserMutation 
} from "@/lib/redux/features/merchantsApi";
import { authClient } from "@/lib/auth-client";
import { useListAllPaymentsQuery } from "@/lib/services/adminApi";
import TeamMemberDetail from "./TeamMemberDetail";

interface TeamMemberDetailPageProps {
  merchantId: string;
  memberId: string;
}

export default function TeamMemberDetailPage({ merchantId, memberId }: TeamMemberDetailPageProps) {
  const router = useRouter();
  const { data: merchant, isLoading, isError, refetch } = useGetMerchantQuery(merchantId, { skip: !merchantId });
  const [deactivateUser, { isLoading: deactivating }] = useDeactivateUserMutation();
  const [activateUser, { isLoading: activating }] = useActivateUserMutation();

  // Fetch payments for this specific user to calculate stats
  const { data: paymentsData } = useListAllPaymentsQuery(
    {
      merchantId: merchant?.id,
      page: 1,
      pageSize: 1000, // Get a large batch to calculate stats
    },
    { skip: !merchant?.id }
  );

  const member = useMemo(() => {
    if (!merchant || !memberId) return null;
    const foundMember = merchant.users?.find((u) => u.id === memberId);
    if (!foundMember) return null;

    // Calculate stats from payments verified by this user
    const payments = paymentsData?.data || [];
    const userPayments = payments.filter((p) => p.verifiedBy?.id === memberId);
    
    // Calculate transactions count (verified payments)
    const transactions = userPayments.filter(
      (p) => p.status === "VERIFIED" || p.status === "SUCCESS"
    ).length;

    // Calculate revenue (sum of verified payment amounts)
    const revenue = userPayments.reduce((sum, payment) => {
      if (payment.status === "VERIFIED" || payment.status === "SUCCESS") {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);

    // Calculate tips (sum of tip amounts from verified payments)
    const tips = userPayments.reduce((sum, payment) => {
      if (payment.status === "VERIFIED" || payment.status === "SUCCESS") {
        return sum + (payment.tipAmount || 0);
      }
      return sum;
    }, 0);

    // Get last active from most recent payment
    const lastActive = userPayments.length > 0
      ? userPayments.sort((a, b) => 
          new Date(b.verifiedAt || b.createdAt).getTime() - 
          new Date(a.verifiedAt || a.createdAt).getTime()
        )[0]?.verifiedAt || userPayments[0]?.createdAt
      : undefined;

    return {
      ...foundMember,
      transactions,
      revenue,
      tips,
      createdAt: foundMember.createdAt || merchant.createdAt,
      lastActive,
    };
  }, [merchant, memberId, paymentsData]);

  const handleBanTeamMember = async (teamMemberId: string) => {
    if (!merchant) return;
    try {
      // Find the user to get their Better Auth userId
      const user = merchant.users?.find((u) => u.id === teamMemberId);
      if (!user || !(user as any).userId) {
        console.error("User not found or missing Better Auth ID");
        return;
      }

      // Ban user using Better Auth admin API
      await authClient.admin.banUser({
        userId: (user as any).userId,
        banReason: `Team member banned by admin`,
      });

      await refetch();
    } catch (error) {
      console.error("Failed to ban team member:", error);
    }
  };

  const handleUnbanTeamMember = async (teamMemberId: string) => {
    if (!merchant) return;
    try {
      // Find the user to get their Better Auth userId
      const user = merchant.users?.find((u) => u.id === teamMemberId);
      if (!user || !(user as any).userId) {
        console.error("User not found or missing Better Auth ID");
        return;
      }

      // Unban user using Better Auth admin API
      await authClient.admin.unbanUser({ userId: (user as any).userId });

      await refetch();
    } catch (error) {
      console.error("Failed to unban team member:", error);
    }
  };

  const handleBack = () => {
    router.push(`/users/${merchantId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 dark:text-gray-400">
        Loading team member detail...
      </div>
    );
  }

  if (isError || !merchant || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
        <p className="text-gray-700 dark:text-gray-300 font-medium">Team member not found</p>
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ChevronLeftIcon className="w-4 h-4" />
          Back to Merchant
        </Button>
      </div>
    );
  }

  const isBanned = (member as any).banned === true;

  return (
    <TeamMemberDetail
      member={member}
      onBack={handleBack}
      onBan={!isBanned ? handleBanTeamMember : undefined}
      onUnban={isBanned ? handleUnbanTeamMember : undefined}
      isBanning={deactivating}
      isUnbanning={activating}
    />
  );
}

