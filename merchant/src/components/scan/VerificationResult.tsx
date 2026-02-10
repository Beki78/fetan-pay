import Image from "next/image";
import { CheckCircle2, XCircle, Building, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumberWithCommas } from "@/lib/validation";
import { BANKS } from "@/lib/config";
import { forwardRef } from "react";

interface VerificationResultProps {
  result: {
    success: boolean;
    status: string;
    reference: string;
    provider: string;
    senderName?: string | null;
    receiverAccount?: string | null;
    receiverName?: string | null;
    amount?: number | null;
    message?: string;
  };
  transferType?: "SAME_BANK" | "INTER_BANK" | null;
  senderBank?: string | null;
}

export const VerificationResult = forwardRef<HTMLDivElement, VerificationResultProps>(
  ({ result, transferType, senderBank }, ref) => {
    const isInterBank = transferType === "INTER_BANK" && senderBank && senderBank !== result.provider;

    return (
      <div
        ref={ref}
        className="mt-6 animate-in fade-in slide-in-from-bottom-4"
      >
        {/* Status Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-t-xl",
            result.success
              ? "bg-green-500 dark:bg-green-600"
              : "bg-red-500 dark:bg-red-600",
          )}
        >
          <div className="flex items-center gap-3">
            {result.success ? (
              <CheckCircle2 className="h-6 w-6 text-white" />
            ) : (
              <XCircle className="h-6 w-6 text-white" />
            )}
            <span className="text-white font-semibold text-lg">
              {result.success ? "Verified" : "Failed"}
            </span>
          </div>
          <span className="text-white/90 text-2xl font-bold">
            {formatNumberWithCommas((result.amount ?? 0).toString())} ETB
          </span>
        </div>

        {/* Main Content */}
        <div className="bg-card border border-t-0 border-border rounded-b-xl">
          <div className="flex items-stretch">
            {/* Bank Logo Column */}
            <div className="flex items-center justify-center p-3 sm:p-5 border-r border-border bg-muted/30 shrink-0">
              {isInterBank ? (
                /* Inter-bank: Show both banks vertically */
                <div className="flex flex-col items-center gap-2">
                  {(() => {
                    const senderBankData = BANKS.find((b) => b.id === senderBank);
                    return senderBankData ? (
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                        <Image
                          src={senderBankData.icon}
                          alt={senderBankData.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 32px, 40px"
                        />
                      </div>
                    ) : null;
                  })()}
                  <ArrowLeftRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground rotate-90" />
                  {(() => {
                    const bankData = BANKS.find(
                      (b) => b.id === result.provider.toLowerCase(),
                    );
                    return bankData ? (
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                        <Image
                          src={bankData.icon}
                          alt={bankData.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 32px, 40px"
                        />
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                /* Same bank: Show single bank */
                (() => {
                  const bankData = BANKS.find(
                    (b) => b.id === result.provider.toLowerCase(),
                  );
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
                })()
              )}
            </div>

            {/* Transaction Details Column */}
            <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3 min-w-0">
              {/* Reference */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide shrink-0">
                  Ref
                </span>
                <span className="font-mono text-xs sm:text-sm font-medium text-foreground truncate">
                  {result.reference}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50" />

              {/* Sender */}
              {result.senderName && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide shrink-0">
                    From
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-foreground capitalize truncate">
                    {result.senderName}
                  </span>
                </div>
              )}

              {/* Receiver */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide shrink-0">
                  To
                </span>
                <div className="text-right min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {result.receiverName || "Merchant"}
                  </p>
                  {result.receiverAccount && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
                      {result.receiverAccount}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {!result.success && result.message && (
            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
              <p className="text-sm sm:text-base font-medium text-red-600 dark:text-red-400 text-center">
                {result.message}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

VerificationResult.displayName = "VerificationResult";
