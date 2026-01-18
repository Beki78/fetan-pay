"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import {
  MoreDotIcon,
  PencilIcon,
  TrashBinIcon,
  PaperPlaneIcon,
  ListIcon,
} from "@/icons";
import type { Webhook } from "@/lib/services/webhooksServiceApi";

interface WebhookCardProps {
  webhook: Webhook;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  onViewLogs: () => void;
  isDeleting?: boolean;
  isTesting?: boolean;
}

export default function WebhookCard({
  webhook,
  onEdit,
  onDelete,
  onTest,
  onViewLogs,
  isDeleting,
  isTesting,
}: WebhookCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const getStatusColor = (status: string): "success" | "warning" | "error" => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "PAUSED":
        return "warning";
      case "FAILED":
        return "error";
      default:
        return "error";
    }
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {webhook.url}
            </h3>
            <Badge color={getStatusColor(webhook.status)}>{webhook.status}</Badge>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Events</p>
            <div className="flex flex-wrap gap-1">
              {webhook.events.map((event) => (
                <span
                  key={event}
                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300"
                >
                  {event}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="dropdown-toggle p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MoreDotIcon className="text-gray-600 dark:text-gray-400" />
          </button>
          <Dropdown isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
            <DropdownItem onClick={onEdit}>
              <PencilIcon className="size-4" />
              Edit
            </DropdownItem>
            <DropdownItem
              onClick={isTesting ? () => {} : onTest}
              className={isTesting ? "opacity-50 cursor-not-allowed" : ""}
            >
              <PaperPlaneIcon className="size-4" />
              {isTesting ? "Testing..." : "Test Webhook"}
            </DropdownItem>
            <DropdownItem onClick={onViewLogs}>
              <ListIcon className="size-4" />
              View Logs
            </DropdownItem>
            <DropdownItem
              onClick={isDeleting ? () => {} : onDelete}
              className={isDeleting ? "opacity-50 cursor-not-allowed" : ""}
            >
              <TrashBinIcon className="size-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Success</p>
          <p className="text-sm font-medium text-success-600 dark:text-success-400">
            {webhook.successCount}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Failed</p>
          <p className="text-sm font-medium text-error-600 dark:text-error-400">
            {webhook.failureCount}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Triggered</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {formatDate(webhook.lastTriggeredAt)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {formatDate(webhook.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

