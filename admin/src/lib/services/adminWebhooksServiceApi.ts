import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export interface MerchantWebhookSummary {
  id: string;
  merchantName: string;
  merchantEmail: string;
  webhookUrl: string | null;
  status: 'Active' | 'Inactive';
  webhooksCount: number;
  ipAddresses: string[];
  lastDelivery: string | null;
  successfulDeliveries: number;
  failedDeliveries: number;
  createdAt: string;
}

export interface WebhookStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalIpAddresses: number;
}

export interface IPAddress {
  id: string;
  ipAddress: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastUsed: string;
}

export interface MerchantWebhookDetails {
  id: string;
  merchantName: string;
  merchantEmail: string;
  webhookUrl: string | null;
  status: 'Active' | 'Inactive';
  stats: WebhookStats;
  ipAddresses: IPAddress[];
}

export interface RequestLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  method: string;
  endpoint: string;
  status: 'Success' | 'Failed';
  responseTime: number;
  userAgent: string;
  errorMessage?: string | null;
}

export interface WebhookDelivery {
  id: string;
  event: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  statusCode?: number | null;
  errorMessage?: string | null;
  attemptNumber: number;
  createdAt: string;
  deliveredAt?: string | null;
  webhook: {
    url: string;
  };
}

export interface OverallWebhookStats {
  totalMerchants: number;
  totalMerchantsWithWebhooks: number;
  totalActiveWebhooks: number;
  recentDeliveries: number;
  successRate: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  totalIpAddresses: number;
  averageIpsPerMerchant: number;
  webhookAdoptionRate: string;
}

export const adminWebhooksServiceApi = createApi({
  reducerPath: 'adminWebhooksServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/admin/webhooks`,
    credentials: 'include',
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['MerchantWebhooks', 'WebhookDetails', 'IPAddress', 'RequestLogs', 'WebhookStats'],
  endpoints: (builder) => ({
    // Get all merchants with webhook statistics
    getMerchantsWithWebhookStats: builder.query<
      MerchantWebhookSummary[],
      { search?: string; status?: string }
    >({
      query: ({ search, status } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status && status !== 'All') params.append('status', status);
        return `merchants?${params.toString()}`;
      },
      providesTags: [{ type: 'MerchantWebhooks', id: 'LIST' }],
    }),

    // Get detailed webhook information for a merchant
    getMerchantWebhookDetails: builder.query<MerchantWebhookDetails, string>({
      query: (merchantId) => `merchants/${merchantId}/details`,
      providesTags: (result, error, merchantId) => [
        { type: 'WebhookDetails', id: merchantId },
      ],
    }),

    // Get IP addresses for a merchant
    getMerchantIPAddresses: builder.query<IPAddress[], string>({
      query: (merchantId) => `merchants/${merchantId}/ip-addresses`,
      providesTags: (result, error, merchantId) => [
        { type: 'IPAddress', id: merchantId },
      ],
    }),

    // Disable an IP address for a merchant
    disableIPAddress: builder.mutation<
      { message: string; ipAddress: IPAddress },
      { merchantId: string; ipId: string }
    >({
      query: ({ merchantId, ipId }) => ({
        url: `merchants/${merchantId}/ip-addresses/${ipId}/disable`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { merchantId }) => [
        { type: 'IPAddress', id: merchantId },
        { type: 'WebhookDetails', id: merchantId },
        { type: 'MerchantWebhooks', id: 'LIST' },
      ],
    }),

    // Enable an IP address for a merchant
    enableIPAddress: builder.mutation<
      { message: string; ipAddress: IPAddress },
      { merchantId: string; ipId: string }
    >({
      query: ({ merchantId, ipId }) => ({
        url: `merchants/${merchantId}/ip-addresses/${ipId}/enable`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { merchantId }) => [
        { type: 'IPAddress', id: merchantId },
        { type: 'WebhookDetails', id: merchantId },
        { type: 'MerchantWebhooks', id: 'LIST' },
      ],
    }),

    // Get API request logs for a merchant
    getMerchantRequestLogs: builder.query<
      RequestLog[],
      { merchantId: string; limit?: number; status?: string }
    >({
      query: ({ merchantId, limit = 50, status }) => {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        if (status && status !== 'All') params.append('status', status);
        return `merchants/${merchantId}/request-logs?${params.toString()}`;
      },
      providesTags: (result, error, { merchantId }) => [
        { type: 'RequestLogs', id: merchantId },
      ],
    }),

    // Get webhook delivery logs for a merchant
    getMerchantWebhookDeliveries: builder.query<
      WebhookDelivery[],
      { merchantId: string; limit?: number }
    >({
      query: ({ merchantId, limit = 50 }) => {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        return `merchants/${merchantId}/webhook-deliveries?${params.toString()}`;
      },
      providesTags: (result, error, { merchantId }) => [
        { type: 'RequestLogs', id: `${merchantId}-deliveries` },
      ],
    }),

    // Get overall webhook statistics
    getWebhookStats: builder.query<OverallWebhookStats, void>({
      query: () => 'stats',
      providesTags: [{ type: 'WebhookStats', id: 'OVERALL' }],
    }),
  }),
});

export const {
  useGetMerchantsWithWebhookStatsQuery,
  useGetMerchantWebhookDetailsQuery,
  useGetMerchantIPAddressesQuery,
  useDisableIPAddressMutation,
  useEnableIPAddressMutation,
  useGetMerchantRequestLogsQuery,
  useGetMerchantWebhookDeliveriesQuery,
  useGetWebhookStatsQuery,
} = adminWebhooksServiceApi;