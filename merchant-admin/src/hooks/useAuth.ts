"use client";

import { useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useSession } from "./useSession";
import { BASE_URL } from "@/constant/baseApi";

const SOCIAL_CALLBACK_URL = "http://localhost:3000";

interface UseAuthReturn {
  // Social authentication
  signInWithGoogle: () => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  signInWithTikTok: () => Promise<boolean>;
  // Email OTP flows
  sendEmailOtp: (email: string, type: "sign-in" | "email-verification" | "forget-password") => Promise<boolean>;
  checkEmailOtp: (email: string, type: "sign-in" | "email-verification" | "forget-password", otp: string) => Promise<boolean>;
  signInWithEmailOtp: (email: string, otp: string, disableSignUp?: boolean) => Promise<boolean>;
  verifyEmailWithOtp: (email: string, otp: string) => Promise<boolean>;
  requestPasswordResetOtp: (email: string) => Promise<boolean>;
  resetPasswordWithOtp: (email: string, otp: string, password: string) => Promise<boolean>;
  signInWithEmailAndPassword: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<boolean>;
  signUpWithEmailAndPassword: (
    email: string,
    password: string
  ) => Promise<boolean>;

  // Password reset
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, password: string) => Promise<boolean>;

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
  // Better Auth client augments aren't in our types, so cast with runtime guard
  const emailOtpClient = (authClient as any)?.emailOtp;
  const forgetPasswordClient = (authClient as any)?.forgetPassword;
  const signInEmailOtpClient = (authClient as any)?.signIn?.emailOtp;

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
        
        return false;
      }
      return false;
    } catch (error: unknown) {
      console.error("❌ Google authentication error:", error);
      setError(
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
        
        return false;
      }
      return false;
    } catch (error: unknown) {
      console.error("❌ Facebook authentication error:", error);
      setError(
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
       
        return false;
      }
      return false;
    } catch (error: unknown) {
      console.error("❌ TikTok authentication error:", error);
      setError(
        (error as Error)?.message || "Failed to authenticate. Please try again."
      // Email OTP flows
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

          return true;
        } else {
          setError("Invalid OTP. Please try again.");
          return false;
        }
      } catch (error: unknown) {
        console.error("❌ OTP verification error:", error);
        const errorMessage =
          (error as Error)?.message === "USER_NOT_FOUND"
            ? "User not found. Please sign up first."
            : (error as Error)?.message || "Invalid OTP. Please try again.";

        setError(errorMessage);
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
    } catch (error) {
      console.error("❌ useAuth: Sign out error:", error);
    }
  }, [sessionSignOut]);

  // Email OTP flows
  const sendEmailOtp = useCallback(
    async (
      email: string,
      type: "sign-in" | "email-verification" | "forget-password"
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!emailOtpClient) throw new Error("Email OTP client not available");
        const { error } = await emailOtpClient.sendVerificationOtp({
          email,
          type,
        });
        if (error) throw new Error(error.message);
        return true;
      } catch (error: unknown) {
        console.error("❌ Email OTP send error:", error);
        setError((error as Error)?.message || "Failed to send code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const checkEmailOtp = useCallback(
    async (
      email: string,
      type: "sign-in" | "email-verification" | "forget-password",
      otp: string
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!emailOtpClient) throw new Error("Email OTP client not available");
        const { error } = await emailOtpClient.checkVerificationOtp({
          email,
          type,
          otp,
        });
        if (error) throw new Error(error.message);
        return true;
      } catch (error: unknown) {
        console.error("❌ Email OTP check error:", error);
        setError((error as Error)?.message || "Invalid code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signInWithEmailOtp = useCallback(
    async (
      email: string,
      otp: string,
      disableSignUp = false
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!signInEmailOtpClient) throw new Error("Sign-in OTP client not available");
        const { data, error } = await signInEmailOtpClient({
          email,
          otp,
          options: {
            disableSignUp,
          },
        });
        if (error) throw new Error(error.message);
        if (data) {
          await refreshSession();
          return true;
        }
        setError("Sign-in failed.");
        return false;
      } catch (error: unknown) {
        console.error("❌ Email OTP sign-in error:", error);
        setError((error as Error)?.message || "Failed to sign in with code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
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
      } catch (error: unknown) {
        console.error("❌ Email verification error:", error);
        setError((error as Error)?.message || "Failed to verify email.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
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
      } catch (error: unknown) {
        console.error("❌ Password reset OTP request error:", error);
        setError((error as Error)?.message || "Failed to send reset code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetPasswordWithOtp = useCallback(
    async (email: string, otp: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!emailOtpClient) throw new Error("Email OTP client not available");
        const { error } = await emailOtpClient.resetPassword({
          email,
          otp,
          password,
        });
        if (error) throw new Error(error.message);
        await refreshSession();
        return true;
      } catch (error: unknown) {
        console.error("❌ Password reset with OTP error:", error);
        setError((error as Error)?.message || "Failed to reset password.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

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
          
          return false;
        }
        return false;
      } catch (error: unknown) {
        console.error("❌ Email/Password authentication error:", error);
        setError(
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
          return true;
        } else if (result.error) {
          console.error("❌ Email/Password registration error:", result.error);
          setError(
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
       
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  // Request password reset email
  const requestPasswordReset = useCallback(
    async (email: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        // Reuse OTP-based reset flow
        return await requestPasswordResetOtp(email);
      } catch (error: unknown) {
        console.error("❌ Password reset request error:", error);
        setError((error as Error)?.message || "Failed to request reset code.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [requestPasswordResetOtp]
  );

  // Confirm password reset with token/code
  const resetPassword = useCallback(
    async (email: string, otp: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        return await resetPasswordWithOtp(email, otp, password);
      } catch (error: unknown) {
        console.error("❌ Password reset error:", error);
        setError((error as Error)?.message || "Failed to reset password.");
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
