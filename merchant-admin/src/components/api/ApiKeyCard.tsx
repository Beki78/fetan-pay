"use client";
import React, { useState } from "react";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { CopyIcon, MoreDotIcon, PencilIcon, TrashBinIcon } from "@/icons";
import type { ApiKey } from "@/lib/services/apiKeysServiceApi";
import { toast } from "sonner";

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  onEdit: (apiKey: ApiKey) => void;
}

export default function ApiKeyCard({ apiKey, onRevoke, onEdit }: ApiKeyCardProps) {
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const maskKey = (keyPrefix: string) => {
    return `${keyPrefix}...`;
  };

  const copyToClipboard = () => {
    // We can't copy the full key since we only have the prefix
    navigator.clipboard.writeText(apiKey.keyPrefix);
    setCopied(true);
    toast.info("Key prefix copied. Full key is only shown on creation.");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {apiKey.name}
            </h3>
            <Badge color={apiKey.status === "ACTIVE" ? "success" : "error"}>
              {apiKey.status}
            </Badge>
            {apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() && (
              <Badge color="error">Expired</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <code className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-300">
              {maskKey(apiKey.keyPrefix)}
            </code>
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
          {apiKey.scopes && apiKey.scopes.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Scopes</p>
              <div className="flex flex-wrap gap-1">
                {apiKey.scopes.map((scope) => (
                  <span
                    key={scope}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300"
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="dropdown-toggle p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MoreDotIcon className="text-gray-600 dark:text-gray-400" />
          </button>
          <Dropdown isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
            <DropdownItem onClick={() => onEdit(apiKey)}>
              <PencilIcon className="size-4" />
              Edit Name
            </DropdownItem>
            <DropdownItem onClick={() => onRevoke(apiKey.id)}>
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
            {formatDate(apiKey.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Used</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {formatDate(apiKey.lastUsedAt)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expires</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : "Never"}
          </p>
        </div>
      </div>
    </div>
  );
}
