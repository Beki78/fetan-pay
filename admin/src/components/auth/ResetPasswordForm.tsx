"use client";
import React, { useState } from "react";
import Link from "next/link";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ResetPasswordFormProps {
  initialToken?: string;
  initialEmail?: string;
}

export default function ResetPasswordForm({
  initialToken = "",
  initialEmail = "",
}: ResetPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const [otp, setOtp] = useState(initialToken);
  const { resetPasswordWithOtp, resetPassword, isLoading, error } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const passwordsMatch = password === confirmPassword && password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !email) return;
    const resetFn = resetPasswordWithOtp ?? resetPassword;
    const ok = await resetFn(email, otp, password);
    if (ok) {
      setSubmitted(true);
      setTimeout(() => router.push("/signin"), 800);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
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
          Back to Sign In
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Paste the code from your email and choose a new password.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email Address <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>
                  Reset Code <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter the reset code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>
                  New Password <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>
                  Confirm Password <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {!passwordsMatch && confirmPassword.length > 0 && (
                  <p className="mt-2 text-xs text-error-500">
                    Passwords must match and be at least 8 characters.
                  </p>
                )}
              </div>

              {submitted && (
                <div className="text-sm text-success-600 dark:text-success-400">
                  Your password has been reset. You can now sign in with your new password.
                </div>
              )}
              {error && !submitted && (
                <div className="text-sm text-error-600 dark:text-error-400">
                  {error}
                </div>
              )}

              <div>
                <Button
                  className="w-full"
                  size="sm"
                  type="submit"
                  disabled={isLoading || !otp || !email || !passwordsMatch}
                >
                  {isLoading ? "Resetting..." : "Reset password"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Remembered your password?{" "}
              <Link
                href="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
