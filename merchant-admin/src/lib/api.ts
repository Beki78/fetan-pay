import { API_BASE_URL } from "./constants";

export type TransactionStatus = "PENDING" | "VERIFIED" | "FAILED";
export type TransactionProvider = "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";

export interface TransactionRecord {
  id: string;
  provider: TransactionProvider;
  reference: string;
  qrUrl: string;
  status: TransactionStatus;
  verifiedAt?: string | null;
  createdAt?: string;
  errorMessage?: string | null;
  verificationPayload?: unknown;
}

export interface TransactionListResponse {
  data: TransactionRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchTransactions(params: {
  provider?: TransactionProvider;
  status?: TransactionStatus;
  page?: number;
  pageSize?: number;
}): Promise<TransactionListResponse> {
  const url = new URL(`${API_BASE_URL}/transactions`);

  if (params.provider) url.searchParams.set("provider", params.provider);
  if (params.status) url.searchParams.set("status", params.status);
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("pageSize", String(params.pageSize ?? 20));

  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to fetch transactions");
  }

  return json as TransactionListResponse;
}