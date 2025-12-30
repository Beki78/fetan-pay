"use client";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (amount: number) => void;
}

export default function TopUpModal({
  isOpen,
  onClose,
  onContinue,
}: TopUpModalProps) {
  const [amount, setAmount] = useState("100");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(100);

  const quickAmounts = [50, 100, 200, 500];
  const minAmount = 10;
  const maxAmount = 50000;

  const handleQuickAmountSelect = (quickAmount: number) => {
    setSelectedQuickAmount(quickAmount);
    setAmount(quickAmount.toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setSelectedQuickAmount(null);
  };

  const handleContinue = () => {
    const amountNum = parseFloat(amount);
    if (amountNum >= minAmount && amountNum <= maxAmount) {
      onContinue(amountNum);
    }
  };

  const amountNum = parseFloat(amount) || 0;
  const isValid = amountNum >= minAmount && amountNum <= maxAmount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4" showCloseButton={true}>
      <div className="rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h4 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Top Up Wallet
          </h4>
        </div>

        <div className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
              Amount (ETB)
            </label>
            <Input
              type="number"
              step="0.01"
              min={minAmount}
              max={maxAmount}
              value={amount}
              onChange={handleAmountChange}
              className="w-full"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Minimum: {minAmount} ETB, Maximum: {maxAmount.toLocaleString()} ETB
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Or select a quick amount:
            </p>
            <div className="grid grid-cols-4 gap-3">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => handleQuickAmountSelect(quickAmount)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                    selectedQuickAmount === quickAmount
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                >
                  {quickAmount} ETB
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!isValid}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
}

