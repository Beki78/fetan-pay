import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../constants";

export type TransactionProvider = "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";

export type PaymentVerificationStatus = "VERIFIED" | "UNVERIFIED" | "PENDING";

export type MerchantVerifyMismatchReason =
  | "REFERENCE_NOT_FOUND"
  | "RECEIVER_MISMATCH"
  | "AMOUNT_MISMATCH"
  | "UNVERIFIED"
  | string
  | null;

export interface VerifyMerchantPaymentRequest {
  provider: TransactionProvider;
  reference: string;
  claimedAmount: number;
  qrData?: string;
}

export interface VerifyMerchantPaymentResponse {
  status: PaymentVerificationStatus;
  checks: {
    referenceFound: boolean;
    receiverMatches: boolean;
    amountMatches: boolean;
  };
  transaction: {
    reference: string;
    receiverAccount: string | null;
    amount: number | null;
    raw: unknown;
  };
  payment: unknown;
  mismatchReason?: MerchantVerifyMismatchReason;
}

export type VerificationHistoryStatus = "PENDING" | "VERIFIED" | "UNVERIFIED";

export interface ListVerificationHistoryQuery {
  provider?: TransactionProvider;
  status?: VerificationHistoryStatus;
  reference?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface VerificationHistoryItem {
  id: string;
  provider: TransactionProvider;
  reference: string;
  claimedAmount: string;
  tipAmount: string | null;
  status: VerificationHistoryStatus;
  mismatchReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListVerificationHistoryResponse {
  page: number;
  pageSize: number;
  total: number;
  data: VerificationHistoryItem[];
}

export const paymentsServiceApi = createApi({
  reducerPath: "paymentsServiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    verifyMerchantPayment: builder.mutation<
      VerifyMerchantPaymentResponse,
      VerifyMerchantPaymentRequest
    >({
      query: (body) => ({
        url: "/payments/verify",
        method: "POST",
        body,
      }),
    }),

    listVerificationHistory: builder.query<
      ListVerificationHistoryResponse,
      ListVerificationHistoryQuery | void
    >({
      query: (params) => ({
        url: "/payments/verification-history",
        method: "GET",
        params: params ?? undefined,
      }),
    }),
  }),
});

export const {
  useVerifyMerchantPaymentMutation,
  useListVerificationHistoryQuery,
} = paymentsServiceApi;
