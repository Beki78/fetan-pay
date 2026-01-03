"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

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

const providerInfo: { [key: string]: { name: string; imagePath: string } } = {
  cbe: { name: "Commercial Bank of Ethiopia", imagePath: "/images/banks/CBE.png" },
  telebirr: { name: "Telebirr", imagePath: "/images/banks/Telebirr.png" },
  "cbe-birr": { name: "CBE Birr", imagePath: "/images/banks/CBE.png" },
  awash: { name: "Awash Bank", imagePath: "/images/banks/Awash.png" },
  boa: { name: "Bank of Abyssinia", imagePath: "/images/banks/BOA.png" },
};

export default function ConfigureProviderModal({
  isOpen,
  onClose,
  providerId,
  initialData,
  onSave,
}: ConfigureProviderModalProps) {
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

  const provider = providerInfo[providerId] || {
    name: "Provider",
    imagePath: "/images/banks/CBE.png",
  };
  const displayName =
    providerId === "boa"
      ? "BOA"
      : providerId === "cbe"
      ? "CBE"
      : provider.name;

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
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-700 overflow-hidden">
              <Image
                src={provider.imagePath}
                alt={provider.name}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Configure {displayName}
            </h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set up your {provider.name} account.
          </p>
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
                : `Enter your ${provider.name} account number.`}
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

