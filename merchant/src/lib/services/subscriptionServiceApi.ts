import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../config";

// Types matching the server-side models
export type PlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type BillingCycle = "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";
export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "EXPIRED"
  | "SUSPENDED"
  | "PENDING";

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  limits?: Record<string, any>; // Flexible limits from JSON field
  features: string[];
  status: PlanStatus;
  isPopular: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
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
  plan: Plan;
}

export interface MerchantSubscriptionResponse {
  subscription: Subscription | null;
}

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ["Subscription"],
  endpoints: (builder) => ({
    getMerchantSubscription: builder.query<
      MerchantSubscriptionResponse,
      string
    >({
      query: (merchantId) => `/pricing/merchants/${merchantId}/subscription`,
      providesTags: (_result, _error, merchantId) => [
        { type: "Subscription", id: merchantId },
      ],
    }),
  }),
});

export const { useGetMerchantSubscriptionQuery } = subscriptionApi;
