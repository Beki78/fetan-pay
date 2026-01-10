"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, LockIcon } from "@/icons";

interface SubscribePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
  };
}

export default function SubscribePaymentModal({
  isOpen,
  onClose,
  plan,
}: SubscribePaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"reference" | "receipt">("reference");
  const [cbeReference, setCbeReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(17 * 60); // 17 minutes in seconds
  const [showHowToPay, setShowHowToPay] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock transaction data
  const transactionId = "TXNGQHAUARIVB";
  const accountNumber = "1000675169601";
  const accountName = "MIKYAS MULAT ASMARE";
  const payerName = "EPHREM DEBEBE";

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canVerify = activeTab === "reference" 
    ? cbeReference.trim().length > 0 && cbeReference.trim().startsWith("FT")
    : receiptFile !== null;

  const handleVerify = () => {
    if (canVerify) {
      // Handle payment verification
      console.log("Verifying payment:", {
        plan: plan.id,
        reference: activeTab === "reference" ? cbeReference : "from receipt",
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[560px] m-4"
      showCloseButton={false}
    >
      <div className="rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Purple Header Section */}
        <div className="bg-purple-600 dark:bg-purple-700 px-6 pt-6 pb-5 text-white">
          {/* Logo and Icons - Centered */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="text-lg font-bold">FetanPay</span>
            <div className="flex items-center gap-2">
              {/* Placeholder Logo */}
              <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center border border-white/30">
                <span className="text-xs font-bold text-white">R</span>
              </div>
              {/* CBE Logo */}
              <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/banks/CBE.png"
                  alt="CBE Bank"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Amount Section - Centered */}
          <div className="mb-4 text-center">
            <p className="text-sm text-white/90 mb-2">Amount to Pay</p>
            <div className="flex items-baseline justify-center gap-2">
              <h1 className="text-5xl font-bold">{plan.price} ETB</h1>
              <span className="text-base">₦</span>
            </div>
            <p className="text-sm text-white/80 mt-2">
              {formatTime(timeRemaining)} remaining
            </p>
          </div>

          {/* Plan Banner - Centered */}
          <div className="bg-purple-500/30 dark:bg-purple-600/30 rounded-lg px-4 py-2.5 flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="text-sm font-medium">
              {plan.name} Plan · {plan.billingCycle}
            </span>
          </div>
        </div>

        {/* White Body Section */}
        <div className="bg-white dark:bg-gray-800 px-6 py-6 space-y-6">
          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{transactionId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Pay To</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{accountName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Account</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800 dark:text-white">{accountNumber}</span>
                <button
                  onClick={() => handleCopy(accountNumber)}
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors active:scale-95"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Payer Name</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{payerName}</span>
            </div>
          </div>

          {/* Tabs - Full Width Equal Distribution */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("reference")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "reference"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Enter Reference
            </button>
            <button
              onClick={() => setActiveTab("receipt")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "receipt"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Upload Receipt
            </button>
          </div>

          {/* Reference Input Tab */}
          {activeTab === "reference" && (
            <div className="space-y-3 transition-all duration-200">
              <label className="block text-sm font-medium text-gray-800 dark:text-white">
                CBE Transaction Reference
              </label>
              <input
                type="text"
                placeholder="FT25346B61Q5"
                value={cbeReference}
                onChange={(e) => setCbeReference(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CBE reference starts with FT (e.g., FT24123ABC456)
              </p>
            </div>
          )}

          {/* Receipt Upload Tab */}
          {activeTab === "receipt" && (
            <div className="space-y-3 transition-all duration-200">
              <label className="block text-sm font-medium text-gray-800 dark:text-white">
                Upload Payment Receipt (PDF)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                {receiptPreview ? (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <Image
                        src={receiptPreview}
                        alt="Receipt preview"
                        width={180}
                        height={180}
                        className="object-contain max-h-40"
                      />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setReceiptFile(null);
                          setReceiptPreview(null);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Remove
                      </button>
                      <label className="cursor-pointer">
                        <span className="inline-block px-3 py-1.5 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                          Change Receipt
                        </span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleReceiptUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="space-y-2">
                      <svg
                        className="mx-auto h-10 w-10 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-500">
                        PDF file only (max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                We&apos;ll extract the transaction reference from your receipt
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={!canVerify}
              className={`w-full h-12 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                canVerify
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              {!canVerify && <LockIcon className="w-4 h-4" />}
              <span>{activeTab === "reference" ? "Verify Payment" : "Verify from Receipt"}</span>
            </button>
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors py-2 active:scale-95"
            >
              Cancel Payment
            </button>
          </div>

          {/* How to Pay Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
            <button
              onClick={() => setShowHowToPay(!showHowToPay)}
              className="w-full flex items-center justify-between text-left py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                How to Pay
              </span>
              <div className="transition-transform duration-200" style={{ transform: showHowToPay ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              </div>
            </button>
            {showHowToPay && (
              <div className="mt-4 space-y-3 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Open Commercial Bank of Ethiopia or Internet Banking
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Transfer {plan.price} ETB to the account above
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Copy the transaction reference from your receipt
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Paste above and click &quot;Verify Payment&quot;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by FetanPay
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

