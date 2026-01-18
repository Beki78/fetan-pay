import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  status: ApiKeyStatus;
  expiresAt: string | null;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyInput {
  name: string;
  expiresAt?: string;
  scopes?: string[];
}

export interface CreateApiKeyResponse extends ApiKey {
  key: string; // Only returned on creation
  warning: string;
}

export const apiKeysServiceApi = createApi({
  reducerPath: 'apiKeysServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['ApiKey'],
  endpoints: (builder) => ({
    // List all API keys
    listApiKeys: builder.query<ApiKey[], void>({
      query: () => '/api-keys',
      providesTags: [{ type: 'ApiKey', id: 'LIST' }],
    }),

    // Get API key details
    getApiKey: builder.query<ApiKey, string>({
      query: (id) => `/api-keys/${id}`,
      providesTags: (result, error, id) => [{ type: 'ApiKey', id }],
    }),

    // Create API key
    createApiKey: builder.mutation<CreateApiKeyResponse, CreateApiKeyInput>({
      query: (body) => ({
        url: '/api-keys',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ApiKey', id: 'LIST' }],
    }),

    // Revoke API key
    revokeApiKey: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api-keys/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ApiKey', id: 'LIST' },
        { type: 'ApiKey', id },
      ],
    }),
  }),
});

export const {
  useListApiKeysQuery,
  useGetApiKeyQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} = apiKeysServiceApi;

