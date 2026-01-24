"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import {
  CheckCircle2,
  FileDigit,
  Scan,
  RefreshCcw,
  Building,
  User,
  // ClipboardClock, // Commented out - history button removed
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BankSelection } from "@/components/bank-selection";
import { CameraScanner } from "@/components/camera-scanner";
import { ThemeToggle } from "@/components/theme-toggle";
import VConsoleCDN from "@/components/vconsole-cdn";
// import { VerificationHistorySidebar } from "@/components/verification-history-sidebar"; // Commented out - history sidebar removed
// import { ProfileDropdown } from "@/components/profile-dropdown"; // Commented out - profile dropdown removed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { APP_CONFIG, BANKS } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  formatNumberWithCommas,
  extractTransactionId,
  detectBankFromUrl,
  type BankId,
} from "@/lib/validation";
import { createScanSchema } from "@/lib/schemas";
import { useVerifyMerchantPaymentMutation } from "@/lib/services/paymentsServiceApi";
import { useSession } from "@/hooks/useSession";
import { useRouter, useSearchParams } from "next/navigation";

type FormData = {
  transactionId?: string;
  tipAmount?: string;
  verificationMethod: "transaction" | "camera" | null;
};

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
  const quickScanTriggered = useRef(false);
  // const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<
    "transaction" | "camera" | null
  >(null);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    status: string;
    reference: string;
    provider: string;
    senderName?: string | null;
    receiverAccount?: string | null;
    receiverName?: string | null;
    amount?: number | null;
    details?: unknown;
    message?: string;
  } | null>(null);
  const [verifyMerchantPayment, { isLoading: isVerifying }] =
    useVerifyMerchantPaymentMutation();
  const [isVerifyingWithBank, setIsVerifyingWithBank] = useState<BankId | null>(
    null
  );
  const resultsRef = useRef<HTMLDivElement>(null);
  const isVerifyingRef = useRef(false); // Prevent duplicate verification calls

  const schema = createScanSchema(
    selectedBank as BankId | null,
    verificationMethod,
    showTip
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactionId: "",
      tipAmount: "",
      verificationMethod: null,
    },
  });

  const tipAmount = watch("tipAmount");

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    // Do not auto-select verification method; let the user choose.
    setVerificationMethod(null);
    setValue("verificationMethod", null);
    setValue("transactionId", "");
    reset({
      transactionId: "",
      tipAmount: tipAmount || "",
      verificationMethod: null,
    });
  };

  const handleCameraScan = async (scannedUrl: string) => {
    console.log("🔍 [SCAN] handleCameraScan called with:", scannedUrl);

    // Prevent duplicate verification calls
    if (isVerifyingRef.current) {
      console.log("⚠️ [SCAN] Verification already in progress, ignoring duplicate scan");
      return;
    }

    // Close camera immediately
    setShowCamera(false);

    // Detect bank from URL
    const urlDetectedBank = detectBankFromUrl(scannedUrl);
    const detectedBank = urlDetectedBank || (selectedBank as BankId | null);

    // Auto-select bank if detected
    if (urlDetectedBank && selectedBank !== urlDetectedBank) {
      setSelectedBank(urlDetectedBank);
    }

    // Extract transaction reference
    const extractedReference = extractTransactionId(detectedBank, scannedUrl);
    const finalReference =
      extractedReference && extractedReference !== scannedUrl
        ? extractedReference
        : scannedUrl;

    // Set form values (but don't trigger form submission)
    setVerificationMethod("camera");
    setValue("verificationMethod", "camera", { shouldValidate: false, shouldDirty: false });
    setValue("transactionId", finalReference, { shouldValidate: false, shouldDirty: false });

    const finalBank = detectedBank;

    if (!finalBank) {
      toast.info("Select bank first", {
        description: "Could not detect bank from QR code",
      });
      return;
    }

    // Set verifying flag to prevent duplicate calls
    isVerifyingRef.current = true;

    // Show loading spinner with bank logo - verify immediately (no amount needed)
    setIsVerifyingWithBank(finalBank);

    try {
      // Call verification directly without amount - backend will use bank response amount
      const provider = finalBank.toUpperCase() as
        | "CBE"
        | "TELEBIRR"
        | "AWASH"
        | "BOA"
        | "DASHEN";
      const response = await verifyMerchantPayment({
        provider,
        reference: finalReference,
        // No claimedAmount - backend uses amount from bank response
        tipAmount: tipAmount
          ? parseFloat(tipAmount.replace(/,/g, ""))
          : undefined,
      }).unwrap();

      console.log("✅ [SCAN] Verification response:", response);

      const success = response.status === "VERIFIED";

      // Show result
      setVerificationResult({
        success,
        status: response.status,
        reference: finalReference,
        provider: finalBank,
        senderName: response.transaction?.senderName,
        receiverAccount: response.transaction?.receiverAccount,
        receiverName: response.transaction?.receiverName,
        amount: response.transaction?.amount,
        details: {
          checks: response.checks,
          raw: response.transaction?.raw,
        },
        message: success
          ? "Payment verified successfully!"
          : response.mismatchReason || "Payment could not be verified",
      });

      // Show toast for result
      toast[success ? "success" : "warning"](
        success ? "Payment verified" : "Not verified",
        {
          description: success
            ? `Reference ${finalReference} verified`
            : response.mismatchReason || "Payment could not be verified",
          duration: 5000,
        }
      );

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("❌ [SCAN] Verification failed:", error);

      // Extract error message
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : error instanceof Error
          ? error.message
          : "Please try again";

      toast.error("Verification failed", {
        description: errorMessage,
      });
    } finally {
      setIsVerifyingWithBank(null);
      isVerifyingRef.current = false; // Reset verification flag
    }
  };

  const handleTipChange = (value: string) => {
    const formatted = formatNumberWithCommas(value);
    setValue("tipAmount", formatted, { shouldValidate: false });
  };

  const onSubmit = async (data: FormData) => {
    console.log("📤 [VERIFY] onSubmit called with:", data);

    if (!selectedBank) {
      console.error("❌ [VERIFY] No bank selected");
      toast.error("Please select a bank account", {
        duration: 5000,
      });
      return;
    }

    if (!data.verificationMethod) {
      console.error("❌ [VERIFY] No verification method selected");
      toast.error("Please select a verification method", {
        duration: 5000,
      });
      return;
    }

    if (data.verificationMethod === "camera" && !data.transactionId) {
      console.error("❌ [VERIFY] No transaction ID for camera method");
      toast.error("Please scan a QR code", {
        duration: 5000,
      });
      return;
    }

    const providerMap: Record<BankId, "CBE" | "BOA" | "AWASH" | "TELEBIRR"> = {
      cbe: "CBE",
      boa: "BOA",
      awash: "AWASH",
      telebirr: "TELEBIRR",
    };

    // Set verifying state with bank logo
    setIsVerifyingWithBank(selectedBank as BankId);
    console.log("🔄 [VERIFY] Starting verification for:", selectedBank);

    try {
      setVerificationResult(null);

      const provider = providerMap[selectedBank as BankId];
      let reference = (data.transactionId || "").trim();
      console.log("📝 [VERIFY] Initial reference:", reference);

      // Extract reference from URL if it's a full URL
      if (
        reference &&
        (reference.startsWith("http") || reference.includes("://"))
      ) {
        console.log("🔍 [VERIFY] Extracting reference from URL:", reference);
        const extracted = extractTransactionId(
          selectedBank as BankId,
          reference
        );
        if (extracted && extracted !== reference) {
          reference = extracted;
          console.log("✅ [VERIFY] Extracted reference:", reference);
          // Update the form value with extracted reference
          setValue("transactionId", reference);
        }
      }

      if (!reference) {
        console.error("❌ [VERIFY] No reference found");
        setIsVerifyingWithBank(null);
        toast.error("Transaction reference is required", {
          duration: 5000,
        });
        throw new Error("Transaction reference is required");
      }

      // Parse tip amount if provided (optional - does not affect verification)
      const tipAmount =
        showTip && data.tipAmount
          ? parseFloat((data.tipAmount || "0").replace(/,/g, ""))
          : undefined;

      console.log("📤 [VERIFY] Sending verification request:", {
        provider,
        reference,
        tipAmount,
      });

      // Show loading toast
      toast.loading("Verifying payment...", {
        description: `Checking ${provider} transaction ${reference}`,
        duration: 10000,
      });

      // No claimedAmount - backend extracts amount from bank verification result
      const response = await verifyMerchantPayment({
        provider,
        reference,
        tipAmount: tipAmount && tipAmount > 0 ? tipAmount : undefined,
      }).unwrap();

      console.log("✅ [VERIFY] Verification response received:", response);

      const success = response.status === "VERIFIED";

      // Determine failure reason from checks
      const failureMessage = (() => {
        if (!response.checks?.referenceFound) {
          return "Transaction not found";
        }
        if (!response.checks?.receiverMatches) {
          return "Receiver account doesn't match your configured account";
        }
        return "Transaction could not be verified";
      })();

      setVerificationResult({
        success,
        status: response.status,
        reference: response.transaction?.reference ?? reference,
        provider,
        senderName: response.transaction?.senderName,
        receiverAccount: response.transaction?.receiverAccount,
        receiverName: response.transaction?.receiverName,
        amount: response.transaction?.amount,
        details: {
          checks: response.checks,
          raw: response.transaction?.raw,
        },
        message: success ? undefined : failureMessage,
      });

      // Clear verifying state
      setIsVerifyingWithBank(null);

      console.log("📊 [VERIFY] Verification result:", {
        success,
        status: response.status,
        reference: response.transaction?.reference ?? reference,
        failureMessage: success ? undefined : failureMessage,
      });

      // UNVERIFIED is an expected outcome (it means we fetched the receipt but checks didn't pass).
      // Only use an error toast for network/server errors (caught in catch below).
      toast.dismiss(); // Dismiss loading toast
      toast[success ? "success" : "warning"](
        success ? "Payment verified" : "Not verified",
        {
          description: success
            ? `Reference ${
                response.transaction?.reference ?? reference
              } verified`
            : failureMessage,
          duration: 8000,
        }
      );

      // Scroll to results to ensure they're visible
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    } catch (error: unknown) {
      // Clear verifying state
      setIsVerifyingWithBank(null);
      isVerifyingRef.current = false; // Reset verification flag

      console.error("❌ [VERIFY] Verification error:", error);

      const message =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : error instanceof Error
          ? error.message
          : "Verification failed";

      console.error("❌ [VERIFY] Error message:", message);

      toast.dismiss(); // Dismiss loading toast
      toast.error("Verification failed", {
        description: message,
        duration: 8000,
      });

      // Also set error result for UI display
      const errorResult = {
        success: false,
        status: "ERROR",
        reference: (data.transactionId || "").trim(),
        provider: providerMap[selectedBank as BankId],
        message: message,
      };

      console.log("📊 [VERIFY] Setting error result:", errorResult);
      setVerificationResult(errorResult);

      // Scroll to results after a short delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    } finally {
      // Always reset verification flag when done
      isVerifyingRef.current = false;
    }
  };

  // Route protection: unauthenticated users must sign in.
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isSessionLoading, router]);

  // Handle quick scan from URL parameter
  useEffect(() => {
    if (
      searchParams.get("quickscan") === "true" &&
      !quickScanTriggered.current &&
      isAuthenticated
    ) {
      quickScanTriggered.current = true;
      setShowCamera(true);
      // Clear the URL parameter
      router.replace("/scan", { scroll: false });
    }
  }, [searchParams, router, isAuthenticated]);

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect will happen in the effect; show loading to avoid 404
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center pb-20">
        <div className="text-sm text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  const selectedBankData = selectedBank
    ? BANKS.find((bank) => bank.id === selectedBank)
    : null;
  const verifyingBankData = isVerifyingWithBank
    ? BANKS.find((bank) => bank.id === isVerifyingWithBank)
    : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background pb-20">
      {/* Bank Logo Loading Spinner Overlay */}
      {isVerifyingWithBank && verifyingBankData && (
        <div className="fixed inset-0 z-9998 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 bg-background rounded-2xl shadow-2xl border border-border">
            <div className="relative w-24 h-24">
              <Image
                src={verifyingBankData.icon}
                alt={verifyingBankData.name}
                fill
                sizes="96px"
                className="object-contain animate-spin"
                style={{ animationDuration: "2s" }}
              />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Verifying {verifyingBankData.fullName} Payment
              </h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your transaction...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 py-8 max-w-2xl">
        {/* Header with Theme Toggle and History */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-xl border border-blue-100 bg-white shadow-sm dark:border-slate-800 dark:bg-background">
              <Image
                src="/images/logo/fetan-logo.png"
                alt={APP_CONFIG.name}
                fill
                sizes="56px"
                className="object-contain p-2"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-poppins tracking-tight text-blue-700 dark:text-white">
                {APP_CONFIG.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Scan & verify payments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            {/* History button - commented out */}
            {/* <Button
              variant="outline"
              size="icon-lg"
              onClick={() => setShowHistorySidebar(true)}
              className=""
              aria-label="View verification history"
            >
              <ClipboardClock />
            </Button> */}
            <ThemeToggle />
            {/* Profile dropdown - commented out */}
            {/* <ProfileDropdown /> */}
          </div>
        </div>

        <Card className="shadow-xl border-border/50 ">
          <CardContent className="space-y-4 px-4">
            <form 
              onSubmit={(e) => {
                // Prevent form submission if verification is already in progress
                if (isVerifyingRef.current) {
                  e.preventDefault();
                  console.log("⚠️ [FORM] Preventing form submission - verification in progress");
                  return false;
                }
                return handleSubmit(onSubmit)(e);
              }} 
              className="space-y-6"
            >
              {/* Bank Selection */}
              {!selectedBank ? (
                <BankSelection
                  selectedBank={selectedBank}
                  onSelectBank={handleBankSelect}
                />
              ) : (
                <>
                  {/* Selected Bank Display */}
                  {selectedBankData && (
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                          <Image
                            src={selectedBankData.icon}
                            alt={selectedBankData.name}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBank(null);
                          setValue("verificationMethod", null);
                          setValue("transactionId", "");
                          reset();
                        }}
                      >
                        <RefreshCcw className="h-3 w-3 mr-1" />
                        Change Bank
                      </Button>
                    </div>
                  )}

                  {/* Verification Method Selection */}
                  {!verificationMethod && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground block">
                        Verification Method
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setVerificationMethod("transaction");
                            setValue("verificationMethod", "transaction");
                          }}
                          className={cn(
                            "flex items-center justify-center gap-3 p-5 border-2 rounded-lg transition-all",
                            "hover:border-primary hover:bg-primary/5 hover:shadow-md",
                            verificationMethod === "transaction"
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border bg-card"
                          )}
                        >
                          <FileDigit className="h-5 w-5 text-primary" />
                          <span className="font-medium text-base">
                            Transaction Reference
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className={cn(
                            "flex items-center justify-center gap-3 p-5 border-2 rounded-lg transition-all",
                            "hover:border-primary hover:bg-primary/5 hover:shadow-md",
                            verificationMethod === "camera"
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border bg-card"
                          )}
                        >
                          <Scan className="h-5 w-5 text-primary" />
                          <span className="font-medium text-base">
                            Scan QR Code
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Transaction ID Input */}
                  {verificationMethod === "transaction" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          Transaction Reference / URL
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setVerificationMethod(null);
                            setValue("verificationMethod", null);
                            setValue("transactionId", "");
                          }}
                          className="text-xs"
                        >
                          <RefreshCcw className="h-3 w-3 mr-1" />
                          Change Method
                        </Button>
                      </div>
                      <Input
                        type="text"
                        placeholder="Enter transaction reference or URL"
                        {...register("transactionId")}
                        className={cn(
                          "h-12 focus-visible:ring-1",
                          errors.transactionId && "border-destructive"
                        )}
                      />
                      {errors.transactionId && (
                        <p className="text-sm text-destructive">
                          {errors.transactionId.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Camera Scan Result */}
                  {verificationMethod === "camera" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          QR Code Status
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setVerificationMethod(null);
                            setValue("verificationMethod", null);
                            setValue("transactionId", "");
                          }}
                          className="text-xs"
                        >
                          <RefreshCcw className="h-3 w-3 mr-1" />
                          Change Method
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                        <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                        <span className="text-sm text-foreground flex-1">
                          QR code captured. Transaction details extracted.
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCamera(true)}
                        >
                          Rescan
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Account suffix for CBE */}

                  {/* Tip Input with Switch */}
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium text-foreground">
                          Include Tip
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Add tip amount for this transaction
                        </p>
                      </div>
                      <Switch
                        checked={showTip}
                        onCheckedChange={(checked) => {
                          setShowTip(checked);
                          if (!checked) {
                            setValue("tipAmount", "", {
                              shouldValidate: false,
                            });
                          }
                        }}
                      />
                    </div>
                    {showTip && (
                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-medium text-foreground">
                          Tip Amount (ETB)
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter tip amount"
                          {...register("tipAmount")}
                          value={tipAmount || ""}
                          onChange={(e) => {
                            handleTipChange(e.target.value);
                            setValue("tipAmount", e.target.value, {
                              shouldValidate: true,
                            });
                          }}
                          className={cn(
                            "h-12 focus-visible:ring-1",
                            errors.tipAmount && "border-destructive"
                          )}
                          inputMode="numeric"
                        />
                        {errors.tipAmount && (
                          <p className="text-sm text-destructive">
                            {errors.tipAmount.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                    size="lg"
                  >
                    {isVerifying ? (
                      <>
                        <Spinner className="mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-10 w-10" />
                        Verify Payment
                      </>
                    )}
                  </Button>

                  {/* Verification Results - Minimalist Design */}
                  {verificationResult && (
                    <div
                      ref={resultsRef}
                      className="mt-6 animate-in fade-in slide-in-from-bottom-4"
                    >
                      {/* Status Header */}
                      <div className={cn(
                        "flex items-center justify-between p-4 rounded-t-xl",
                        verificationResult.success
                          ? "bg-green-500 dark:bg-green-600"
                          : "bg-red-500 dark:bg-red-600"
                      )}>
                        <div className="flex items-center gap-3">
                          {verificationResult.success ? (
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          ) : (
                            <XCircle className="h-6 w-6 text-white" />
                          )}
                          <span className="text-white font-semibold text-lg">
                            {verificationResult.success ? "Verified" : "Failed"}
                          </span>
                        </div>
                        <span className="text-white/90 text-2xl font-bold">
                          {formatNumberWithCommas((verificationResult.amount ?? 0).toString())} ETB
                        </span>
                      </div>

                      {/* Main Content - Single Row Layout */}
                      <div className="bg-card border border-t-0 border-border rounded-b-xl">
                        <div className="flex items-stretch">
                          {/* Bank Logo Column - Compact on mobile */}
                          <div className="flex items-center justify-center p-3 sm:p-5 border-r border-border bg-muted/30 shrink-0">
                            {(() => {
                              const bankData = BANKS.find(b => b.id === verificationResult.provider.toLowerCase());
                              return bankData ? (
                                <div className="relative w-10 h-10 sm:w-14 sm:h-14">
                                  <Image
                                    src={bankData.icon}
                                    alt={bankData.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 640px) 40px, 56px"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-muted rounded-lg flex items-center justify-center">
                                  <Building className="h-5 w-5 sm:h-7 sm:w-7 text-muted-foreground" />
                                </div>
                              );
                            })()}
                          </div>

                          {/* Transaction Details Column - More space on mobile */}
                          <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3 min-w-0">
                            {/* Reference */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide shrink-0">Ref</span>
                              <span className="font-mono text-xs sm:text-sm font-medium text-foreground truncate">{verificationResult.reference}</span>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border/50" />

                            {/* Sender */}
                            {verificationResult.senderName && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide shrink-0">From</span>
                                <span className="text-xs sm:text-sm font-medium text-foreground capitalize truncate">
                                  {verificationResult.senderName}
                                </span>
                              </div>
                            )}

                            {/* Receiver */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide shrink-0">To</span>
                              <div className="text-right min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                                  {verificationResult.receiverName || "Merchant"}
                                </p>
                                {verificationResult.receiverAccount && (
                                  <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
                                    {verificationResult.receiverAccount}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Error Message (only for failed) */}
                        {!verificationResult.success && verificationResult.message && (
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                            <p className="text-sm sm:text-base font-medium text-red-600 dark:text-red-400 text-center">
                              {verificationResult.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Camera Scanner Modal */}
      {showCamera && (
        <CameraScanner
          onScan={handleCameraScan}
          onClose={() => setShowCamera(false)}
          selectedBank={selectedBank as BankId | null}
        />
      )}

      {/* Verification History Sidebar - commented out */}
      {/* <VerificationHistorySidebar
        open={showHistorySidebar}
        onOpenChange={setShowHistorySidebar}
      /> */}

      {/* VConsole for Mobile Debugging */}
      <VConsoleCDN />
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading…</div>
        </div>
      }
    >
      <ScanPageContent />
    </Suspense>
  );
}
