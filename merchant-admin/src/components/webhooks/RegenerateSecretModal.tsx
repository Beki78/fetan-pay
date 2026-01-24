"use client";
import React from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { AlertIcon } from "@/icons";

interface RegenerateSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function RegenerateSecretModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: RegenerateSecretModalProps) {
  const handleConfirm = () => {
    onConfirm();
    // Don't close immediately - let the parent handle it after new secret is generated
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5 lg:p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-error-100 rounded-xl dark:bg-error-900/20 flex-shrink-0">
          <AlertIcon className="text-error-600 size-6 dark:text-error-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-2 text-title-sm dark:text-white/90">
            Regenerate Webhook Secret
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This will generate a new secret for your webhook. The old secret will stop working
            immediately and you&apos;ll need to update your webhook endpoint to use the new secret.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20 mb-6">
        <p className="text-sm text-error-800 dark:text-error-300">
          <strong>Warning:</strong> The old secret will be invalidated immediately. Make sure to
          copy and store the new secret securely - it will only be shown once.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleConfirm}
          className="bg-error-500 hover:bg-error-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Regenerating..." : "Regenerate Secret"}
        </Button>
      </div>
    </Modal>
  );
}

