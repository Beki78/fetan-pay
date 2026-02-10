import Image from "next/image";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BankSelection } from "@/components/bank-selection";
import { BANKS } from "@/lib/config";

interface InterBankSelectorProps {
  senderBank: string | null;
  receiverBank: string | null;
  onSelectSenderBank: (bankId: string) => void;
  onSelectReceiverBank: (bankId: string) => void;
  onReset: () => void;
}

export function InterBankSelector({
  senderBank,
  receiverBank,
  onSelectSenderBank,
  onSelectReceiverBank,
  onReset,
}: InterBankSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Bank Selection
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
        >
          <RefreshCcw className="h-3 w-3 mr-1" />
          Change Type
        </Button>
      </div>
      
      {/* Sender Bank */}
      {!senderBank ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Sender Bank (Customer&apos;s Bank)
          </label>
          <BankSelection
            selectedBank={senderBank}
            onSelectBank={onSelectSenderBank}
            title="Select Sender Bank"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
          <div className="flex items-center gap-3">
            {(() => {
              const bankData = BANKS.find((b) => b.id === senderBank);
              return bankData ? (
                <>
                  <div className="relative w-10 h-10">
                    <Image
                      src={bankData.icon}
                      alt={bankData.name}
                      fill
                      sizes="40px"
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sender Bank</p>
                    <p className="font-medium text-sm">{bankData.fullName}</p>
                  </div>
                </>
              ) : null;
            })()}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectSenderBank("")}
          >
            Change
          </Button>
        </div>
      )}
      
      {/* Receiver Bank */}
      {senderBank && !receiverBank && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Receiver Bank (Your Account)
          </label>
          <BankSelection
            selectedBank={receiverBank}
            onSelectBank={onSelectReceiverBank}
            excludeBank={senderBank}
            title="Select Receiver Bank"
          />
        </div>
      )}
    </div>
  );
}
