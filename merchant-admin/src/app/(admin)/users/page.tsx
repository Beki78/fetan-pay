"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import UserTable from "@/components/users/UserTable";
import UserModal from "@/components/users/UserModal";
import QRCodeModal from "@/components/users/QRCodeModal";
import MerchantApprovalStatus from "@/components/common/MerchantApprovalStatus";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { useSession } from "@/hooks/useSession";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { useGetMerchantUsersQuery, MerchantUser } from "@/lib/services/merchantUsersServiceApi";
import { toast } from "sonner";

type User = MerchantUser;

export default function UsersPage() {
  // All hooks must be called at the top level, before any early returns
  const { status: accountStatus, isLoading: isStatusLoading } = useAccountStatus();
  const { canAccessFeature, getFeatureLimit, plan } = useSubscription();
  const router = useRouter();
  const { user } = useSession();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [qrModalUser, setQrModalUser] = useState<MerchantUser | null>(null);

  // Get merchantId from session or localStorage
  const merchantId = (() => {
    const meta = (user as any)?.metadata;
    if (meta?.merchantId) return meta.merchantId as string;
    if (meta?.merchant?.id) return meta.merchant.id as string;
    if ((user as any)?.merchantId) return (user as any).merchantId as string;
    if ((user as any)?.merchant?.id) return (user as any).merchant.id as string;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("merchantId");
      if (stored) return stored;
    }
    return null;
  })();

  // Fetch users - must be called before early returns
  const { data: users = [], isFetching: isUsersLoading, refetch } = useGetMerchantUsersQuery(merchantId ?? "", {
    skip: !merchantId,
  });

  // Show loading spinner while checking account status
  if (isStatusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show approval status if merchant is not approved
  if (accountStatus === "pending") {
    return <MerchantApprovalStatus />;
  }

  const handleAdd = () => {
    // Check team members limit
    const teamMembersLimit = getFeatureLimit("teamMembers") as number;
    // Count only employees, exclude the merchant owner
    const currentActiveEmployees = users.filter(user => 
      user.status === "ACTIVE" && user.role !== "MERCHANT_OWNER"
    ).length;
    
    console.log("🔍 [Users] Team members limit check:", {
      teamMembersLimit,
      currentActiveEmployees,
      totalUsers: users.length,
      allActiveUsers: users.filter(user => user.status === "ACTIVE").length,
      planName: plan?.name,
      canExceedLimit: teamMembersLimit === -1, // -1 means unlimited
    });

    // Check if limit is reached (unless unlimited)
    if (teamMembersLimit !== -1 && currentActiveEmployees >= teamMembersLimit) {
      toast.error("Team members limit reached", {
        description: `You have reached the maximum number of team members (${teamMembersLimit}) allowed in your ${plan?.name || "current"} plan. Please upgrade your plan to add more team members.`,
        duration: 5000,
      });
      return;
    }

    setIsAddModalOpen(true);
  };

  const handleView = (user: User) => {
    // Navigate to user detail page
    router.push(`/users/${user.id}`);
  };

  const handleSave = (_user?: User) => {
    refetch();
  };

  const handleShowQRCode = (user: User) => {
    setQrModalUser(user);
  };


  return (
    <div>
      <PageBreadcrumb pageTitle="User Management" />
      <div className="space-y-6">
        <ComponentCard
          title="Users & Team Members"
          desc=" View and manage all user accounts in your system"
        >
          <div className="space-y-4">
            {/* Header with Add Button */}
            <div className="flex items-center justify-end">
              
              <Button
                size="sm"
                onClick={handleAdd}
                startIcon={
                  <PlusIcon className="w-4 h-4" />
                }
                disabled={!merchantId}
              >
                Add User
              </Button>
            </div>

            {/* User Table */}
            <UserTable
              users={users}
              isLoading={isUsersLoading}
              onView={handleView}
              merchantId={merchantId}
              onShowQRCode={handleShowQRCode}
            />
          </div>
        </ComponentCard>
      </div>

      {/* Add User Modal */}
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        merchantId={merchantId}
        mode="add"
      />

      {/* QR Code Modal */}
      {qrModalUser && merchantId && (
        <QRCodeModal
          isOpen={!!qrModalUser}
          onClose={() => setQrModalUser(null)}
          merchantId={merchantId}
          userId={qrModalUser.id}
          userName={qrModalUser.name || undefined}
          userEmail={qrModalUser.email || undefined}
        />
      )}

      {/* Edit + Deactivate now live in the user detail page */}
    </div>
  );
}

