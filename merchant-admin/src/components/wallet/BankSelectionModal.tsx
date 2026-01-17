"use client";
import React from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Image from "next/image";
import type { WalletDepositReceiverAccount } from "@/lib/services/walletServiceApi";
import type { TransactionProvider } from "@/lib/services/walletServiceApi";

interface BankSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  receivers: WalletDepositReceiverAccount[];
  selectedAmount: number;
  onSelect: (receiver: WalletDepositReceiverAccount) => void;
}

const getBankLogo = (provider: TransactionProvider) => {
  const logos: Record<string, string> = {
    CBE: "/images/banks/CBE.png",
    TELEBIRR: "/images/banks/telebirr.png",
    AWASH: "/images/banks/awash.png",
    BOA: "/images/banks/boa.png",
    DASHEN: "/images/banks/dashen.png",
  };
  return logos[provider] || "/images/banks/CBE.png";
};

const getBankName = (provider: TransactionProvider) => {
  const bankNames: Record<string, string> = {
    CBE: "Commercial Bank of Ethiopia (CBE)",
    TELEBIRR: "Telebirr",
    AWASH: "Awash Bank",
    BOA: "Bank of Abyssinia (BOA)",
    DASHEN: "Dashen Bank",
  };
  return bankNames[provider] || provider;
};

export default function BankSelectionModal({
  isOpen,
  onClose,
  receivers,
  selectedAmount,
  onSelect,
}: BankSelectionModalProps) {
  const activeReceivers = receivers.filter((r) => r.status === "ACTIVE");

  const handleSelect = (receiver: WalletDepositReceiverAccount) => {
    onSelect(receiver);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4" showCloseButton={true}>
      <div className="rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h4 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Select Deposit Bank
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose the bank you want to use for depositing {selectedAmount.toFixed(2)} ETB
          </p>
        </div>

        {activeReceivers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No deposit accounts available. Please contact support.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {activeReceivers.map((receiver) => (
              <button
                key={receiver.id}
                onClick={() => handleSelect(receiver)}
                className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white dark:bg-gray-700 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                    <Image
                      src={getBankLogo(receiver.provider)}
                      alt={receiver.provider}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {receiver.receiverLabel || getBankName(receiver.provider)}
                      </h4>
                      <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {receiver.receiverName || "Account Name"}
                    </p>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-500">
                      {receiver.receiverAccount}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

