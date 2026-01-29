export type PlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type BillingCycle = "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";

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
