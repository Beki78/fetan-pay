const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3003/api/v1";

export type MerchantStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export interface MerchantUser {
  id: string;
  role: string;
  status: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface Merchant {
  id: string;
  name: string;
  tin?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: MerchantStatus;
  source?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  users: MerchantUser[];
}

export interface MerchantListResponse {
  data: Merchant[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchMerchants(params?: {
  status?: MerchantStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const url = new URL(`${API_BASE_URL}/merchant-accounts`);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(url.toString(), { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to fetch merchants");
  }
  return json as MerchantListResponse;
}

export async function approveMerchant(id: string, approvedBy?: string) {
  const res = await fetch(`${API_BASE_URL}/merchant-accounts/${id}/approve`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvedBy }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to approve merchant");
  }
  return json as Merchant;
}
