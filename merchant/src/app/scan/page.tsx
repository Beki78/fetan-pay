"use client";

import { useEffect, useState, useRef } from "react";
import {
  CheckCircle2,
  FileDigit,
  Scan,
  RefreshCcw,
  ClipboardClock,
} from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BankSelection } from "@/components/bank-selection";
import { CameraScanner } from "@/components/camera-scanner";
import { ThemeToggle } from "@/components/theme-toggle";
import { VerificationHistorySidebar } from "@/components/verification-history-sidebar";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { APP_CONFIG, BANKS } from "@/lib/config";
import { cn } from "@/lib/utils";
import { formatNumberWithCommas, type BankId } from "@/lib/validation";
import { createScanSchema } from "@/lib/schemas";
import { useVerifyFromQrMutation } from "@/lib/services/transactionsServiceApi";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";

type FormData = {
  amount: string;
  transactionId?: string;
  tipAmount?: string;
  verificationMethod: "transaction" | "camera" | null;
  accountSuffix?: string;
};

export default function ScanPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<
    "transaction" | "camera" | null
  >(null);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    status: string;
    reference: string;
    provider: string;
    details?: unknown;
    message?: string;
  } | null>(null);
  const [verifyFromQr, { isLoading: isVerifying }] = useVerifyFromQrMutation();
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
      accountSuffix: "",
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
      accountSuffix: "",
    });
  };

  const handleCameraScan = async (scannedUrl: string) => {
    setShowCamera(false);
    setVerificationMethod("camera");
    setValue("verificationMethod", "camera");
    setValue("transactionId", scannedUrl);

    // Auto-verify after successful scan if amount is already entered
    if (amount && selectedBank) {
      // Wait a bit for form state to update, then auto-verify
      setTimeout(async () => {
        const formData: FormData = {
          amount: amount,
          transactionId: scannedUrl,
          tipAmount: tipAmount || "",
          verificationMethod: "camera",
        };
        await onSubmit(formData);
      }, 500);
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
    if (!selectedBank) {
      toast.error("Please select a bank account");
      return;
    }

    if (!data.verificationMethod) {
      toast.error("Please select a verification method");
      return;
    }

    if (data.verificationMethod === "camera" && !data.transactionId) {
      toast.error("Please scan a QR code");
      return;
    }

    const providerMap: Record<BankId, "CBE" | "BOA" | "AWASH" | "TELEBIRR"> = {
      cbe: "CBE",
      boa: "BOA",
      awash: "AWASH",
      telebirr: "TELEBIRR",
    };

    const buildQrUrl = (input: string) => {
      if (!input) {
        throw new Error("Transaction reference or URL is required");
      }

      // For Telebirr, verification often relies on a QR/URL payload.
      // For other banks, users commonly enter a plain transaction reference.
      // In that case, we STILL send a valid URL to the backend for parsing,
      // but we also pass the reference explicitly so the backend doesn't depend
      // on query parsing.
      if (input.startsWith("http://") || input.startsWith("https://")) {
        return input;
      }

      const paramKey = selectedBank === "cbe" ? "id" : "ref";
      return `https://scan.kifiya.local/qr?${paramKey}=${encodeURIComponent(input)}`;
    };

    try {
      setVerificationResult(null);

      const provider = providerMap[selectedBank as BankId];
  const qrUrl = buildQrUrl(data.transactionId || "");
      const accountSuffix = selectedBank === "cbe" ? data.accountSuffix : undefined;

      const response = await verifyFromQr({
        qrUrl,
        provider,
        // If user typed a URL, let server extract the reference.
        // If user typed a plain reference, pass it explicitly.
        reference:
          data.transactionId &&
          (data.transactionId.startsWith("http://") ||
            data.transactionId.startsWith("https://"))
            ? undefined
            : data.transactionId || undefined,
        accountSuffix,
      }).unwrap();

      const success = response.status === "VERIFIED";

      setVerificationResult({
        success,
        status: response.status,
        reference: response.reference,
        provider: response.provider,
        details: response.verification,
        message: response.error,
      });

      toast[success ? "success" : "error"](
        success ? "Payment verified" : "Verification failed",
        {
          description: success
            ? `Reference ${response.reference} verified`
            : response.error ?? "Could not verify the transaction",
        }
      );

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed";
      toast.error("Verification error", { description: message });
    }
  };

  const selectedBankData = selectedBank
    ? BANKS.find((bank) => bank.id === selectedBank)
    : null;

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
    // Redirect will happen in the effect; avoid rendering protected UI.
    return null;
  }

  return (
  <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background">
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
              <p className="text-sm text-slate-600 dark:text-slate-300">Scan & verify payments</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => setShowHistorySidebar(true)}
              className=""
              aria-label="View verification history"
            >
              <ClipboardClock />
            </Button>
            <ThemeToggle />
            <ProfileDropdown />
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
                  {selectedBank === "cbe" && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">
                        CBE Account Suffix (5 digits)
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter account suffix"
                        inputMode="numeric"
                        maxLength={5}
                        {...register("accountSuffix")}
                        className={cn(
                          "h-12 focus-visible:ring-1",
                          errors.accountSuffix && "border-destructive"
                        )}
                      />
                      {errors.accountSuffix && (
                        <p className="text-sm text-destructive">
                          {errors.accountSuffix.message}
                        </p>
                      )}
                    </div>
                  )}

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
                      className="mt-6 p-6 bg-muted/50 rounded-lg border border-border space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                        <h3 className="text-lg font-semibold text-foreground">
                          Verification Result
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            Status:
                          </span>
                          <span className="text-base font-semibold text-foreground">
                            {verificationResult.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            Reference:
                          </span>
                          <span className="text-base font-semibold text-foreground">
                            {verificationResult.reference}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            Provider:
                          </span>
                          <span className="text-base font-semibold text-foreground">
                            {verificationResult.provider}
                          </span>
                        </div>
                        {verificationResult.message && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">
                              Message:
                            </span>
                            <span className="text-sm text-foreground">
                              {verificationResult.message}
                            </span>
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

      {/* Verification History Sidebar */}
      <VerificationHistorySidebar
        open={showHistorySidebar}
        onOpenChange={setShowHistorySidebar}
      />
    </div>
  );
}
