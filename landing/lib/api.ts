import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl =
  process.env.NEXT_PUBLIC_VERIFIER_API?.replace(/\/$/, '') ??
  'http://localhost:3003/api/v1/verifier'

type Provider =
  | 'Telebirr'
  | 'CBE'
  | 'Dashen'
  | 'Abyssinia'
  | 'Awash'
  | 'CBE Birr'

export interface VerifyRequest {
  provider: Provider
  reference: string
  phoneNumber?: string
}

export interface VerifyImageRequest {
  file: File
  autoVerify?: boolean
  suffix?: string
}

export interface VerifyImageResponse {
  type?: 'telebirr' | 'cbe'
  reference?: string
  forward_to?: string
  verified?: boolean
  details?: unknown
  error?: string
  accountSuffix?: string
}

export interface VerifyResponse {
  success?: boolean
  error?: string
  data?: unknown
  [key: string]: unknown
}

function buildRequest(provider: Provider, reference: string, phoneNumber?: string) {
  switch (provider) {
    case 'Telebirr':
      return { url: '/verify-telebirr', body: { reference } }
    case 'CBE':
      return { url: '/verify-cbe-smart', body: { reference } }
    case 'Dashen':
      return { url: '/verify-dashen', body: { transactionReference: reference } }
    case 'Abyssinia':
      return { url: '/verify-abyssinia-smart', body: { reference } }
    case 'Awash':
      return { url: '/verify-awash-smart', body: { reference } }
    case 'CBE Birr':
      return {
        url: '/verify-cbebirr',
        body: {
          receiptNumber: reference,
          phoneNumber: phoneNumber || reference || '',
          apiKey: '',
        },
      }
    default:
      throw new Error('Unsupported provider')
  }
}

export const verifierApi = createApi({
  reducerPath: 'verifierApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    verifyReceipt: builder.mutation<VerifyResponse, VerifyRequest>({
      query: ({ provider, reference, phoneNumber }) => {
        const { url, body } = buildRequest(provider, reference, phoneNumber)
        return {
          url,
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
        }
      },
    }),
    verifyReceiptImage: builder.mutation<VerifyImageResponse, VerifyImageRequest>({
      query: ({ file, autoVerify, suffix }) => {
        const formData = new FormData()
        formData.append('file', file)
        if (suffix) formData.append('suffix', suffix)

        const url = autoVerify === true ? '/verify-image?autoVerify=true' : '/verify-image'

        return {
          url,
          method: 'POST',
          body: formData,
        }
      },
    }),
  }),
})

export const { useVerifyReceiptMutation, useVerifyReceiptImageMutation } = verifierApi
