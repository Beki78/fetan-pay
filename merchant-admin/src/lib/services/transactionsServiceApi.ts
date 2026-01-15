import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export type TransactionProvider = 'CBE' | 'TELEBIRR' | 'AWASH' | 'BOA' | 'DASHEN';
export type TransactionStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'EXPIRED';

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
  merchant?: {
    id: string;
    name: string;
  } | null;
  verifiedBy?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    user?: {
      id: string;
      email: string;
      name: string;
    } | null;
  } | null;
  payments?: Array<{
    id: string;
    order: {
      id: string;
      expectedAmount: string;
      currency: string;
      status: string;
      createdAt: string;
    };
    receiverAccount?: {
      receiverName?: string | null;
      receiverAccount: string;
    } | null;
  }>;
}

export interface TransactionListResponse {
  data: TransactionRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export const transactionsServiceApi = createApi({
  reducerPath: 'transactionsServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  // These endpoints back "live" verification tables; prefer fresh data over cache reuse.
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['Transaction'],
  endpoints: (builder) => ({
    listTransactions: builder.query<
      TransactionListResponse,
      { provider?: TransactionProvider; status?: TransactionStatus; page?: number; pageSize?: number }
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.provider) query.set('provider', params.provider);
        if (params.status) query.set('status', params.status);
        query.set('page', String(params.page ?? 1));
        query.set('pageSize', String(params.pageSize ?? 20));
        return {
          url: `/transactions?${query.toString()}`,
        };
      },
      providesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),

    listVerifiedByUser: builder.query<
      TransactionListResponse,
      { merchantUserId: string; page?: number; pageSize?: number }
    >({
      query: ({ merchantUserId, page, pageSize }) => {
        const query = new URLSearchParams();
        query.set('page', String(page ?? 1));
        query.set('pageSize', String(pageSize ?? 20));
        return {
          url: `/transactions/verified-by/${merchantUserId}?${query.toString()}`,
        };
      },
    }),

    getTransaction: builder.query<TransactionRecord, string>({
      query: (idOrReference) => ({
        url: `/transactions/${idOrReference}`,
      }),
    }),

    getPublicPaymentDetails: builder.query<PublicPaymentDetails, string>({
      query: (idOrReference) => ({
        url: `/transactions/public/${idOrReference}`,
      }),
    }),
  }),
});

export interface PublicPaymentDetails {
  transactionId: string;
  reference: string;
  status: TransactionStatus;
  provider: TransactionProvider;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  merchantName: string | null;
  amount: number;
  currency: string;
  receiverName: string | null;
  receiverAccount: string | null;
  receiverProvider: TransactionProvider | null;
}

export const { useListTransactionsQuery, useListVerifiedByUserQuery, useGetTransactionQuery, useGetPublicPaymentDetailsQuery } = transactionsServiceApi;
