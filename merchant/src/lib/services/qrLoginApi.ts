import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../constants";

export interface QRLoginRequest {
  qrData: string;
  origin: string;
}

export interface QRLoginResponse {
  email: string;
  password: string;
  userId: string;
  merchantId: string;
}

export const qrLoginApi = createApi({
  reducerPath: "qrLoginApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    validateQRCode: builder.mutation<QRLoginResponse, QRLoginRequest>({
      query: (body) => ({
        url: "/merchant-accounts/qr-login",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useValidateQRCodeMutation } = qrLoginApi;
