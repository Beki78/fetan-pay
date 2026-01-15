import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../constants";

export type TransactionProvider =
  | "CBE"
  | "TELEBIRR"
  | "AWASH"
  | "BOA"
  | "DASHEN";

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
  claimedAmount?: number; // Optional - if not provided, uses amount from bank response
  qrData?: string;
  tipAmount?: number;
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
    receiverName: string | null;
    amount: number | null;
    senderName: string | null;
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

export interface TipsSummaryResponse {
  count: number;
  totalTipAmount: number | null;
}

export interface TipItem {
  id: string;
  tipAmount: number;
  claimedAmount: number;
  reference: string;
  provider: TransactionProvider;
  status: VerificationHistoryStatus;
  createdAt: string;
  verifiedAt: string | null;
  verifiedBy: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
}

export interface ListTipsResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: TipItem[];
}

export interface TipsSummaryQuery {
  from?: string;
  to?: string;
}

export interface ListTipsQuery {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface MerchantReceiverAccount {
  id: string;
  merchantId: string;
  provider: TransactionProvider;
  status: "ACTIVE" | "INACTIVE";
  receiverLabel?: string | null;
  receiverAccount: string;
  receiverName?: string | null;
  meta?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetActiveReceiverAccountsResponse {
  data: MerchantReceiverAccount[];
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

    getTipsSummary: builder.query<TipsSummaryResponse, TipsSummaryQuery | void>(
      {
        query: (params) => {
          let url = "/payments/tips/summary";
          const searchParams = new URLSearchParams();

          if (params && typeof params === "object") {
            if (params.from) {
              searchParams.set("from", params.from);
            }
            if (params.to) {
              searchParams.set("to", params.to);
            }
          }

          const queryString = searchParams.toString();
          if (queryString) {
            url += `?${queryString}`;
          }

          return {
            url,
            method: "GET",
          };
        },
        serializeQueryArgs: ({ endpointName, queryArgs }) => {
          // Create unique cache key based on date range
          if (
            !queryArgs ||
            typeof queryArgs !== "object" ||
            (!queryArgs.from && !queryArgs.to)
          ) {
            return `${endpointName}(all)`;
          }
          const from = queryArgs.from || "";
          const to = queryArgs.to || "";
          return `${endpointName}(${from}-${to})`;
        },
        merge: (currentCache, newItems) => {
          // Always use new data, don't merge
          return newItems;
        },
        forceRefetch: ({ currentArg, previousArg }) => {
          // Always refetch if args change
          if (!currentArg && !previousArg) return false;
          if (!currentArg || !previousArg) return true;
          if (typeof currentArg !== "object" || typeof previousArg !== "object")
            return true;
          return (
            currentArg.from !== previousArg.from ||
            currentArg.to !== previousArg.to
          );
        },
      }
    ),

    listTips: builder.query<ListTipsResponse, ListTipsQuery | void>({
      query: (params) => ({
        url: "/payments/tips",
        method: "GET",
        params: params ?? undefined,
      }),
    }),

    getActiveReceiverAccounts: builder.query<
      GetActiveReceiverAccountsResponse,
      { provider?: TransactionProvider } | void
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params && "provider" in params && params.provider) {
          query.set("provider", params.provider);
        }
        const qs = query.toString();
        return {
          url: `/payments/receiver-accounts/active${qs ? `?${qs}` : ""}`,
        };
      },
    }),
  }),
});

export const {
  useVerifyMerchantPaymentMutation,
  useListVerificationHistoryQuery,
  useGetTipsSummaryQuery,
  useListTipsQuery,
  useGetActiveReceiverAccountsQuery,
} = paymentsServiceApi;
