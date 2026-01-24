"use client";
import React from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { AlertIcon } from "@/icons";

interface RevokeKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  apiKeyName: string;
  isLoading?: boolean;
  isRegenerating?: boolean;
}

export default function RevokeKeyModal({
  isOpen,
  onClose,
  onConfirm,
  apiKeyName,
  isLoading,
  isRegenerating = false,
}: RevokeKeyModalProps) {
  const handleConfirm = () => {
    onConfirm();
    // Don't close immediately when regenerating - let the parent handle it after new key is created
    if (!isRegenerating) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5 lg:p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-error-100 rounded-xl dark:bg-error-900/20 flex-shrink-0">
          <AlertIcon className="text-error-600 size-6 dark:text-error-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-2 text-title-sm dark:text-white/90">
            {isRegenerating ? "Regenerate API Key" : "Revoke API Key"}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isRegenerating ? (
              <>
                This will revoke <strong>{apiKeyName}</strong> and create a new key. The old key
                will stop working immediately.
              </>
            ) : (
              <>
                Are you sure you want to revoke <strong>{apiKeyName}</strong>? This action cannot be
                undone. Any applications using this key will stop working immediately.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20 mb-6">
        <p className="text-sm text-error-800 dark:text-error-300">
          <strong>Warning:</strong>{" "}
          {isRegenerating
            ? "The old key will be invalidated and a new key will be generated. Make sure to update all applications with the new key."
            : "Revoking this key will immediately invalidate it. Make sure no critical services are using this key."}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleConfirm}
          className="bg-error-500 hover:bg-error-600 text-white"
          disabled={isLoading}
        >
          {isLoading
            ? isRegenerating
              ? "Regenerating..."
              : "Revoking..."
            : isRegenerating
            ? "Regenerate Key"
            : "Revoke Key"}
        </Button>
      </div>
    </Modal>
  );
}

