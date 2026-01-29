"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { ArrowLeftIcon, CheckCircleIcon, CalenderIcon } from "@/icons";

// Mock merchant data
const mockMerchant = {
  id: "USR001",
  firstName: "John",
  lastName: "Doe", 
  email: "john.doe@example.com",
  currentPlan: "Starter",
  status: "active"
};

// Mock available plans
const availablePlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    billingCycle: "month",
    description: "Perfect for testing the platform and small businesses getting started",
    features: [
      "100 verifications/month",
      "Full API access",
      "2 API keys",
      "Vendor dashboard",
      "Basic analytics"
    ],
    isEnabled: true,
    isPopular: false
  },
  {
    id: "starter",
    name: "Starter", 
    price: 1740,
    billingCycle: "month",
    description: "Perfect for small businesses and startups",
    features: [
      "1,000 verifications/month",
      "Full API access",
      "2 API keys", 
      "Vendor dashboard",
      "Webhook support",
      "Advanced analytics"
    ],
    isEnabled: true,
    isPopular: true
  },
  {
    id: "business",
    name: "Business",
    price: 11940,
    billingCycle: "month", 
    description: "Perfect for growing businesses and medium-sized companies",
    features: [
      "10,000 verifications/month",
      "Full API access",
      "2 API keys",
      "Vendor dashboard", 
      "Webhook support",
      "Advanced analytics & reporting",
      "Export functionality",
      "Custom integration support"
    ],
    isEnabled: true,
    isPopular: false
  }
];
export default function ChangePlanPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.id as string;
  
  const [selectedPlan, setSelectedPlan] = useState("");
  const [assignmentType, setAssignmentType] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState<"permanent" | "temporary">("permanent");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      alert("Please select a plan");
      return;
    }

    const assignment = {
      merchantId,
      planId: selectedPlan,
      assignmentType,
      scheduledDate: assignmentType === "scheduled" ? scheduledDate : null,
      duration,
      endDate: duration === "temporary" ? endDate : null,
      notes,
      assignedBy: "Admin", // In real app, get from auth context
      assignedAt: new Date().toISOString()
    };

    console.log("Plan assignment:", assignment);
    alert(`Plan assigned successfully to ${mockMerchant.firstName} ${mockMerchant.lastName}`);
    router.push(`/merchants/${merchantId}`);
  };

  const handleCancel = () => {
    router.push(`/merchants/${merchantId}`);
  };

  const selectedPlanData = availablePlans.find(p => p.id === selectedPlan);

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
                Assign a new plan to {mockMerchant.firstName} {mockMerchant.lastName}
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
                {mockMerchant.firstName} {mockMerchant.lastName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {mockMerchant.email}
              </div>
            </div>
            <div className="text-right">
              <Badge color="info" size="sm">
                {mockMerchant.currentPlan}
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
                {availablePlans.filter(plan => plan.isEnabled).map((plan) => (
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
                          ETB {plan.price.toLocaleString()}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            /{plan.billingCycle}
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
                ))}
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
                        value="immediate"
                        checked={assignmentType === "immediate"}
                        onChange={(e) => setAssignmentType(e.target.value as "immediate" | "scheduled")}
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
                        value="scheduled"
                        checked={assignmentType === "scheduled"}
                        onChange={(e) => setAssignmentType(e.target.value as "immediate" | "scheduled")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="scheduled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Schedule for later
                      </label>
                    </div>
                  </div>
                  
                  {assignmentType === "scheduled" && (
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
                        name="duration"
                        value="permanent"
                        checked={duration === "permanent"}
                        onChange={(e) => setDuration(e.target.value as "permanent" | "temporary")}
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
                        name="duration"
                        value="temporary"
                        checked={duration === "temporary"}
                        onChange={(e) => setDuration(e.target.value as "permanent" | "temporary")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="temporary" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Temporary (expires on specific date)
                      </label>
                    </div>
                  </div>
                  
                  {duration === "temporary" && (
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
                      <div>Price: <span className="font-medium">ETB {selectedPlanData.price.toLocaleString()}/{selectedPlanData.billingCycle}</span></div>
                      <div>Apply: <span className="font-medium">{assignmentType === "immediate" ? "Immediately" : `On ${new Date(scheduledDate).toLocaleString()}`}</span></div>
                      <div>Duration: <span className="font-medium">{duration === "permanent" ? "Permanent" : `Until ${new Date(endDate).toLocaleString()}`}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedPlan}>
                Assign Plan
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}