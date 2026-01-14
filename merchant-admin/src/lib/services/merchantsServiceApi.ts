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
