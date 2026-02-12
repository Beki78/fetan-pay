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

export interface WalletBalance {
  balance: number;
}

export interface WalletConfig {
  walletEnabled: boolean;
  walletChargeType: 'PERCENTAGE' | 'FIXED' | null;
  walletChargeValue: number | null;
  walletMinBalance: number | null;
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

export interface PendingDeposit {
  id: string;
  provider: TransactionProvider;
  amount: number;
  receiverAccount: WalletDepositReceiverAccount;
  expiresAt: string;
  createdAt: string;
  isExpired: boolean;
}

export interface CreateDepositInput {
  amount: number;
  provider: TransactionProvider;
  receiverAccountId: string;
}

export const walletServiceApi = createApi({
  reducerPath: 'walletServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['WalletBalance', 'WalletTransaction', 'DepositReceiver', 'WalletConfig', 'PendingDeposit'],
  endpoints: (builder) => ({
    // Wallet Configuration
    getWalletConfig: builder.query<WalletConfig, void>({
      query: () => '/wallet/config',
      providesTags: [{ type: 'WalletConfig', id: 'CURRENT' }],
    }),

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

    // Pending Deposits
    getPendingDeposits: builder.query<PendingDeposit[], void>({
      query: () => '/wallet/pending-deposits',
      providesTags: [{ type: 'PendingDeposit', id: 'LIST' }],
    }),

    // Create Pending Deposit
    createPendingDeposit: builder.mutation<any, CreateDepositInput>({
      query: (body) => ({
        url: '/wallet/create-deposit',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'PendingDeposit', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetWalletConfigQuery,
  useGetWalletBalanceQuery,
  useGetDepositReceiversQuery,
  useVerifyDepositMutation,
  useGetWalletTransactionsQuery,
  useGetPendingDepositsQuery,
  useCreatePendingDepositMutation,
} = walletServiceApi;

