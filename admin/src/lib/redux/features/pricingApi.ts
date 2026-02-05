import { baseApi } from "../api";

// Types matching the server-side models
export type PlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type BillingCycle = "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "SUSPENDED" | "PENDING";
export type TransactionStatus = "PENDING" | "VERIFIED" | "FAILED" | "EXPIRED";
export type PlanAssignmentType = "IMMEDIATE" | "SCHEDULED";
export type PlanDurationType = "PERMANENT" | "TEMPORARY";
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
  _count?: {
    subscriptions: number;
  };
}

export interface PlanWithStats extends Plan {
  activeSubscribers: number;
  monthlyRevenue: number;
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
  merchant?: {
    id: string;
    name: string;
    contactEmail?: string | null;
  };
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
  merchant: {
    id: string;
    name: string;
    contactEmail?: string | null;
  };
  plan: Plan;
  subscription?: Subscription | null;
}

export interface PlanAssignment {
  id: string;
  merchantId: string;
  planId: string;
  assignmentType: PlanAssignmentType;
  scheduledDate?: string | null;
  durationType: PlanDurationType;
  endDate?: string | null;
  notes?: string | null;
  isApplied: boolean;
  appliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedBy: string;
  merchant: {
    id: string;
    name: string;
    contactEmail?: string | null;
  };
  plan: Plan;
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

export interface PlanStatistics {
  plans: PlanWithStats[];
  totalRevenue: number;
}

// Create Plan DTO
export interface CreatePlanRequest {
  name: string;
  description: string;
  price: number;
  billingCycle?: BillingCycle;
  limits?: Record<string, any>; // Flexible limits configuration
  verificationLimit?: number; // Legacy field for backward compatibility
  apiLimit?: number; // Legacy field for backward compatibility
  features: string[];
  isPopular?: boolean;
  displayOrder?: number;
}

// Update Plan DTO
export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  limits?: Record<string, any>; // Flexible limits configuration
  verificationLimit?: number; // Legacy field for backward compatibility
  apiLimit?: number; // Legacy field for backward compatibility
  features?: string[];
  status?: PlanStatus;
  isPopular?: boolean;
  displayOrder?: number;
}

