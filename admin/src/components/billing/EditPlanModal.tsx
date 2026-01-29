"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { CheckCircleIcon, PlusIcon, CloseIcon } from "@/icons";

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  onUpdatePlan: (plan: any) => void;
}

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

export default function EditPlanModal({
  isOpen,
  onClose,
  plan,
  onUpdatePlan,
}: EditPlanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "month",
    verificationLimit: "",
    apiLimit: "",
    isPopular: false,
    displayOrder: "1",
    isEnabled: true
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  // Update form data when plan changes
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || "",
        description: plan.description || "",
        price: plan.price?.toString() || "",
        billingCycle: plan.billingCycle || "month",
        verificationLimit: plan.verificationLimit?.toString() || "",
        apiLimit: plan.apiLimit?.toString() || "",
        isPopular: plan.isPopular || false,
        displayOrder: plan.displayOrder?.toString() || "1",
        isEnabled: plan.isEnabled !== undefined ? plan.isEnabled : true
      });
      setFeatures(plan.features || []);
    }
  }, [plan]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedPlan = {
      ...plan,
      name: formData.name,
      description: formData.description,
      price: parseInt(formData.price) || 0,
      billingCycle: formData.billingCycle,
      verificationLimit: parseInt(formData.verificationLimit) || 0,
      apiLimit: parseInt(formData.apiLimit) || 60,
      features: features,
      isPopular: formData.isPopular,
      displayOrder: parseInt(formData.displayOrder) || 1,
      isEnabled: formData.isEnabled
    };

    onUpdatePlan(updatedPlan);
  };

  if (!plan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Plan: {plan.name}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
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

          {/* Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Leave empty or 0 for unlimited
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Requests (per minute)
              </label>
              <Input
                type="number"
                value={formData.apiLimit}
                onChange={(e) => handleInputChange("apiLimit", e.target.value)}
                placeholder="60"
                min="1"
              />
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
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
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

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isEnabled"
                checked={formData.isEnabled}
                onChange={(e) => handleInputChange("isEnabled", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Plan is enabled (visible to merchants)
              </label>
            </div>
            
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan Features
            </label>
            
            {/* Quick Add Default Features */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Quick add common features:
              </p>
              <div className="flex flex-wrap gap-2">
                {defaultFeatures.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => handleAddDefaultFeature(feature)}
                    disabled={features.includes(feature)}
                    className={`px-2 py-1 text-xs rounded ${
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
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a custom feature..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              />
              <Button type="button" onClick={handleAddFeature} variant="outline">
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Features List */}
            {features.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected Features:
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
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
                        variant="ghost"
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

          {/* Plan Statistics (Read-only) */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Plan Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.activeSubscribers?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Active Subscribers
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ETB {plan.monthlyRevenue?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Monthly Revenue
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Plan
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}