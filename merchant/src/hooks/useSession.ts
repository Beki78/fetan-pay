"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { API_BASE_URL } from "@/lib/config";

type User = NonNullable<
  ReturnType<typeof authClient.getSession>["data"]
>["user"];

type Session = NonNullable<
  ReturnType<typeof authClient.getSession>["data"]
>["session"];

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<any | null>(null);
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

        // Best-effort: fetch merchant membership info so the UI can show business name.
        // This is optional and should not break auth/session if the API isn't reachable.
        try {
          const r = await fetch(`${API_BASE_URL}/merchant-users/me`, {
            credentials: "include",
          });
          if (r.ok) {
            const data = await r.json();
            setMembership(data);
          } else if (r.status === 401) {
            // User is banned or unauthorized - sign them out
            console.log("[merchant] User is banned or unauthorized, signing out");
            setUser(null);
            setSession(null);
            setMembership(null);
            // Sign out from Better Auth as well
            try {
              await authClient.signOut();
            } catch (e) {
              console.error("[merchant] Error signing out:", e);
            }
            return false;
          } else {
            setMembership(null);
          }
        } catch {
          setMembership(null);
        }
        return true;
      }

      setUser(null);
      setSession(null);
      setMembership(null);
      return false;
    } catch (e) {
      console.error("[merchant] getSession failed", e);
      setError("Failed to check session");
      setUser(null);
      setSession(null);
      setMembership(null);
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
            setMembership(null);
            setError(null);
          },
          onError: () => {
            setUser(null);
            setSession(null);
            setMembership(null);
            setError(null);
          },
        },
      });
      return true;
    } catch (e) {
      console.error("[merchant] signOut failed", e);
      setUser(null);
      setSession(null);
      setMembership(null);
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
    membership,
    isLoading,
    isAuthenticated,
    error,
    checkSession,
    refreshSession,
    signOut,
  };
}
