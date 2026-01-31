"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { ChevronLeftIcon, CheckCircleIcon } from "@/icons";
import { Toggle } from "@/components/ui/toggle";
import Link from "next/link";
import { toast } from "sonner";
import { 
  useGetPlanQuery, 
  useUpdatePlanMutation,
  type BillingCycle,
  type PlanStatus 
} from "@/lib/redux/features/pricingApi";

const defaultFeatures = [
  "Monthly verifications",
  "Team members (employees)",
  "Payment providers",
  "Unlimited API keys",
  "Unlimited webhooks", 
  "Advanced analytics & reporting",
  "Tips collection",
  "Custom branding",
  "All verification methods",
  "Bank account management",
  "Frontend UI Package",
  "White-label solution",
  "Custom integrations",
  "Dedicated support",
  "Priority support"
];

// Available limit types that admin can configure
const availableLimits = [
  { key: "verifications_monthly", label: "Monthly Verifications", type: "number", placeholder: "100", hasInput: true },
  { key: "team_members", label: "Team Members", type: "number", placeholder: "5", hasInput: true },
  { key: "payment_providers", label: "Payment Providers", type: "number", placeholder: "3", hasInput: true },
];

interface EditPlanFormProps {
  planId: string;
}

export default function EditPlanForm({ planId }: EditPlanFormProps) {
  const router = useRouter();
  const { data: plan, isLoading, error } = useGetPlanQuery(planId);
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "MONTHLY" as BillingCycle,
    isPopular: false,
    displayOrder: "1",
    status: "ACTIVE" as PlanStatus
  });
  const [limits, setLimits] = useState<Record<string, any>>({});
  const [features, setFeatures] = useState<string[]>([]);

  // Populate form when plan data is loaded
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price.toString(),
        billingCycle: plan.billingCycle,
        isPopular: plan.isPopular,
        displayOrder: plan.displayOrder?.toString() || "1",
        status: plan.status
      });
      setLimits(plan.limits || {});
      setFeatures(plan.features);
    }
  }, [plan]);

  const handleLimitChange = (key: string, value: any) => {
    setLimits(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRemoveLimit = (key: string) => {
    setLimits(prev => {
      const newLimits = { ...prev };
      delete newLimits[key];
      return newLimits;
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddDefaultFeature = (feature: string) => {
    if (!features.includes(feature)) {
      setFeatures([...features, feature]);
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setFeatures(features.filter(feature => feature !== featureToRemove));
  };

  const handleSave = async () => {
    if (!plan) return;

    try {
      await updatePlan({
        id: planId,
        data: {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          billingCycle: formData.billingCycle,
          limits: limits, // Use the flexible limits object
          features: features,
          status: formData.status,
          isPopular: formData.isPopular,
          displayOrder: parseInt(formData.displayOrder) || 1
        }
      }).unwrap();
      
      toast.success("Plan updated successfully!");
      router.push("/plans");
    } catch (error: any) {
      console.error("Error updating plan:", error);
      toast.error(error?.data?.message || "Failed to update plan");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading plan...</div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-2">Plan not found</div>
          <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            The plan ID &quot;{planId}&quot; does not exist.
          </div>
          <Link href="/plans">
            <Button variant="outline">
              Back to Plans
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/plans">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Plans
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Edit Plan: {formData.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Update plan details, pricing, and features
          </p>
        </div>
      </div>

      {/* Plan Details Form */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
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
                step={1}
                required
              />
            </div>
          </div>

          <div className="mt-6">
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
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            Plan Limits Configuration
          </h3>
          
          {/* Available Limits */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Configure plan limits:
            </p>
            <div className="space-y-4">
              {availableLimits.map((limitConfig) => (
                <div key={limitConfig.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={limits[limitConfig.key] !== undefined}
                      onChange={(checked) => {
                        if (checked) {
                          handleLimitChange(limitConfig.key, 0);
                        } else {
                          handleRemoveLimit(limitConfig.key);
                        }
                      }}
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {limitConfig.label}
                      </label>
                      {limits[limitConfig.key] !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {limits[limitConfig.key] === -1 ? "Unlimited" : `Current: ${limits[limitConfig.key] || 0}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Input section */}
                  {limits[limitConfig.key] !== undefined && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={limits[limitConfig.key] === -1 ? "" : (limits[limitConfig.key] || "")}
                        onChange={(e) => handleLimitChange(limitConfig.key, parseInt(e.target.value) || 0)}
                        placeholder={limitConfig.placeholder}
                        min="0"
                        className="w-24"
                        disabled={limits[limitConfig.key] === -1}
                      />
                      <button
                        type="button"
                        onClick={() => handleLimitChange(limitConfig.key, -1)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          limits[limitConfig.key] === -1
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                        }`}
                      >
                        {limits[limitConfig.key] === -1 ? "✓ Unlimited" : "Unlimited"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Plan Features:
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={limits.custom_branding === true}
                    onChange={(checked) => handleLimitChange("custom_branding", checked)}
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Custom Branding
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={limits.advanced_analytics === true}
                    onChange={(checked) => handleLimitChange("advanced_analytics", checked)}
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Advanced Analytics
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={limits.tips === true}
                    onChange={(checked) => handleLimitChange("tips", checked)}
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tips Collection
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Current Limits Summary */}
          {Object.keys(limits).length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Plan Configuration:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(limits).map(([key, value]) => {
                  const limitConfig = availableLimits.find(l => l.key === key);
                  const featureNames = {
                    custom_branding: "Custom Branding",
                    advanced_analytics: "Advanced Analytics", 
                    tips: "Tips Collection"
                  };
                  const displayName = limitConfig?.label || featureNames[key as keyof typeof featureNames] || key;
                  
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {displayName}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {value === -1 ? "Unlimited" : 
                         typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : 
                         value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Billing Cycle
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={formData.billingCycle}
                onChange={(e) => handleInputChange("billingCycle", e.target.value)}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
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

          {/* Plan Status Toggles */}
          <div className="space-y-4 mt-6">
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
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.status === "ACTIVE"}
                onChange={(e) => handleInputChange("status", e.target.checked ? "ACTIVE" : "INACTIVE")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable this plan (visible to merchants)
              </label>
            </div>
          </div>
        </div>

        {/* Features Management */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            Additional Features
          </h3>
          
          {/* Quick Add Default Features */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Click to add common features to your plan:
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
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 cursor-not-allowed'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                  }`}
                >
                  {features.includes(feature) ? '✓ ' : '+ '}
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Features List */}
          {features.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Selected Features ({features.length}):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
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
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-blue-500 hover:bg-blue-600 text-white border-0 px-8"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
