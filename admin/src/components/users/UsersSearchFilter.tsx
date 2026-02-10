"use client";
import React, { useState, useEffect } from "react";
// Simple SVG icons as React components
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
import Button from "../ui/button/Button";

export type MerchantStatus = "PENDING" | "ACTIVE";

interface UsersSearchFilterProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: MerchantStatus | "") => void;
  searchValue: string;
  statusValue: MerchantStatus | "";
  showStatusFilter?: boolean;
}

export default function UsersSearchFilter({
  onSearchChange,
  onStatusChange,
  searchValue,
  statusValue,
  showStatusFilter = true,
}: UsersSearchFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search - update parent after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearch, onSearchChange]);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleClearFilters = () => {
    setLocalSearch("");
    onSearchChange("");
    if (showStatusFilter) {
      onStatusChange("");
    }
  };

  const hasActiveFilters = showStatusFilter
    ? searchValue || statusValue
    : searchValue;

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by merchant name, email, or business name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 ${
              hasActiveFilters 
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" 
                : ""
            }`}
          >
            <FilterIcon className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full">
                {(searchValue ? 1 : 0) + (statusValue ? 1 : 0)}
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
            >
              <XIcon className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusValue}
                onChange={(e) => onStatusChange(e.target.value as MerchantStatus | "")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>

            {/* Quick Filter Buttons */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quick Filters
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onStatusChange("PENDING")}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    statusValue === "PENDING"
                      ? "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  }`}
                >
                  Pending Approval
                </button>
                <button
                  onClick={() => onStatusChange("ACTIVE")}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    statusValue === "ACTIVE"
                      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  }`}
                >
                  Active Merchants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
