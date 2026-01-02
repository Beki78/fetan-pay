"use client";
import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";

// Mock data - same as PlanComparison
const plans = [
  {
    id: "early-access",
    name: "Early Access (Limited)",
    price: 20,
    billingCycle: "7 days",
    description: "Our early access limited offer plan.",
    features: [
      "1000 verifications/month",
      "60 API requests/min",
      "Webhook notifications",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    limitations: [],
    popular: false,
  },
  {
    id: "intermediate",
    name: "Intermediate",
    price: 1200,
    billingCycle: "30 days",
    description: "Ideal for growing businesses with moderate verification needs.",
    features: [
      "2500 verifications/month",
      "60 API requests/min",
      "Webhook notifications",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    limitations: [],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 6000,
    billingCycle: "30 days",
    description: "For high-volume businesses requiring maximum verifications and features.",
    features: [
      "15000 verifications/month",
      "120 API requests/min",
      "Webhook notifications",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    limitations: [],
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 20000,
    billingCycle: "30 days",
    description: "For companies which has many customers",
    features: [
      "Unlimited verifications/month",
      "Unlimited API requests/min",
      "Webhook notifications",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    limitations: [],
    popular: false,
  },
];

interface EditPlanFormProps {
  planId: string;
}

export default function EditPlanForm({ planId }: EditPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Find the plan by ID directly instead of using useEffect
  const plan = plans.find(p => p.id === planId) || null;

  const handleSave = async () => {
    if (!plan) return;

    setIsLoading(true);
    // TODO: Implement save logic
    console.log("Saving plan:", plan);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Show success message or redirect
    }, 1000);
  };


  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-2">Loading plan...</div>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            If this takes too long, the plan ID &quot;{planId}&quot; might not exist.
          </div>
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
            Edit Plan: {plan.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage plan details, features, and pricing
          </p>
        </div>
      </div>

      {/* Plan Details Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Basic Information
            </h3>

            <div className="space-y-4">
              {/* Plan Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={plan.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={plan.description}
                  readOnly
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (ETB)
                  </label>
                  <input
                    type="number"
                    value={plan.price}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Billing Cycle
                  </label>
                  <select
                    value={plan.billingCycle}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="7 days">7 days</option>
                    <option value="30 days">30 days</option>
                    <option value="90 days">90 days</option>
                    <option value="365 days">365 days</option>
                  </select>
                </div>
              </div>

              {/* Popular Badge Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="popular"
                  checked={plan.popular}
                  disabled
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="popular" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mark as Popular Plan
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Features Management */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Features Management
            </h3>

            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={true} // All features are enabled by default
                        onChange={(e) => {
                          // In a real app, this would update the feature enabled/disabled state
                          console.log(`${feature} ${e.target.checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white border-0 px-8"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
