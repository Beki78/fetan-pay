import { API_BASE_URL } from "../config";

export interface SelfRegisterMerchantPayload {
  name: string;
  tin?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerEmail: string;
  ownerPhone?: string;
  ownerName?: string;
}

export async function selfRegisterMerchant(
  payload: SelfRegisterMerchantPayload
) {
  const res = await fetch(`${API_BASE_URL}/merchant-accounts/self-register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to create merchant");
  }

  return json;
}

/**
 * Link Better Auth user to MerchantUser after signup
 * This should be called after the user completes Better Auth signup
 */
export async function linkUserToMerchant() {
  const res = await fetch(`${API_BASE_URL}/merchant-accounts/link-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for Better Auth session
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Failed to link user to merchant:", json);
    // Don't throw - this is a non-critical operation
    return { success: false };
  }

  return json;
}


/**
 * Promote merchant from UNVERIFIED to PENDING after email verification
 * This should be called after the user verifies their email
 */
export async function promoteToVerified(email: string) {
  const res = await fetch(`${API_BASE_URL}/merchant-accounts/promote-to-verified`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for Better Auth session
    body: JSON.stringify({ email }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to promote merchant");
  }

  return json;
}
