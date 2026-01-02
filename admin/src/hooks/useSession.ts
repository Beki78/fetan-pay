"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

type User = NonNullable<ReturnType<typeof authClient.getSession>["data"]>["user"];
type Session = NonNullable<ReturnType<typeof authClient.getSession>["data"]>["session"];

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

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const sessionResponse = await authClient.getSession();

      if (sessionResponse.data?.user && sessionResponse.data?.session) {
        setUser(sessionResponse.data.user);
        setSession(sessionResponse.data.session);
        return true;
      }

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

  const refreshSession = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await checkSession();
    } catch (error) {
      console.error("❌ Error refreshing session:", error);
      setError("Failed to refresh session");
    } finally {
      setIsLoading(false);
    }
  }, [checkSession]);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setUser(null);
            setSession(null);
            setError(null);
          },
          onError: (ctx: any) => {
            console.error("❌ Sign out error:", ctx.error);
            setUser(null);
            setSession(null);
            setError(null);
          },
        },
      });

      return true;
    } catch (error) {
      console.error("❌ Error signing out:", error);
      setUser(null);
      setSession(null);
      setError(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);
      await checkSession();
      setIsLoading(false);
    };

    initializeSession();
  }, [checkSession]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkSession();
      }
    }, 5 * 60 * 1000);

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
