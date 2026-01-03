"use client";

import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/useSession";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshSession, signOut: sessionSignOut } = useSession();

  const signInWithEmailAndPassword = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authClient.signIn.email({
          email,
          password,
        });

        if (res.error) {
          setError(res.error.message ?? "Failed to sign in");
          return false;
        }

        await refreshSession();
        return true;
      } catch (e) {
        console.error("[merchant] signIn.email failed", e);
        setError((e as Error)?.message ?? "Failed to sign in");
        return false;
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
