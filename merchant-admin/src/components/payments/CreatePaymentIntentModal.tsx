"use client";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";

interface CreatePaymentIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { payerName: string; amount: number; notes?: string }) => void;
}

export default function CreatePaymentIntentModal({
  isOpen,
  onClose,
  onCreate,
}: CreatePaymentIntentModalProps) {
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ payerName?: string; amount?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { payerName?: string; amount?: string } = {};
    if (!payerName.trim()) {
      newErrors.payerName = "Payer name is required";
    }
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreate({
      payerName: payerName.trim(),
      amount: amountNum,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setPayerName("");
    setAmount("");
    setNotes("");
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setPayerName("");
    setAmount("");
    setNotes("");
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[500px] m-4" showCloseButton={true}>
      <div className="rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h4 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Create Payment Intent
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a new payment request for your customer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Payer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
              Payer Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Customer's full name"
              value={payerName}
              onChange={(e) => {
                setPayerName(e.target.value);
                if (errors.payerName) {
                  setErrors({ ...errors, payerName: undefined });
                }
              }}
              error={!!errors.payerName}
              className="w-full"
            />
            {errors.payerName && (
              <p className="mt-1 text-sm text-red-500">{errors.payerName}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
              Amount (ETB) <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers and one decimal point
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setAmount(value);
                  if (errors.amount) {
                    setErrors({ ...errors, amount: undefined });
                  }
                }
              }}
              onBlur={(e) => {
                // Format to 2 decimal places on blur if valid
                const numValue = parseFloat(e.target.value);
                if (!isNaN(numValue) && numValue > 0) {
                  setAmount(numValue.toFixed(2));
                }
              }}
              error={!!errors.amount}
              className="w-full"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 resize-none"
            />
          </div>

          {/* Action Buttons - Equal width in one row */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              size="sm"
              onClick={handleClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white border-0"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

