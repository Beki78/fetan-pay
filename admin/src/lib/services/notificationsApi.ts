import { baseApi } from "../redux/api";

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationType = 
  | 'MERCHANT_REGISTRATION'
  | 'MERCHANT_APPROVED'
  | 'MERCHANT_REJECTED'
  | 'MERCHANT_BANNED'
  | 'MERCHANT_UNBANNED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'WALLET_DEPOSIT_VERIFIED'
  | 'WALLET_BALANCE_LOW'
  | 'TEAM_MEMBER_INVITED'
  | 'API_KEY_CREATED'
  | 'WEBHOOK_FAILED'
  | 'SYSTEM_ALERT'
  | 'CAMPAIGN_COMPLETED'
  | 'BRANDING_UPDATED';

export type NotificationUserType = 'ADMIN' | 'MERCHANT_USER';

export interface Notification {
  id: string;
  userId: string;
  userType: NotificationUserType;
  merchantId?: string;
  merchant?: {
    id: string;
    name: string;
  };
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  emailSent: boolean;
  emailLogId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationFilters {
  unread_only?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  page?: number;
  limit?: number;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, NotificationFilters>({
      query: (params = {}) => {
        const query = new URLSearchParams();
        if (params.unread_only) query.set("unread_only", "true");
        if (params.type) query.set("type", params.type);
        if (params.priority) query.set("priority", params.priority);
        query.set("page", String(params.page ?? 1));
        query.set("limit", String(params.limit ?? 20));
        return `/notifications?${query.toString()}`;
      },
      providesTags: [{ type: "Merchant", id: "NOTIFICATIONS" }],
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => "/notifications/unread-count",
      providesTags: [{ type: "Merchant", id: "UNREAD_COUNT" }],
    }),

    markAsRead: builder.mutation<Notification, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Merchant", id: "NOTIFICATIONS" },
        { type: "Merchant", id: "UNREAD_COUNT" },
      ],
    }),

    markAllAsRead: builder.mutation<{ count: number }, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Merchant", id: "NOTIFICATIONS" },
        { type: "Merchant", id: "UNREAD_COUNT" },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApi;