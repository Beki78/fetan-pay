"use client";

import { useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useSession } from "./useSession";

const SOCIAL_CALLBACK_URL = "http://localhost:3000";

type EmailOtpType = "sign-in" | "email-verification" | "forget-password";

interface UseAuthReturn {
  signInWithGoogle: () => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  signInWithTikTok: () => Promise<boolean>;
  sendEmailOtp: (email: string, type: EmailOtpType) => Promise<boolean>;
  checkEmailOtp: (email: string, type: EmailOtpType, otp: string) => Promise<boolean>;
  signInWithEmailOtp: (email: string, otp: string, disableSignUp?: boolean) => Promise<boolean>;
  verifyEmailWithOtp: (email: string, otp: string) => Promise<boolean>;
  requestPasswordResetOtp: (email: string) => Promise<boolean>;
  resetPasswordWithOtp: (email: string, otp: string, password: string) => Promise<boolean>;
  signInWithEmailAndPassword: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<boolean>;
  signUpWithEmailAndPassword: (email: string, password: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, password: string) => Promise<boolean>;
  sendOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshSession, signOut: sessionSignOut } = useSession();

  const emailOtpClient = (authClient as any)?.emailOtp;
  const forgetPasswordClient = (authClient as any)?.forgetPassword;
  const signInEmailOtpClient = (authClient as any)?.signIn?.emailOtp;

  const signInWithSocial = useCallback(
    async (provider: "google" | "facebook" | "tiktok"): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await authClient.signIn.social({
          provider,
          callbackURL: SOCIAL_CALLBACK_URL,
        });

        if (result.data) {
          await refreshSession();
          return true;
        }

        if (result.error) {
          console.error("❌ Social authentication error:", result.error);
          setError(
            (result.error as { message?: string })?.message ||
              "Authentication failed. Please try again."
          );
        }
        return false;
      } catch (err) {
        console.error("❌ Social authentication error:", err);
        setError((err as Error)?.message || "Failed to authenticate. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  const signInWithGoogle = useCallback(() => signInWithSocial("google"), [signInWithSocial]);
  const signInWithFacebook = useCallback(() => signInWithSocial("facebook"), [signInWithSocial]);
  const signInWithTikTok = useCallback(() => signInWithSocial("tiktok"), [signInWithSocial]);

  const sendOtp = useCallback(async (phoneNumber: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.phoneNumber.sendOtp({ phoneNumber });
      return true;
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      setError((err as Error)?.message || "Failed to send OTP. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (phoneNumber: string, code: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await authClient.phoneNumber.verify({ phoneNumber, code });
        if (error) {
          throw new Error(error.message);
        }
        if (data) {
          await refreshSession();
          return true;
        }
        setError("Invalid OTP. Please try again.");
        return false;
      } catch (err) {
        console.error("❌ OTP verification error:", err);
        const message =
          (err as Error)?.message === "USER_NOT_FOUND"
            ? "User not found. Please sign up first."
            : (err as Error)?.message || "Invalid OTP. Please try again.";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  const signOut = useCallback(async () => {
    console.info("[useAuth] Sign out requested");
    try {
      await sessionSignOut();
      console.info("[useAuth] Sign out result: success");
    } catch (err) {
      console.error("❌ useAuth: Sign out error:", err);
    }
  }, [sessionSignOut]);

  const sendEmailOtp = useCallback(
    async (email: string, type: EmailOtpType): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!emailOtpClient) throw new Error("Email OTP client not available");
        const { error } = await emailOtpClient.sendVerificationOtp({ email, type });
        if (error) throw new Error(error.message);
        return true;
      } catch (err) {
        console.error("❌ Email OTP send error:", err);
        setError((err as Error)?.message || "Failed to send code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [emailOtpClient]
  );

  const checkEmailOtp = useCallback(
    async (email: string, type: EmailOtpType, otp: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!emailOtpClient) throw new Error("Email OTP client not available");
        const { error } = await emailOtpClient.checkVerificationOtp({ email, type, otp });
        if (error) throw new Error(error.message);
        return true;
      } catch (err) {
        console.error("❌ Email OTP check error:", err);
        setError((err as Error)?.message || "Invalid code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [emailOtpClient]
  );

  const signInWithEmailOtp = useCallback(
    async (email: string, otp: string, disableSignUp = false): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!signInEmailOtpClient) throw new Error("Sign-in OTP client not available");
        const { data, error } = await signInEmailOtpClient({
          email,
          otp,
          options: { disableSignUp },
        });
        if (error) throw new Error(error.message);
        if (data) {
          await refreshSession();
          return true;
        }
        setError("Sign-in failed.");
        return false;
      } catch (err) {
        console.error("❌ Email OTP sign-in error:", err);
        setError((err as Error)?.message || "Failed to sign in with code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession, signInEmailOtpClient]
  );

  const verifyEmailWithOtp = useCallback(
    async (email: string, otp: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!emailOtpClient) throw new Error("Email OTP client not available");
        const { error } = await emailOtpClient.verifyEmail({ email, otp });
        if (error) throw new Error(error.message);
        await refreshSession();
        return true;
      } catch (err) {
        console.error("❌ Email verification error:", err);
        setError((err as Error)?.message || "Failed to verify email.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession, emailOtpClient]
  );

  const requestPasswordResetOtp = useCallback(
    async (email: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!forgetPasswordClient) throw new Error("Password reset OTP client not available");
        const { error } = await forgetPasswordClient.emailOtp({ email });
        if (error) throw new Error(error.message);
        return true;
      } catch (err) {
        console.error("❌ Password reset OTP request error:", err);
        setError((err as Error)?.message || "Failed to send reset code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [forgetPasswordClient]
  );

  const resetPasswordWithOtp = useCallback(
    async (email: string, otp: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!emailOtpClient) throw new Error("Email OTP client not available");
        const { error } = await emailOtpClient.resetPassword({ email, otp, password });
        if (error) throw new Error(error.message);
        await refreshSession();
        return true;
      } catch (err) {
        console.error("❌ Password reset with OTP error:", err);
        setError((err as Error)?.message || "Failed to reset password.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession, emailOtpClient]
  );

  const signInWithEmailAndPassword = useCallback(
    async (email: string, password: string, rememberMe: boolean = true): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authClient.signIn.email({ email, password, rememberMe });
        if (result.data) {
          await refreshSession();
          return true;
        }
        if (result.error) {
          console.error("❌ Email/Password authentication error:", result.error);
          setError(
            (result.error as { message?: string })?.message ||
              "Authentication failed. Please try again."
          );
        }
        return false;
      } catch (err) {
        console.error("❌ Email/Password authentication error:", err);
        setError((err as Error)?.message || "Failed to authenticate. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  const signUpWithEmailAndPassword = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const name = email.split("@")[0] || email;
        const result = await authClient.signUp.email({ email, password, name });
        if (result.data) {
          await refreshSession();
          return true;
        }
        if (result.error) {
          console.error("❌ Email/Password registration error:", result.error);
          setError(
            (result.error as { message?: string })?.message ||
              "Registration failed. Please try again."
          );
        }
        return false;
      } catch (err) {
        console.error("❌ Email/Password registration error:", err);
        setError((err as Error)?.message || "Failed to register. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  const requestPasswordReset = useCallback(
    async (email: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        return await requestPasswordResetOtp(email);
      } catch (err) {
        console.error("❌ Password reset request error:", err);
        setError((err as Error)?.message || "Failed to request reset code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [requestPasswordResetOtp]
  );

  const resetPassword = useCallback(
    async (email: string, otp: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        return await resetPasswordWithOtp(email, otp, password);
      } catch (err) {
        console.error("❌ Password reset error:", err);
        setError((err as Error)?.message || "Failed to reset password.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [resetPasswordWithOtp]
  );

  return {
    signInWithGoogle,
    signInWithFacebook,
    signInWithTikTok,
    sendEmailOtp,
    checkEmailOtp,
    signInWithEmailOtp,
    verifyEmailWithOtp,
    requestPasswordResetOtp,
    resetPasswordWithOtp,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    requestPasswordReset,
    resetPassword,
    sendOtp,
    verifyOtp,
    signOut,
    isLoading,
    error,
  };
};
