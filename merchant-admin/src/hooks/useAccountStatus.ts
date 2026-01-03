"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "./useSession";

export type AccountStatus = "pending" | "active";

/**
 * Derive a normalized account status from the authenticated user record.
 * We defensively look at a few common locations (metadata, top-level status)
 * and fall back to "pending" when uncertain.
 */
function deriveAccountStatus(user: unknown): AccountStatus {
  if (!user || typeof user !== "object") return "pending";

  const rawStatus = (user as any)?.metadata?.merchantStatus ??
    (user as any)?.merchantStatus ??
    (user as any)?.status;

  if (typeof rawStatus === "string") {
    const normalized = rawStatus.toLowerCase();
    if (normalized === "active") return "active";
  }

  return "pending";
}

export const useAccountStatus = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [status, setStatus] = useState<AccountStatus>("pending");
  const [cachedStatus, setCachedStatus] = useState<AccountStatus | null>(null);

  const derived = useMemo(() => deriveAccountStatus(user), [user]);

  // Read any cached status from localStorage (set by profile fetch)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("merchantStatus");
    if (stored === "active" || stored === "pending") {
      setCachedStatus(stored);
    }
  }, []);

  useEffect(() => {
    // Prefer cached status (from profile fetch) when available
    if (cachedStatus) {
      setStatus(cachedStatus);
    } else {
      setStatus(derived);
    }
  }, [derived, cachedStatus]);

  return {
    status,
    isPending: status === "pending",
    isLoading: isSessionLoading,
  } as const;
};
