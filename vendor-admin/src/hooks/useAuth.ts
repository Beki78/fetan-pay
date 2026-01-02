"use client";

import { useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useSession } from "./useSession";
import { toast } from "react-hot-toast";

const SOCIAL_CALLBACK_URL = "http://localhost:3000";

interface UseAuthReturn {
  // Social authentication
  signInWithGoogle: () => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  signInWithTikTok: () => Promise<boolean>;
  signInWithEmailAndPassword: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<boolean>;
  signUpWithEmailAndPassword: (
    email: string,
    password: string
  ) => Promise<boolean>;

  // Phone authentication
  sendOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, code: string) => Promise<boolean>;

  // General
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshSession, signOut: sessionSignOut } = useSession();

  // Social authentication
  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: SOCIAL_CALLBACK_URL,
      });

      if (result.data) {
        await refreshSession();
        // Don't show toast here - it will show after redirect
        return true;
      } else if (result.error) {
        console.error("❌ Google authentication error:", result.error);
        setError(
          (result.error as { message?: string }).message ||
            "Authentication failed. Please try again."
        );
        toast.error(
          (result.error as { message?: string }).message ||
            "Authentication failed. Please try again."
        );
        return false;
      }
      return false;
    } catch (error: unknown) {
      console.error("❌ Google authentication error:", error);
      setError(
        (error as Error)?.message || "Failed to authenticate. Please try again."
      );
      toast.error(
        (error as Error)?.message || "Failed to authenticate. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshSession]);

  const signInWithFacebook = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.social({
        provider: "facebook",
        callbackURL: SOCIAL_CALLBACK_URL,
      });

      if (result.data) {
        await refreshSession();
        // Don't show toast here - it will show after redirect
        return true;
      } else if (result.error) {
        console.error("❌ Facebook authentication error:", result.error);
        setError(
          (result.error as { message?: string }).message ||
            "Authentication failed. Please try again."
        );
        toast.error(
          (result.error as { message?: string }).message ||
            "Authentication failed. Please try again."
        );
        return false;
      }
      return false;
    } catch (error: unknown) {
      console.error("❌ Facebook authentication error:", error);
      setError(
        (error as Error)?.message || "Failed to authenticate. Please try again."
      );
      toast.error(
        (error as Error)?.message || "Failed to authenticate. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshSession]);

  const signInWithTikTok = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.social({
        provider: "tiktok",
        callbackURL: SOCIAL_CALLBACK_URL,
      });

      if (result.data) {
        await refreshSession();
        // Don't show toast here - it will show after redirect
        return true;
      } else if (result.error) {
        console.error("❌ TikTok authentication error:", result.error);
        setError(
          (result.error as { message?: string }).message ||
            "Authentication failed. Please try again."
        );
        toast.error(
          (result.error as { message?: string }).message ||
            "Authentication failed. Please try again."
        );
        return false;
      }
      return false;
    } catch (error: unknown) {
      console.error("❌ TikTok authentication error:", error);
      setError(
        (error as Error)?.message || "Failed to authenticate. Please try again."
      );
      toast.error(
        (error as Error)?.message || "Failed to authenticate. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshSession]);

  // Send OTP for phone authentication
  const sendOtp = useCallback(async (phoneNumber: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.phoneNumber.sendOtp({ phoneNumber });
      return true;
    } catch (error: unknown) {
      console.error("❌ Error sending OTP:", error);
      setError(
        (error as Error)?.message || "Failed to send OTP. Please try again."
      );
      toast.error(
        (error as Error)?.message || "Failed to send OTP. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify OTP for phone authentication
  const verifyOtp = useCallback(
    async (phoneNumber: string, code: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await authClient.phoneNumber.verify({
          phoneNumber,
          code,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          // Refresh session to update the hook state
          await refreshSession();

          toast.success("Login successful!");
          return true;
        } else {
          setError("Invalid OTP. Please try again.");
          toast.error("Invalid OTP. Please try again.");
          return false;
        }
      } catch (error: unknown) {
        console.error("❌ OTP verification error:", error);
        const errorMessage =
          (error as Error)?.message === "USER_NOT_FOUND"
            ? "User not found. Please sign up first."
            : (error as Error)?.message || "Invalid OTP. Please try again.";

        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  // Sign out
  const signOut = useCallback(async () => {
    console.info("[useAuth] Sign out requested");
    try {
      const success = await sessionSignOut();
      console.info("[useAuth] Sign out result:", success);
      toast.success("You have been signed out.");
    } catch (error) {
      console.error("❌ useAuth: Sign out error:", error);
      toast.success("You have been signed out.");
    }
  }, [sessionSignOut]);

  // Email and password authentication
  const signInWithEmailAndPassword = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean = true
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await authClient.signIn.email({
          email,
          password,
          rememberMe,
        });

        if (result.data) {
          await refreshSession();
          toast.success("Login successful!");
          return true;
        } else if (result.error) {
          console.error(
            "❌ Email/Password authentication error:",
            result.error
          );
          setError(
            (result.error as { message?: string }).message ||
              "Authentication failed. Please try again."
          );
          toast.error(
            (result.error as { message?: string }).message ||
              "Authentication failed. Please try again."
          );
          return false;
        }
        return false;
      } catch (error: unknown) {
        console.error("❌ Email/Password authentication error:", error);
        setError(
          (error as Error)?.message ||
            "Failed to authenticate. Please try again."
        );
        toast.error(
          (error as Error)?.message ||
            "Failed to authenticate. Please try again."
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  // Email and password registration
  const signUpWithEmailAndPassword = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Extract name from email (part before @) or use email as fallback
        const name = email.split("@")[0] || email;

        const result = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (result.data) {
          await refreshSession();
          toast.success("Registration successful! Welcome to Afriuz!");
          return true;
        } else if (result.error) {
          console.error("❌ Email/Password registration error:", result.error);
          setError(
            (result.error as { message?: string }).message ||
              "Registration failed. Please try again."
          );
          toast.error(
            (result.error as { message?: string }).message ||
              "Registration failed. Please try again."
          );
          return false;
        }
        return false;
      } catch (error: unknown) {
        console.error("❌ Email/Password registration error:", error);
        setError(
          (error as Error)?.message || "Failed to register. Please try again."
        );
        toast.error(
          (error as Error)?.message || "Failed to register. Please try again."
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  return {
    signInWithGoogle,
    signInWithFacebook,
    signInWithTikTok,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    sendOtp,
    verifyOtp,
    signOut,
    isLoading,
    error,
  };
};
