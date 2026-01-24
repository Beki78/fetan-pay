import { baseApi } from "../redux/api";

export type EmailStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "BOUNCED";
export type SmsStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "QUEUED";
export type EmailTemplateCategory = "WELCOME" | "APPROVAL" | "SECURITY" | "MARKETING" | "REMINDER" | "NOTIFICATION";
export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "PAUSED" | "CANCELLED" | "FAILED";
export type CampaignType = "EMAIL" | "SMS" | "BOTH";
export type AudienceSegmentType = 
  | "ALL_MERCHANTS" 
  | "PENDING_MERCHANTS" 
  | "ACTIVE_MERCHANTS" 
  | "BANNED_USERS" 
  | "INACTIVE_MERCHANTS" 
  | "HIGH_VOLUME_MERCHANTS" 
  | "NEW_SIGNUPS" 
  | "MERCHANT_OWNERS" 
  | "WAITERS" 
  | "CUSTOM_FILTER";

export interface EmailTemplate {
  id: string;
  name: string;
  category: EmailTemplateCategory;
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  subject?: string;
  content: string;
  templateId?: string;
  template?: {
    id: string;
    name: string;
    category: string;
  };
  audienceSegment: AudienceSegmentType;
  customFilters?: Record<string, any>;
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  estimatedCost: number;
  actualCost: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceRecipient {
  email: string;
  name: string;
  phone?: string;
  merchantId?: string;
  merchantName?: string;
  userId?: string;
  role?: string;
}

export interface EmailLog {
  id: string;
  toEmail: string;
  subject: string;
  content: string;
  templateId?: string;
  template?: {
    id: string;
    name: string;
    category: string;
  };
  merchantId?: string;
  merchant?: {
    id: string;
    name: string;
  };
  sentByUserId: string;
  status: EmailStatus;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  messageId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SmsLog {
  id: string;
  toPhone: string;
  message: string;
  templateId?: string;
  template?: {
    id: string;
    name: string;
    category: string;
  };
  merchantId?: string;
  merchant?: {
    id: string;
    name: string;
  };
  sentByUserId: string;
  status: SmsStatus;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  messageId?: string;
  sender?: string;
  segmentCount: number;
  cost?: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SendEmailInput {
  toEmail: string;
  subject: string;
  content: string;
  templateId?: string;
  merchantId?: string;
  variables?: Record<string, string>;
}

export interface SendSmsInput {
  toPhone: string;
  message: string;
  templateId?: string;
  merchantId?: string;
  variables?: Record<string, string>;
  sender?: string;
  callback?: string;
}

export interface CreateCampaignInput {
  name: string;
  type: CampaignType;
  subject?: string;
  content: string;
  templateId?: string;
  audienceSegment: AudienceSegmentType;
  customFilters?: Record<string, any>;
  scheduledAt?: string;
  variables?: Record<string, string>;
}

export interface GetAudienceCountInput {
  segment: AudienceSegmentType;
  filters?: Record<string, any>;
}

export interface AudienceCountResponse {
  segment: AudienceSegmentType;
  count: number;
  filters?: Record<string, any>;
}

export interface AudiencePreviewResponse {
  segment: AudienceSegmentType;
  count: number;
  preview: AudienceRecipient[];
  filters?: Record<string, any>;
}

export interface ListCampaignsParams {
  page?: number;
  pageSize?: number;
  status?: CampaignStatus;
  type?: CampaignType;
  search?: string;
  from?: string;
  to?: string;
}

export interface ListCampaignsResponse {
  data: Campaign[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateEmailTemplateInput {
  name: string;
  category: EmailTemplateCategory;
  subject: string;
  content: string;
  variables: string[];
  isActive?: boolean;
}

export interface SendEmailResponse {
  id: string;
  status: "SENT";
  sentAt: string;
}

export interface SendSmsResponse {
  id: string;
  status: "SENT";
  sentAt: string;
  messageId: string;
  segmentCount: number;
}

export interface CampaignActionResponse {
  message: string;
  campaignId: string;
}

export interface ListEmailLogsParams {
  page?: number;
  pageSize?: number;
  merchantId?: string;
  status?: EmailStatus;
  templateId?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface ListSmsLogsParams {
  page?: number;
  pageSize?: number;
  merchantId?: string;
  status?: SmsStatus;
  templateId?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface AnalyticsOverview {
  totalEmails: number;
  totalCampaigns: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalCost: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  engagementBreakdown: Record<string, number>;
}

export interface EngagementTrend {
  date: string;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  openRate: number;
  clickRate: number;
}

export interface CampaignAnalytics {
  campaignId: string;
  name: string;
  status: string;
  type: string;
  sentAt?: string;
  completedAt?: string;
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  estimatedCost: number;
  actualCost: number;
  costPerEmail: number;
  costPerOpen: number;
  costPerClick: number;
}

export interface ListEmailLogsResponse {
  data: EmailLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListSmsLogsResponse {
  data: SmsLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const communicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send individual email
    sendEmail: builder.mutation<SendEmailResponse, SendEmailInput>({
      query: (body) => ({
        url: "communications/emails/send",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmailLog"],
    }),

    // Send individual SMS
    sendSms: builder.mutation<SendSmsResponse, SendSmsInput>({
      query: (body) => ({
        url: "communications/sms/send",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SmsLog"],
    }),

    // Create email template
    createEmailTemplate: builder.mutation<EmailTemplate, CreateEmailTemplateInput>({
      query: (body) => ({
        url: "communications/templates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmailTemplate"],
    }),

    // List email templates
    listEmailTemplates: builder.query<EmailTemplate[], void>({
      query: () => "communications/templates",
      providesTags: ["EmailTemplate"],
    }),

    // Get email template by ID
    getEmailTemplate: builder.query<EmailTemplate, string>({
      query: (id) => `communications/templates/${id}`,
      providesTags: (result, error, id) => [{ type: "EmailTemplate", id }],
    }),

    // List email logs
    listEmailLogs: builder.query<ListEmailLogsResponse, ListEmailLogsParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString());
        if (params.merchantId) searchParams.append("merchantId", params.merchantId);
        if (params.status) searchParams.append("status", params.status);
        if (params.templateId) searchParams.append("templateId", params.templateId);
        if (params.search) searchParams.append("search", params.search);
        if (params.from) searchParams.append("from", params.from);
        if (params.to) searchParams.append("to", params.to);

        return `communications/emails/logs?${searchParams.toString()}`;
      },
      providesTags: ["EmailLog"],
    }),

    // List SMS logs
    listSmsLogs: builder.query<ListSmsLogsResponse, ListSmsLogsParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString());
        if (params.merchantId) searchParams.append("merchantId", params.merchantId);
        if (params.status) searchParams.append("status", params.status);
        if (params.templateId) searchParams.append("templateId", params.templateId);
        if (params.search) searchParams.append("search", params.search);
        if (params.from) searchParams.append("from", params.from);
        if (params.to) searchParams.append("to", params.to);

        return `communications/sms/logs?${searchParams.toString()}`;
      },
      providesTags: ["SmsLog"],
    }),

    // ===== CAMPAIGN ENDPOINTS =====

    // Create campaign
    createCampaign: builder.mutation<Campaign, CreateCampaignInput>({
      query: (body) => ({
        url: "communications/campaigns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Campaign"],
    }),

    // List campaigns
    listCampaigns: builder.query<ListCampaignsResponse, ListCampaignsParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString());
        if (params.status) searchParams.append("status", params.status);
        if (params.type) searchParams.append("type", params.type);
        if (params.search) searchParams.append("search", params.search);
        if (params.from) searchParams.append("from", params.from);
        if (params.to) searchParams.append("to", params.to);

        return `communications/campaigns?${searchParams.toString()}`;
      },
      providesTags: ["Campaign"],
    }),

    // Get campaign by ID
    getCampaign: builder.query<Campaign, string>({
      query: (id) => `communications/campaigns/${id}`,
      providesTags: (result, error, id) => [{ type: "Campaign", id }],
    }),

    // Send campaign
    sendCampaign: builder.mutation<CampaignActionResponse, string>({
      query: (id) => ({
        url: `communications/campaigns/${id}/send`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Campaign", id }, "Campaign"],
    }),

    // Pause campaign
    pauseCampaign: builder.mutation<CampaignActionResponse, string>({
      query: (id) => ({
        url: `communications/campaigns/${id}/pause`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Campaign", id }, "Campaign"],
    }),

    // Cancel campaign
    cancelCampaign: builder.mutation<CampaignActionResponse, string>({
      query: (id) => ({
        url: `communications/campaigns/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Campaign", id }, "Campaign"],
    }),

    // ===== AUDIENCE ENDPOINTS =====

    // Get audience count
    getAudienceCount: builder.mutation<AudienceCountResponse, GetAudienceCountInput>({
      query: (body) => ({
        url: "communications/audience/count",
        method: "POST",
        body,
      }),
    }),

    // Get audience preview
    getAudiencePreview: builder.mutation<AudiencePreviewResponse, GetAudienceCountInput>({
      query: (body) => ({
        url: "communications/audience/preview",
        method: "POST",
        body,
      }),
    }),

    // ===== ANALYTICS ENDPOINTS =====

    // Get analytics overview
    getAnalyticsOverview: builder.query<AnalyticsOverview, { days?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.days) searchParams.append("days", params.days.toString());
        return `communications/analytics/overview?${searchParams.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // Get engagement trends
    getEngagementTrends: builder.query<EngagementTrend[], { days?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.days) searchParams.append("days", params.days.toString());
        return `communications/analytics/trends?${searchParams.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // Get top performing campaigns
    getTopCampaigns: builder.query<CampaignAnalytics[], { limit?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.append("limit", params.limit.toString());
        return `communications/analytics/campaigns/top?${searchParams.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // Get campaign analytics
    getCampaignAnalytics: builder.query<CampaignAnalytics, string>({
      query: (id) => `communications/analytics/campaigns/${id}`,
      providesTags: (result, error, id) => [{ type: "Analytics", id }],
    }),
  }),
});

// Export hooks
export const {
  useSendEmailMutation,
  useSendSmsMutation,
  useCreateEmailTemplateMutation,
  useListEmailTemplatesQuery,
  useGetEmailTemplateQuery,
  useListEmailLogsQuery,
  useListSmsLogsQuery,
  // Campaign hooks
  useCreateCampaignMutation,
  useListCampaignsQuery,
  useGetCampaignQuery,
  useSendCampaignMutation,
  usePauseCampaignMutation,
  useCancelCampaignMutation,
  // Audience hooks
  useGetAudienceCountMutation,
  useGetAudiencePreviewMutation,
  // Analytics hooks
  useGetAnalyticsOverviewQuery,
  useGetEngagementTrendsQuery,
  useGetTopCampaignsQuery,
  useGetCampaignAnalyticsQuery,
} = communicationsApi;