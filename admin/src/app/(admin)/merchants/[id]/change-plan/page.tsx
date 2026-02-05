"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { ArrowLeftIcon, CheckCircleIcon } from "@/icons";
import { toast } from "sonner";
import { 
  useGetMerchantQuery 
} from "@/lib/redux/features/merchantsApi";
import { 
  useGetPlansQuery, 
  useAssignPlanMutation,
  useGetMerchantSubscriptionQuery,
  type PlanAssignmentType,
  type PlanDurationType 
} from "@/lib/redux/features/pricingApi";
export default function ChangePlanPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.id as string;
  
  const [selectedPlan, setSelectedPlan] = useState("");
  const [assignmentType, setAssignmentType] = useState<PlanAssignmentType>("IMMEDIATE");
  const [scheduledDate, setScheduledDate] = useState("");
  const [durationType, setDurationType] = useState<PlanDurationType>("PERMANENT");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API queries
  const { data: merchant, isLoading: merchantLoading, error: merchantError } = useGetMerchantQuery(merchantId);
  const { data: plansResponse, isLoading: plansLoading, error: plansError } = useGetPlansQuery({ 
    status: "ACTIVE", 
    limit: 100,
    sortBy: "displayOrder",
    sortOrder: "asc"
  });
  const { data: subscriptionResponse, isLoading: subscriptionLoading } = useGetMerchantSubscriptionQuery(merchantId);
  const [assignPlan] = useAssignPlanMutation();

  const plans = plansResponse?.data || [];
  const currentSubscription = subscriptionResponse?.subscription;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    if (assignmentType === "SCHEDULED" && !scheduledDate) {
      toast.error("Please select a scheduled date");
      return;
    }

    if (durationType === "TEMPORARY" && !endDate) {
      toast.error("Please select an end date for temporary assignment");
      return;
    }

    setIsSubmitting(true);

    try {
      const assignmentData = {
        merchantId,
        planId: selectedPlan,
        assignmentType,
        scheduledDate: assignmentType === "SCHEDULED" ? scheduledDate : undefined,
        durationType,
        endDate: durationType === "TEMPORARY" ? endDate : undefined,
        notes: notes.trim() || undefined,
      };

      await assignPlan(assignmentData).unwrap();
      
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      toast.success(`Plan "${selectedPlanData?.name}" assigned successfully to ${merchant?.name}`);
      router.push(`/merchants/${merchantId}`);
    } catch (error: any) {
      console.error("Error assigning plan:", error);
      
      // Handle specific error cases
      if (error?.data?.message?.includes("already a pending assignment")) {
        toast.error("There is already a pending plan assignment for this merchant. Please wait for it to be processed, cancel the existing assignment, or contact support.");
      } else if (error?.data?.message?.includes("Plan assignment already applied")) {
        toast.error("This plan assignment has already been processed. Please refresh the page to see the current status.");
      } else if (error?.data?.message?.includes("Merchant not found")) {
        toast.error("Merchant not found. Please verify the merchant ID and try again.");
      } else if (error?.data?.message?.includes("Plan not found")) {
        toast.error("Selected plan not found. Please refresh the page and try again.");
      } else if (error?.data?.message?.includes("Cannot assign inactive plan")) {
        toast.error("Cannot assign inactive plan. Please select an active plan.");
      } else if (error?.data?.message?.includes("already has an active subscription")) {
        toast.error("Merchant already has an active subscription to this plan. Please select a different plan.");
      } else {
        toast.error(error?.data?.message || "Failed to assign plan. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/merchants/${merchantId}`);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  // Loading states
  if (merchantLoading || plansLoading || subscriptionLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Change Plan" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (merchantError || plansError) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Change Plan" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              {merchantError ? "Failed to load merchant details" : "Failed to load plans"}
            </p>
            <Button onClick={() => router.push(`/merchants/${merchantId}`)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Change Plan" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Merchant not found</p>
            <Button onClick={() => router.push("/merchants")}>
              Back to Merchants
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Change Plan" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Merchant
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Change Plan
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Assign a new plan to {merchant.name}
              </p>
            </div>
          </div>
        </div>

        {/* Current Plan Info */}
        <ComponentCard
          title="Current Plan"
          desc="Merchant's current subscription details"
        >
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {merchant.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {merchant.contactEmail}
              </div>
            </div>
            <div className="text-right">
              <Badge color={currentSubscription?.status === "ACTIVE" ? "success" : "warning"} size="sm">
                {currentSubscription?.plan?.name || "No Plan"}
              </Badge>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Current Plan
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Plan Selection */}
        <ComponentCard
          title="Select New Plan"
          desc="Choose a plan to assign to this merchant"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Available Plans */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Available Plans
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {plans.filter(plan => plan.status === "ACTIVE").length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No active plans available</p>
                  </div>
                ) : (
                  plans.filter(plan => plan.status === "ACTIVE").map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="plan"
                            value={plan.id}
                            checked={selectedPlan === plan.id}
                            onChange={(e) => setSelectedPlan(e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {plan.name}
                          </h4>
                        </div>
                        {plan.isPopular && (
                          <Badge color="info" size="sm">Popular</Badge>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            ETB {Number(plan.price).toLocaleString()}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              /{plan.billingCycle.toLowerCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {plan.description}
                        </p>
                      </div>

                      <div className="space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircleIcon className="w-3 h-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                        {plan.features.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{plan.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Assignment Options */}
            {selectedPlan && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Assignment Options
                </h3>
                
                {/* Assignment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    When to apply this plan?
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="immediate"
                        name="assignmentType"
                        value="IMMEDIATE"
                        checked={assignmentType === "IMMEDIATE"}
                        onChange={(e) => setAssignmentType(e.target.value as PlanAssignmentType)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="immediate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Apply immediately
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="scheduled"
                        name="assignmentType"
                        value="SCHEDULED"
                        checked={assignmentType === "SCHEDULED"}
                        onChange={(e) => setAssignmentType(e.target.value as PlanAssignmentType)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="scheduled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Schedule for later
                      </label>
                    </div>
                  </div>
                  
                  {assignmentType === "SCHEDULED" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scheduled Date
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Plan Duration
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="permanent"
                        name="durationType"
                        value="PERMANENT"
                        checked={durationType === "PERMANENT"}
                        onChange={(e) => setDurationType(e.target.value as PlanDurationType)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="permanent" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Permanent (until changed)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="temporary"
                        name="durationType"
                        value="TEMPORARY"
                        checked={durationType === "TEMPORARY"}
                        onChange={(e) => setDurationType(e.target.value as PlanDurationType)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="temporary" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Temporary (expires on specific date)
                      </label>
                    </div>
                  </div>
                  
                  {durationType === "TEMPORARY" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this plan assignment..."
                  />
                </div>

                {/* Summary */}
                {selectedPlanData && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Assignment Summary
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Plan: <span className="font-medium">{selectedPlanData.name}</span></div>
                      <div>Price: <span className="font-medium">ETB {Number(selectedPlanData.price).toLocaleString()}/{selectedPlanData.billingCycle.toLowerCase()}</span></div>
                      <div>Apply: <span className="font-medium">{assignmentType === "IMMEDIATE" ? "Immediately" : `On ${new Date(scheduledDate).toLocaleString()}`}</span></div>
                      <div>Duration: <span className="font-medium">{durationType === "PERMANENT" ? "Permanent" : `Until ${new Date(endDate).toLocaleString()}`}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedPlan || isSubmitting}>
                {isSubmitting ? "Assigning..." : "Assign Plan"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}