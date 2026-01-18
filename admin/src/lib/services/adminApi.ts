import { baseApi } from "../redux/api";

export type PaymentType = "QR" | "cash" | "bank";
export type PaymentRecordType = "transaction" | "payment";

export interface UnifiedPayment {
  id: string;
  type: PaymentRecordType;
  paymentType: PaymentType;
  merchantId: string;
  merchant?: {
    id: string;
    name: string;
  };
  provider: string | null;
  reference: string;
  amount: number;
  tipAmount: number | null;
  status: string;
  createdAt: string;
  verifiedAt: string | null;
  verifiedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  payerName: string | null;
  receiverAccount?: string | null;
  receiverName?: string | null;
  qrUrl?: string | null;
  note?: string | null;
  receiptUrl?: string | null;
}

export interface ListAllPaymentsResponse {
  data: UnifiedPayment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListAllPaymentsParams {
  merchantId?: string;
  provider?: string;
  status?: string;
  paymentType?: PaymentType;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAllPayments: builder.query<ListAllPaymentsResponse, ListAllPaymentsParams>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.merchantId) query.set("merchantId", params.merchantId);
        if (params.provider) query.set("provider", params.provider);
        if (params.status) query.set("status", params.status);
        if (params.paymentType) query.set("paymentType", params.paymentType);
        if (params.search) query.set("search", params.search);
        if (params.from) query.set("from", params.from);
        if (params.to) query.set("to", params.to);
        query.set("page", String(params.page ?? 1));
        query.set("pageSize", String(params.pageSize ?? 20));
        return `/admin/payments?${query.toString()}`;
      },
      providesTags: [{ type: "Merchant", id: "ALL_PAYMENTS" }],
    }),
  }),
});

export const { useListAllPaymentsQuery } = adminApi;

