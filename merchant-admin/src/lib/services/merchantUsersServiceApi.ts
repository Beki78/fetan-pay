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
  tagTypes: ["MerchantUsers", "MerchantUser"],
  endpoints: (builder) => ({
    getMerchantUsers: builder.query<MerchantUser[], string>({
      query: (merchantId) => ({
        url: `/merchant-accounts/${merchantId}/users`,
        method: "GET",
      }),
      providesTags: (result, error, merchantId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "MerchantUser" as const, id })),
              { type: "MerchantUsers" as const, id: merchantId },
            ]
          : [{ type: "MerchantUsers" as const, id: merchantId }],
    }),

    getMerchantUser: builder.query<MerchantUser, { merchantId: string; id: string }>({
      query: ({ merchantId, id }) => ({
        url: `/merchant-accounts/${merchantId}/users/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, { id }) => [{ type: "MerchantUser", id }],
    }),

    createMerchantUser: builder.mutation<MerchantUser, CreateMerchantUserInput>({
      query: ({ merchantId, ...body }) => ({
        url: `/merchant-accounts/${merchantId}/users`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { merchantId }) => [
        { type: "MerchantUsers", id: merchantId },
      ],
    }),

    updateMerchantUser: builder.mutation<MerchantUser, UpdateMerchantUserInput>({
      query: ({ merchantId, id, ...body }) => ({
        url: `/merchant-accounts/${merchantId}/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { merchantId, id }) => [
        { type: "MerchantUser", id },
        { type: "MerchantUsers", id: merchantId },
      ],
    }),

    deactivateMerchantUser: builder.mutation<MerchantUser, { merchantId: string; id: string; actionBy: string }>({
      query: ({ merchantId, id, ...body }) => ({
        url: `/merchant-accounts/${merchantId}/users/${id}/deactivate`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { merchantId, id }) => [
        { type: "MerchantUser", id },
        { type: "MerchantUsers", id: merchantId },
      ],
    }),

    activateMerchantUser: builder.mutation<MerchantUser, { merchantId: string; id: string; actionBy: string }>({
      query: ({ merchantId, id, ...body }) => ({
        url: `/merchant-accounts/${merchantId}/users/${id}/activate`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { merchantId, id }) => [
        { type: "MerchantUser", id },
        { type: "MerchantUsers", id: merchantId },
      ],
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
