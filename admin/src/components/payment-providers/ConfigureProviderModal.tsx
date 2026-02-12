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
}

export default function ConfigureProviderModal({
  isOpen,
  onClose,
  providerId,
  initialData,
  onSave,
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

  const handleSave = () => {
    const newErrors: { accountNumber?: string; accountHolderName?: string } = {};

    if (!accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }
    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save configuration
    console.log("Saving configuration:", {
      providerId,
      accountNumber,
      accountHolderName,
      isEnabled,
    });

    // Call onSave callback
    if (onSave) {
      onSave(providerId, "save");
    }

    // Reset form and close
    setAccountNumber("");
    setAccountHolderName("");
    setIsEnabled(false);
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setAccountNumber("");
    setAccountHolderName("");
    setIsEnabled(false);
    setErrors({});
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
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
              <Image
                src={logoUrl}
                alt={providerName}
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Configure {providerName}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Set up your {providerName} account.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
                setAccountNumber(e.target.value);
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
                setAccountHolderName(e.target.value);
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
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white border-0"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

