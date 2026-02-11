"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, LockIcon } from "@/icons";
import { 
  useUpgradeMerchantPlanMutation,
  useGetActivePricingReceiversByProviderQuery,
  useGetAllActivePricingReceiversQuery,
  useVerifyPaymentMutation,
  type TransactionProvider,
  type PricingReceiverAccount,
  type VerifyPaymentResponse
} from "@/lib/services/pricingServiceApi";
import { useMerchant } from "@/hooks/useMerchant";
import { toast } from "sonner";

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

const PROVIDER_OPTIONS: Array<{ code: TransactionProvider; name: string; logo: string }> = [
  { code: "CBE", name: "Commercial Bank of Ethiopia", logo: "/images/banks/CBE.png" },
  { code: "TELEBIRR", name: "Telebirr", logo: "/images/banks/Telebirr.png" },
  { code: "AWASH", name: "Awash Bank", logo: "/images/banks/Awash.png" },
  { code: "BOA", name: "Bank of Abyssinia", logo: "/images/banks/BOA.png" },
];

export default function SubscribePaymentModal({
  isOpen,
  onClose,
  plan,
}: SubscribePaymentModalProps) {
  const [step, setStep] = useState<"select-bank" | "payment" | "verification">("select-bank");
  const [selectedProvider, setSelectedProvider] = useState<TransactionProvider | null>(null);
  const [selectedReceiver, setSelectedReceiver] = useState<PricingReceiverAccount | null>(null);
  const [activeTab, setActiveTab] = useState<"reference" | "receipt" | "transaction">("reference");
  const [paymentReference, setPaymentReference] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(17 * 60); // 17 minutes in seconds
  const [showHowToPay, setShowHowToPay] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerifyPaymentResponse | null>(null);

  const { merchantId } = useMerchant();
  const [upgradePlan, { isLoading: isUpgrading }] = useUpgradeMerchantPlanMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  
  // Fetch all active receivers to filter available providers
  const { data: allReceivers = [], isLoading: allReceiversLoading } = useGetAllActivePricingReceiversQuery();
  
  // Fetch receivers for selected provider
  const { data: receivers = [], isLoading: receiversLoading } = useGetActivePricingReceiversByProviderQuery(
    selectedProvider || '',
    { skip: !selectedProvider }
  );

  // Filter PROVIDER_OPTIONS based on available receivers from admin
  const availableProviders = PROVIDER_OPTIONS.filter(provider => 
    allReceivers.some(receiver => receiver.provider === provider.code)
  );

  // Mock transaction data - will be generated when receiver is selected
  const mockTransactionId = selectedReceiver ? `TXN${Date.now().toString().slice(-8).toUpperCase()}` : "";

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep("select-bank");
      setSelectedProvider(null);
      setSelectedReceiver(null);
      setPaymentReference("");
      setTransactionId("");
      setReceiptFile(null);
      setReceiptPreview(null);
      setTimeRemaining(17 * 60);
      setVerificationResult(null);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleProviderSelect = (provider: TransactionProvider) => {
    setSelectedProvider(provider);
    // Auto-select first receiver if only one available
    // We'll set this after receivers are loaded
  };

  useEffect(() => {
    if (receivers.length === 1) {
      setSelectedReceiver(receivers[0]);
      setStep("payment");
    } else if (receivers.length > 1) {
      // For now, auto-select first receiver, but in future could show receiver selection
      setSelectedReceiver(receivers[0]);
      setStep("payment");
    }
  }, [receivers]);

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
    ? paymentReference.trim().length > 0 && (
        selectedProvider === "CBE" ? paymentReference.trim().startsWith("FT") : paymentReference.trim().length > 0
      )
    : activeTab === "transaction"
    ? transactionId.trim().length > 0
    : receiptFile !== null;

  const handleVerify = async () => {
    if (!canVerify || !merchantId || !selectedReceiver || !selectedProvider) return;

    setIsProcessing(true);
    try {
      // First verify the payment
      const reference = activeTab === "reference" 
        ? paymentReference 
        : activeTab === "transaction"
        ? transactionId
        : `Receipt: ${receiptFile?.name}`;

      const verificationResponse = await verifyPayment({
        provider: selectedProvider,
        reference,
        claimedAmount: plan.price,
      }).unwrap();

      setVerificationResult(verificationResponse);

      if (verificationResponse.status === "VERIFIED") {
        // Payment verified successfully, proceed with plan upgrade
        await upgradePlan({
          merchantId,
          planId: plan.id,
          paymentReference: verificationResponse.transaction.reference,
          paymentMethod: `${selectedProvider} - ${activeTab === "reference" ? "Reference" : activeTab === "transaction" ? "Transaction" : "Receipt"}`,
        }).unwrap();

        toast.success(`Successfully upgraded to ${plan.name} plan!`);
        onClose();
      } else {
        // Payment verification failed
        setStep("verification");
        toast.error("Payment verification failed. Please check your transaction details.");
      }
    } catch (error: any) {
      console.error('Verification or upgrade failed:', error);
      
      // Handle specific error cases with better user messaging
      if (error?.data?.message?.includes('already has an active subscription')) {
        toast.error(`You already have the ${plan.name} plan active.`);
      } else if (error?.data?.message?.includes('pending assignment')) {
        toast.error('Your previous upgrade request is still being processed. Please wait a few minutes and try again, or contact support if this persists.');
      } else if (error?.data?.message?.includes('Merchant not found')) {
        toast.error('Account not found. Please refresh the page and try again.');
      } else if (error?.data?.message?.includes('Plan not found')) {
        toast.error('Selected plan is no longer available. Please refresh the page and select a different plan.');
      } else if (error?.data?.message?.includes('inactive plan')) {
        toast.error('This plan is currently unavailable. Please select a different plan.');
      } else if (error?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (error?.status >= 500) {
        toast.error('Server error occurred. Please try again in a few minutes or contact support.');
      } else {
        toast.error(error?.data?.message || 'Failed to verify payment. Please try again or contact support.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (step === "verification") {
      setStep("payment");
      setVerificationResult(null);
    } else if (step === "payment") {
      setStep("select-bank");
      setSelectedProvider(null);
      setSelectedReceiver(null);
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

        {step === "select-bank" ? (
          // Bank Selection Step
          <>
            {/* Purple Header Section */}
            <div className="bg-purple-600 dark:bg-purple-700 px-6 pt-6 pb-5 text-white">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Select Payment Method</h1>
                <p className="text-sm text-white/90 mb-4">
                  Choose your preferred bank to pay for {plan.name}
                </p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl font-bold">{plan.price} ETB</span>
                  <span className="text-base">₦</span>
                </div>
              </div>
            </div>

            {/* White Body Section */}
            <div className="bg-white dark:bg-gray-800 px-6 py-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Available Payment Methods
              </h3>
              
              {allReceiversLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading payment methods...</p>
                </div>
              ) : availableProviders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Payment Methods Available</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No payment providers have been configured by the administrator.
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Please contact support to set up payment methods.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {availableProviders.map((provider) => (
                    <button
                      key={provider.code}
                      onClick={() => handleProviderSelect(provider.code)}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left"
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                        <Image
                          src={provider.logo}
                          alt={`${provider.name} logo`}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {provider.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Pay via {provider.name}
                        </p>
                      </div>
                      <div className="text-purple-600 dark:text-purple-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {receiversLoading && selectedProvider && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading payment details...</p>
                </div>
              )}
            </div>
          </>
        ) : step === "verification" ? (
          // Verification Result Step
          <>
            {/* Purple Header Section */}
            <div className="bg-purple-600 dark:bg-purple-700 px-6 pt-6 pb-5 text-white">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back to payment</span>
              </button>

              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Verification Result</h1>
                <p className="text-sm text-white/90 mb-4">
                  Payment verification for {plan.name}
                </p>
              </div>
            </div>

            {/* White Body Section */}
            <div className="bg-white dark:bg-gray-800 px-6 py-6 space-y-6">
              {verificationResult && (
                <>
                  {/* Verification Status */}
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      verificationResult.status === "VERIFIED" 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}>
                      {verificationResult.status === "VERIFIED" ? (
                        <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                      ) : (
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${
                      verificationResult.status === "VERIFIED" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {verificationResult.status === "VERIFIED" ? "Payment Verified" : "Verification Failed"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {verificationResult.status === "VERIFIED" 
                        ? "Your payment has been successfully verified and your plan will be upgraded."
                        : "We couldn't verify your payment. Please check the details and try again."}
                    </p>
                  </div>

                  {/* Verification Details */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-3">Verification Details</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Reference Found:</span>
                        <span className={`ml-2 font-medium ${
                          verificationResult.checks.referenceFound 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {verificationResult.checks.referenceFound ? "✓ Yes" : "✗ No"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Receiver Matches:</span>
                        <span className={`ml-2 font-medium ${
                          verificationResult.checks.receiverMatches 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {verificationResult.checks.receiverMatches ? "✓ Yes" : "✗ No"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Amount Matches:</span>
                        <span className={`ml-2 font-medium ${
                          verificationResult.checks.amountMatches 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {verificationResult.checks.amountMatches ? "✓ Yes" : "✗ No"}
                        </span>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    {verificationResult.transaction && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                        <h5 className="font-medium text-gray-800 dark:text-white mb-2">Transaction Information</h5>
                        <div className="space-y-2 text-sm">
                          {verificationResult.transaction.reference && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Reference:</span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {verificationResult.transaction.reference}
                              </span>
                            </div>
                          )}
                          {verificationResult.transaction.amount && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {verificationResult.transaction.amount} ETB
                              </span>
                            </div>
                          )}
                          {verificationResult.transaction.senderName && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Sender:</span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {verificationResult.transaction.senderName}
                              </span>
                            </div>
                          )}
                          {verificationResult.transaction.receiverName && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Receiver:</span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {verificationResult.transaction.receiverName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mismatch Reason */}
                    {verificationResult.mismatchReason && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                        <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">Issue Details</h5>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {verificationResult.mismatchReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {verificationResult.status !== "VERIFIED" && (
                      <button
                        onClick={handleBack}
                        className="w-full h-12 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                      >
                        Try Again
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors py-2 active:scale-95"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          // Payment Step
          <>
            {/* Purple Header Section */}
            <div className="bg-purple-600 dark:bg-purple-700 px-6 pt-6 pb-5 text-white">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back to payment methods</span>
              </button>

              {/* Logo and Icons - Centered */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <span className="text-lg font-bold">FetanPay</span>
                <div className="flex items-center gap-2">
                  {/* Placeholder Logo */}
                  <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center border border-white/30">
                    <span className="text-xs font-bold text-white">F</span>
                  </div>
                  {/* Selected Bank Logo */}
                  {selectedProvider && (
                    <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                      <Image
                        src={PROVIDER_OPTIONS.find(p => p.code === selectedProvider)?.logo || ""}
                        alt={`${selectedProvider} Bank`}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Section - Centered */}
              <div className="mb-4 text-center">
                <p className="text-sm text-white/90 mb-2">Amount to Pay</p>
                <div className="flex items-baseline justify-center gap-2">
                  <h1 className="text-5xl font-bold">{plan.price} ETB</h1>
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
              {selectedReceiver && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">{mockTransactionId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Pay To</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">{selectedReceiver.receiverName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Account</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{selectedReceiver.receiverAccount}</span>
                      <button
                        onClick={() => handleCopy(selectedReceiver.receiverAccount)}
                        className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors active:scale-95"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                  {selectedReceiver.receiverLabel && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Label</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{selectedReceiver.receiverLabel}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tabs - Full Width Equal Distribution */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("reference")}
                  className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === "reference"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Reference
                </button>
                <button
                  onClick={() => setActiveTab("transaction")}
                  className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === "transaction"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Transaction
                </button>
                <button
                  onClick={() => setActiveTab("receipt")}
                  className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === "receipt"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Receipt
                </button>
              </div>

              {/* Transaction ID Input Tab */}
              {activeTab === "transaction" && (
                <div className="space-y-3 transition-all duration-200">
                  <label className="block text-sm font-medium text-gray-800 dark:text-white">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter transaction ID from your receipt"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter the transaction ID exactly as shown on your bank receipt or SMS
                  </p>
                </div>
              )}

              {/* Reference Input Tab */}
              {activeTab === "reference" && (
                <div className="space-y-3 transition-all duration-200">
                  <label className="block text-sm font-medium text-gray-800 dark:text-white">
                    {selectedProvider} Transaction Reference
                  </label>
                  <input
                    type="text"
                    placeholder="FT25346B61Q5"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedProvider === "CBE" ? "CBE reference starts with FT (e.g., FT24123ABC456)" : `Enter your ${selectedProvider} transaction reference`}
                  </p>
                </div>
              )}

              {/* Receipt Upload Tab */}
              {activeTab === "receipt" && (
                <div className="space-y-3 transition-all duration-200">
                  <label className="block text-sm font-medium text-gray-800 dark:text-white">
                    Upload Payment Receipt
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
                              accept=".pdf,.jpg,.jpeg,.png,.webp"
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
                            PDF, JPG, PNG or WEBP (max 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
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
                  disabled={!canVerify || isProcessing || isUpgrading || isVerifying}
                  className={`w-full h-12 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                    canVerify && !isProcessing && !isUpgrading && !isVerifying
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isProcessing || isUpgrading || isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>
                        {isVerifying ? "Verifying..." : isUpgrading ? "Upgrading..." : "Processing..."}
                      </span>
                    </>
                  ) : (
                    <>
                      {!canVerify && <LockIcon className="w-4 h-4" />}
                      <span>
                        {activeTab === "reference" 
                          ? "Verify Payment" 
                          : activeTab === "transaction"
                          ? "Verify Transaction"
                          : "Verify from Receipt"}
                      </span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors py-2 active:scale-95"
                >
                  Cancel Payment
                </button>
              </div>

              {/* How to Pay Section */}
              {selectedReceiver && (
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
                          Open {PROVIDER_OPTIONS.find(p => p.code === selectedProvider)?.name} or Internet Banking
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                          2
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          Transfer {plan.price} ETB to account {selectedReceiver.receiverAccount}
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
              )}

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Powered by FetanPay
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

