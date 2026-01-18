import { baseApi } from "../redux/api";

export interface GetAdminAnalyticsParams {
  from?: string;
  to?: string;
}

export interface AdminAnalytics {
  userAnalytics: {
    totalUsers: number;
    totalMerchants: number;
  };
  platformTransactions: {
    totalTransactions: number;
    totalVerified: number;
    totalPending: number;
    totalUnsuccessful: number;
    totalTransactionAmount: number;
    totalTips: number;
  };
  walletAnalytics: {
    totalDeposits: number;
  };
  transactionTypeBreakdown: {
    qr: number;
    cash: number;
    bank: number;
  };
  transactionStatusBreakdown: {
    successful: number;
    failed: number;
    pending: number;
    expired: number;
  };
  providerUsage: Array<{
    provider: string;
    count: number;
    isCustom: boolean;
  }>;
  dailyData?: Array<{
    date: string;
    amount: number;
    tips: number;
  }>;
}

export const adminDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAnalytics: builder.query<
      AdminAnalytics,
      GetAdminAnalyticsParams | void
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.from) query.set("from", params.from);
        if (params?.to) query.set("to", params.to);
        const queryString = query.toString();
        return `/admin/dashboard/analytics${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: [{ type: "Merchant", id: "ANALYTICS" }],
    }),
  }),
});

export const { useGetAdminAnalyticsQuery } = adminDashboardApi;

