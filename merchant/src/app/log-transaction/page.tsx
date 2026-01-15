"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Banknote,
  Building2,
  Camera,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { formatNumberWithCommas } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { BANKS } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  useGetActiveReceiverAccountsQuery,
  type TransactionProvider,
} from "@/lib/services/paymentsServiceApi";

type PaymentMethod = "cash" | "bank";

// Map provider to bank ID
const providerToBankId: Record<TransactionProvider, string> = {
  CBE: "cbe",
  TELEBIRR: "telebirr",
  AWASH: "awash",
  BOA: "boa",
  DASHEN: "dashen",
};

export default function LogTransactionPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const { data: receiverAccountsData, isLoading: isLoadingAccounts } =
    useGetActiveReceiverAccountsQuery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [otherBankName, setOtherBankName] = useState("");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get active receiver accounts
  const activeAccounts = (receiverAccountsData?.data ?? []).filter(
    (account) => account.status === "ACTIVE"
  );

  // Get unique banks from active accounts
  const activeBanks = activeAccounts
    .map((account) => {
      const bankId = providerToBankId[account.provider];
      const bank = BANKS.find((b) => b.id === bankId);
      return bank
        ? {
            id: bank.id,
            name: bank.name,
            fullName: bank.fullName,
            icon: bank.icon,
          }
        : null;
    })
    .filter((bank): bank is NonNullable<typeof bank> => bank !== null)
    .filter(
      (bank, index, self) => self.findIndex((b) => b.id === bank.id) === index
    );

  const handleAmountChange = (value: string) => {
    const formatted = formatNumberWithCommas(value);
    setAmount(formatted);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount.replace(/,/g, "")) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (paymentMethod === "bank" && !selectedBank) {
      toast.error("Please select a bank");
      return;
    }

    if (
      paymentMethod === "bank" &&
      selectedBank === "other" &&
      !otherBankName.trim()
    ) {
      toast.error("Please enter the bank name");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to log transaction
      const transactionData = {
        paymentMethod,
        amount: parseFloat(amount.replace(/,/g, "")),
        bank: selectedBank === "other" ? otherBankName : selectedBank,
        note,
        screenshot,
      };

      console.log("Logging transaction:", transactionData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Transaction logged successfully!");
      router.push("/scan");
    } catch (error) {
      console.error("Error logging transaction:", error);
      toast.error("Failed to log transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth check
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="size-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              Log Transaction
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <Card className="shadow-xl border-border/50">
          <CardContent className="p-4 space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("cash");
                    setSelectedBank(null);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                    paymentMethod === "cash"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  )}
                >
                  <Banknote className="size-5" />
                  <span className="font-medium">Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={cn(
                    "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                    paymentMethod === "bank"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  )}
                >
                  <Building2 className="size-5" />
                  <span className="font-medium">Bank</span>
                </button>
              </div>
            </div>

            {/* Bank Selection - Only show when bank is selected */}
            {paymentMethod === "bank" && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Select Bank
                </label>
                {isLoadingAccounts ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Loading accounts...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {activeBanks.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => {
                          setSelectedBank(bank.id);
                          setOtherBankName("");
                        }}
                        className={cn(
                          "relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all",
                          selectedBank === bank.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        {selectedBank === bank.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="size-5 text-primary" />
                          </div>
                        )}
                        <div className="relative w-10 h-10">
                          <Image
                            src={bank.icon}
                            alt={bank.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">
                            {bank.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bank.name}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Other Bank Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedBank("other")}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all min-h-[120px]",
                        selectedBank === "other"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {selectedBank === "other" && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="size-5 text-primary" />
                        </div>
                      )}
                      <Plus className="size-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Other
                      </span>
                    </button>
                  </div>
                )}

                {/* Other Bank Name Input */}
                {selectedBank === "other" && (
                  <div className="mt-3">
                    <Input
                      type="text"
                      placeholder="Enter bank name"
                      value={otherBankName}
                      onChange={(e) => setOtherBankName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  ETB
                </span>
                <Input
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-14 pr-4 h-14 text-lg text-right"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Add Details Toggle */}
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center gap-2 w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-sm">Add Details</span>
              {showDetails ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>

            {/* Additional Details */}
            {showDetails && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Note */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Note (optional)
                  </label>
                  <Textarea
                    placeholder="Add a note about this transaction..."
                    value={note}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNote(e.target.value)
                    }
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {/* Receipt Screenshot - Only for bank payments */}
            {paymentMethod === "bank" && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Receipt Screenshot{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </label>

                {screenshotPreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-border">
                    <Image
                      src={screenshotPreview}
                      alt="Receipt screenshot"
                      width={400}
                      height={300}
                      className="w-full h-auto object-contain bg-muted"
                    />
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute top-2 right-2 p-2 rounded-full bg-destructive/80 hover:bg-destructive transition-colors"
                    >
                      <X className="size-4 text-destructive-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center gap-3"
                  >
                    <div className="p-3 rounded-full bg-muted">
                      <Camera className="size-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Add Screenshot
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Optional for documentation
                      </p>
                    </div>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !amount}
          className="w-full h-14 text-lg font-semibold"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Logging...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-5" />
              Log Transaction
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
