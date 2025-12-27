"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";

interface CompletePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  reference: string;
  expiresAt: Date;
  onVerify: (reference: string) => void;
}

export default function CompletePaymentModal({
  isOpen,
  onClose,
  amount,
  reference,
  expiresAt,
  onVerify,
}: CompletePaymentModalProps) {
  const [cbeReference, setCbeReference] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [copied, setCopied] = useState(false);

  const accountNumber = "1000675169601";
  const accountName = "MIKYAS MULAT ASMARE";
  const bankName = "Commercial Bank of Ethiopia (CBE)";

  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      setTimeRemaining(Math.max(0, Math.floor(diff / 60000))); // minutes
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isOpen, expiresAt]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    if (cbeReference.trim()) {
      onVerify(cbeReference.trim());
    }
  };

  const isValidReference = cbeReference.trim().length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4" showCloseButton={true}>
      <div className="rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        {/* Header with Title */}
        <div className="mb-6">
          <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Complete Payment
          </h4>
        </div>

        <div className="space-y-6">
          {/* Payment Amount Section - Light blue background */}
          <div className="rounded-xl bg-blue-50 dark:bg-blue-500/20 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Pay exactly
            </p>
            <h3 className="text-4xl font-bold text-blue-500 dark:text-blue-400 mb-2">
              {amount.toFixed(2)} ETB
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              to the account below
            </p>
          </div>

          {/* Bank Details - Light grey background */}
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                Bank
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white">
                {bankName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                Account Name
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white">
                {accountName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                Account Number
              </p>
              <div className="flex items-center gap-3">
                <p className="text-base font-medium text-gray-800 dark:text-white flex-1">
                  {accountNumber}
                </p>
                <button
                  onClick={() => handleCopy(accountNumber)}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors underline"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* CBE Reference Input */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
              CBE Reference (FT...)
            </label>
            <Input
              type="text"
              placeholder="FT25346XXXXXX"
              value={cbeReference}
              onChange={(e) => setCbeReference(e.target.value)}
              className="w-full"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter the reference from your CBE receipt
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={!isValidReference}
            className="w-full bg-green-500 hover:bg-green-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify Payment
          </Button>

          {/* Timer */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expires in {timeRemaining} min remaining
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

