"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { usePaymentProviders } from "@/hooks/usePaymentProviders";

interface ConfigureProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  initialData?: {
    accountNumber?: string;
    accountHolderName?: string;
    isEnabled?: boolean;
  };
  onSave?: (providerId: string, action: "enable" | "disable" | "save") => void;
  onSubmit?: (input: {
    providerId: string;
    accountNumber: string;
    accountHolderName: string;
    isEnabled: boolean;
  }) => Promise<void>;
}

export default function ConfigureProviderModal({
  isOpen,
  onClose,
  providerId,
  initialData,
  onSave,
  onSubmit,
}: ConfigureProviderModalProps) {
  const { getLogoUrl, getBankName } = usePaymentProviders();
  const [accountNumber, setAccountNumber] = useState(
    initialData?.accountNumber || ""
  );
  const [accountHolderName, setAccountHolderName] = useState(
    initialData?.accountHolderName || ""
  );
  const [isEnabled, setIsEnabled] = useState(initialData?.isEnabled || false);
  const [errors, setErrors] = useState<{
    accountNumber?: string;
    accountHolderName?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const providerName = getBankName(providerId.toUpperCase());
  const logoUrl = getLogoUrl(providerId.toUpperCase());

  // Update form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAccountNumber(initialData.accountNumber || "");
        setAccountHolderName(initialData.accountHolderName || "");
        setIsEnabled(initialData.isEnabled || false);
      } else {
        // Reset for new configuration
        setAccountNumber("");
        setAccountHolderName("");
        setIsEnabled(false);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    // Clear previous errors
    setErrors({});
    setSubmitError(null);

    // Validate inputs
    const trimmedAccountNumber = accountNumber.trim();
    const trimmedAccountHolderName = accountHolderName.trim();

    const newErrors: { accountNumber?: string; accountHolderName?: string } = {};

    if (!trimmedAccountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(trimmedAccountNumber)) {
      newErrors.accountNumber = "Account number must contain only digits";
    }

    if (!trimmedAccountHolderName) {
      newErrors.accountHolderName = "Account holder name is required";
    } else if (!/^[a-zA-Z\s\u1200-\u137F]+$/.test(trimmedAccountHolderName)) {
      newErrors.accountHolderName = "Name must contain only letters (no numbers or special characters)";
    }

    // If validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Start submission
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        // Call parent's submit handler
        await onSubmit({
          providerId,
          accountNumber: trimmedAccountNumber,
          accountHolderName: trimmedAccountHolderName,
          isEnabled,
        });

        // Success - reset form state
        setIsSubmitting(false);
        setErrors({});
        setSubmitError(null);

        // Parent will handle toast and closing the modal
      } else {
        // Fallback for dev/testing (should not happen in production)
        console.warn("onSubmit handler not provided");
        setIsSubmitting(false);
        onClose();
      }
    } catch (e: any) {
      // Extract error message
      const errorMsg =
        e?.message ?? e?.data?.message ?? "Failed to save configuration";

      // Show error in modal
      setSubmitError(errorMsg);
      setIsSubmitting(false);

      // Don't close modal on error - let user see the error and try again
    }
  };

  const handleClose = () => {
    setAccountNumber("");
    setAccountHolderName("");
    setIsEnabled(false);
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[500px] m-4"
      showCloseButton={true}
    >
      <div className="rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-700 overflow-hidden">
              <Image
                src={logoUrl}
                alt={providerName}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Configure {providerName}
            </h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set up your {providerName} account.
          </p>
        </div>

        <div className="space-y-6">
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
              {submitError}
            </div>
          )}

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
              {providerId === "cbe" ? "CBE Account Number" : "Account Number"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={accountNumber}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/\D/g, "");
                setAccountNumber(value);
                if (errors.accountNumber) {
                  setErrors({ ...errors, accountNumber: undefined });
                }
              }}
              error={!!errors.accountNumber}
              className="w-full"
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.accountNumber}</p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {providerId === "cbe"
                ? "Enter your full CBE account number (13-16 digits)"
                : `Enter your ${providerName} account number.`}
            </p>
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Name as shown on account"
              value={accountHolderName}
              onChange={(e) => {
                // Only allow letters, spaces, and Amharic characters
                const value = e.target.value.replace(/[^a-zA-Z\s\u1200-\u137F]/g, "");
                setAccountHolderName(value);
                if (errors.accountHolderName) {
                  setErrors({ ...errors, accountHolderName: undefined });
                }
              }}
              error={!!errors.accountHolderName}
              className="w-full"
            />
            {errors.accountHolderName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.accountHolderName}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              This name will be shown to customers for verification.
            </p>
          </div>

          {/* Enable Checkbox */}
          <div>
            <Checkbox
              checked={isEnabled}
              onChange={setIsEnabled}
              label="Enable this provider for payments"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white border-0"
            >
              {isSubmitting ? "Saving…" : "Save Configuration"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

