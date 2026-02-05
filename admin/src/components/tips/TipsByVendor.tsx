"use client";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon, EyeIcon, GroupIcon } from "@/icons";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { TipsByMerchantResponse } from "@/lib/services/tipsApi";

interface TipsByVendorProps {
  data?: TipsByMerchantResponse[];
  isLoading?: boolean;
}

export default function TipsByVendor({ data, isLoading }: TipsByVendorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenuVendorId, setOpenMenuVendorId] = useState<string | null>(null);

  const filteredVendorTips = useMemo(() => {
    if (!data) return [];
    return data.filter((vendorTip) => {
      const matchesSearch = vendorTip.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4">
        <Input
          type="text"
          placeholder="Search merchants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          className="w-32"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
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
                  Total Tips
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Tip Count
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Avg Tip
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
              {filteredVendorTips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No merchant tips found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendorTips.map((vendorTip) => (
                  <TableRow
                    key={vendorTip.merchantId}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <GroupIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vendorTip.merchantName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {vendorTip.merchantId.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        ETB {vendorTip.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {vendorTip.tipCount}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        ETB {vendorTip.averageTip.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="relative">
                        <button
                          type="button"
                          className="dropdown-toggle p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() =>
                            setOpenMenuVendorId((prev) =>
                              prev === vendorTip.merchantId ? null : vendorTip.merchantId
                            )
                          }
                          aria-haspopup="menu"
                          aria-expanded={openMenuVendorId === vendorTip.merchantId}
                        >
                          <MoreDotIcon className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <Dropdown
                          isOpen={openMenuVendorId === vendorTip.merchantId}
                          onClose={() => setOpenMenuVendorId(null)}
                        >
                          <DropdownItem
                            onClick={() => {
                              setOpenMenuVendorId(null);
                            }}
                          >
                            <EyeIcon className="size-4" />
                            View Details
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

