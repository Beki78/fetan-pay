"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import Link from "next/link";
import { useGetMerchantsQuery, useSendMerchantVerificationEmailMutation, type Merchant } from "@/lib/redux/features/merchantsApi";
import UsersSearchFilter, { MerchantStatus } from "./UsersSearchFilter";
import { toast } from "sonner";
import { Tabs } from "../common/Tabs";
import { useSearchParams } from "next/navigation";

export default function UsersTable() {
  const searchParams = useSearchParams();
  const newFirst = searchParams?.get("newFirst") === "1";
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "ACTIVE" | "PENDING" | "EMAIL_NOT_VERIFIED"
  >("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [sendingMerchantId, setSendingMerchantId] = useState<string | null>(
    null
  );
  const [sendVerificationEmail, { isLoading: isSendingVerification }] =
    useSendMerchantVerificationEmailMutation();

  useEffect(() => {
    if (!newFirst) return;
    setActiveTab("ALL");
  }, [newFirst]);

  const renderTabLabel = (label: string, count: number) => (
    <span className="flex items-center gap-2">
      <span>{label}</span>
      {count > 0 && (
        <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
          {count}
        </span>
      )}
    </span>
  );

  const { data, isLoading } = useGetMerchantsQuery(
    {
      page,
      pageSize,
      search: search || undefined,
      status:
        activeTab === "ALL"
          ? undefined
          : activeTab === "EMAIL_NOT_VERIFIED"
            ? "PENDING"
            : (activeTab as MerchantStatus),
    },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
      pollingInterval: 5000,
    }
  );

  const getStatusBadgeColor = (status: string) => {
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

  const merchants = data?.data ?? [];

  const getFilteredByTab = useCallback((tabId: typeof activeTab, items: Merchant[]) => {
    const isOwnerVerified = (merchant: Merchant) => {
      const owner = merchant.users.find(
        (u: any) => u.role === "MERCHANT_OWNER"
      );
      return owner?.emailVerified === true;
    };

    const isOwnerNotVerified = (merchant: Merchant) => {
      const owner = merchant.users.find(
        (u: any) => u.role === "MERCHANT_OWNER"
      );
      return owner?.emailVerified === false;
    };

    if (tabId === "ACTIVE") {
      return items.filter(
        (merchant: Merchant) => merchant.status === "ACTIVE"
      );
    }

    if (tabId === "PENDING") {
      return items.filter(
        (merchant: Merchant) =>
          merchant.status === "PENDING" && isOwnerVerified(merchant)
      );
    }

    if (tabId === "EMAIL_NOT_VERIFIED") {
      return items.filter(
        (merchant: Merchant) =>
          merchant.status === "PENDING" && isOwnerNotVerified(merchant)
      );
    }

    return items;
  }, []);

  const filteredMerchants = useMemo(
    () => getFilteredByTab(activeTab, merchants),
    [activeTab, getFilteredByTab, merchants]
  );

  const sortedMerchants = useMemo(() => {
    if (!newFirst) return filteredMerchants;
    return [...filteredMerchants].sort((a, b) => {
      const aUnseen = !a.viewedAt;
      const bUnseen = !b.viewedAt;
      if (aUnseen !== bUnseen) return aUnseen ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredMerchants, newFirst]);

  const unseenCountByTab = useMemo(() => {
    const countForTab = (tabId: typeof activeTab) =>
      getFilteredByTab(tabId, merchants).filter(
        (merchant) => !merchant.viewedAt
      ).length;

    return {
      ALL: countForTab("ALL"),
      ACTIVE: countForTab("ACTIVE"),
      PENDING: countForTab("PENDING"),
      EMAIL_NOT_VERIFIED: countForTab("EMAIL_NOT_VERIFIED"),
    };
  }, [getFilteredByTab, merchants]);

  const resolvedTabs = useMemo(
    () => [
      { id: "ALL", label: renderTabLabel("All", unseenCountByTab.ALL) },
      {
        id: "ACTIVE",
        label: renderTabLabel("Active", unseenCountByTab.ACTIVE),
      },
      {
        id: "PENDING",
        label: renderTabLabel("Pending", unseenCountByTab.PENDING),
      },
      {
        id: "EMAIL_NOT_VERIFIED",
        label: renderTabLabel(
          "Email Not Verified",
          unseenCountByTab.EMAIL_NOT_VERIFIED
        ),
      },
    ],
    [renderTabLabel, unseenCountByTab]
  );
  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page when searching
  };

  const handleSendVerification = async (merchantId: string) => {
    try {
      setSendingMerchantId(merchantId);
      await sendVerificationEmail({ id: merchantId }).unwrap();
      toast.success("Verification email sent successfully.");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to send verification email."
      );
    } finally {
      setSendingMerchantId((prev) => (prev === merchantId ? null : prev));
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs
        tabs={resolvedTabs}
        activeTab={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(
            tabId as "ALL" | "ACTIVE" | "PENDING" | "EMAIL_NOT_VERIFIED"
          );
          setPage(1);
        }}
      />

      {/* Search and Filter */}
      <UsersSearchFilter
        onSearchChange={handleSearchChange}
        onStatusChange={() => null}
        searchValue={search}
        statusValue={""}
        showStatusFilter={false}
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Merchants
            {data?.total !== undefined && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({sortedMerchants.length} shown)
              </span>
            )}
          </h3>
          {search && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {search && `Searching for "${search}"`}
            </p>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Merchant
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Contact Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Contact Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Owner (invite)
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Email Verified
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Created
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading merchants...
                  </TableCell>
                </TableRow>
              ) : sortedMerchants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No merchants found
                  </TableCell>
                </TableRow>
              ) : (
                sortedMerchants.map((merchant: Merchant) => {
                  const owner = merchant.users.find((u: any) => u.role === "MERCHANT_OWNER");
                  // Check if any user in the merchant is banned (Better Auth banned field)
                  const isBanned = merchant.users?.some((u: any) => u.banned === true) ?? false;
                  const displayStatus = isBanned ? "BANNED" : merchant.status;
                  const ownerEmailVerified = owner?.emailVerified === true;
                  const emailVerifiedLabel = owner?.userId
                    ? ownerEmailVerified
                      ? "Verified"
                      : "Not Verified"
                    : "Not Linked";
                  const emailVerifiedBadgeClass = owner?.userId
                    ? ownerEmailVerified
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
                  return (
                  <TableRow
                    key={merchant.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-200 dark:border-gray-700/50"
                  >
                    <TableCell className="px-5 py-4">
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {merchant.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>{merchant.name}</span>
                        {!merchant.viewedAt && (
                          <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                            New
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {merchant.contactEmail ?? "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {merchant.contactPhone ?? "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {owner?.email ?? owner?.name ?? "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${emailVerifiedBadgeClass}`}>
                        {emailVerifiedLabel}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(displayStatus)}`}>
                        {displayStatus}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(merchant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/users/${merchant.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            View detail
                          </Button>
                        </Link>
                        {activeTab === "EMAIL_NOT_VERIFIED" && !ownerEmailVerified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendVerification(merchant.id)}
                            disabled={isSendingVerification && sendingMerchantId === merchant.id}
                            className="text-orange-700 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
                          >
                            {isSendingVerification && sendingMerchantId === merchant.id ? "Sending..." : "Send verification"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data?.total || 0)} of {data?.total || 0} merchants
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="disabled:opacity-50"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        page === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
