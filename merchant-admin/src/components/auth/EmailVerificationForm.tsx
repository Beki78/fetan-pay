"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";
import { linkUserToMerchant, promoteToVerified } from "@/lib/services/merchantsServiceApi";
import OTPInput from "@/components/form/input/OTPInput";
import Button from "@/components/ui/button/Button";
import toast from "react-hot-toast";
import { OTP_EXPIRY_SECONDS, OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/constants";

export default function EmailVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendEmailOtp, verifyEmailWithOtp, isLoading } = useAuth();
  const { session, refreshSession } = useSession();
  
  const email = searchParams.get("email") || "";
  const source = searchParams.get("source") || ""; // 'signup' or 'login'
  const autoRequest = searchParams.get("autoRequest") === "true"; // Auto-request from email link
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLinkingMerchant, setIsLinkingMerchant] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [autoRequested, setAutoRequested] = useState(false);

  // Auto-request OTP when coming from email link
  useEffect(() => {
    if (autoRequest && email && !autoRequested && !isLoading) {
      setAutoRequested(true);
      sendOtp();
      toast.success("Sending verification code to your email...");
    }
  }, [autoRequest, email, autoRequested, isLoading]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendOtp = async () => {
    if (!email) {
      setError("Email address is required");
      return;
    }

    try {
      const success = await sendEmailOtp(email, "email-verification");
      if (success) {
        setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
        setTimeLeft(OTP_EXPIRY_SECONDS);
        setError(null);
        toast.success("Verification code sent to your email");
      } else {
        setError("Failed to send verification code. Please try again.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Failed to send verification code. Please try again.");
    }
  };

  const handleVerify = useCallback(async (otpValue: string) => {
    if (otpValue.length !== 4) return;

    setIsVerifying(true);
    setError(null);

    try {
      // First verify the email
      const success = await verifyEmailWithOtp(email, otpValue);
      
      if (!success) {
        setError("Invalid verification code. Please try again.");
        setOtp("");
        return;
      }
      
      toast.success("Email verified successfully!");
      
      // Email is verified, but we need to wait for autoSignIn to create session
      // The autoSignIn: true in server/auth.ts should create a session automatically
      setIsLinkingMerchant(true);
      
      // Wait longer for session to be created by autoSignIn
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      await refreshSession(); // Refresh to get the session
      
      // Check if session exists
      if (!session?.user) {
        // Session not created yet, wait a bit more
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshSession();
      }
      
      // Now call merchant APIs with valid session
      try {
        await linkUserToMerchant();
        console.log("User linked to merchant successfully");
      } catch (linkError: any) {
        console.error("Error linking user to merchant:", linkError);
        // Don't fail - user can still proceed
      }
      
      // Promote merchant from UNVERIFIED to PENDING (only for signup flow)
      if (source === "signup") {
        try {
          await promoteToVerified(email);
          console.log("Merchant promoted to PENDING status");
        } catch (promoteError: any) {
          console.error("Error promoting merchant:", promoteError);
          // Don't fail - user can still proceed
        }
      }
      
      setIsLinkingMerchant(false);
      
      // Redirect based on source
      setTimeout(() => {
        if (source === "login") {
          router.push("/");
        } else {
          router.push("/setup-bank-account");
        }
      }, 500);
    } catch (err: any) {
      console.error("Verification error:", err);
      const errorMessage = err?.message || "Verification failed. Please try again.";
      
      if (errorMessage.toLowerCase().includes("expired")) {
        setError("Verification code has expired. Please request a new one.");
        setTimeLeft(0);
      } else if (errorMessage.toLowerCase().includes("invalid")) {
        setError("Invalid verification code. Please try again.");
      } else if (errorMessage.toLowerCase().includes("attempts")) {
        setError("Too many failed attempts. Please request a new code.");
      } else {
        setError(errorMessage);
      }
      
      setOtp("");
    } finally {
      setIsVerifying(false);
      setIsLinkingMerchant(false);
    }
  }, [email, source, verifyEmailWithOtp, refreshSession, session, router]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 4 && !isVerifying) {
      handleVerify(otp);
    }
  }, [otp, isVerifying, handleVerify]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-error-600 dark:text-error-400 mb-4">
          Email address is missing. Please try signing up again.
        </p>
        <Button onClick={() => router.push("/signup")}>
          Go to Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h1>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We sent a 4-digit verification code to
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
          {email}
        </p>
      </div>

      <div className="mb-6">
        <OTPInput
          length={4}
          value={otp}
          onChange={setOtp}
          disabled={isVerifying || timeLeft === 0}
          error={!!error}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
          <p className="text-sm text-error-600 dark:text-error-400 text-center">
            {error}
          </p>
        </div>
      )}

      {(isVerifying || isLinkingMerchant) && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {isLinkingMerchant ? "Setting up your account..." : "Verifying..."}
          </div>
        </div>
      )}

      <div className="mb-6 text-center">
        {timeLeft > 0 ? (
          <p className={`text-sm ${timeLeft < 60 ? 'text-error-600 dark:text-error-400' : 'text-gray-600 dark:text-gray-400'}`}>
            Code expires in {formatTime(timeLeft)}
          </p>
        ) : (
          <p className="text-sm text-error-600 dark:text-error-400">
            Code has expired. Please request a new one.
          </p>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Didn&apos;t receive the code?
        </p>
        <button
          type="button"
          onClick={sendOtp}
          disabled={resendCooldown > 0 || isLoading}
          className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resendCooldown > 0 
            ? `Resend in ${resendCooldown}s` 
            : isLoading 
            ? "Sending..." 
            : "Resend Code"
          }
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Wrong email address?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
          >
            Sign up again
          </button>
        </p>
      </div>
    </div>
  );
}
