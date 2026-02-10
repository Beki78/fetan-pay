"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useGetPublicPaymentDetailsQuery, usePublicVerifyMutation } from "@/lib/services/transactionsServiceApi";
import { CheckCircleIcon, ChevronDownIcon, LockIcon } from "@/icons";
import { STATIC_ASSETS_BASE_URL } from "@/lib/config";

export default function PublicPaymentPage() {
  const params = useParams();
  const transactionId = params?.id as string;

  const { data: paymentDetails, isLoading, error, refetch } = useGetPublicPaymentDetailsQuery(transactionId, {
    skip: !transactionId,
    pollingInterval: 10000, // Poll every 10 seconds for status updates
  });

  const [publicVerify, { isLoading: isVerifying }] = usePublicVerifyMutation();

  const [activeTab, setActiveTab] = useState<"reference" | "receipt">("reference");
  const [cbeReference, setCbeReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [showHowToPay, setShowHowToPay] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState(false);
 
  // Calculate time remaining from expiresAt
  useEffect(() => {
    if (!paymentDetails?.expiresAt) return;

    const calculateRemaining = () => {
      const expiry = new Date(paymentDetails.expiresAt);
      const now = new Date();
      return Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));
    };

    setTimeRemaining(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentDetails?.expiresAt]);

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
    ? cbeReference.trim().length > 0
    : receiptFile !== null;

  const handleVerify = async () => {
    if (!canVerify || !paymentDetails) return;
    
    setVerifyError(null);
    
    try {
      const result = await publicVerify({
        transactionId: paymentDetails.reference,
        reference: cbeReference.trim(),
        provider: paymentDetails.receiverProvider || paymentDetails.provider,
      }).unwrap();
      
      if (result.success) {
        setVerifySuccess(true);
        refetch(); // Refresh payment details to show verified status
      } else {
        setVerifyError(result.message || "Verification failed. Please check your reference.");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setVerifyError(error?.data?.message || "Verification failed. Please try again.");
    }
  };

  const isExpired = paymentDetails?.isExpired || timeRemaining <= 0;
  const isVerified = paymentDetails?.status === "VERIFIED";

  // Get bank logo based on provider
  const getBankLogo = (provider: string | null) => {
    if (!provider) return "/images/banks/CBE.png";
    const logos: Record<string, string> = {
      CBE: "/images/banks/CBE.png",
      TELEBIRR: "/images/banks/telebirr.png",
      AWASH: "/images/banks/awash.png",
      BOA: "/images/banks/boa.png",
      DASHEN: "/images/banks/dashen.png",
    };
    return logos[provider] || "/images/banks/CBE.png";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-pulse text-gray-500">Loading payment details...</div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-red-600 dark:bg-red-700 px-6 py-8 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">Payment Not Found</h1>
            <p className="text-white/80">This payment link is invalid or has been removed.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 px-6 py-6">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              Please contact the merchant for a new payment link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-green-600 dark:bg-green-700 px-6 py-8 text-white text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Verified</h1>
            <p className="text-white/80">This payment has been successfully verified.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Reference</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{paymentDetails.reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {paymentDetails.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {paymentDetails.currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-red-600 dark:bg-red-700 px-6 py-8 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">Payment Expired</h1>
            <p className="text-white/80">This payment link has expired.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 px-6 py-6">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              Please contact the merchant for a new payment link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get branding colors with fallback
  const primaryColor = paymentDetails.branding?.primaryColor || "#7C3AED";
  const secondaryColor = paymentDetails.branding?.secondaryColor || "#6366F1";
  const brandName = paymentDetails.branding?.displayName || paymentDetails.merchantName || "PAYAUTH";
  const showPoweredBy = paymentDetails.branding?.showPoweredBy ?? true;
  
  // Construct full logo URL
  const logoUrl = paymentDetails.branding?.logoUrl 
    ? `${STATIC_ASSETS_BASE_URL}${paymentDetails.branding.logoUrl}`
    : null;
  
  // Debug logging
  console.log('Branding data:', {
    fullBranding: paymentDetails.branding,
    logoUrl: paymentDetails.branding?.logoUrl,
    constructedUrl: logoUrl,
    showPoweredBy: paymentDetails.branding?.showPoweredBy,
    showPoweredByComputed: showPoweredBy,
    STATIC_ASSETS_BASE_URL,
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-[420px] w-full rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Header Section with branding color */}
        <div 
          className="px-6 pt-6 pb-5 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
          }}
        >
          {/* Logo and Brand Name - Centered */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="text-lg font-bold tracking-wide">{brandName}</span>
            <div className="flex items-center gap-2">
              {logoUrl && (
                <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                  <Image
                    src={logoUrl}
                    alt={brandName}
                    width={32}
                    height={32}
                    className="object-contain p-1"
                    unoptimized
                    onError={(e) => {
                      console.error('Logo failed to load:', logoUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                <Image
                  src={getBankLogo(paymentDetails.receiverProvider)}
                  alt="Bank"
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
              <h1 className="text-5xl font-bold">
                {paymentDetails.amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </h1>
              <span className="text-xl font-semibold">{paymentDetails.currency}</span>
            </div>
            <p className="text-sm text-white/80 mt-2">
              {formatTime(timeRemaining)} remaining
            </p>
          </div>
        </div>

        {/* White Body Section */}
        <div className="bg-white dark:bg-gray-800 px-6 py-6 space-y-6">
          {/* Transaction Details - Matching the image layout */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">{paymentDetails.reference}</span>
            </div>
            {paymentDetails.receiverName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Pay To</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{paymentDetails.receiverName}</span>
              </div>
            )}
            {paymentDetails.receiverAccount && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Account</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{paymentDetails.receiverAccount}</span>
                  <button
                    onClick={() => handleCopy(paymentDetails.receiverAccount!)}
                    className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors active:scale-95"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
            {paymentDetails.payerName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Payer Name</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{paymentDetails.payerName}</span>
              </div>
            )}
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
                Transaction Reference
              </label>
              <input
                type="text"
                placeholder="FT25346B61Q5"
                value={cbeReference}
                onChange={(e) => setCbeReference(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter the transaction reference from your bank receipt (e.g., FT24123ABC456)
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

          {/* Error Message */}
          {verifyError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{verifyError}</p>
            </div>
          )}

          {/* Success Message */}
          {verifySuccess && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400">Payment verified successfully!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={!canVerify || isVerifying}
              className={`w-full h-12 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                canVerify && !isVerifying
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
              ) : (
                <>
                  {!canVerify && <LockIcon className="w-4 h-4" />}
                  <span>{activeTab === "reference" ? "Verify Payment" : "Verify from Receipt"}</span>
                </>
              )}
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
                    Transfer {paymentDetails.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {paymentDetails.currency} to the account above
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
                    Paste above and click &quot;Verify Payment&quot;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {showPoweredBy && (
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by <span className="font-semibold">FetanPay</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

