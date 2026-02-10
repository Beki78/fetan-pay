"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("merchantadmin@test.com");
  const [password, setPassword] = useState("merchantadmin123");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState("");
  const [verificationInfo, setVerificationInfo] = useState<string | null>(null);
  const {
    signInWithGoogle,
    signInWithEmailAndPassword,
    sendEmailOtp,
    verifyEmailWithOtp,
    isLoading,
    error,
    errorCode,
  } = useAuth();
  const router = useRouter();

  // Check for error in URL parameters (from OAuth callback)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const e = params.get("error");
      if (e) {
        // Check if it's a signup disabled error
        if (e === "signup_disabled" || e.toLowerCase().includes("signup disabled")) {
          setUrlError("Sign up is currently disabled. Please contact support or sign in if you already have an account.");
        } else if (e.toLowerCase().includes("not found") || e.toLowerCase().includes("does not exist") || e === "USER_NOT_FOUND") {
          setUrlError("Account does not exist. Please sign up first or contact support.");
        } else {
          setUrlError(e);
        }
        // Clean up URL
        router.replace(window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, [router]);

  React.useEffect(() => {
    const message = (error || "").toLowerCase();
    const needsVerification =
      errorCode === "EMAIL_NOT_VERIFIED" || message.includes("email not verified");

    if (needsVerification) {
      setShowVerification(true);
      setVerificationInfo("We sent a verification code to your email.");
    }
  }, [error, errorCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signInWithEmailAndPassword(email, password, isChecked);
    if (success) {
      // Use window.location for production to ensure cookies are set
      if (process.env.NODE_ENV === 'production') {
        window.location.href = "/";
      } else {
        router.push("/");
      }
    } else {
      const message = (error || "").toLowerCase();
      const needsVerification =
        errorCode === "EMAIL_NOT_VERIFIED" || message.includes("email not verified");

      if (needsVerification) {
        setShowVerification(true);
        setVerificationInfo("We sent a verification code to your email.");
      }
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationInfo(null);

    const ok = await verifyEmailWithOtp(email.trim(), verificationOtp.trim());
    if (ok) {
      if (process.env.NODE_ENV === "production") {
        window.location.href = "/";
      } else {
        router.push("/");
      }
    }
  };

  const handleResendVerification = async () => {
    setVerificationInfo(null);
    const ok = await sendEmailOtp(email, "email-verification");
    if (ok) {
      setVerificationInfo("A new code was sent to your email.");
    }
  };

  const emailNotVerified =
    errorCode === "EMAIL_NOT_VERIFIED" ||
    (error || "").toLowerCase().includes("email not verified");
  const displayError = !showVerification || !emailNotVerified;

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to your vendor admin account to continue
            </p>
          </div>
          <div>
            <div className="grid gap-3  sm:gap-5 mb-6">
              <button
                type="button"
                onClick={async () => {
                  const success = await signInWithGoogle();
                  if (success) {
                    // Use window.location for production to ensure cookies are set
                    if (process.env.NODE_ENV === 'production') {
                      window.location.href = "/";
                    } else {
                      router.push("/");
                    }
                  }
                }}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 disabled:opacity-60"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                Google
              </button>
             
            </div>
            {displayError && (error || urlError) && (
              <div className="mb-4 text-sm text-error-600 dark:text-error-400">
                {urlError || error}
              </div>
            )}
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 py-2 text-gray-400 bg-white dark:bg-gray-900">
                  Or continue with email
                </span>
              </div>
            </div>
            {!showVerification ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                <div>
                  <Label>
                    Email Address <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="vendor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                  <div>
                    <Button
                      className="w-full"
                      size="sm"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmail} className="mt-2 space-y-4">
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <h2 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Verify your email
                  </h2>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    Enter the 6-digit code we sent to {email}.
                  </p>
                  <Input
                    type="text"
                    placeholder="Verification code"
                    value={verificationOtp}
                    onChange={(e) => setVerificationOtp(e.target.value)}
                    required
                  />
                  {verificationInfo && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {verificationInfo}
                    </div>
                  )}
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="w-full"
                      size="sm"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify email"}
                    </Button>
                    <Button
                      className="w-full"
                      size="sm"
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      variant="outline"
                    >
                      Resend code
                    </Button>
                  </div>
                </div>
              </form>
            )}

            <div className="mt-6">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
