"use client";
import React, { useState } from "react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { CheckCircleIcon } from "@/icons";

// Mock data
const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    billingCycle: "monthly",
    description: "Perfect for testing the platform",
    features: [
      "100 verifications/month",
      "Full API access",
      "2 API keys",
      "Vendor dashboard",
      "Basic analytics",
      "Transaction history (30 days)",
      "Up to 2 bank accounts",
    ],
    limitations: ["No webhook support", "Basic analytics only", "UI watermark"],
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    billingCycle: "monthly",
    description: "Perfect for small businesses",
    features: [
      "1,000 verifications/month",
      "Full API access",
      "2 API keys",
      "Webhook support",
      "Advanced analytics",
      "Transaction history (6 months)",
      "Up to 5 bank accounts",
    ],
    limitations: ["UI watermark"],
    popular: false,
    overage: "$0.10 per additional verification",
  },
  {
    id: "growth",
    name: "Growth",
    price: 199,
    billingCycle: "monthly",
    description: "Perfect for growing businesses",
    features: [
      "10,000 verifications/month",
      "Full API access",
      "2 API keys",
      "Webhook support",
      "Advanced analytics & reporting",
      "Transaction history (12 months)",
      "Unlimited bank accounts",
      "Export functionality (CSV, PDF)",
      "Frontend UI (NO watermark)",
      "Custom integration support",
    ],
    limitations: [],
    popular: true,
    overage: "$0.08 per additional verification",
  },
  {
    id: "custom",
    name: "Custom",
    price: null,
    billingCycle: "custom",
    description: "Perfect for large enterprises",
    features: [
      "Custom verification limits",
      "Full API access",
      "2 API keys",
      "Webhook support",
      "Advanced analytics & reporting",
      "Unlimited transaction history",
      "Unlimited bank accounts",
      "Export functionality (all formats)",
      "White-label options",
      "Custom features development",
      "On-premise deployment (optional)",
      "Dedicated support",
    ],
    limitations: [],
    popular: false,
    custom: true,
  },
];

const mockCurrentPlanId = "growth";

export default function PlanComparison() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.custom) return "Custom";
    if (billingCycle === "annual" && plan.price > 0) {
      const annualPrice = plan.price * 12 * 0.9; // 10% discount
      return `$${annualPrice.toFixed(0)}/yr`;
    }
    return `$${plan.price}/${plan.billingCycle === "monthly" ? "mo" : "yr"}`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
            Available Plans
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose the plan that best fits your business needs
          </p>
        </div>
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${
              billingCycle === "monthly"
                ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${
              billingCycle === "annual"
                ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Annual
            <span className="ml-1 text-xs text-success-600 dark:text-success-400">
              (Save 10%)
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl border p-5 transition-all ${
              plan.popular
                ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
            } ${plan.id === mockCurrentPlanId ? "ring-2 ring-brand-500" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge color="success" size="sm">
                  Most Popular
                </Badge>
              </div>
            )}

            {plan.id === mockCurrentPlanId && (
              <div className="absolute -top-3 right-3">
                <Badge color="success" size="sm">
                  Current
                </Badge>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-1">
                {plan.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {plan.description}
              </p>
              <div className="mb-3">
                <span className="text-3xl font-bold text-gray-800 dark:text-white/90">
                  {getPrice(plan)}
                </span>
                {!plan.custom && billingCycle === "annual" && plan.price > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    (${(plan.price * 0.9).toFixed(2)}/mo)
                  </span>
                )}
              </div>
              {plan.overage && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {plan.overage}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
              {plan.limitations.length > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start gap-2 mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              size="sm"
              className="w-full"
              variant={plan.id === mockCurrentPlanId ? "outline" : "primary"}
              disabled={plan.id === mockCurrentPlanId}
            >
              {plan.id === mockCurrentPlanId
                ? "Current Plan"
                : plan.custom
                ? "Contact Sales"
                : plan.id === "free"
                ? "Get Started"
                : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

