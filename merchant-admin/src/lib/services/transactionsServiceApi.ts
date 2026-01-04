import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants';

export type TransactionProvider = 'CBE' | 'TELEBIRR' | 'AWASH' | 'BOA' | 'DASHEN';
export type TransactionStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

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
  }),
});

export const { useListTransactionsQuery, useListVerifiedByUserQuery } = transactionsServiceApi;
