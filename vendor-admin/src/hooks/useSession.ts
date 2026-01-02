"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

// Use Better Auth's built-in types
type User = NonNullable<
  ReturnType<typeof authClient.getSession>["data"]
>["user"];
type Session = NonNullable<
  ReturnType<typeof authClient.getSession>["data"]
>["session"];

interface UseSessionReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<boolean>;
  checkSession: () => Promise<boolean>;
}

export const useSession = (): UseSessionReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null && session !== null;

  // Simple session check using Better Auth
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const sessionResponse = await authClient.getSession();

      if (sessionResponse.data?.user && sessionResponse.data?.session) {
        setUser(sessionResponse.data.user);
        setSession(sessionResponse.data.session);
        return true;
      }

      // No valid session
      setUser(null);
      setSession(null);
      return false;
    } catch (error) {
      console.error("❌ Error checking session:", error);
      setError("Failed to check session");
      setUser(null);
      setSession(null);
      return false;
    }
  }, []);

  // Refresh session data
  const refreshSession = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simply check session again - Better Auth handles refresh automatically
      await checkSession();
    } catch (error) {
      console.error("❌ Error refreshing session:", error);
      setError("Failed to refresh session");
    } finally {
      setIsLoading(false);
    }
  }, [checkSession]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      // Call Better Auth's signOut and wait for it to complete
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear local state after successful sign out
            setUser(null);
            setSession(null);
            setError(null);
          },
          onError: (ctx) => {
            console.error("❌ Sign out error:", ctx.error);
            // Still clear local state even on error
            setUser(null);
            setSession(null);
            setError(null);
          },
        },
      });

      return true;
    } catch (error) {
      console.error("❌ Error signing out:", error);
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      setError(null);
      return false;
    }
  }, []);

  // Initial session check on mount
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);
      await checkSession();
      setIsLoading(false);
    };

    initializeSession();
  }, [checkSession]);

  // Set up periodic session refresh (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkSession();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, checkSession]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    refreshSession,
    signOut,
    checkSession,
  };
};
