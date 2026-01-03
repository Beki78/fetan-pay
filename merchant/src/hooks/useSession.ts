"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type User = NonNullable<
  ReturnType<typeof authClient.getSession>["data"]
>["user"];

type Session = NonNullable<
  ReturnType<typeof authClient.getSession>["data"]
>["session"];

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!session;

  const checkSession = useCallback(async () => {
    try {
      setError(null);
      const res = await authClient.getSession();

      if (res.data?.user && res.data?.session) {
        setUser(res.data.user);
        setSession(res.data.session);
        return true;
      }

      setUser(null);
      setSession(null);
      return false;
    } catch (e) {
      console.error("[merchant] getSession failed", e);
      setError("Failed to check session");
      setUser(null);
      setSession(null);
      return false;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      await checkSession();
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
          onError: () => {
            setUser(null);
            setSession(null);
            setError(null);
          },
        },
      });
      return true;
    } catch (e) {
      console.error("[merchant] signOut failed", e);
      setUser(null);
      setSession(null);
      setError(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await checkSession();
      setIsLoading(false);
    };
    init();
  }, [checkSession]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    checkSession,
    refreshSession,
    signOut,
  };
}
