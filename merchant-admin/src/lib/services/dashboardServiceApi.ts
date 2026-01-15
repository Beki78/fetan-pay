import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export interface DashboardStats {
  merchantName: string;
  ownerName: string;
  metrics: {
    totalTransactions: number;
    verified: number;
    pending: number;
    walletBalance: number;
  };
}

export interface AnalyticsMetrics {
  totalTransactions: number;
  verified: number;
  successRate: number;
  totalRevenue: number;
  totalUsers: number;
  totalTips: number;
}

export interface StatisticsTrend {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

export interface StatusDistribution {
  verified: number;
  pending: number;
  failed: number;
  total: number;
}

export const dashboardServiceApi = createApi({
  reducerPath: 'dashboardServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['Dashboard', 'Analytics'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({
        url: '/merchant-admin-dashboard/stats',
        method: 'GET',
      }),
      providesTags: [{ type: 'Dashboard', id: 'STATS' }],
    }),
    getAnalyticsMetrics: builder.query<
      AnalyticsMetrics,
      { period?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.period) {
          queryParams.set('period', params.period);
        }
        const queryString = queryParams.toString();
        return {
          url: `/merchant-admin-dashboard/analytics/metrics${
            queryString ? `?${queryString}` : ''
          }`,
          method: 'GET',
        };
      },
      providesTags: [{ type: 'Analytics', id: 'METRICS' }],
    }),
    getStatisticsTrend: builder.query<
      StatisticsTrend,
      { period?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.period) {
          queryParams.set('period', params.period);
        }
        const queryString = queryParams.toString();
        return {
          url: `/merchant-admin-dashboard/analytics/trend${
            queryString ? `?${queryString}` : ''
          }`,
          method: 'GET',
        };
      },
      providesTags: [{ type: 'Analytics', id: 'TREND' }],
    }),
    getStatusDistribution: builder.query<
      StatusDistribution,
      { period?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.period) {
          queryParams.set('period', params.period);
        }
        const queryString = queryParams.toString();
        return {
          url: `/merchant-admin-dashboard/analytics/status-distribution${
            queryString ? `?${queryString}` : ''
          }`,
          method: 'GET',
        };
      },
      providesTags: [{ type: 'Analytics', id: 'STATUS_DIST' }],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAnalyticsMetricsQuery,
  useGetStatisticsTrendQuery,
  useGetStatusDistributionQuery,
} = dashboardServiceApi;

