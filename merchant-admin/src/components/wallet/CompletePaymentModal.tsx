"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { CameraScanner } from "./CameraScanner";
import type { WalletDepositReceiverAccount } from "@/lib/services/walletServiceApi";

interface CompletePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  receiver: WalletDepositReceiverAccount;
  expiresAt: Date;
  onVerify: (reference: string) => void;
  isVerifying?: boolean;
}

export default function CompletePaymentModal({
  isOpen,
  onClose,
  amount,
  receiver,
  expiresAt,
  onVerify,
  isVerifying = false,
}: CompletePaymentModalProps) {
  const [transactionReference, setTransactionReference] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const accountNumber = receiver.receiverAccount;
  const accountName = receiver.receiverName || receiver.receiverLabel || "Account Name";
  const bankName = getBankName(receiver.provider);

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
    if (transactionReference.trim()) {
      onVerify(transactionReference.trim());
    }
  };

  const handleScan = (scannedUrl: string) => {
    console.log("Scanned URL:", scannedUrl);
    
    // Extract transaction reference from URL
    try {
      const url = new URL(scannedUrl);
      const referenceParam = url.searchParams.get("trx") || 
                            url.searchParams.get("reference") || 
                            url.searchParams.get("ref") ||
                            url.searchParams.get("transactionId");
      
      if (referenceParam) {
        setTransactionReference(referenceParam);
      } else {
        // Try to extract from path
        const pathParts = url.pathname.split("/");
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart.length > 5) {
          setTransactionReference(lastPart);
        } else {
          // If it's not a URL, treat the whole scanned text as reference
          setTransactionReference(scannedUrl);
        }
      }
    } catch {
      // If it's not a URL, treat the whole scanned text as reference
      setTransactionReference(scannedUrl);
    }
    
    setShowScanner(false);
  };

  const getBankName = (provider: string) => {
    const bankNames: Record<string, string> = {
      CBE: "Commercial Bank of Ethiopia (CBE)",
      TELEBIRR: "Telebirr",
      AWASH: "Awash Bank",
      BOA: "Bank of Abyssinia (BOA)",
      DASHEN: "Dashen Bank",
    };
    return bankNames[provider] || provider;
  };

  const getReferencePlaceholder = (provider: string) => {
    const placeholders: Record<string, string> = {
      CBE: "FT25346XXXXXX",
      TELEBIRR: "Transaction reference",
      AWASH: "Transaction reference",
      BOA: "Transaction reference",
      DASHEN: "Transaction reference",
    };
    return placeholders[provider] || "Transaction reference";
  };

  const getReferenceLabel = (provider: string) => {
    if (provider === "CBE") {
      return "CBE Reference (FT...)";
    }
    return "Transaction Reference";
  };

  const isValidReference = transactionReference.trim().length > 0;

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

          {/* Transaction Reference Input */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
              {getReferenceLabel(receiver.provider)}
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={getReferencePlaceholder(receiver.provider)}
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="flex-1"
                disabled={isVerifying}
              />
              <Button
                variant="outline"
                onClick={() => setShowScanner(true)}
                disabled={isVerifying}
                className="shrink-0"
              >
                Scan QR
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter the reference from your {bankName} receipt, or scan the QR code from your bank app
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={!isValidReference || isVerifying}
            className="w-full bg-green-500 hover:bg-green-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify Payment"}
          </Button>

          {/* Timer */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expires in {timeRemaining} min remaining
            </p>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <CameraScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </Modal>
  );
}

