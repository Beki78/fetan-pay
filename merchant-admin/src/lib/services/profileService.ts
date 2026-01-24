import { API_BASE_URL } from "../config";

export interface MerchantUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  status?: string | null;
  userId?: string | null;
}

export interface MerchantProfile {
  id: string;
  name: string;
  tin?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status?: string | null;
  users?: MerchantUser[];
  approvedAt?: string | null;
  approvedBy?: string | null;
  source?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export async function getMerchantProfile(merchantId: string): Promise<MerchantProfile> {
  const res = await fetch(`${API_BASE_URL}/merchant-accounts/${merchantId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to load merchant profile");
  }

  return json as MerchantProfile;
}

export async function findMerchantByEmail(email: string): Promise<MerchantProfile | null> {
  const url = new URL(`${API_BASE_URL}/merchant-accounts`);
  url.searchParams.set("search", email);

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to find merchant by email");
  }

  const data = (json as any)?.data;
  if (Array.isArray(data) && data.length > 0) {
    return data[0] as MerchantProfile;
  }
  return null;
}

export interface UpdateMerchantProfileInput {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  tin?: string;
}

export async function updateMerchantProfile(
  merchantId: string,
  data: UpdateMerchantProfileInput
): Promise<MerchantProfile> {
  const res = await fetch(`${API_BASE_URL}/merchant-accounts/${merchantId}/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to update merchant profile");
  }

  return json as MerchantProfile;
}
