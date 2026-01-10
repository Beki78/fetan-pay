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
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const derived = useMemo(() => deriveAccountStatus(user), [user]);

  // Read any cached status from localStorage (set by profile fetch)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("merchantStatus");
    if (stored === "active" || stored === "pending") {
      setCachedStatus(stored as AccountStatus);
    }
  }, []);

  // Track previous user email to detect user changes
  const [previousUserEmail, setPreviousUserEmail] = useState<string | null>(null);

  // Clear cached status when user changes
  useEffect(() => {
    if (user?.email && user.email !== previousUserEmail) {
      // User has changed - clear cached status
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("merchantStatus");
        window.localStorage.removeItem("merchantId");
      }
      setCachedStatus(null);
      setPreviousUserEmail(user.email);
    }
  }, [user?.email, previousUserEmail]);

  // Fetch merchant profile when user is available but status is still pending
  useEffect(() => {
    if (isSessionLoading || isFetchingProfile || !user?.email) return;
    
    // Only fetch if we don't have cached status and derived status is pending
    // And make sure we're fetching for the current user
    if (!cachedStatus && derived === "pending" && user.email === previousUserEmail && typeof window !== "undefined") {
      const fetchProfile = async () => {
        setIsFetchingProfile(true);
        try {
          const { findMerchantByEmail, getMerchantProfile } = await import('@/lib/services/profileService');
          const merchant = await findMerchantByEmail(user.email!);
          if (merchant) {
            const profile = await getMerchantProfile(merchant.id);
            // Verify the profile belongs to the current user
            if (profile.status && profile.contactEmail === user.email) {
              const profileStatus = profile.status.toLowerCase() as AccountStatus;
              window.localStorage.setItem('merchantStatus', profileStatus);
              window.localStorage.setItem('merchantId', profile.id);
              setCachedStatus(profileStatus);
            }
          }
        } catch (err) {
          // Silently fail - profile fetch is optional
          console.debug('Could not fetch merchant profile:', err);
        } finally {
          setIsFetchingProfile(false);
        }
      };
      
      fetchProfile();
    }
  }, [user, isSessionLoading, cachedStatus, derived, isFetchingProfile, previousUserEmail]);

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
