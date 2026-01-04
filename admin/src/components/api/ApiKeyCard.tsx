"use client";
import React, { useState } from "react";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { EyeIcon, EyeCloseIcon, CopyIcon, MoreDotIcon, PencilIcon, TrashBinIcon, BoltIcon } from "@/icons";
import { useModal } from "@/hooks/useModal";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  status: "Active" | "Revoked";
  usageStats: {
    totalCalls: number;
    successCalls: number;
    failedCalls: number;
  };
}

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  onRotate: (id: string) => void;
  onEdit: (apiKey: ApiKey) => void;
}

export default function ApiKeyCard({ apiKey, onRevoke, onRotate, onEdit }: ApiKeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const maskKey = (key: string) => {
    if (key.length <= 8) return "•".repeat(key.length);
    return key.substring(0, 4) + "•".repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const successRate = apiKey.usageStats.totalCalls > 0
    ? ((apiKey.usageStats.successCalls / apiKey.usageStats.totalCalls) * 100).toFixed(1)
    : "0";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {apiKey.name}
            </h3>
            <Badge color={apiKey.status === "Active" ? "success" : "error"}>
              {apiKey.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <code className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-300">
              {isRevealed ? apiKey.key : maskKey(apiKey.key)}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRevealed(!isRevealed)}
              className="flex-shrink-0"
            >
              {isRevealed ? <EyeCloseIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="flex-shrink-0"
            >
              <CopyIcon className="size-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            className="dropdown-toggle p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <MoreDotIcon className="text-gray-600 dark:text-gray-400" />
          </button>

          <Dropdown isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
            <DropdownItem
              onClick={() => {
                setIsMenuOpen(false);
                onEdit(apiKey);
              }}
            >
              <PencilIcon className="size-4" />
              Edit Name
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setIsMenuOpen(false);
                onRotate(apiKey.id);
              }}
            >
              <BoltIcon className="size-4" />
              Rotate Key
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setIsMenuOpen(false);
                onRevoke(apiKey.id);
              }}
            >
              <TrashBinIcon className="size-4" />
              Revoke Key
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {new Date(apiKey.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Used</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {apiKey.lastUsed
              ? new Date(apiKey.lastUsed).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Never"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Success Rate</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {successRate}% ({apiKey.usageStats.successCalls}/{apiKey.usageStats.totalCalls})
          </p>
        </div>
      </div>
    </div>
  );
}

