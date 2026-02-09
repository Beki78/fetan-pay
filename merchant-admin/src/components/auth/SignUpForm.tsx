"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import PhoneInput from "@/components/form/input/PhoneInput";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/hooks/useAuth";
import { selfRegisterMerchant, linkUserToMerchant } from "@/lib/services/merchantsServiceApi";
import { signupSchema, validateField, normalizeEthiopianPhone, type SignupFormData } from "@/lib/validation";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import Image from "next/image";
import { useSetActiveReceiverAccountMutation } from "@/lib/services/paymentsServiceApi";
import { useGetPaymentProvidersQuery } from "@/lib/services/paymentProvidersServiceApi";

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

export default function SignUpForm() {
  const {
    signUpWithEmailAndPassword,
    isLoading,
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // 1: Account Creation, 2: Bank Setup
  const [accountCreated, setAccountCreated] = useState(false);
  
  // Step 1: Account Creation State
  const [formState, setFormState] = useState<SignupFormData>({
    businessName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof SignupFormData, boolean>>>({});
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  // Step 2: Bank Setup State
  const [selectedBank, setSelectedBank] = useState<BankProvider | null>(null);
  const [bankFormData, setBankFormData] = useState({
    accountNumber: "",
    accountHolderName: "",
  });
  const [bankFieldErrors, setBankFieldErrors] = useState<{
    accountNumber?: string;
    accountHolderName?: string;
  }>({});
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { data: providersData } = useGetPaymentProvidersQuery();
  const [setActiveReceiverAccount] = useSetActiveReceiverAccountMutation();

  // Map providers to bank format
  const banks: BankProvider[] = (providersData?.providers ?? [])
    .filter(p => p.status === 'ACTIVE')
    .map(p => ({
      id: p.code.toLowerCase(),
      name: p.name,
      code: p.code as TransactionProvider,
      logoPath: `/images/banks/${p.logoUrl || 'CBE.png'}`,
    }));

  // Validate field on change
  const validateFieldOnChange = useCallback((fieldName: keyof SignupFormData, value: any) => {
    const error = validateField(fieldName, value, formState);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, [formState]);

  // Handle input changes with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof SignupFormData;
    
    setFormState((prev) => ({ ...prev, [fieldName]: value }));
    
    if (touchedFields[fieldName]) {
      validateFieldOnChange(fieldName, value);
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormState((prev) => ({ ...prev, phone: value }));
    
    if (touchedFields.phone) {
      validateFieldOnChange('phone', value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as keyof SignupFormData;
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    validateFieldOnChange(fieldName, formState[fieldName]);
  };

  const handlePhoneBlur = () => {
    setTouchedFields(prev => ({ ...prev, phone: true }));
    validateFieldOnChange('phone', formState.phone);
  };

  // Handle bank form changes
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

  // Step 1: Create Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const allFields: (keyof SignupFormData)[] = ['businessName', 'firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone'];
    setTouchedFields(Object.fromEntries(allFields.map(field => [field, true])));

    if (!isChecked) {
      setError("Please accept the terms and privacy policy.");
      setIsSubmitting(false);
      return;
    }

    try {
      const validatedData = signupSchema.parse(formState);
      setFieldErrors({});

      const { email, password, firstName, lastName, businessName, phone } = validatedData;
      const fullName = `${firstName} ${lastName}`.trim();
      const normalizedPhone = phone ? normalizeEthiopianPhone(phone) : undefined;

      try {
        // Step 1: Register merchant account
        await selfRegisterMerchant({
          name: businessName,
          contactEmail: email,
          contactPhone: normalizedPhone,
          ownerEmail: email,
          ownerPhone: normalizedPhone,
          ownerName: fullName,
        });

        // Step 2: Create user account (Better Auth automatically sends OTP when requireEmailVerification: true)
        const ok = await signUpWithEmailAndPassword(email, password, fullName);
        if (!ok) {
          setError("Account created for business, but user signup failed. Please retry login or contact support.");
          return;
        }

        // Better Auth automatically sends OTP on signup when requireEmailVerification: true
        // Redirect to email verification page
        toast.success("Account created! Please check your email for verification code.");
        router.push(`/verify-email?email=${encodeURIComponent(email)}&source=signup`);
        
      } catch (err: any) {
        console.error("❌ Registration error", err);
        // Display the actual API error message
        setError(err?.message || "Failed to create account. Please try again.");
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const newFieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
        
        validationError.issues.forEach((issue) => {
          const fieldName = issue.path[0] as keyof SignupFormData;
          if (fieldName) {
            newFieldErrors[fieldName] = issue.message;
          }
        });
        
        setFieldErrors(newFieldErrors);
        setError("Please fix the errors below and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Setup Bank Account
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
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        {/* {!accountCreated && (
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Back to dashboard
          </Link>
        )} */}
      </div>
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                {/* Step 1 */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
                  currentStep === 1 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {currentStep === 2 ? '✓' : '1'}
                </div>
                <div className={`w-20 h-0.5 mx-2 transition-all ${
                  currentStep === 2 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}></div>
                {/* Step 2 */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
                  currentStep === 2 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  2
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-16 text-xs text-gray-500 dark:text-gray-400">
              <span className={currentStep === 1 ? 'text-brand-500 font-medium' : currentStep === 2 ? 'text-green-600 dark:text-green-400' : ''}>
                Account
              </span>
              <span className={currentStep === 2 ? 'text-brand-500 font-medium' : ''}>
                Bank Setup
              </span>
            </div>
          </div>

          {/* Step 1: Account Creation */}
          {currentStep === 1 && (
            <>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Create Your Account
                </h1>
                {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your details to get started with FetanPay
                </p> */}
              </div>
              
              <form onSubmit={handleCreateAccount}>
                <div className="space-y-5">
                  <div>
                    <Label>
                      Business Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="businessName"
                      name="businessName"
                      placeholder="Enter your business name"
                      value={formState.businessName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!fieldErrors.businessName}
                      hint={fieldErrors.businessName}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <Label>
                        First Name<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={formState.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!fieldErrors.firstName}
                        hint={fieldErrors.firstName}
                      />
                    </div>
                    
                    <div className="sm:col-span-1">
                      <Label>
                        Last Name<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={formState.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!fieldErrors.lastName}
                        hint={fieldErrors.lastName}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>
                      Email<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formState.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!fieldErrors.email}
                      hint={fieldErrors.email}
                    />
                  </div>
                  
                  <div>
                    <Label>
                      Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formState.password}
                        onChange={handleChange}
                        onBlur={(e) => {
                          handleBlur(e);
                          setIsPasswordFocused(false);
                        }}
                        // onFocus={() => setIsPasswordFocused(true)}
                        error={!!fieldErrors.password}
                        hint={fieldErrors.password}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                    {formState.password && isPasswordFocused && (
                      <div className="mt-2 space-y-1">
                        {[
                          { met: formState.password.length >= 8, text: "At least 8 characters" },
                          { met: /[a-z]/.test(formState.password), text: "One lowercase letter" },
                          { met: /[A-Z]/.test(formState.password), text: "One uppercase letter" },
                          { met: /\d/.test(formState.password), text: "One number" },
                          { met: /[!@#$%^&*(),.?":{}|<>]/.test(formState.password), text: "One special character" },
                        ].map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                              req.met ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                              {req.met && (
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>
                      Confirm Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="Confirm your password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formState.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!fieldErrors.confirmPassword}
                        hint={fieldErrors.confirmPassword}
                      />
                      <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Phone<span className="text-error-500">*</span></Label>
                    <PhoneInput
                      id="phone"
                      name="phone"
                      placeholder="9XXXXXXXX or 7XXXXXXXX"
                      value={formState.phone}
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      error={!!fieldErrors.phone}
                      // hint={fieldErrors.phone || "Enter Ethiopian mobile number (9XXXXXXXX or 7XXXXXXXX)"}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Checkbox
                      className="w-5 h-5"
                      checked={isChecked}
                      onChange={setIsChecked}
                    />
                    <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                      By creating an account means you agree to the{" "}
                      <Link 
                        href="/terms" 
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms and Conditions
                      </Link>
                      , and our{" "}
                      <Link 
                        href="/privacy" 
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading || isSubmitting ? "Creating Account..." : "Create Account"}
                    </button>
                    {error && (
                      <p className="mt-3 text-sm text-error-500">{error}</p>
                    )}
                  </div>
                </div>
              </form>

              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Step 2: Bank Setup */}
          {currentStep === 2 && (
            <>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Setup Your Bank Account
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add a bank account to start receiving payments (optional)
                </p>
              </div>

              <form onSubmit={handleBankSetup}>
                <div className="space-y-6">
                  {/* Bank Selection */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Select Your Bank
                    </Label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {banks.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            selectedBank?.id === bank.id
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                              <Image
                                src={bank.logoPath}
                                alt={bank.name}
                                width={36}
                                height={36}
                                className="object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white">
                              {bank.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account Details */}
                  {selectedBank && (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <Label>
                          Account Number<span className="text-error-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="accountNumber"
                          placeholder="Enter your account number"
                          value={bankFormData.accountNumber}
                          onChange={handleBankInputChange}
                          error={!!bankFieldErrors.accountNumber}
                          hint={bankFieldErrors.accountNumber}
                        />
                      </div>

                      <div>
                        <Label>
                          Account Holder Name<span className="text-error-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="accountHolderName"
                          placeholder="Enter the account holder name"
                          value={bankFormData.accountHolderName}
                          onChange={handleBankInputChange}
                          error={!!bankFieldErrors.accountHolderName}
                          hint={bankFieldErrors.accountHolderName}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={!selectedBank || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Setting up..." : "Setup Bank Account"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkipBankSetup}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      Skip for Now
                    </Button>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> You can add or change your bank account later from the Payment Providers page in your dashboard.
                    </p>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}