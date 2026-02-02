import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

// Types matching the server-side models
export type PlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type BillingCycle = "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "SUSPENDED" | "PENDING";
export type TransactionStatus = "PENDING" | "VERIFIED" | "FAILED" | "EXPIRED";
export type TransactionProvider = "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";
export type PricingReceiverStatus = "ACTIVE" | "INACTIVE";

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  limits?: Record<string, any>; // Flexible limits from JSON field
  verificationLimit?: number | null; // Legacy field for backward compatibility
  apiLimit?: number | null; // Legacy field for backward compatibility
  features: string[];
  status: PlanStatus;
  isPopular: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
}

export interface Subscription {
  id: string;
  merchantId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string | null;
  nextBillingDate?: string | null;
  monthlyPrice: number;
  billingCycle: BillingCycle;
  currentUsage?: any;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  plan: Plan;
}

export interface BillingTransaction {
  id: string;
  transactionId: string;
  merchantId: string;
  planId: string;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  status: TransactionStatus;
  processedAt?: string | null;
  processedBy?: string | null;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  notes?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  plan: Plan;
  subscription?: Subscription | null;
}

export interface PricingReceiverAccount {
  id: string;
  provider: TransactionProvider;
  receiverAccount: string;
  receiverName: string | null;
  receiverLabel: string | null;
  status: PricingReceiverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlanListResponse {
  data: Plan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BillingTransactionListResponse {
  data: BillingTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Plan Query Parameters
export interface PlanQueryParams {
  status?: PlanStatus;
  billingCycle?: BillingCycle;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Upgrade Plan Request
export interface UpgradePlanRequest {
  planId: string;
  paymentReference?: string;
  paymentMethod?: string;
}

// Payment Verification Types
export type PaymentVerificationStatus = "VERIFIED" | "UNVERIFIED" | "PENDING";

export interface VerifyPaymentRequest {
  provider: TransactionProvider;
  reference: string;
  claimedAmount?: number;
  tipAmount?: number;
}

export interface VerifyPaymentResponse {
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
  mismatchReason?: string | null;
}

export const pricingServiceApi = createApi({
  reducerPath: 'pricingServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['Plan', 'Subscription', 'BillingTransaction', 'PublicPlans'],
  endpoints: (builder) => ({
    // Public Plans (for merchant pricing page)
    getPublicPlans: builder.query<PlanListResponse, PlanQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set('status', params.status);
        if (params?.billingCycle) queryParams.set('billingCycle', params.billingCycle);
        if (params?.search) queryParams.set('search', params.search);
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);
        const queryString = queryParams.toString();
        return {
          url: `/pricing/public/plans${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: [{ type: 'PublicPlans', id: 'LIST' }],
    }),

    // Get specific plan details
    getPlan: builder.query<Plan, string>({
      query: (planId) => ({
        url: `/pricing/plans/${planId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, planId) => [{ type: 'Plan', id: planId }],
    }),

    // Merchant Subscription Management
    getMerchantSubscription: builder.query<{ subscription: Subscription | null }, string>({
      query: (merchantId) => ({
        url: `/pricing/merchants/${merchantId}/subscription`,
        method: 'GET',
      }),
      providesTags: (_result, _error, merchantId) => [
        { type: 'Subscription', id: merchantId },
      ],
    }),

    // Get merchant billing transactions
    getMerchantBillingTransactions: builder.query<
      BillingTransactionListResponse,
      { merchantId: string; page?: number; limit?: number }
    >({
      query: ({ merchantId, page, limit }) => {
        const queryParams = new URLSearchParams();
        queryParams.set('merchantId', merchantId);
        if (page) queryParams.set('page', String(page));
        if (limit) queryParams.set('limit', String(limit));
        const queryString = queryParams.toString();
        return {
          url: `/pricing/billing/transactions${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (_result, _error, { merchantId }) => [
        { type: 'BillingTransaction', id: merchantId },
      ],
    }),

    // Get billing transaction by ID
    getBillingTransaction: builder.query<BillingTransaction, string>({
      query: (transactionId) => ({
        url: `/pricing/billing/transactions/${transactionId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, transactionId) => [
        { type: 'BillingTransaction', id: transactionId },
      ],
    }),

    // Upgrade merchant plan
    upgradeMerchantPlan: builder.mutation<
      { message: string; assignment: any },
      { merchantId: string } & UpgradePlanRequest
    >({
      query: ({ merchantId, ...body }) => ({
        url: `/pricing/merchants/${merchantId}/upgrade`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { merchantId }) => [
        { type: 'Subscription', id: merchantId },
        { type: 'BillingTransaction', id: merchantId },
      ],
    }),

    // Get active pricing receivers by provider (for payment modal)
    getActivePricingReceiversByProvider: builder.query<
      PricingReceiverAccount[],
      string
    >({
      query: (provider) => `/pricing/receivers/provider/${provider}`,
      providesTags: (result, error, provider) => [
        { type: 'Plan', id: `RECEIVERS_${provider}` },
      ],
    }),

    // Verify payment for billing
    verifyPayment: builder.mutation<
      VerifyPaymentResponse,
      VerifyPaymentRequest
    >({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
    }),

    // Get all active pricing receivers (for filtering available providers)
    getAllActivePricingReceivers: builder.query<
      PricingReceiverAccount[],
      void
    >({
      query: () => '/pricing/receivers/active',
      providesTags: [{ type: 'Plan', id: 'ALL_RECEIVERS' }],
    }),
  }),
});

export const {
  useGetPublicPlansQuery,
  useGetPlanQuery,
  useGetMerchantSubscriptionQuery,
  useGetMerchantBillingTransactionsQuery,
  useGetBillingTransactionQuery,
  useUpgradeMerchantPlanMutation,
  useGetActivePricingReceiversByProviderQuery,
  useVerifyPaymentMutation,
  useGetAllActivePricingReceiversQuery,
} = pricingServiceApi;