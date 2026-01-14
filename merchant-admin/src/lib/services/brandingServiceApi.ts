import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants';

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

export interface UpdateBrandingInput {
  merchantId: string;
  primaryColor?: string;
  secondaryColor?: string;
  displayName?: string;
  tagline?: string;
  showPoweredBy?: boolean;
  logo?: File;
}

export const brandingServiceApi = createApi({
  reducerPath: 'brandingServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Branding'],
  endpoints: (builder) => ({
    getBranding: builder.query<BrandingData, string>({
      query: (merchantId) => ({
        url: `/merchants/${merchantId}/branding`,
        method: 'GET',
      }),
      providesTags: (result, error, merchantId) => [
        { type: 'Branding', id: merchantId },
      ],
    }),

    updateBranding: builder.mutation<BrandingData, UpdateBrandingInput>({
      query: ({ merchantId, logo, ...body }) => {
        const formData = new FormData();
        
        if (logo) {
          formData.append('logo', logo);
        }
        if (body.primaryColor) {
          formData.append('primaryColor', body.primaryColor);
        }
        if (body.secondaryColor) {
          formData.append('secondaryColor', body.secondaryColor);
        }
        if (body.displayName !== undefined) {
          formData.append('displayName', body.displayName || '');
        }
        if (body.tagline !== undefined) {
          // Allow empty string to clear tagline
          formData.append('tagline', body.tagline);
        }
        if (body.showPoweredBy !== undefined) {
          formData.append('showPoweredBy', String(body.showPoweredBy));
        }

        return {
          url: `/merchants/${merchantId}/branding`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: 'Branding', id: arg.merchantId },
      ],
    }),

    deleteBranding: builder.mutation<{ message: string }, string>({
      query: (merchantId) => ({
        url: `/merchants/${merchantId}/branding`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, merchantId) => [
        { type: 'Branding', id: merchantId },
      ],
    }),
  }),
});

export const {
  useGetBrandingQuery,
  useUpdateBrandingMutation,
  useDeleteBrandingMutation,
} = brandingServiceApi;

