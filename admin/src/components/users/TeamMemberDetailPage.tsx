"use client";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import { Modal } from "../ui/modal";
import { useGetMerchantQuery } from "@/lib/redux/features/merchantsApi";
import TeamMemberDetail from "./TeamMemberDetail";

interface TeamMemberDetailPageProps {
  merchantId: string;
  memberId: string;
}

export default function TeamMemberDetailPage({ merchantId, memberId }: TeamMemberDetailPageProps) {
  const router = useRouter();
  const { data: merchant, isLoading, isError, refetch } = useGetMerchantQuery(merchantId, { skip: !merchantId });

  const member = useMemo(() => {
    if (!merchant || !memberId) return null;
    const foundMember = merchant.users?.find((u) => u.id === memberId);
    if (!foundMember) return null;
    return {
      ...foundMember,
      transactions: 245, // Mock data
      revenue: 125000, // Mock data
      tips: 4500, // Mock data
      createdAt: merchant.createdAt,
      lastActive: new Date().toISOString(), // Mock data
    };
  }, [merchant, memberId]);

  const handleBanTeamMember = async (teamMemberId: string) => {
    // Note: This would need a banTeamMember mutation in the API
    // For now, this is just UI placeholder
    console.log("Ban team member:", teamMemberId);
    await refetch();
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

  return (
    <TeamMemberDetail
      member={member}
      onBack={handleBack}
      onBan={handleBanTeamMember}
    />
  );
}

