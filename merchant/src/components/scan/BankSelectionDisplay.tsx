import Image from "next/image";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BANKS } from "@/lib/config";

interface BankSelectionDisplayProps {
  senderBank?: string | null;
  receiverBank?: string | null;
  isInterBank: boolean;
  onChangeBanks: () => void;
}

export function BankSelectionDisplay({
  senderBank,
  receiverBank,
  isInterBank,
  onChangeBanks,
}: BankSelectionDisplayProps) {
  const senderBankData = senderBank ? BANKS.find((b) => b.id === senderBank) : null;
  const receiverBankData = receiverBank ? BANKS.find((b) => b.id === receiverBank) : null;

  if (isInterBank && senderBank && receiverBank && senderBank !== receiverBank) {
    // Inter-bank: Show both sender and receiver
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
          <div className="flex items-center gap-3">
            {senderBankData && (
              <>
                <div className="relative w-10 h-10">
                  <Image
                    src={senderBankData.icon}
                    alt={senderBankData.name}
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sender Bank</p>
                  <p className="font-medium text-sm">{senderBankData.fullName}</p>
                </div>
              </>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onChangeBanks}
          >
            <RefreshCcw className="h-3 w-3 mr-1" />
            Change
          </Button>
        </div>
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary">
          <div className="flex items-center gap-3">
            {receiverBankData && (
              <>
                <div className="relative w-10 h-10">
                  <Image
                    src={receiverBankData.icon}
                    alt={receiverBankData.name}
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Receiver Bank (Your Account)</p>
                  <p className="font-medium text-sm">{receiverBankData.fullName}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Same bank: Show single bank
  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
      <div className="flex items-center gap-3">
        {receiverBankData && (
          <>
            <div className="relative w-12 h-12">
              <Image
                src={receiverBankData.icon}
                alt={receiverBankData.name}
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bank</p>
              <p className="font-medium">{receiverBankData.fullName}</p>
            </div>
          </>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onChangeBanks}
      >
        <RefreshCcw className="h-3 w-3 mr-1" />
        Change Bank
      </Button>
    </div>
  );
}
