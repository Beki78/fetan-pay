import { API_BASE_URL } from "../config";

export type PlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type BillingCycle = "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "SUSPENDED" | "PENDING";
export type TransactionStatus = "PENDING" | "VERIFIED" | "FAILED" | "EXPIRED";
export type PlanAssignmentType = "IMMEDIATE" | "SCHEDULED";
export type PlanDurationType = "PERMANENT" | "TEMPORARY";

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  verificationLimit?: number | null;
  apiLimit: number;
  features: string[];
  status: PlanStatus;
  isPopular: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  _count?: {
    subscriptions: number;
  };
}

export interface Subscription {
  id: string;
  merchantId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string | null;
  nextBillingDate?: string | null;
  monthlyPrice: number;
  billingCycle: BillingCycle;
  currentUsage?: any;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  plan: Plan;
  merchant?: {
    id: string;
    name: string;
    contactEmail?: string | null;
  };
}

export interface BillingTransaction {
  id: string;
  transactionId: string;
  merchantId: string;
  planId: string;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  status: TransactionStatus;
  processedAt?: string | null;
  processedBy?: string | null;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  notes?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  merchant: {
    id: string;
    name: string;
    contactEmail?: string | null;
  };
  plan: Plan;
  subscription?: Subscription | null;
}

export interface PlanAssignment {
  id: string;
  merchantId: string;
  planId: string;
  assignmentType: PlanAssignmentType;
  scheduledDate?: string | null;
  durationType: PlanDurationType;
  endDate?: string | null;
  notes?: string | null;
  isApplied: boolean;
  appliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedBy: string;
  merchant: {
    id: string;
    name: string;
    contactEmail?: string | null;
  };
  plan: Plan;
}

export interface PlanListResponse {
  data: Plan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BillingTransactionListResponse {
  data: BillingTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlanStatistics {
  plans: (Plan & {
    activeSubscribers: number;
    monthlyRevenue: number;
  })[];
  totalRevenue: number;
}

// Plan Management API
export async function fetchPlans(params?: {
  status?: PlanStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<PlanListResponse> {
  const url = new URL(`${API_BASE_URL}/pricing/plans`);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.sortBy) url.searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) url.searchParams.set("sortOrder", params.sortOrder);

  const res = await fetch(url.toString(), { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to fetch plans");
  }
  return json;
}

export async function fetchPlanById(id: string): Promise<Plan> {
  const res = await fetch(`${API_BASE_URL}/pricing/plans/${id}`, {
    credentials: "include"
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to fetch plan");
  }
  return json;
}

export async function createPlan(planData: {
  name: string;
  description: string;
  price: number;
  billingCycle?: BillingCycle;
  verificationLimit?: number;
  apiLimit?: number;
  features: string[];
  isPopular?: boolean;
  displayOrder?: number;
}): Promise<Plan> {
  const res = await fetch(`${API_BASE_URL}/pricing/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(planData)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to create plan");
  }
  return json;
}

export async function updatePlan(id: string, planData: {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  verificationLimit?: number;
  apiLimit?: number;
  features?: string[];
  status?: PlanStatus;
  isPopular?: boolean;
  displayOrder?: number;
}): Promise<Plan> {
  const res = await fetch(`${API_BASE_URL}/pricing/plans/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(planData)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to update plan");
  }
  return json;
}

export async function deletePlan(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/pricing/plans/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.message || json?.error || "Failed to delete plan");
  }
}

// Plan Assignment API
export async function assignPlan(assignmentData: {
  merchantId: string;
  planId: string;
  assignmentType?: PlanAssignmentType;
  scheduledDate?: string;
  durationType?: PlanDurationType;
  endDate?: string;
  notes?: string;
}): Promise<PlanAssignment> {
  const res = await fetch(`${API_BASE_URL}/pricing/plans/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(assignmentData)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to assign plan");
  }
  return json;
}

export async function applyPlanAssignment(assignmentId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/pricing/plans/assignments/${assignmentId}/apply`, {
    method: "POST",
    credentials: "include"
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.message || json?.error || "Failed to apply plan assignment");
  }
}

// Billing Transaction API
export async function fetchBillingTransactions(params?: {
  merchantId?: string;
  page?: number;
  limit?: number;
}): Promise<BillingTransactionListResponse> {
  const url = new URL(`${API_BASE_URL}/pricing/billing/transactions`);
  if (params?.merchantId) url.searchParams.set("merchantId", params.merchantId);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to fetch billing transactions");
  }
  return json;
}

export async function createBillingTransaction(transactionData: {
  merchantId: string;
  planId: string;
  subscriptionId?: string;
  amount: number;
  paymentReference?: string;
  paymentMethod?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  notes?: string;
}): Promise<BillingTransaction> {
  const res = await fetch(`${API_BASE_URL}/pricing/billing/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(transactionData)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to create billing transaction");
  }
  return json;
}

export async function updateTransactionStatus(
  transactionId: string, 
  status: TransactionStatus
): Promise<BillingTransaction> {
  const res = await fetch(`${API_BASE_URL}/pricing/billing/transactions/${transactionId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to update transaction status");
  }
  return json;
}

// Subscription API
export async function fetchMerchantSubscription(merchantId: string): Promise<{ subscription: Subscription | null }> {
  const res = await fetch(`${API_BASE_URL}/pricing/merchants/${merchantId}/subscription`, {
    credentials: "include"
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to fetch merchant subscription");
  }
  return json;
}

// Statistics API
export async function fetchPlanStatistics(): Promise<PlanStatistics> {
  const res = await fetch(`${API_BASE_URL}/pricing/statistics`, {
    credentials: "include"
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to fetch plan statistics");
  }
  return json;
}

// Get merchants for a specific plan
export async function fetchMerchantsForPlan(planId: string, page: number = 1, limit: number = 10): Promise<{
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const res = await fetch(`${API_BASE_URL}/pricing/plans/${planId}/merchants?page=${page}&limit=${limit}`, {
    credentials: "include"
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to fetch merchants for plan");
  }
  return json;
}

// Public API (for landing page)
export async function fetchPublicPlans(): Promise<PlanListResponse> {
  const res = await fetch(`${API_BASE_URL}/pricing/public/plans`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to fetch public plans");
  }
  return json;
}