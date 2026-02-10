"use client";

import Image from "next/image";
import Link from "next/link";
import { FileDigit } from "lucide-react";
import { BANKS } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGetActiveReceiverAccountsQuery, type TransactionProvider } from "@/lib/services/paymentsServiceApi";

interface BankSelectionProps {
  selectedBank: string | null;
  onSelectBank: (bankId: string) => void;
  excludeBank?: string; // For inter-bank: don't show sender bank in receiver options
  title?: string; // Custom title
}

// Map provider to bank ID
const providerToBankId: Record<TransactionProvider, string> = {
  CBE: "cbe",
  TELEBIRR: "telebirr",
  AWASH: "awash",
  BOA: "boa",
  DASHEN: "dashen",
};

export function BankSelection({ selectedBank, onSelectBank, excludeBank, title }: BankSelectionProps) {
  const { data: receiverAccountsData, isLoading } = useGetActiveReceiverAccountsQuery();

  // Get active receiver accounts
  const activeAccounts = (receiverAccountsData?.data ?? []).filter(
    (account) => account.status === "ACTIVE"
  );

  // Get unique banks from active accounts
  let activeBanks = activeAccounts
    .map((account) => {
      const bankId = providerToBankId[account.provider];
      const bank = BANKS.find((b) => b.id === bankId);
      return bank ? { ...bank, provider: account.provider } : null;
    })
    .filter((bank): bank is NonNullable<typeof bank> => bank !== null)
    // Remove duplicates
    .filter((bank, index, self) => self.findIndex((b) => b.id === bank.id) === index);
  
  // Exclude specified bank if provided
  if (excludeBank) {
    activeBanks = activeBanks.filter((bank) => bank.id !== excludeBank);
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-center text-xl font-semibold mb-6 text-foreground">
        {title || "Select Bank Account"}
      </h2>
      
      {activeBanks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {activeBanks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => onSelectBank(bank.id)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200",
                "hover:scale-105 hover:shadow-md",
                selectedBank === bank.id
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="relative w-16 h-16 mb-2">
                <Image
                  src={bank.icon}
                  alt={bank.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 64px, 64px"
                />
              </div>
              <span className="text-sm font-medium text-foreground">{bank.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-2">No active bank accounts configured.</p>
          <p className="text-sm">Please add receiver accounts in merchant admin.</p>
        </div>
      )}

      {/* Log Manually Button */}
      <div className="mt-6 pt-6 border-t border-border">
        <Button
          variant="outline"
          asChild
          className="w-full h-12"
        >
          <Link href="/log-transaction">
            <FileDigit className="size-5 mr-2" />
            Log Manually
          </Link>
        </Button>
      </div>
    </div>
  );
}

