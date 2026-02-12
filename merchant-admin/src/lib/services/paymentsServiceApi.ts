import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export type TransactionProvider = 
  | 'CBE' 
  | 'TELEBIRR' 
  | 'AWASH' 
  | 'BOA' 
  | 'DASHEN'
  | 'AMHARA'
  | 'BIRHAN'
  | 'CBEBIRR'
  | 'COOP'
  | 'ENAT'
  | 'GADDA'
  | 'HIBRET'
  | 'WEGAGEN';
export type PaymentVerificationStatus = 'PENDING' | 'VERIFIED' | 'UNVERIFIED';

export interface ListVerificationHistoryParams {
  provider?: TransactionProvider;
  status?: PaymentVerificationStatus;
  reference?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface VerificationHistoryResponse {
  data: PaymentRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MerchantReceiverAccount {
  id: string;
  merchantId: string;
  provider: TransactionProvider;
  status: 'ACTIVE' | 'INACTIVE';
  receiverLabel?: string | null;
  receiverAccount: string;
  receiverName?: string | null;
  meta?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderRecord {
  id: string;
  merchantId: string;
  expectedAmount: string; // Prisma Decimal serialized
  currency: string;
  status: 'OPEN' | 'CANCELLED' | 'PAID';
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRecord {
  id: string;
  provider: TransactionProvider;
  reference: string;
  qrUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  merchantId?: string | null;
  createdAt: string;
  updatedAt: string;
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
  merchant?: {
    id: string;
    name: string;
  } | null;
}

export interface PaymentRecord {
  id: string;
  merchantId: string;
  orderId: string;
  provider: TransactionProvider;
  reference: string;
  claimedAmount: string;
  tipAmount?: string | null;
  status: PaymentVerificationStatus;
  verifiedAt?: string | null;
  mismatchReason?: string | null;
  verifiedById?: string | null;
  verificationPayload?: unknown;
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
  order?: OrderRecord;
  receiverAccount?: MerchantReceiverAccount | null;
}

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
  verificationPayload?: unknown;
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

export interface ListTipsParams {
  from?: string;
  to?: string;
  provider?: TransactionProvider;
  status?: PaymentVerificationStatus;
  phone?: string;
  name?: string;
  page?: number;
  pageSize?: number;
}

export const paymentsServiceApi = createApi({
  reducerPath: 'paymentsServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['ReceiverAccount', 'Order', 'Payment', 'Tips'],
  endpoints: (builder) => ({
    setActiveReceiverAccount: builder.mutation<
      { active: MerchantReceiverAccount },
      {
        provider: TransactionProvider;
        receiverAccount: string;
        receiverLabel?: string;
        receiverName?: string;
        enabled?: boolean;
        meta?: unknown;
      }
    >({
      query: (body) => ({
        url: '/payments/receiver-accounts/active',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'ReceiverAccount', id: arg.provider },
        { type: 'ReceiverAccount', id: 'LIST' },
      ],
    }),

    getActiveReceiverAccounts: builder.query<
      { data: MerchantReceiverAccount[] },
      { provider?: TransactionProvider } | void
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params && 'provider' in params && params.provider) {
          query.set('provider', params.provider);
        }
        const qs = query.toString();
        return {
          url: `/payments/receiver-accounts/active${qs ? `?${qs}` : ''}`,
        };
      },
      providesTags: (result) =>
        result?.data?.length
          ? result.data.map((x) => ({ type: 'ReceiverAccount' as const, id: x.provider }))
          : [{ type: 'ReceiverAccount' as const, id: 'LIST' }],
    }),

    disableActiveReceiverAccount: builder.mutation<
      { disabledCount: number },
      { provider: TransactionProvider }
    >({
      query: (body) => ({
        url: '/payments/receiver-accounts/disable',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'ReceiverAccount', id: arg.provider },
        { type: 'ReceiverAccount', id: 'LIST' },
      ],
    }),

    enableLastReceiverAccount: builder.mutation<
      { enabled: MerchantReceiverAccount },
      { provider: TransactionProvider }
    >({
      query: (body) => ({
        url: '/payments/receiver-accounts/enable',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'ReceiverAccount', id: arg.provider },
        { type: 'ReceiverAccount', id: 'LIST' },
      ],
    }),

    createOrder: builder.mutation<
      { 
        order: OrderRecord; 
        transaction: TransactionRecord;
        receiverAccount?: {
          receiverName?: string | null;
          receiverAccount: string;
        } | null;
      },
      { expectedAmount: number; currency?: string; provider?: TransactionProvider; payerName?: string }
    >({
      query: (body) => ({
        url: '/payments/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),

    submitPaymentClaim: builder.mutation<
      {
        status: PaymentVerificationStatus;
        payment: PaymentRecord;
        checks: { amountMatches: boolean; receiverMatches: boolean };
      },
      {
        orderId: string;
        provider: TransactionProvider;
        reference: string;
        claimedAmount: number;
        tipAmount?: number;
      }
    >({
      query: (body) => ({
        url: '/payments/claims',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }, { type: 'Tips', id: 'SUMMARY' }],
    }),

    getPaymentClaim: builder.query<{ payment: PaymentRecord }, { paymentId: string }>({
      query: ({ paymentId }) => ({
        url: `/payments/claims/${paymentId}`,
      }),
      providesTags: (r, e, a) => [{ type: 'Payment', id: a.paymentId }],
    }),

    getTipsSummary: builder.query<TipsSummaryResponse, { from?: string; to?: string } | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.from) query.set('from', params.from);
        if (params?.to) query.set('to', params.to);
        const qs = query.toString();
        return { url: `/payments/tips/summary${qs ? `?${qs}` : ''}` };
      },
      providesTags: [{ type: 'Tips', id: 'SUMMARY' }],
    }),

    listTips: builder.query<ListTipsResponse, ListTipsParams | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.from) query.set('from', params.from);
        if (params?.to) query.set('to', params.to);
        if (params?.provider) query.set('provider', params.provider);
        if (params?.status) query.set('status', params.status);
        if (params?.phone) query.set('phone', params.phone);
        if (params?.name) query.set('name', params.name);
        query.set('page', String(params?.page ?? 1));
        query.set('pageSize', String(params?.pageSize ?? 20));
        return { url: `/payments/tips?${query.toString()}` };
      },
      providesTags: [{ type: 'Tips', id: 'LIST' }],
    }),

    listVerificationHistory: builder.query<VerificationHistoryResponse, ListVerificationHistoryParams | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.provider) query.set('provider', params.provider);
        if (params?.status) query.set('status', params.status);
        if (params?.reference) query.set('reference', params.reference);
        if (params?.from) query.set('from', params.from);
        if (params?.to) query.set('to', params.to);
        query.set('page', String(params?.page ?? 1));
        query.set('pageSize', String(params?.pageSize ?? 20));
        return { url: `/payments/verification-history?${query.toString()}` };
      },
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((p) => ({ type: 'Payment' as const, id: p.id })),
              { type: 'Payment' as const, id: 'LIST' },
            ]
          : [{ type: 'Payment' as const, id: 'LIST' }],
    }),

    logTransaction: builder.mutation<
      {
        payment: PaymentRecord;
        order: OrderRecord;
      },
      {
        paymentMethod: 'cash' | 'bank';
        amount: number;
        tipAmount?: number;
        note?: string;
        provider?: TransactionProvider;
        otherBankName?: string;
      }
    >({
      query: (body) => ({
        url: '/payments/log-transaction',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Payment', id: 'LIST' },
        { type: 'Order', id: 'LIST' },
        { type: 'Tips', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const {
  useSetActiveReceiverAccountMutation,
  useGetActiveReceiverAccountsQuery,
  useDisableActiveReceiverAccountMutation,
  useEnableLastReceiverAccountMutation,
  useCreateOrderMutation,
  useSubmitPaymentClaimMutation,
  useGetPaymentClaimQuery,
  useGetTipsSummaryQuery,
  useListTipsQuery,
  useListVerificationHistoryQuery,
  useLogTransactionMutation,
} = paymentsServiceApi;
