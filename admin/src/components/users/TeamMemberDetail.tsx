"use client";
import React from "react";
import Link from "next/link";
import Button from "../ui/button/Button";
import { ChevronLeftIcon, UserCircleIcon } from "@/icons";
import { Modal } from "../ui/modal";

interface TeamMember {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: string;
  status: string;
  createdAt?: string;
  lastActive?: string;
  transactions?: number;
  revenue?: number;
  tips?: number;
}

interface TeamMemberDetailProps {
  member: TeamMember;
  onBack: () => void;
  onBan?: (memberId: string) => void;
}

const statusBadge = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "PENDING":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "SUSPENDED":
    case "BANNED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-gray-900 dark:text-white font-medium">{value ?? "-"}</p>
  </div>
);

export default function TeamMemberDetail({ member, onBack, onBan }: TeamMemberDetailProps) {
  const [showBanModal, setShowBanModal] = React.useState(false);
  const [isBanning, setIsBanning] = React.useState(false);

  const handleBan = async () => {
    if (!onBan) return;
    setIsBanning(true);
    try {
      await onBan(member.id);
      setShowBanModal(false);
    } catch (error) {
      console.error("Failed to ban member:", error);
    } finally {
      setIsBanning(false);
    }
  };

  const isBanned = member.status === "BANNED" || member.status === "SUSPENDED";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {member.name || member.email || "Unknown User"}
                </h1>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBadge(member.status)}`}>
                  {member.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {member.id}</p>
            </div>
          </div>
        </div>

        {!isBanned && onBan && (
          <Button
            onClick={() => setShowBanModal(true)}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Ban User
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Transactions</p>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {member.transactions?.toLocaleString() || 0}
          </h3>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Revenue Generated</p>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {member.revenue?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"} ETB
          </h3>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tips Collected</p>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {member.tips?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"} ETB
          </h3>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/60 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Name" value={member.name} />
            <InfoItem label="Email" value={member.email} />
            <InfoItem label="Phone" value={member.phone} />
            <InfoItem label="Role" value={member.role} />
            <InfoItem label="Status" value={member.status} />
            <InfoItem label="User ID" value={member.id} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/60 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem 
              label="Created At" 
              value={member.createdAt ? new Date(member.createdAt).toLocaleString() : null} 
            />
            <InfoItem 
              label="Last Active" 
              value={member.lastActive ? new Date(member.lastActive).toLocaleString() : "Never"} 
            />
            <InfoItem label="Total Transactions" value={member.transactions} />
            <InfoItem 
              label="Revenue Generated" 
              value={member.revenue ? `${member.revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB` : null} 
            />
            <InfoItem 
              label="Tips Collected" 
              value={member.tips ? `${member.tips.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB` : null} 
            />
          </div>
        </div>
      </div>

      {/* Ban Confirmation Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => !isBanning && setShowBanModal(false)}
        className="max-w-lg p-6"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ban Team Member
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to ban {member.name || member.email}? This action will suspend their account and prevent them from accessing the system.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBanModal(false)}
              disabled={isBanning}
              className="border-gray-300 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBan}
              disabled={isBanning}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isBanning ? "Banning..." : "Confirm Ban"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

