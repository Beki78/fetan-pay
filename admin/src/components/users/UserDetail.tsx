"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import Button from "../ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import { Modal } from "../ui/modal";
import {
  useApproveMerchantMutation,
  useGetMerchantQuery,
  useRejectMerchantMutation,
} from "@/lib/redux/features/merchantsApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface UserDetailProps {
  userId: string;
}

const statusBadge = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "PENDING":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "SUSPENDED":
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
  const shouldSkip = !userId;
  const { data: merchant, isLoading, isError, refetch } = useGetMerchantQuery(userId, { skip: shouldSkip });
  const [approve, { isLoading: approving }] = useApproveMerchantMutation();
  const [reject, { isLoading: rejecting }] = useRejectMerchantMutation();
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | "approve" | "reject">(null);

  const owner = useMemo(
    () => merchant?.users.find((u) => u.role === "MERCHANT_OWNER"),
    [merchant]
  );

  const handleApprove = async () => {
    if (!merchant) return;
    setError(null);
    try {
      await approve({ id: merchant.id }).unwrap();
      await refetch();
      setConfirmAction(null);
    } catch (e: any) {
      setError(e?.data?.message ?? "Could not approve merchant");
    }
  };

  const handleReject = async () => {
    if (!merchant) return;
    setError(null);
    try {
      await reject({ id: merchant.id }).unwrap();
      await refetch();
      setConfirmAction(null);
    } catch (e: any) {
      setError(e?.data?.message ?? "Could not reject merchant");
    }
  };

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
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBadge(merchant.status)}`}>
                {merchant.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {merchant.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            disabled={!isPending || approving || rejecting}
            onClick={() => setConfirmAction("approve")}
            className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {approving ? "Approving..." : "Approve"}
          </Button>
          <Button
            disabled={!isPending || rejecting || approving}
            onClick={() => setConfirmAction("reject")}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 disabled:opacity-60"
          >
            {rejecting ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/60 space-y-4 col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Merchant details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem label="Merchant name" value={merchant.name} />
            <InfoItem label="TIN" value={merchant.tin} />
            <InfoItem label="Status" value={merchant.status} />
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
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/60">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team members</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{merchant.users.length} total</span>
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
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {merchant.users.map((user) => (
                <TableRow key={user.id} className="bg-white dark:bg-gray-800/50">
                  <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.name ?? "-"}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.email ?? "-"}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.phone ?? "-"}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200">{user.role}</TableCell>
                  <TableCell className="px-5 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
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
            {confirmAction === "approve" ? "Approve merchant" : "Reject merchant"}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {confirmAction === "approve"
              ? `Approve ${merchant.name} and activate its invited users?`
              : `Reject ${merchant.name} and suspend all of its users?`}
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
                disabled={approving}
                className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                {approving ? "Approving..." : "Confirm approve"}
              </Button>
            ) : (
              <Button
                onClick={handleReject}
                disabled={rejecting}
                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {rejecting ? "Rejecting..." : "Confirm reject"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
