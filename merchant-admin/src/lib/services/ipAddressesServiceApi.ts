import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export type IPAddressStatus = 'ACTIVE' | 'INACTIVE';

export interface IPAddress {
  id: string;
  ipAddress: string;
  description?: string | null;
  status: IPAddressStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIPAddressInput {
  ipAddress: string;
  description?: string;
}

export interface UpdateIPAddressInput {
  ipAddress?: string;
  description?: string;
  status?: IPAddressStatus;
}

export interface IPWhitelistingStatus {
  enabled: boolean;
  ipAddresses: IPAddress[];
}

export interface CurrentIPResponse {
  ip: string;
}

export const ipAddressesServiceApi = createApi({
  reducerPath: 'ipAddressesServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['IPAddress', 'IPStatus'],
  endpoints: (builder) => ({
    // Get IP whitelisting status
    getIPWhitelistingStatus: builder.query<IPWhitelistingStatus, void>({
      query: () => '/ip-addresses/status',
      providesTags: [{ type: 'IPStatus', id: 'STATUS' }],
    }),

    // Get current client IP
    getCurrentIP: builder.query<CurrentIPResponse, void>({
      query: () => '/ip-addresses/current-ip',
    }),

    // List all IP addresses
    listIPAddresses: builder.query<IPAddress[], void>({
      query: () => '/ip-addresses',
      providesTags: [{ type: 'IPAddress', id: 'LIST' }],
    }),

    // Get IP address details
    getIPAddress: builder.query<IPAddress, string>({
      query: (id) => `/ip-addresses/${id}`,
      providesTags: (result, error, id) => [{ type: 'IPAddress', id }],
    }),

    // Create IP address
    createIPAddress: builder.mutation<IPAddress, CreateIPAddressInput>({
      query: (body) => ({
        url: '/ip-addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'IPAddress', id: 'LIST' },
        { type: 'IPStatus', id: 'STATUS' },
      ],
    }),

    // Update IP address
    updateIPAddress: builder.mutation<IPAddress, { id: string; data: UpdateIPAddressInput }>({
      query: ({ id, data }) => ({
        url: `/ip-addresses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'IPAddress', id: 'LIST' },
        { type: 'IPAddress', id },
        { type: 'IPStatus', id: 'STATUS' },
      ],
    }),

    // Delete IP address
    deleteIPAddress: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/ip-addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'IPAddress', id: 'LIST' },
        { type: 'IPAddress', id },
        { type: 'IPStatus', id: 'STATUS' },
      ],
    }),

    // Enable IP whitelisting
    enableIPWhitelisting: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/ip-addresses/enable',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'IPStatus', id: 'STATUS' }],
    }),

    // Disable IP whitelisting
    disableIPWhitelisting: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/ip-addresses/disable',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'IPStatus', id: 'STATUS' }],
    }),
  }),
});

export const {
  useGetIPWhitelistingStatusQuery,
  useGetCurrentIPQuery,
  useListIPAddressesQuery,
  useGetIPAddressQuery,
  useCreateIPAddressMutation,
  useUpdateIPAddressMutation,
  useDeleteIPAddressMutation,
  useEnableIPWhitelistingMutation,
  useDisableIPWhitelistingMutation,
} = ipAddressesServiceApi;