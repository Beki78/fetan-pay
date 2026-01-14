"use client";

import { useEffect, useState, useRef } from "react";
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
import { useRouter } from "next/navigation";

type FormData = {
  amount: string;
  transactionId?: string;
  tipAmount?: string;
  verificationMethod: "transaction" | "camera" | null;
};

export default function ScanPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
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
      amount: "",
      transactionId: "",
      tipAmount: "",
      verificationMethod: null,
    },
  });

  const amount = watch("amount");
  const tipAmount = watch("tipAmount");

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    // Do not auto-select verification method; let the user choose.
    setVerificationMethod(null);
    setValue("verificationMethod", null);
    setValue("transactionId", "");
    reset({
      amount,
      transactionId: "",
      tipAmount: tipAmount || "",
      verificationMethod: null,
    });
  };

  const handleCameraScan = async (scannedUrl: string) => {
    console.log("🔍 [SCAN] handleCameraScan called with:", scannedUrl);

    // Show validation loading immediately
    const loadingToast = toast.loading("Validating QR code...", {
      description: "Extracting transaction details",
    });

    try {
      // Close camera scanner immediately
      setShowCamera(false);
      console.log("✅ [SCAN] Camera scanner closed");

      // Set verification method
      setVerificationMethod("camera");
      setValue("verificationMethod", "camera", { shouldValidate: false });
      console.log("✅ [SCAN] Verification method set to camera");

      // Always detect bank from URL first (QR code contains the actual bank info)
      const urlDetectedBank = detectBankFromUrl(scannedUrl);
      const detectedBank = urlDetectedBank || (selectedBank as BankId | null);
      console.log("🏦 [SCAN] Bank detection:", {
        urlDetectedBank,
        selectedBank,
        detectedBank,
      });

      // Check for bank mismatch
      if (selectedBank && urlDetectedBank && selectedBank !== urlDetectedBank) {
        console.warn("⚠️ [SCAN] Bank mismatch detected");
        // Auto-select the detected bank from URL
        setSelectedBank(urlDetectedBank);
      } else if (!selectedBank && urlDetectedBank) {
        // Auto-select bank if detected from URL
        console.log("✅ [SCAN] Auto-selecting bank:", urlDetectedBank);
        setSelectedBank(urlDetectedBank);
      }

      // Extract transaction reference from URL
      const extractedReference = extractTransactionId(detectedBank, scannedUrl);
      console.log("📝 [SCAN] Extracted reference:", {
        scannedUrl,
        detectedBank,
        extractedReference,
      });

      // Always set the transaction ID (use extracted reference or fallback to full URL)
      const transactionIdToUse =
        extractedReference && extractedReference !== scannedUrl
          ? extractedReference
          : scannedUrl;

      setValue("transactionId", transactionIdToUse, { shouldValidate: false });
      console.log("✅ [SCAN] Transaction ID set in form:", transactionIdToUse);

      // Dismiss validation toast
      toast.dismiss(loadingToast);

      // Validate extraction
      if (!extractedReference || extractedReference === scannedUrl) {
        console.warn(
          "⚠️ [SCAN] Could not extract clean reference, using full URL"
        );
        toast.warning("Using full URL", {
          description:
            "Could not extract transaction reference, using full URL for verification",
          duration: 2000,
        });
      } else {
        // Show success feedback
        toast.success("QR code validated!", {
          description: `Reference: ${extractedReference}`,
          duration: 2000,
        });
      }

      // Auto-verify after successful scan if amount is already entered
      const finalBank = detectedBank;
      const currentAmount = amount;
      const finalReference =
        extractedReference && extractedReference !== scannedUrl
          ? extractedReference
          : scannedUrl;

      console.log("🔍 [SCAN] Checking auto-verify conditions:", {
        currentAmount,
        finalBank,
        finalReference,
        canAutoVerify: !!(currentAmount && finalBank && finalReference),
      });

      if (currentAmount && finalBank && finalReference) {
        // Wait a bit for form state to update, then auto-verify
        console.log("🚀 [SCAN] Starting auto-verification...");

        // Show verification loading
        toast.loading("Verifying payment...", {
          description: "Sending request to server",
          id: "verifying",
        });

        setTimeout(async () => {
          console.log("🔄 [SCAN] Auto-verifying with:", {
            currentAmount,
            finalReference,
            finalBank,
          });
          // Set verifying state with bank logo
          setIsVerifyingWithBank(finalBank);
          const formData: FormData = {
            amount: currentAmount,
            transactionId: finalReference,
            tipAmount: tipAmount || "",
            verificationMethod: "camera",
          };
          try {
            await onSubmit(formData);
            console.log("✅ [SCAN] Auto-verification completed");
            toast.dismiss("verifying");
          } catch (error) {
            console.error("❌ [SCAN] Auto-verification failed:", error);
            toast.dismiss("verifying");
          } finally {
            // Clear verifying state after a short delay to show result
            setTimeout(() => {
              setIsVerifyingWithBank(null);
            }, 500);
          }
        }, 300);
      } else {
        // Show helpful message about what's missing
        console.log("ℹ️ [SCAN] Cannot auto-verify - missing:", {
          amount: !currentAmount,
          bank: !finalBank,
          reference: !finalReference,
        });
        if (!currentAmount) {
          toast.info("Amount required", {
            description: "Please enter the amount to verify the payment",
            duration: 5000,
          });
        } else if (!finalBank) {
          toast.info("Bank selection required", {
            description: "Please select a bank account first",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("❌ [SCAN] Error in handleCameraScan:", error);
      toast.dismiss(loadingToast);
      toast.error("Scan error", {
        description:
          error instanceof Error ? error.message : "Failed to process QR code",
        duration: 5000,
      });
    }
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatNumberWithCommas(value);
    setValue("amount", formatted, { shouldValidate: false });
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

      const claimedAmount = parseFloat((data.amount || "0").replace(/,/g, ""));
      if (Number.isNaN(claimedAmount) || claimedAmount <= 0) {
        console.error("❌ [VERIFY] Invalid amount:", data.amount);
        setIsVerifyingWithBank(null);
        toast.error("Please enter a valid amount", {
          duration: 5000,
        });
        throw new Error("Please enter a valid amount");
      }

      // Parse tip amount if provided
      const tipAmount =
        showTip && data.tipAmount
          ? parseFloat((data.tipAmount || "0").replace(/,/g, ""))
          : undefined;

      console.log("📤 [VERIFY] Sending verification request:", {
        provider,
        reference,
        claimedAmount,
        tipAmount,
      });

      // Show loading toast
      toast.loading("Verifying payment...", {
        description: `Checking ${provider} transaction ${reference}`,
        duration: 10000,
      });

      const response = await verifyMerchantPayment({
        provider,
        reference,
        claimedAmount,
        tipAmount: tipAmount && tipAmount > 0 ? tipAmount : undefined,
      }).unwrap();

      console.log("✅ [VERIFY] Verification response received:", response);

      const success = response.status === "VERIFIED";

      const failureMessage = (() => {
        if (response.mismatchReason === "REFERENCE_NOT_FOUND") {
          return "Reference not found or transaction not successful";
        }
        if (response.mismatchReason === "RECEIVER_MISMATCH") {
          return "Paid to a different receiver account (not your configured account)";
        }
        if (response.mismatchReason === "AMOUNT_MISMATCH") {
          return "Amount doesn't match the entered value";
        }
        if (!response.checks?.referenceFound) {
          return "Reference not found or transaction not successful";
        }
        if (
          response.checks?.referenceFound &&
          !response.checks?.receiverMatches
        ) {
          return "Paid to a different receiver account (not your configured account)";
        }
        if (
          response.checks?.referenceFound &&
          !response.checks?.amountMatches
        ) {
          return "Amount doesn't match the entered value";
        }
        return "Transaction isn't verified";
      })();

      setVerificationResult({
        success,
        status: response.status,
        reference: response.transaction?.reference ?? reference,
        provider,
        senderName: response.transaction?.senderName,
        receiverAccount: response.transaction?.receiverAccount,
        receiverName: response.transaction?.receiverName,
        amount: response.transaction?.amount ?? claimedAmount,
        details: {
          checks: response.checks,
          mismatchReason: response.mismatchReason ?? null,
          receiverAccount: response.transaction?.receiverAccount ?? null,
          amount: response.transaction?.amount ?? null,
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
    }
  };

  // Route protection: unauthenticated users must sign in.
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isSessionLoading, router]);

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
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm">
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                  {/* Amount Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Amount to Verify (ETB)
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={cn(
                        "text-lg h-12 focus-visible:ring-1",
                        errors.amount && "border-destructive"
                      )}
                      inputMode="numeric"
                    />
                    {errors.amount && (
                      <p className="text-sm text-destructive">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>

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

                  {/* Verification Results */}
                  {verificationResult && (
                    <div
                      ref={resultsRef}
                      className={cn(
                        "mt-6 p-1 rounded-xl border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4",
                        verificationResult.success
                          ? "bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-600"
                          : "bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-600"
                      )}
                    >
                      <div className="p-6 space-y-6">
                        {/* Header Status */}
                        <div className="text-center space-y-2">
                          <div className="flex justify-center">
                            {verificationResult.success ? (
                              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/20">
                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900/20">
                                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                              </div>
                            )}
                          </div>
                          <h3
                            className={cn(
                              "text-xl font-bold tracking-tight",
                              verificationResult.success
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-700 dark:text-red-400"
                            )}
                          >
                            {verificationResult.success
                              ? "Payment Verified"
                              : "Verification Failed"}
                          </h3>
                          {verificationResult.message && (
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                              {verificationResult.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-4">
                          {/* Amount */}
                          <div className="bg-background/50 rounded-lg p-4 text-center border border-border/50">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Amount Paid
                            </p>
                            <div className="text-3xl font-extrabold text-foreground tracking-tight">
                              {formatNumberWithCommas(
                                (verificationResult.amount ?? 0).toString()
                              )}{" "}
                              <span className="text-lg text-muted-foreground font-semibold">
                                ETB
                              </span>
                            </div>
                          </div>

                          {/* Flow Details */}
                          <div className="bg-background/50 rounded-lg border border-border/50 divide-y divide-border/50">
                            {/* Sent To */}
                            <div className="p-3 flex items-start gap-3">
                              <div className="mt-1 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Sent To (Merchant)
                                </p>
                                <p className="font-semibold text-foreground truncate">
                                  {verificationResult.receiverName ||
                                    "Unknown Merchant"}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono truncate">
                                  {verificationResult.receiverAccount}
                                </p>
                              </div>
                            </div>

                            {/* Sent From */}
                            {verificationResult.senderName && (
                              <div className="p-3 flex items-start gap-3">
                                <div className="mt-1 h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                  <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Sent From (Payer)
                                  </p>
                                  <p className="font-semibold text-foreground truncate capitalize">
                                    {verificationResult.senderName}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Tech Details */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-muted p-3 rounded-lg border border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Provider
                              </p>
                              <p className="font-medium font-mono">
                                {verificationResult.provider}
                              </p>
                            </div>
                            <div className="bg-muted p-3 rounded-lg border border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Reference
                              </p>
                              <p
                                className="font-medium font-mono truncate"
                                title={verificationResult.reference}
                              >
                                {verificationResult.reference}
                              </p>
                            </div>
                          </div>
                        </div>
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
