import { baseApi } from "../redux/api";

export interface BrandingData {
  id: string | null;
  merchantId: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  displayName: string | null;
  tagline: string | null;
  showPoweredBy: boolean;
  createdAt: string;
  updatedAt: string;
}

export const brandingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMerchantBranding: build.query<BrandingData, string>({
      query: (merchantId: string) => `/merchants/${merchantId}/branding`,
      providesTags: (_result, _error, merchantId) => [
        { type: "Branding" as const, id: merchantId },
      ],
    }),
  }),
});

export const {
  useGetMerchantBrandingQuery,
} = brandingApi;
