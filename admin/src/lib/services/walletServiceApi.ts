import { baseApi } from "../redux/api";

export type TransactionProvider = "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";
export type WalletTransactionType = "DEPOSIT" | "CHARGE" | "REFUND" | "ADJUSTMENT";
export type WalletDepositStatus = "PENDING" | "VERIFIED" | "UNVERIFIED" | "EXPIRED";
export type ReceiverStatus = "ACTIVE" | "INACTIVE";

export interface WalletDepositReceiverAccount {
  id: string;
  provider: TransactionProvider;
  receiverAccount: string;
  receiverName: string | null;
  receiverLabel: string | null;
  status: ReceiverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  merchantId: string;
  merchant?: {
    id: string;
    name: string;
  };
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: any;
  payment?: {
    id: string;
    reference: string;
    provider: string;
    claimedAmount: number;
  };
  walletDeposit?: {
    id: string;
    reference: string;
    provider: string;
    amount: number;
  };
  createdAt: string;
}

export interface MerchantWalletConfig {
  walletEnabled: boolean;
  walletChargeType: "PERCENTAGE" | "FIXED" | null;
  walletChargeValue: number | null;
  walletMinBalance: number | null;
  walletBalance: number;
}

export interface SetDepositReceiverInput {
  provider: TransactionProvider;
  receiverAccount: string;
  receiverName: string;
  receiverLabel?: string;
  status?: ReceiverStatus;
}

export interface ManualDepositInput {
  merchantId: string;
  amount: number;
  description?: string;
}


export interface UpdateMerchantWalletConfigInput {
  walletEnabled?: boolean;
  walletChargeType?: "PERCENTAGE" | "FIXED" | null;
  walletChargeValue?: number | null;
  walletMinBalance?: number | null;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export const walletServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Deposit Receiver Accounts
    getDepositReceivers: builder.query<WalletDepositReceiverAccount[], void>({
      query: () => "/wallet/deposit-receivers",
      providesTags: [{ type: "Merchant", id: "WALLET_RECEIVERS" }],
    }),

    setDepositReceiver: builder.mutation<
      WalletDepositReceiverAccount,
      SetDepositReceiverInput
    >({
      query: (body) => ({
        url: "/wallet/deposit-receivers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Merchant", id: "WALLET_RECEIVERS" }],
    }),

    updateDepositReceiver: builder.mutation<
      WalletDepositReceiverAccount,
      { id: string; data: SetDepositReceiverInput }
    >({
      query: ({ id, data }) => ({
        url: `/wallet/deposit-receivers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "Merchant", id: "WALLET_RECEIVERS" }],
    }),

    deleteDepositReceiver: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/wallet/deposit-receivers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Merchant", id: "WALLET_RECEIVERS" }],
    }),

    // Manual Operations
    manualDeposit: builder.mutation<WalletTransaction, ManualDepositInput>({
      query: (body) => ({
        url: "/wallet/deposit",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Merchant", id: "WALLET_TRANSACTIONS" },
        { type: "Merchant", id: "MERCHANT_WALLETS" },
      ],
    }),

    // Merchant Wallet Configuration
    getMerchantWalletConfig: builder.query<
      MerchantWalletConfig,
      string
    >({
      query: (merchantId) => `/merchants/${merchantId}/wallet-config`,
      providesTags: (result, error, merchantId) => [
        { type: "Merchant", id: `WALLET_CONFIG_${merchantId}` },
      ],
    }),

    updateMerchantWalletConfig: builder.mutation<
      MerchantWalletConfig,
      { merchantId: string; config: UpdateMerchantWalletConfigInput }
    >({
      query: ({ merchantId, config }) => ({
        url: `/merchants/${merchantId}/wallet-config`,
        method: "PUT",
        body: config,
      }),
      invalidatesTags: (result, error, { merchantId }) => [
        { type: "Merchant", id: `WALLET_CONFIG_${merchantId}` },
        { type: "Merchant", id: "MERCHANT_WALLETS" },
      ],
    }),

    // Wallet Transactions (for admin view)
    getWalletTransactions: builder.query<
      WalletTransactionsResponse,
      { merchantId?: string; page?: number; pageSize?: number }
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.merchantId) query.set("merchantId", params.merchantId);
        query.set("page", String(params.page ?? 1));
        query.set("pageSize", String(params.pageSize ?? 20));
        return `/wallet/transactions?${query.toString()}`;
      },
      providesTags: [{ type: "Merchant", id: "WALLET_TRANSACTIONS" }],
    }),

    // Get merchants list (for dropdowns)
    getMerchantsForWallet: builder.query<
      { id: string; name: string; walletBalance?: number }[],
      void
    >({
      query: () => "/merchant-accounts?walletInfo=true",
      providesTags: [{ type: "Merchant", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDepositReceiversQuery,
  useSetDepositReceiverMutation,
  useUpdateDepositReceiverMutation,
  useDeleteDepositReceiverMutation,
  useManualDepositMutation,
  useGetMerchantWalletConfigQuery,
  useUpdateMerchantWalletConfigMutation,
  useGetWalletTransactionsQuery,
  useGetMerchantsForWalletQuery,
} = walletServiceApi;

