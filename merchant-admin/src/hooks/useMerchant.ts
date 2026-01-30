"use client";

import { useState, useEffect } from "react";
import { useSession } from "./useSession";

interface UseMerchantReturn {
  merchantId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useMerchant = (): UseMerchantReturn => {
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();

  useEffect(() => {
    const getMerchantId = async () => {
      if (sessionLoading) {
        return; // Wait for session to load
      }

      if (!isAuthenticated || !user?.email) {
        setMerchantId(null);
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        // First try to get from localStorage (set by useSession)
        const storedMerchantId = localStorage.getItem('merchantId');
        if (storedMerchantId) {
          setMerchantId(storedMerchantId);
          setError(null);
          setIsLoading(false);
          return;
        }

        // If not in localStorage, fetch from API
        const { findMerchantByEmail } = await import('@/lib/services/profileService');
        const merchant = await findMerchantByEmail(user.email);
        
        if (merchant) {
          setMerchantId(merchant.id);
          setError(null);
          // Store in localStorage for future use
          localStorage.setItem('merchantId', merchant.id);
        } else {
          setMerchantId(null);
          setError("Merchant not found");
        }
      } catch (err) {
        console.error("Error fetching merchant ID:", err);
        setMerchantId(null);
        setError("Failed to fetch merchant information");
      } finally {
        setIsLoading(false);
      }
    };

    getMerchantId();
  }, [user, isAuthenticated, sessionLoading]);

  return {
    merchantId,
    isLoading,
    error,
  };
};