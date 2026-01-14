import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../config";

export interface MerchantUser {
  id: string;
  merchantId: string;
  userId?: string | null;
  role: string;
  status: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMerchantUserInput {
  merchantId: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

export interface UpdateMerchantUserInput {
  merchantId: string;
  id: string;
  name?: string;
  phone?: string;
  role?: string;
}

export const merchantUsersServiceApi = createApi({
  reducerPath: "merchantUsersServiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getMerchantUsers: builder.query<MerchantUser[], string>({
      query: (merchantId) => ({
        url: `/merchant-accounts/${merchantId}/users`,
        method: "GET",
      }),
    }),

    getMerchantUser: builder.query<MerchantUser, { merchantId: string; id: string }>({
      query: ({ merchantId, id }) => ({
        url: `/merchant-accounts/${merchantId}/users/${id}`,
        method: "GET",
      }),
    }),

    createMerchantUser: builder.mutation<MerchantUser, CreateMerchantUserInput>({
      query: ({ merchantId, ...body }) => ({
        url: `/merchant-accounts/${merchantId}/users`,
        method: "POST",
        body,
      }),
    }),

    updateMerchantUser: builder.mutation<MerchantUser, UpdateMerchantUserInput>({
      query: ({ merchantId, id, ...body }) => ({
        url: `/merchant-accounts/${merchantId}/users/${id}`,
        method: "PATCH",
        body,
      }),
    }),

    deactivateMerchantUser: builder.mutation<MerchantUser, { merchantId: string; id: string; actionBy: string }>({
      query: ({ merchantId, id, ...body }) => ({
        url: `/merchant-accounts/${merchantId}/users/${id}/deactivate`,
        method: "PATCH",
        body,
      }),
    }),

    activateMerchantUser: builder.mutation<MerchantUser, { merchantId: string; id: string; actionBy: string }>({
      query: ({ merchantId, id, ...body }) => ({
        url: `/merchant-accounts/${merchantId}/users/${id}/activate`,
        method: "PATCH",
        body,
      }),
    }),

    getQRCode: builder.query<{ qrCodeImage: string; qrCodeData: string; email: string; generatedAt: string }, { merchantId: string; userId: string }>({
      query: ({ merchantId, userId }) => ({
        url: `/merchant-accounts/${merchantId}/users/${userId}/qr-code`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateMerchantUserMutation,
  useGetMerchantUsersQuery,
  useGetMerchantUserQuery,
  useUpdateMerchantUserMutation,
  useDeactivateMerchantUserMutation,
  useActivateMerchantUserMutation,
  useGetQRCodeQuery,
} = merchantUsersServiceApi;
