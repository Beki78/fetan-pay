"use client";

import Image from "next/image";
import { BANKS } from "@/lib/config";
import { cn } from "@/lib/utils";

interface BankSelectionProps {
  selectedBank: string | null;
  onSelectBank: (bankId: string) => void;
}

export function BankSelection({ selectedBank, onSelectBank }: BankSelectionProps) {
  return (
    <div className="w-full">
      <h2 className="text-center text-xl font-semibold mb-6 text-foreground">
        Select Bank Account
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {BANKS.map((bank) => (
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
    </div>
  );
}

