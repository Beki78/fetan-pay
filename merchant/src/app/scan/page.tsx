"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { CheckCircle2, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BankSelection } from "@/components/bank-selection";
import { UnifiedScanner } from "@/components/UnifiedScanner";
import { ThemeToggle } from "@/components/theme-toggle";
import VConsoleCDN from "@/components/vconsole-cdn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  formatNumberWithCommas,
  extractTransactionId,
  detectBankFromUrl,
  type BankId,
} from "@/lib/validation";
import { createScanSchema } from "@/lib/schemas";
import { useVerifyMerchantPaymentMutation, type TransferType } from "@/lib/services/paymentsServiceApi";
import { useSession } from "@/hooks/useSession";
import { useSubscription } from "@/hooks/useSubscription";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TransferTypeSelector,
  BankSelectionDisplay,
  InterBankSelector,
  VerificationMethodSelector,
  TipInput,
  VerificationResult,
  VerifyingOverlay,
} from "@/components/scan";

type FormData = {
  transactionId?: string;
  tipAmount?: string;
  verificationMethod: "transaction" | "camera" | null;
};

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const { canAccessFeature, plan } = useSubscription();
  
  // Transfer type and bank selection states
  const [transferType, setTransferType] = useState<TransferType | null>(null);
  const [senderBank, setSenderBank] = useState<string | null>(null);
  const [receiverBank, setReceiverBank] = useState<string | null>(null);
  
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
  const quickScanTriggered = useRef(false);
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
    null,
  );
  const resultsRef = useRef<HTMLDivElement>(null);
  const isVerifyingRef = useRef(false);

  const validationBank = transferType === "INTER_BANK" && senderBank 
    ? senderBank 
    : selectedBank;

  const schema = createScanSchema(
    validationBank as BankId | null,
    verificationMethod,
    showTip,
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

  const handleTransferTypeSelect = (type: TransferType) => {
    setTransferType(type);
    setSenderBank(null);
    setReceiverBank(null);
    setSelectedBank(null);
    setVerificationMethod(null);
    setValue("verificationMethod", null);
    setValue("transactionId", "");
    reset({
      transactionId: "",
      tipAmount: tipAmount || "",
      verificationMethod: null,
    });
  };
  
  const handleSenderBankSelect = (bankId: string) => {
    setSenderBank(bankId);
  };
  
  const handleReceiverBankSelect = (bankId: string) => {
    setReceiverBank(bankId);
    setSelectedBank(bankId);
  };

  const handleResetBanks = () => {
    setTransferType(null);
    setSenderBank(null);
    setReceiverBank(null);
    setSelectedBank(null);
    setValue("verificationMethod", null);
    setValue("transactionId", "");
    reset();
  };

  const handleCameraScan = async (scannedUrl: string) => {
    if (isVerifyingRef.current) return;

    setShowCamera(false);

    const urlDetectedBank = detectBankFromUrl(scannedUrl);
    const detectedBank = urlDetectedBank || (selectedBank as BankId | null);

    if (urlDetectedBank && selectedBank !== urlDetectedBank) {
      setSelectedBank(urlDetectedBank);
    }

    const extractedReference = extractTransactionId(detectedBank, scannedUrl);
    const finalReference =
      extractedReference && extractedReference !== scannedUrl
        ? extractedReference
        : scannedUrl;

    setVerificationMethod("camera");
    setValue("verificationMethod", "camera", {
      shouldValidate: false,
      shouldDirty: false,
    });
    setValue("transactionId", finalReference, {
      shouldValidate: false,
      shouldDirty: false,
    });

    const finalBank = detectedBank;

    if (!finalBank) {
      toast.info("Select bank first", {
        description: "Could not detect bank from QR code",
      });
      return;
    }

    isVerifyingRef.current = true;
    setIsVerifyingWithBank(finalBank);

    try {
      const providerMap: Record<BankId, "CBE" | "BOA" | "AWASH" | "TELEBIRR"> = {
        cbe: "CBE",
        boa: "BOA",
        awash: "AWASH",
        telebirr: "TELEBIRR",
      };
      
      const response = await verifyMerchantPayment({
        transferType: "SAME_BANK",
        receiverBank: providerMap[finalBank],
        reference: finalReference,
        tipAmount: tipAmount
          ? parseFloat(tipAmount.replace(/,/g, ""))
          : undefined,
      }).unwrap();

      const success = response.status === "VERIFIED";

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

      toast[success ? "success" : "warning"](
        success ? "Payment verified" : "Not verified",
        {
          description: success
            ? `Reference ${finalReference} verified`
            : response.mismatchReason || "Payment could not be verified",
          duration: 5000,
        },
      );

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
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
      isVerifyingRef.current = false;
    }
  };

  const handleTipChange = (value: string) => {
    const formatted = formatNumberWithCommas(value);
    setValue("tipAmount", formatted, { shouldValidate: false });
  };

  const onSubmit = async (data: FormData) => {
    if (!transferType) {
      toast.error("Please select transfer type", { duration: 5000 });
      return;
    }

    if (!receiverBank) {
      toast.error("Please select receiver bank", { duration: 5000 });
      return;
    }

    if (transferType === "INTER_BANK" && !senderBank) {
      toast.error("Please select sender bank", { duration: 5000 });
      return;
    }

    if (!data.verificationMethod) {
      toast.error("Please select a verification method", { duration: 5000 });
      return;
    }

    if (data.verificationMethod === "camera" && !data.transactionId) {
      toast.error("Please scan a QR code", { duration: 5000 });
      return;
    }

    const providerMap: Record<BankId, "CBE" | "BOA" | "AWASH" | "TELEBIRR"> = {
      cbe: "CBE",
      boa: "BOA",
      awash: "AWASH",
      telebirr: "TELEBIRR",
    };

    setIsVerifyingWithBank(receiverBank as BankId);

    try {
      setVerificationResult(null);

      let reference = (data.transactionId || "").trim();

      if (
        reference &&
        (reference.startsWith("http") || reference.includes("://"))
      ) {
        const extracted = extractTransactionId(
          receiverBank as BankId,
          reference,
        );
        if (extracted && extracted !== reference) {
          reference = extracted;
          setValue("transactionId", reference);
        }
      }

      if (!reference) {
        setIsVerifyingWithBank(null);
        toast.error("Transaction reference is required", { duration: 5000 });
        throw new Error("Transaction reference is required");
      }

      const tipAmount =
        showTip && data.tipAmount
          ? parseFloat((data.tipAmount || "0").replace(/,/g, ""))
          : undefined;

      toast.loading("Verifying payment...", {
        description: `Checking ${transferType === "INTER_BANK" ? `${senderBank} → ${receiverBank}` : receiverBank} transaction`,
        duration: 10000,
      });

      const response = await verifyMerchantPayment({
        transferType,
        senderBank: senderBank ? providerMap[senderBank as BankId] : undefined,
        receiverBank: providerMap[receiverBank as BankId],
        reference,
        tipAmount: tipAmount && tipAmount > 0 ? tipAmount : undefined,
      }).unwrap();

      const success = response.status === "VERIFIED";

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
        provider: receiverBank,
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

      setIsVerifyingWithBank(null);

      toast.dismiss();
      toast[success ? "success" : "warning"](
        success ? "Payment verified" : "Not verified",
        {
          description: success
            ? `Reference ${
                response.transaction?.reference ?? reference
              } verified`
            : failureMessage,
          duration: 8000,
        },
      );

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    } catch (error: unknown) {
      setIsVerifyingWithBank(null);
      isVerifyingRef.current = false;

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

      toast.dismiss();
      toast.error("Verification failed", {
        description: message,
        duration: 8000,
      });

      const errorResult = {
        success: false,
        status: "ERROR",
        reference: (data.transactionId || "").trim(),
        provider: receiverBank,
        message: message,
      };

      setVerificationResult(errorResult);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    } finally {
      isVerifyingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isSessionLoading, router]);

  useEffect(() => {
    if (
      searchParams.get("quickscan") === "true" &&
      !quickScanTriggered.current &&
      isAuthenticated
    ) {
      quickScanTriggered.current = true;
      setShowCamera(true);
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
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center pb-20">
        <div className="text-sm text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background pb-20">
      {/* Verifying Overlay */}
      {isVerifyingWithBank && (
        <VerifyingOverlay
          bankId={isVerifyingWithBank}
          transferType={transferType}
          senderBank={senderBank}
        />
      )}

      <div className="container mx-auto px-3 py-8 max-w-2xl">
        {/* Header */}
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
            <ThemeToggle />
          </div>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardContent className="space-y-4 px-4">
            <form
              onSubmit={(e) => {
                if (isVerifyingRef.current) {
                  e.preventDefault();
                  return false;
                }
                return handleSubmit(onSubmit)(e);
              }}
              className="space-y-6"
            >
              {/* Transfer Type Selection */}
              {!transferType ? (
                <TransferTypeSelector onSelectType={handleTransferTypeSelect} />
              ) : transferType === "SAME_BANK" && !receiverBank ? (
                /* Same Bank Selection */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Select Bank (Sender & Receiver)
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTransferType(null);
                        setSenderBank(null);
                        setReceiverBank(null);
                        setSelectedBank(null);
                        setValue("verificationMethod", null);
                        setValue("transactionId", "");
                        reset();
                      }}
                    >
                      <RefreshCcw className="h-3 w-3 mr-1" />
                      Change Type
                    </Button>
                  </div>
                  <BankSelection
                    selectedBank={receiverBank}
                    onSelectBank={(bankId) => {
                      handleReceiverBankSelect(bankId);
                      setSenderBank(bankId);
                    }}
                    title="Select Bank"
                  />
                </div>
              ) : transferType === "INTER_BANK" && (!senderBank || !receiverBank) ? (
                /* Inter-Bank Selection */
                <InterBankSelector
                  senderBank={senderBank}
                  receiverBank={receiverBank}
                  onSelectSenderBank={handleSenderBankSelect}
                  onSelectReceiverBank={handleReceiverBankSelect}
                  onReset={handleResetBanks}
                />
              ) : receiverBank ? (
                /* Show selected bank(s) and continue to verification method */
                <>
                  <div className="space-y-3">
                    <BankSelectionDisplay
                      senderBank={senderBank}
                      receiverBank={receiverBank}
                      isInterBank={transferType === "INTER_BANK"}
                      onChangeBanks={handleResetBanks}
                    />
                  </div>

                  {/* Verification Method Selection */}
                  {!verificationMethod && (
                    <VerificationMethodSelector
                      onSelectMethod={(method) => {
                        if (method === "camera") {
                          setShowCamera(true);
                        } else {
                          setVerificationMethod(method);
                          setValue("verificationMethod", method);
                        }
                      }}
                      selectedMethod={verificationMethod}
                    />
                  )}

                  {/* Transaction ID Input */}
                  {verificationMethod === "transaction" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          Transaction Reference
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
                          errors.transactionId && "border-destructive",
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

                  {/* Tip Input */}
                  <TipInput
                    showTip={showTip}
                    tipAmount={tipAmount || ""}
                    canAccessTips={canAccessFeature("tips")}
                    planName={plan?.name}
                    error={errors.tipAmount?.message}
                    onToggleTip={(checked) => {
                      setShowTip(checked);
                      if (!checked) {
                        setValue("tipAmount", "", { shouldValidate: false });
                      }
                    }}
                    onTipChange={handleTipChange}
                  />

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
                    <VerificationResult
                      ref={resultsRef}
                      result={verificationResult}
                      transferType={transferType}
                      senderBank={senderBank}
                    />
                  )}
                </>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Camera Scanner Modal */}
      {showCamera && (
        <UnifiedScanner
          onScan={handleCameraScan}
          onClose={() => setShowCamera(false)}
          title="Scan Payment QR Code"
          description="Position the payment QR code within the frame"
        />
      )}

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
