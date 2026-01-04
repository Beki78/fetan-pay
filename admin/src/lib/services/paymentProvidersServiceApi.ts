import { baseApi } from "../redux/api";

export type ProviderStatus = "ACTIVE" | "COMING_SOON" | "DISABLED";
export type ProviderCode = "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";

export interface PaymentProviderRecord {
  id: string;
  code: ProviderCode;
  name: string;
  // Stored as a local filename under /public/images/banks
  logoUrl?: string | null;
  status: ProviderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const paymentProvidersServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentProviders: builder.query<{ providers: PaymentProviderRecord[] }, void>({
      query: () => ({ url: "/payment-providers" }),
      providesTags: [{ type: "Merchant", id: "PAYMENT_PROVIDERS" }],
    }),

    upsertPaymentProvider: builder.mutation<
      { provider: PaymentProviderRecord },
      { code: ProviderCode; name: string; logoKey?: string; status?: ProviderStatus }
    >({
      query: (body) => ({
        url: "/payment-providers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Merchant", id: "PAYMENT_PROVIDERS" }],
    }),

    deletePaymentProvider: builder.mutation<{ ok: true }, { code: ProviderCode }>({
      query: ({ code }) => ({
        url: `/payment-providers/${code}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Merchant", id: "PAYMENT_PROVIDERS" }],
    }),
  }),
});

export const {
  useGetPaymentProvidersQuery,
  useUpsertPaymentProviderMutation,
  useDeletePaymentProviderMutation,
} = paymentProvidersServiceApi;
