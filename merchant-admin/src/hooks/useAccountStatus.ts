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

// Helper function to get cached status synchronously
function getCachedStatus(): AccountStatus | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("merchantStatus");
  if (stored === "active" || stored === "pending") {
    return stored as AccountStatus;
  }
  return null;
}

export const useAccountStatus = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  // Initialize status from localStorage immediately to avoid flash
  const cached = getCachedStatus();
  const [status, setStatus] = useState<AccountStatus | null>(cached);
  const [cachedStatus, setCachedStatus] = useState<AccountStatus | null>(() => getCachedStatus());
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isStatusConfirmed, setIsStatusConfirmed] = useState(!!cached);

  const derived = useMemo(() => deriveAccountStatus(user), [user]);

  // Read any cached status from localStorage (set by profile fetch)
  // This effect ensures we pick up any updates to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("merchantStatus");
    if (stored === "active" || stored === "pending") {
      const newCachedStatus = stored as AccountStatus;
      setCachedStatus(newCachedStatus);
      // Update status immediately if we have a cached value
      setStatus(newCachedStatus);
      setIsStatusConfirmed(true);
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

  // Fetch merchant profile when user is available but status is not confirmed
  useEffect(() => {
    if (isSessionLoading || isFetchingProfile || !user?.email || isStatusConfirmed) return;
    
    // Fetch profile if we don't have cached status
    // And make sure we're fetching for the current user
    if (!cachedStatus && user.email === previousUserEmail && typeof window !== "undefined") {
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
              // Update status immediately when we get the profile
              setStatus(profileStatus);
              setIsStatusConfirmed(true);
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
  }, [user, isSessionLoading, cachedStatus, isFetchingProfile, previousUserEmail, isStatusConfirmed]);

  useEffect(() => {
    // Prefer cached status (from profile fetch) when available
    // Only update if we have a cached status, otherwise use derived
    if (cachedStatus) {
      setStatus(cachedStatus);
      setIsStatusConfirmed(true);
    } else if (!isSessionLoading && user && derived) {
      // Only use derived status if session is loaded, user exists, and we don't have cache
      // Check if derived status is actually from user data (not default)
      const hasStatusInUser = !!(user as any)?.metadata?.merchantStatus ||
        !!(user as any)?.merchantStatus ||
        !!(user as any)?.status;
      
      if (hasStatusInUser) {
        setStatus(derived);
        setIsStatusConfirmed(true);
      }
    }
  }, [derived, cachedStatus, isSessionLoading, user]);

  return {
    status: status || "pending", // Return pending as fallback for type safety, but isStatusConfirmed tells if it's real
    isPending: status === "pending",
    isLoading: isSessionLoading || isFetchingProfile || !isStatusConfirmed,
    isStatusConfirmed,
  } as const;
};
