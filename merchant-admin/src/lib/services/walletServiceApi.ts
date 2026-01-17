import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export type TransactionProvider = 'CBE' | 'TELEBIRR' | 'AWASH' | 'BOA' | 'DASHEN';

export interface WalletBalance {
  balance: number;
}

export interface WalletDepositReceiverAccount {
  id: string;
  provider: TransactionProvider;
  receiverAccount: string;
  receiverName: string | null;
  receiverLabel: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface WalletTransaction {
  id: string;
  merchantId: string;
  type: 'DEPOSIT' | 'CHARGE' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: any;
  payment?: {
    id: string;
    reference: string;
    provider: string;
    claimedAmount: number;
  } | null;
  walletDeposit?: {
    id: string;
    reference: string;
    provider: string;
    amount: number;
  } | null;
  createdAt: string;
}

export interface WalletTransactionHistory {
  transactions: WalletTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VerifyDepositInput {
  provider: TransactionProvider;
  reference: string;
}

export interface VerifyDepositResponse {
  success: boolean;
  status: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
  amount: number | null;
  walletDeposit: any;
  error?: string;
}

export const walletServiceApi = createApi({
  reducerPath: 'walletServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['WalletBalance', 'WalletTransaction', 'DepositReceiver'],
  endpoints: (builder) => ({
    // Wallet Balance
    getWalletBalance: builder.query<WalletBalance, void>({
      query: () => '/wallet/balance',
      providesTags: [{ type: 'WalletBalance', id: 'CURRENT' }],
    }),

    // Deposit Receivers (where to send money)
    getDepositReceivers: builder.query<WalletDepositReceiverAccount[], void>({
      query: () => '/wallet/deposit-receivers',
      providesTags: [{ type: 'DepositReceiver', id: 'LIST' }],
    }),

    // Verify Deposit
    verifyDeposit: builder.mutation<VerifyDepositResponse, VerifyDepositInput>({
      query: (body) => ({
        url: '/wallet/verify-deposit',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'WalletBalance', id: 'CURRENT' },
        { type: 'WalletTransaction', id: 'LIST' },
      ],
    }),

    // Transaction History
    getWalletTransactions: builder.query<
      WalletTransactionHistory,
      { page?: number; pageSize?: number }
    >({
      query: (params) => {
        const query = new URLSearchParams();
        query.set('page', String(params.page ?? 1));
        query.set('pageSize', String(params.pageSize ?? 20));
        return `/wallet/transactions?${query.toString()}`;
      },
      providesTags: [{ type: 'WalletTransaction', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetWalletBalanceQuery,
  useGetDepositReceiversQuery,
  useVerifyDepositMutation,
  useGetWalletTransactionsQuery,
} = walletServiceApi;

