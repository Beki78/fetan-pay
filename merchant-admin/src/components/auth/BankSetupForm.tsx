"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetActiveReceiverAccountMutation } from "@/lib/services/paymentsServiceApi";
import { useGetPaymentProvidersQuery } from "@/lib/services/paymentProvidersServiceApi";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import toast from "react-hot-toast";
import { z } from "zod";
import Image from "next/image";

type TransactionProvider = 'CBE' | 'TELEBIRR' | 'AWASH' | 'BOA' | 'DASHEN';

interface BankProvider {
  id: string;
  name: string;
  code: TransactionProvider;
  logoPath: string;
}

// Bank account validation schema
const bankAccountSchema = z.object({
  accountNumber: z
    .string()
    .min(10, "Account number must be at least 10 characters")
    .max(20, "Account number must be less than 20 characters"),
  accountHolderName: z
    .string()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Account holder name can only contain letters, spaces, hyphens, and apostrophes"),
});

export default function BankSetupForm() {
  const router = useRouter();
  const { data: providersData } = useGetPaymentProvidersQuery();
  const [setActiveReceiverAccount] = useSetActiveReceiverAccountMutation();

  const [selectedBank, setSelectedBank] = useState<BankProvider | null>(null);
  const [bankFormData, setBankFormData] = useState({
    accountNumber: "",
    accountHolderName: "",
  });
  const [bankFieldErrors, setBankFieldErrors] = useState<{
    accountNumber?: string;
    accountHolderName?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map providers to bank format
  const banks: BankProvider[] = (providersData?.providers ?? [])
    .filter(p => p.status === 'ACTIVE')
    .map(p => ({
      id: p.code.toLowerCase(),
      name: p.name,
      code: p.code as TransactionProvider,
      logoPath: `/images/banks/${p.logoUrl || 'CBE.png'}`,
    }));

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankFormData(prev => ({ ...prev, [name]: value }));
    
    if (bankFieldErrors[name as keyof typeof bankFieldErrors]) {
      setBankFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateBankForm = () => {
    if (!selectedBank) {
      return false;
    }

    try {
      bankAccountSchema.parse(bankFormData);
      setBankFieldErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: typeof bankFieldErrors = {};
        error.issues.forEach(issue => {
          const fieldName = issue.path[0] as keyof typeof bankFieldErrors;
          newErrors[fieldName] = issue.message;
        });
        setBankFieldErrors(newErrors);
      }
      return false;
    }
  };

  const handleBankSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBank) {
      toast.error("Please select a bank");
      return;
    }

    if (!validateBankForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsSubmitting(true);

    try {
      await setActiveReceiverAccount({
        provider: selectedBank.code,
        receiverAccount: bankFormData.accountNumber.trim(),
        receiverName: bankFormData.accountHolderName.trim(),
        receiverLabel: `${selectedBank.name} Account`,
        enabled: true,
      }).unwrap();

      toast.success("Bank account setup successfully!");
      router.push("/");
    } catch (error: any) {
      console.error("Bank setup error:", error);
      toast.error(error?.data?.message || "Failed to setup bank account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipBankSetup = () => {
    router.push("/");
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-brand-100 dark:bg-brand-900/20">
          <svg
            className="w-8 h-8 text-brand-600 dark:text-brand-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Setup Bank Account
        </h1>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add your bank account to receive payments (optional)
        </p>
      </div>

      <form onSubmit={handleBankSetup} className="space-y-6">
        {/* Bank Selection */}
        <div>
          <Label>Select Bank <span className="text-error-500">*</span></Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
            {banks.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => setSelectedBank(bank)}
                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${selectedBank?.id === bank.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="aspect-square relative">
                  <Image
                    src={bank.logoPath}
                    alt={bank.name}
                    fill
                    className="object-contain"
                  />
                </div>
                {selectedBank?.id === bank.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          {selectedBank && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedBank.name}
            </p>
          )}
        </div>

        {/* Account Number */}
        <div>
          <Label>
            Account Number <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            name="accountNumber"
            placeholder="Enter your account number"
            value={bankFormData.accountNumber}
            onChange={handleBankInputChange}
            required
          />
          {bankFieldErrors.accountNumber && (
            <p className="mt-1 text-sm text-error-600 dark:text-error-400">
              {bankFieldErrors.accountNumber}
            </p>
          )}
        </div>

        {/* Account Holder Name */}
        <div>
          <Label>
            Account Holder Name <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            name="accountHolderName"
            placeholder="Enter account holder name"
            value={bankFormData.accountHolderName}
            onChange={handleBankInputChange}
            required
          />
          {bankFieldErrors.accountHolderName && (
            <p className="mt-1 text-sm text-error-600 dark:text-error-400">
              {bankFieldErrors.accountHolderName}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || !selectedBank}
          >
            {isSubmitting ? "Setting up..." : "Setup Bank Account"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleSkipBankSetup}
            disabled={isSubmitting}
          >
            Skip for Now
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> You can add or change your bank account later from the Payment Providers page in your dashboard.
        </p>
      </div>
    </div>
  );
}
