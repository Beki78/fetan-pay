"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { CheckCircleIcon, PlusIcon, ArrowLeftIcon } from "@/icons";
import { useCreatePlanMutation, type BillingCycle } from "@/lib/redux/features/pricingApi";
import { toast } from "sonner";

const defaultFeatures = [
  "Full API access",
  "Vendor dashboard",
  "All verification methods",
  "Multi-bank support",
  "Basic analytics",
  "Advanced analytics",
  "Transaction history",
  "Bank account management",
  "Webhook support",
  "Export functionality",
  "Custom branding",
  "Priority support"
];

export default function CreatePlanPage() {
  const router = useRouter();
  const [createPlan, { isLoading }] = useCreatePlanMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "MONTHLY" as BillingCycle,
    verificationLimit: "",
    apiLimit: "60",
    isPopular: false,
    displayOrder: "1"
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setFeatures(features.filter(feature => feature !== featureToRemove));
  };

  const handleAddDefaultFeature = (feature: string) => {
    if (!features.includes(feature)) {
      setFeatures([...features, feature]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (features.length === 0) {
      toast.error("Please add at least one feature to the plan");
      return;
    }

    try {
      const planData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        billingCycle: formData.billingCycle,
        verificationLimit: formData.verificationLimit ? parseInt(formData.verificationLimit) : undefined,
        apiLimit: parseInt(formData.apiLimit) || 60,
        features: features,
        isPopular: formData.isPopular,
        displayOrder: parseInt(formData.displayOrder) || 1
      };

      await createPlan(planData).unwrap();
      toast.success("Plan created successfully!");
      router.push("/plans");
    } catch (error: any) {
      console.error("Error creating plan:", error);
      toast.error(error?.data?.message || "Failed to create plan");
    }
  };

  const handleCancel = () => {
    router.push("/plans");
  };

  return (
    <div>
      <PageBreadcrumb 
        pageTitle="Create New Plan" 
      />
      
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
              Back to Plans
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Plan
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure a new pricing plan for merchants
              </p>
            </div>
          </div>
        </div>

        <ComponentCard
          title="Plan Configuration"
          desc="Set up the details, pricing, and features for the new plan"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Starter Plan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Price (ETB) *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the plan and its target audience..."
                  required
                />
              </div>
            </div>

            {/* Limits & Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Limits & Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Limit (per month)
                  </label>
                  <Input
                    type="number"
                    value={formData.verificationLimit}
                    onChange={(e) => handleInputChange("verificationLimit", e.target.value)}
                    placeholder="1000"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty for unlimited
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Requests (per minute) *
                  </label>
                  <Input
                    type="number"
                    value={formData.apiLimit}
                    onChange={(e) => handleInputChange("apiLimit", e.target.value)}
                    placeholder="60"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Billing Cycle *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={formData.billingCycle}
                    onChange={(e) => handleInputChange("billingCycle", e.target.value as BillingCycle)}
                    required
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => handleInputChange("displayOrder", e.target.value)}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              {/* Popular Plan Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={(e) => handleInputChange("isPopular", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPopular" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Mark as "Most Popular" plan
                </label>
              </div>
            </div>

            {/* Features Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Plan Features *
              </h3>
              
              {/* Quick Add Default Features */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick add common features:
                </p>
                <div className="flex flex-wrap gap-2">
                  {defaultFeatures.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => handleAddDefaultFeature(feature)}
                      disabled={features.includes(feature)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        features.includes(feature)
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Feature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Custom Feature
                </label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Enter a custom feature..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddFeature} variant="outline">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Features List */}
              {features.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Selected Features ({features.length}):
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFeature(feature)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {features.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No features added yet. Please add at least one feature.</p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Plan"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}