import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export type TransactionProvider = 'CBE' | 'TELEBIRR' | 'AWASH' | 'BOA' | 'DASHEN';
export type PaymentVerificationStatus = 'PENDING' | 'VERIFIED' | 'UNVERIFIED';

export interface TipsSummaryResponse {
  count: number;
  totalTipAmount: string | null;
}

export interface TipItem {
  id: string;
  tipAmount: number;
  claimedAmount: number;
  reference: string;
  provider: TransactionProvider;
  status: PaymentVerificationStatus;
  createdAt: string;
  verifiedAt: string | null;
  verifiedBy: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
  merchant?: {
    id: string;
    name: string;
    contactEmail: string;
  } | null;
}

export interface ListTipsResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: TipItem[];
}

export interface ListTipsParams {
  merchantId?: string;
  provider?: TransactionProvider;
  status?: PaymentVerificationStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface TipsByMerchantResponse {
  merchantId: string;
  merchantName: string;
  totalTips: number;
  tipCount: number;
  averageTip: number;
}

export interface TipsAnalyticsResponse {
  totalTips: number;
  totalCount: number;
  averageTip: number;
  byProvider: Array<{
    provider: TransactionProvider;
    totalTips: number;
    count: number;
  }>;
  byMerchant: TipsByMerchantResponse[];
  dailyTips: Array<{
    date: string;
    totalTips: number;
    count: number;
  }>;
}

export const tipsApi = createApi({
  reducerPath: 'tipsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Tips', 'TipsSummary', 'TipsAnalytics'],
  endpoints: (builder) => ({
    // Get tips summary (admin-wide)
    getAdminTipsSummary: builder.query<TipsSummaryResponse, { from?: string; to?: string } | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.from) query.set('from', params.from);
        if (params?.to) query.set('to', params.to);
        const qs = query.toString();
        return { url: `/payments/admin/tips/summary${qs ? `?${qs}` : ''}` };
      },
      providesTags: [{ type: 'TipsSummary', id: 'ADMIN' }],
    }),

    // List all tips (admin view)
    listAllTips: builder.query<ListTipsResponse, ListTipsParams | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.merchantId) query.set('merchantId', params.merchantId);
        if (params?.provider) query.set('provider', params.provider);
        if (params?.status) query.set('status', params.status);
        if (params?.from) query.set('from', params.from);
        if (params?.to) query.set('to', params.to);
        query.set('page', String(params?.page ?? 1));
        query.set('pageSize', String(params?.pageSize ?? 20));
        return { url: `/payments/admin/tips?${query.toString()}` };
      },
      providesTags: [{ type: 'Tips', id: 'LIST' }],
    }),

    // Get tips analytics
    getTipsAnalytics: builder.query<TipsAnalyticsResponse, { from?: string; to?: string } | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.from) query.set('from', params.from);
        if (params?.to) query.set('to', params.to);
        const qs = query.toString();
        return { url: `/payments/admin/tips/analytics${qs ? `?${qs}` : ''}` };
      },
      providesTags: [{ type: 'TipsAnalytics', id: 'ADMIN' }],
    }),

    // Get tips by merchant
    getTipsByMerchant: builder.query<TipsByMerchantResponse[], { from?: string; to?: string } | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.from) query.set('from', params.from);
        if (params?.to) query.set('to', params.to);
        const qs = query.toString();
        return { url: `/payments/admin/tips/by-merchant${qs ? `?${qs}` : ''}` };
      },
      providesTags: [{ type: 'Tips', id: 'BY_MERCHANT' }],
    }),
  }),
});

export const {
  useGetAdminTipsSummaryQuery,
  useListAllTipsQuery,
  useGetTipsAnalyticsQuery,
  useGetTipsByMerchantQuery,
} = tipsApi;