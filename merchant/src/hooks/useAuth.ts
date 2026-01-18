"use client";

import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/useSession";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshSession, signOut: sessionSignOut } = useSession();

  const signInWithEmailAndPassword = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authClient.signIn.email({
          email,
          password,
        });

        if (res.error) {
          // Check if it's a ban-related error and show appropriate message
          const errorCode = (res.error as { code?: string })?.code;
          const errorMessage = res.error.message ?? "Failed to sign in";
          
          let finalError: string;
          if (errorCode === "BANNED_USER" || errorMessage.includes("banned") || errorMessage.includes("SUSPENDED")) {
            finalError = "Your account has been banned. Please contact support.";
          } else {
            finalError = errorMessage;
          }
          
          setError(finalError);
          return { success: false, error: finalError };
        }

        await refreshSession();
        return { success: true };
      } catch (e) {
        console.error("[merchant] signIn.email failed", e);
        // Check if the error is from a banned user
        const errorCode = (e as { code?: string })?.code;
        const errorMessage = (e as Error)?.message ?? "Failed to sign in";
        
        let finalError: string;
        if (errorCode === "BANNED_USER" || errorMessage.includes("banned") || errorMessage.includes("SUSPENDED")) {
          finalError = "Your account has been banned. Please contact support.";
        } else {
          finalError = errorMessage;
        }
        
        setError(finalError);
        return { success: false, error: finalError };
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession]
  );

  const signOut = useCallback(async () => {
    await sessionSignOut();
  }, [sessionSignOut]);

  return {
    signInWithEmailAndPassword,
    signOut,
    isLoading,
    error,
  };
}
