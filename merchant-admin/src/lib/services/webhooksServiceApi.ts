import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export type WebhookStatus = 'ACTIVE' | 'PAUSED' | 'FAILED';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  maxRetries: number;
  timeout: number;
  successCount: number;
  failureCount: number;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookInput {
  url: string;
  events: string[];
  maxRetries?: number;
  timeout?: number;
}

export interface CreateWebhookResponse extends Webhook {
  secret: string; // Only returned on creation
  warning: string;
}

export interface RegenerateSecretResponse extends Webhook {
  secret: string; // Only returned on regeneration
  warning: string;
}

export interface UpdateWebhookInput {
  url?: string;
  events?: string[];
  status?: WebhookStatus;
  maxRetries?: number;
  timeout?: number;
}

export interface WebhookDelivery {
  id: string;
  event: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  statusCode: number | null;
  errorMessage: string | null;
  attemptNumber: number;
  createdAt: string;
  deliveredAt: string | null;
}

export const webhooksServiceApi = createApi({
  reducerPath: 'webhooksServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['Webhook', 'WebhookDelivery'],
  endpoints: (builder) => ({
    // List all webhooks
    listWebhooks: builder.query<Webhook[], void>({
      query: () => '/webhooks',
      providesTags: [{ type: 'Webhook', id: 'LIST' }],
    }),

    // Get webhook details
    getWebhook: builder.query<Webhook, string>({
      query: (id) => `/webhooks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Webhook', id }],
    }),

    // Create webhook
    createWebhook: builder.mutation<CreateWebhookResponse, CreateWebhookInput>({
      query: (body) => ({
        url: '/webhooks',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Webhook', id: 'LIST' }],
    }),

    // Update webhook
    updateWebhook: builder.mutation<Webhook, { id: string; data: UpdateWebhookInput }>({
      query: ({ id, data }) => ({
        url: `/webhooks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Webhook', id: 'LIST' },
        { type: 'Webhook', id },
      ],
    }),

    // Delete webhook
    deleteWebhook: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/webhooks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Webhook', id: 'LIST' },
        { type: 'Webhook', id },
      ],
    }),

    // Regenerate webhook secret
    regenerateSecret: builder.mutation<RegenerateSecretResponse, string>({
      query: (id) => ({
        url: `/webhooks/${id}/regenerate-secret`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Webhook', id: 'LIST' },
        { type: 'Webhook', id },
      ],
    }),

    // Test webhook
    testWebhook: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/webhooks/${id}/test`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Webhook', id },
        { type: 'WebhookDelivery', id: 'LIST' },
      ],
    }),

    // Get delivery logs
    getDeliveryLogs: builder.query<WebhookDelivery[], { webhookId: string; limit?: number }>({
      query: ({ webhookId, limit = 50 }) => ({
        url: `/webhooks/${webhookId}/deliveries`,
        params: limit ? { limit } : {},
      }),
      providesTags: (result, error, { webhookId }) => [
        { type: 'WebhookDelivery', id: webhookId },
      ],
    }),

    // Retry failed delivery
    retryDelivery: builder.mutation<
      { message: string },
      { webhookId: string; deliveryId: string }
    >({
      query: ({ webhookId, deliveryId }) => ({
        url: `/webhooks/${webhookId}/retry/${deliveryId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { webhookId }) => [
        { type: 'WebhookDelivery', id: webhookId },
        { type: 'Webhook', id: webhookId },
      ],
    }),
  }),
});

export const {
  useListWebhooksQuery,
  useGetWebhookQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useRegenerateSecretMutation,
  useTestWebhookMutation,
  useGetDeliveryLogsQuery,
  useRetryDeliveryMutation,
} = webhooksServiceApi;

