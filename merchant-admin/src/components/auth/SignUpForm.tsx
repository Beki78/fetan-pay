"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useAuth } from "@/hooks/useAuth";
import { selfRegisterMerchant } from "@/lib/services/merchantsServiceApi";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";




export default function SignUpForm() {
  const {
    signInWithGoogle,
    signUpWithEmailAndPassword,
    isLoading,
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formState, setFormState] = useState({
    businessName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  // Email verification is disabled - removed verification step
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    if (!isChecked) {
      setError("Please accept the terms and privacy policy.");
      setIsSubmitting(false);
      return;
    }
    const { email, password, firstName, lastName, businessName, phone } = formState;
    if (!email || !password || !businessName) {
      setError("Business name, email and password are required.");
      setIsSubmitting(false);
      return;
    }

    // Name is optional for Better Auth; send a friendly display name
    const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0];

    try {
      // First, create merchant + membership record (status pending, role MERCHANT_OWNER).
      // If this fails, we stop before creating the auth user to avoid duplicate email errors on retry.
      await selfRegisterMerchant({
        name: businessName,
        contactEmail: email,
        contactPhone: phone || undefined,
        ownerEmail: email,
        ownerPhone: phone || undefined,
        ownerName: fullName,
      });

      // Now create the Better Auth user
      const ok = await signUpWithEmailAndPassword(email, password, fullName);
      if (!ok) {
        setError("Account created for business, but user signup failed. Please retry login or contact support.");
        return;
      }

      // Email verification is disabled - redirect directly to signin
      setInfo("Account created successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/signin");
      }, 1500);
    } catch (err) {
      console.error("❌ Self registration error", err);
      setError((err as Error)?.message || "Failed to create merchant record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email verification handlers removed - verification is disabled
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
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
                  />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
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
                    />
                  </div>
                  {/* <!-- Last Name --> */}
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
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
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
                  />
                </div>
                {/* <!-- Password --> */}
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
                </div>
                {/* <!-- Phone (optional) --> */}
                <div>
                  <Label>Phone (optional)</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formState.phone}
                    onChange={handleChange}
                  />
                </div>
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading || isSubmitting ? "Signing up..." : "Sign Up"}
                  </button>
                  {info && (
                    <p className="mt-3 text-sm text-success-600 dark:text-success-400">
                      {info}
                    </p>
                  )}
                  {error && (
                    <p className="mt-3 text-sm text-error-500">{error}</p>
                  )}
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
