import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";
import { BANKS } from "@/lib/config";

interface VerifyingOverlayProps {
  bankId: string;
  transferType?: "SAME_BANK" | "INTER_BANK" | null;
  senderBank?: string | null;
}

export function VerifyingOverlay({
  bankId,
  transferType,
  senderBank,
}: VerifyingOverlayProps) {
  const verifyingBankData = BANKS.find((b) => b.id === bankId);
  
  if (!verifyingBankData) return null;

  const isInterBank = transferType === "INTER_BANK" && senderBank && senderBank !== bankId;

  return (
    <div className="fixed inset-0 z-9998 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 bg-background rounded-2xl shadow-2xl border border-border max-w-sm">
        {isInterBank ? (
          /* Inter-bank: Show both banks with arrow */
          <>
            <div className="flex items-center gap-4">
              {(() => {
                const senderBankData = BANKS.find((b) => b.id === senderBank);
                return senderBankData ? (
                  <div className="relative w-16 h-16">
                    <Image
                      src={senderBankData.icon}
                      alt={senderBankData.name}
                      fill
                      sizes="64px"
                      className="object-contain animate-pulse"
                    />
                  </div>
                ) : null;
              })()}
              <ArrowLeftRight className="h-8 w-8 text-primary animate-pulse" />
              <div className="relative w-16 h-16">
                <Image
                  src={verifyingBankData.icon}
                  alt={verifyingBankData.name}
                  fill
                  sizes="64px"
                  className="object-contain animate-pulse"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Verifying Inter-Bank Transfer
              </h3>
              <p className="text-sm text-muted-foreground">
                {(() => {
                  const senderBankData = BANKS.find((b) => b.id === senderBank);
                  return senderBankData ? `${senderBankData.name} → ${verifyingBankData.name}` : '';
                })()}
              </p>
              <p className="text-xs text-muted-foreground">
                Please wait while we verify your transaction...
              </p>
            </div>
          </>
        ) : (
          /* Same bank: Show single bank */
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
