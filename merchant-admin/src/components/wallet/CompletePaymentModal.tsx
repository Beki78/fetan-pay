"use client";
import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { CameraScanner } from "./CameraScanner";
import { ChevronDownIcon } from "@/icons";
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

// Helper function to get bank name
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

// Helper function to get reference placeholder
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

export default function CompletePaymentModal({
  isOpen,
  onClose,
  amount,
  receiver,
  expiresAt,
  onVerify,
  isVerifying = false,
}: CompletePaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"reference" | "qr">("reference");
  const [transactionReference, setTransactionReference] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const accountNumber = receiver.receiverAccount;
  const accountName = receiver.receiverName || receiver.receiverLabel || "Account Name";
  const bankName = getBankName(receiver.provider);

  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      const remaining = Math.max(0, Math.floor(diff / 1000)); // seconds
      setTimeRemaining(remaining);
      setIsExpired(remaining === 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update every second

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isValidReference = transactionReference.trim().length > 0;
  const canVerify = isValidReference; // Works for both tabs now

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4" showCloseButton={true}>
        <div className="rounded-3xl bg-white dark:bg-gray-900 overflow-hidden">
          {/* Header Section with gradient */}
          <div 
            className="px-6 pt-6 pb-5 text-white"
            style={{ 
              background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' 
            }}
          >
            {/* Amount Section - Centered */}
            <div className="mb-4 text-center">
              <p className="text-sm text-white/90 mb-2">Amount to Deposit</p>
              <div className="flex items-baseline justify-center gap-2">
                <h1 className="text-5xl font-bold">
                  {amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </h1>
                <span className="text-xl font-semibold">ETB</span>
              </div>
              {!isExpired && (
                <p className="text-sm text-white/80 mt-2">
                  {formatTime(timeRemaining)} remaining
                </p>
              )}
              {isExpired && (
                <p className="text-sm text-red-200 mt-2 font-medium">
                  Expired
                </p>
              )}
            </div>
          </div>

          {/* White Body Section */}
          <div className="bg-white dark:bg-gray-800 px-6 py-6 space-y-6">
            {/* Bank Account Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Bank</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Account Name</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{accountName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{accountNumber}</span>
                  <button
                    onClick={() => handleCopy(accountNumber)}
                    className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors active:scale-95"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("reference")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "reference"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Transaction ID
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "qr"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                QR Code
              </button>
            </div>

            {/* Transaction ID Tab */}
            {activeTab === "reference" && (
              <div className="space-y-3 transition-all duration-200">
                <label className="block text-sm font-medium text-gray-800 dark:text-white">
                  Transaction Reference
                </label>
                <Input
                  type="text"
                  placeholder={getReferencePlaceholder(receiver.provider)}
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full"
                  disabled={isVerifying || isExpired}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter the transaction reference from your bank receipt (e.g., FT24123ABC456)
                </p>
              </div>
            )}

            {/* QR Code Tab */}
            {activeTab === "qr" && (
              <div className="space-y-3 transition-all duration-200">
                <label className="block text-sm font-medium text-gray-800 dark:text-white">
                  Scan QR Code from Receipt
                </label>
                
                {!transactionReference ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <div className="space-y-4">
                        <svg
                          className="mx-auto h-16 w-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                        <Button
                          onClick={() => setShowScanner(true)}
                          disabled={isVerifying || isExpired}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Open Camera to Scan
                        </Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Scan the QR code from your bank receipt to auto-fill the reference
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">QR Code Scanned Successfully</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mb-1">Reference extracted:</p>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 font-mono">{transactionReference}</p>
                    </div>
                    <Button
                      onClick={() => {
                        setTransactionReference("");
                        setShowScanner(true);
                      }}
                      variant="outline"
                      disabled={isVerifying || isExpired}
                      className="w-full"
                    >
                      Scan Again
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleVerify}
                disabled={!canVerify || isVerifying || isExpired}
                className={`w-full h-12 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  canVerify && !isVerifying && !isExpired
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : isExpired ? (
                  <span>Expired - Cannot Verify</span>
                ) : (
                  <span>Verify Deposit</span>
                )}
              </Button>
            </div>

            {/* How to Deposit Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between text-left py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  How to Deposit
                </span>
                <div className="transition-transform duration-200" style={{ transform: showInstructions ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                </div>
              </button>
              {showInstructions && (
                <div className="mt-4 space-y-3 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Open your mobile banking app or Internet Banking
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Transfer {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB to the account above
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Copy the transaction reference from your receipt
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold shrink-0 mt-0.5">
                      4
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Enter the reference above or scan the QR code and click &quot;Verify Deposit&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by <span className="font-semibold">FetanPay</span>
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* QR Scanner Modal */}
      {showScanner && (
        <CameraScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
