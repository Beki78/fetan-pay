"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTable from "@/components/users/UserTable";
import UserModal from "@/components/users/UserModal";
import QRCodeModal from "@/components/users/QRCodeModal";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { useSession } from "@/hooks/useSession";
import { useGetMerchantUsersQuery, MerchantUser } from "@/lib/services/merchantUsersServiceApi";

type User = MerchantUser;

export default function UsersPage() {
  const router = useRouter();
  const { user } = useSession();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [qrModalUser, setQrModalUser] = useState<MerchantUser | null>(null);

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  const handleView = (user: User) => {
    // Navigate to user detail page
    router.push(`/users/${user.id}`);
  };

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

  const { data: users = [], isFetching: isUsersLoading, refetch } = useGetMerchantUsersQuery(merchantId ?? "", {
    skip: !merchantId,
  });

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
          desc="Create and manage accounts for your employees, sales staff, and team members. Verify their payment access and monitor activity."
        >
          <div className="space-y-4">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  All Users
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  View and manage all user accounts in your system
                </p>
              </div>
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

