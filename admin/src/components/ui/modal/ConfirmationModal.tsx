"use client";
import React from "react";
import { Modal } from "./index";
import Button from "../button/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger" | "warning";
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const getConfirmButtonClasses = () => {
    switch (confirmVariant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white border-0";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white border-0";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white border-0";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-4" showCloseButton={false}>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={getConfirmButtonClasses()}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};