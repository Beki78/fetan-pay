"use client";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { CheckCircleIcon, CloseIcon } from "@/icons";
import { Toggle } from "../ui/toggle";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlan: (plan: any) => void;
}

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

export default function CreatePlanModal({
  isOpen,
  onClose,
  onCreatePlan,
}: CreatePlanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "MONTHLY",
    isPopular: false,
    displayOrder: "1"
  });
  const [limits, setLimits] = useState<Record<string, any>>({});
  const [features, setFeatures] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const handleRemoveFeature = (featureToRemove: string) => {
    setFeatures(features.filter(feature => feature !== featureToRemove));
  };

  const handleAddDefaultFeature = (feature: string) => {
    if (!features.includes(feature)) {
      setFeatures([...features, feature]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPlan = {
      name: formData.name,
      description: formData.description,
      price: parseInt(formData.price) || 0,
      billingCycle: formData.billingCycle,
      limits: limits,
      features: features,
      isPopular: formData.isPopular,
      displayOrder: parseInt(formData.displayOrder) || 1
    };

    onCreatePlan(newPlan);
    
    // Reset form
    setFormData({
      name: "",
      description: "",
      price: "",
      billingCycle: "MONTHLY",
      isPopular: false,
      displayOrder: "1"
    });
    setLimits({});
    setFeatures([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Plan
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the plan..."
              required
            />
          </div>

          {/* Limits Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan Limits
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Configure usage limits for this plan. Use -1 for unlimited.
            </p>
            
            {/* Available Limits */}
            <div className="space-y-4 mb-6">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan Features
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Enable or disable specific features for this plan.
            </p>
            
            <div className="space-y-4 mb-6">
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

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Features Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Features
            </label>
            
            {/* Quick Add Default Features */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
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
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected Features ({features.length}):
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
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
                      >
                        <CloseIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Plan
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}