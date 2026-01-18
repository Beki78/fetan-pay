import { baseApi } from "../api";

export type MerchantStatus = "PENDING" | "ACTIVE";

export interface MerchantUser {
  id: string;
  role: string;
  status: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt?: string;
  userId?: string; // Better Auth user ID
  banned?: boolean; // Better Auth banned status
}

export interface Merchant {
  id: string;
  name: string;
  tin?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: MerchantStatus;
  source?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  users: MerchantUser[];
}

export interface MerchantListResponse {
  data: Merchant[];
  total: number;
  page: number;
  pageSize: number;
}

export const merchantsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMerchants: build.query<MerchantListResponse, {
      status?: MerchantStatus;
      search?: string;
      page?: number;
      pageSize?: number;
    } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set("status", params.status);
        if (params?.search) searchParams.set("search", params.search);
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
        const qs = searchParams.toString();
        return `/merchant-accounts${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((m) => ({ type: "Merchant" as const, id: m.id })),
              { type: "Merchant" as const, id: "LIST" },
            ]
          : [{ type: "Merchant" as const, id: "LIST" }],
    }),
        getMerchant: build.query<Merchant, string>({
          query: (id) => `/merchant-accounts/${id}`,
          providesTags: (_result, _error, id) => [{ type: "Merchant" as const, id }],
        }),
    approveMerchant: build.mutation<Merchant, { id: string; approvedBy?: string }>(
      {
        query: ({ id, approvedBy }) => ({
          url: `/merchant-accounts/${id}/approve`,
          method: "PATCH",
          body: approvedBy ? { approvedBy } : {},
        }),
        invalidatesTags: (_result, _error, arg) => [
          { type: "Merchant" as const, id: arg.id },
          { type: "Merchant" as const, id: "LIST" },
        ],
      }
    ),
    rejectMerchant: build.mutation<Merchant, { id: string; rejectedBy?: string; reason?: string }>(
      {
        query: ({ id, rejectedBy, reason }) => ({
          url: `/merchant-accounts/${id}/reject`,
          method: "PATCH",
          body: {
            ...(rejectedBy ? { rejectedBy } : {}),
            ...(reason ? { reason } : {}),
          },
        }),
        invalidatesTags: (_result, _error, arg) => [
          { type: "Merchant" as const, id: arg.id },
          { type: "Merchant" as const, id: "LIST" },
        ],
      }
    ),
    deactivateUser: build.mutation<MerchantUser, { merchantId: string; userId: string }>({
      query: ({ merchantId, userId }) => ({
        url: `/merchant-accounts/${merchantId}/users/${userId}/deactivate`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Merchant" as const, id: arg.merchantId },
      ],
    }),
    activateUser: build.mutation<MerchantUser, { merchantId: string; userId: string }>({
      query: ({ merchantId, userId }) => ({
        url: `/merchant-accounts/${merchantId}/users/${userId}/activate`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Merchant" as const, id: arg.merchantId },
      ],
    }),
  }),
});

export const {
  useGetMerchantsQuery,
  useGetMerchantQuery,
  useApproveMerchantMutation,
  useRejectMerchantMutation,
  useDeactivateUserMutation,
  useActivateUserMutation,
} = merchantsApi;
