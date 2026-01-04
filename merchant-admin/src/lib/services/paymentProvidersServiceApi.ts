import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants';

export type ProviderStatus = 'ACTIVE' | 'COMING_SOON' | 'DISABLED';
export type ProviderCode = 'CBE' | 'TELEBIRR' | 'AWASH' | 'BOA' | 'DASHEN';

export interface PaymentProviderRecord {
  id: string;
  code: ProviderCode;
  name: string;
  // Stored as a local filename (e.g. CBE.png) and rendered as `/images/banks/${logoKey}`.
  logoUrl?: string | null;
  status: ProviderStatus;
}

export const paymentProvidersServiceApi = createApi({
  reducerPath: 'paymentProvidersServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['PaymentProviders'],
  endpoints: (builder) => ({
    getPaymentProviders: builder.query<{ providers: PaymentProviderRecord[] }, void>({
      query: () => ({
        url: '/payment-providers',
      }),
      providesTags: [{ type: 'PaymentProviders', id: 'LIST' }],
    }),
  }),
});

export const { useGetPaymentProvidersQuery } = paymentProvidersServiceApi;
