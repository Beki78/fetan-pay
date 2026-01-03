import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../constants";

export type TransactionProvider = "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";
export type TransactionStatus = "PENDING" | "VERIFIED" | "FAILED";

export interface VerifyFromQrRequest {
  qrUrl: string;
  provider?: TransactionProvider;
  reference?: string;
  accountSuffix?: string;
}

export interface VerifyFromQrResponse {
  provider: TransactionProvider;
  reference: string;
  status: TransactionStatus;
  verification?: unknown;
  error?: string;
  transaction?: {
    id: string;
    qrUrl: string;
    status: TransactionStatus;
    verifiedAt?: string | null;
    createdAt?: string;
  };
}

export const transactionsServiceApi = createApi({
  reducerPath: "transactionsServiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  endpoints: (builder) => ({
    verifyFromQr: builder.mutation<VerifyFromQrResponse, VerifyFromQrRequest>({
      query: (body) => ({
        url: "/transactions/verify-from-qr",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useVerifyFromQrMutation } = transactionsServiceApi;