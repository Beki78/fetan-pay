const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3003/api/v1";

type TransactionProvider = "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";

export interface VerifyFromQrPayload {
  qrUrl: string;
  provider?: TransactionProvider;
  reference?: string;
  accountSuffix?: string;
}

export interface VerifyFromQrResponse {
  provider: TransactionProvider;
  reference: string;
  status: "PENDING" | "VERIFIED" | "FAILED";
  verification?: unknown;
  error?: string;
  transaction?: {
    id: string;
    qrUrl: string;
    status: string;
    verifiedAt?: string | null;
    createdAt?: string;
  };
}

export async function verifyFromQr(
  payload: VerifyFromQrPayload
): Promise<VerifyFromQrResponse> {
  const response = await fetch(`${API_BASE_URL}/transactions/verify-from-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    const message = json?.message || json?.error || "Verification failed";
    throw new Error(message);
  }

  if (json.error) {
    throw new Error(json.error);
  }

  return json as VerifyFromQrResponse;
}