// Plan Query Parameters
export interface PlanQueryParams {
  status?: PlanStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Plan Assignment Request
export interface AssignPlanRequest {
  merchantId: string;
  planId: string;
  assignmentType?: PlanAssignmentType;
  scheduledDate?: string;
  durationType?: PlanDurationType;
  endDate?: string;
  notes?: string;
}

// Billing Transaction Request
export interface CreateBillingTransactionRequest {
  merchantId: string;
  planId: string;
  subscriptionId?: string;
  amount: number;
  paymentReference?: string;
  paymentMethod?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  notes?: string;
}

// Pricing Receiver Interfaces
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

export interface CreatePricingReceiverRequest {
  provider: TransactionProvider;
  receiverAccount: string;
  receiverName: string;
  receiverLabel?: string;
  status?: PricingReceiverStatus;
}

export interface VerifyPricingPaymentRequest {
  transactionId: string;
  provider: TransactionProvider;
  paymentReference: string;
  receiverAccountId: string;
  notes?: string;
}

export const pricingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Plan Management
    getPlans: build.query<PlanListResponse, PlanQueryParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set("status", params.status);
        if (params?.search) searchParams.set("search", params.search);
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.limit) searchParams.set("limit", String(params.limit));
        if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
        const qs = searchParams.toString();
        return `/pricing/plans${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((plan) => ({ type: "Plan" as const, id: plan.id })),
              { type: "Plan" as const, id: "LIST" },
            ]
          : [{ type: "Plan" as const, id: "LIST" }],
    }),

    getPlan: build.query<Plan, string>({
      query: (id) => `/pricing/plans/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Plan" as const, id }],
    }),

    createPlan: build.mutation<Plan, CreatePlanRequest>({
      query: (planData) => ({
        url: "/pricing/plans",
        method: "POST",
        body: planData,
      }),
      invalidatesTags: [{ type: "Plan" as const, id: "LIST" }],
    }),

    updatePlan: build.mutation<Plan, { id: string; data: UpdatePlanRequest }>({
      query: ({ id, data }) => ({
        url: `/pricing/plans/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Plan" as const, id },
        { type: "Plan" as const, id: "LIST" },
      ],
    }),

    deletePlan: build.mutation<void, string>({
      query: (id) => ({
        url: `/pricing/plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Plan" as const, id },
        { type: "Plan" as const, id: "LIST" },
      ],
    }),

    // Plan Assignment
    assignPlan: build.mutation<PlanAssignment, AssignPlanRequest>({
      query: (assignmentData) => ({
        url: "/pricing/plans/assign",
        method: "POST",
        body: assignmentData,
      }),
      invalidatesTags: ["Merchant"],
    }),

    applyPlanAssignment: build.mutation<void, string>({
      query: (assignmentId) => ({
        url: `/pricing/plans/assignments/${assignmentId}/apply`,
        method: "POST",
      }),
      invalidatesTags: ["Merchant"],
    }),

    // Billing Transactions
    getBillingTransactions: build.query<BillingTransactionListResponse, {
      merchantId?: string;
      page?: number;
      limit?: number;
    } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.merchantId) searchParams.set("merchantId", params.merchantId);
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.limit) searchParams.set("limit", String(params.limit));
        const qs = searchParams.toString();
        return `/pricing/billing/transactions${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["BillingTransaction"],
    }),

    createBillingTransaction: build.mutation<BillingTransaction, CreateBillingTransactionRequest>({
      query: (transactionData) => ({
        url: "/pricing/billing/transactions",
        method: "POST",
        body: transactionData,
      }),
      invalidatesTags: ["BillingTransaction"],
    }),

    updateTransactionStatus: build.mutation<BillingTransaction, {
      transactionId: string;
      status: TransactionStatus;
    }>({
      query: ({ transactionId, status }) => ({
        url: `/pricing/billing/transactions/${transactionId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["BillingTransaction"],
    }),

    // Subscription Management
    getMerchantSubscription: build.query<{ subscription: Subscription | null }, string>({
      query: (merchantId) => `/pricing/merchants/${merchantId}/subscription`,
      providesTags: (_result, _error, merchantId) => [
        { type: "Subscription" as const, id: merchantId },
      ],
    }),

    // Statistics
    getPlanStatistics: build.query<PlanStatistics, void>({
      query: () => "/pricing/statistics",
      providesTags: ["PlanStats"],
    }),

    // Public Plans (for landing page)
    getPublicPlans: build.query<PlanListResponse, void>({
      query: () => "/pricing/public/plans",
      providesTags: ["PublicPlans"],
    }),

    // Pricing Receiver Management
    getPricingReceivers: build.query<PricingReceiverAccount[], void>({
      query: () => "/pricing/receivers",
      providesTags: [{ type: "Plan", id: "PRICING_RECEIVERS" }],
    }),

    createPricingReceiver: build.mutation<
      PricingReceiverAccount,
      CreatePricingReceiverRequest
    >({
      query: (body) => ({
        url: "/pricing/receivers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Plan", id: "PRICING_RECEIVERS" }],
    }),

    updatePricingReceiver: build.mutation<
      PricingReceiverAccount,
      { id: string; data: CreatePricingReceiverRequest }
    >({
      query: ({ id, data }) => ({
        url: `/pricing/receivers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "Plan", id: "PRICING_RECEIVERS" }],
    }),

    deletePricingReceiver: build.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/pricing/receivers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Plan", id: "PRICING_RECEIVERS" }],
    }),

    getActivePricingReceiversByProvider: build.query<
      PricingReceiverAccount[],
      string
    >({
      query: (provider) => `/pricing/receivers/provider/${provider}`,
      providesTags: (result, error, provider) => [
        { type: "Plan", id: `RECEIVERS_${provider}` },
      ],
    }),

    verifyPricingPayment: build.mutation<any, VerifyPricingPaymentRequest>({
      query: (body) => ({
        url: "/pricing/verify-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Plan", id: "BILLING_TRANSACTIONS" },
        { type: "Plan", id: "STATISTICS" },
      ],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPlanQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useAssignPlanMutation,
  useApplyPlanAssignmentMutation,
  useGetBillingTransactionsQuery,
  useCreateBillingTransactionMutation,
  useUpdateTransactionStatusMutation,
  useGetMerchantSubscriptionQuery,
  useGetPlanStatisticsQuery,
  useGetPublicPlansQuery,
  useGetPricingReceiversQuery,
  useCreatePricingReceiverMutation,
  useUpdatePricingReceiverMutation,
  useDeletePricingReceiverMutation,
  useGetActivePricingReceiversByProviderQuery,
  useVerifyPricingPaymentMutation,
} = pricingApi;