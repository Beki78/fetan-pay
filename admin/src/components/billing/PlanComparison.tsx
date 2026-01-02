"use client";
import React from "react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { CheckCircleIcon } from "@/icons";
import Link from "next/link";

// Mock data
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

export default function PlanComparison() {
  const getPrice = (plan: typeof plans[0]) => {
    return `ETB ${plan.price.toFixed(2)}/${plan.billingCycle}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Manage Plans</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure and manage subscription plans for vendors
          </p>
        </div>
        {/* <Button className="bg-green-500 hover:bg-green-600 text-white border-0">
          + Add New Plan
        </Button> */}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl border p-5 transition-all ${
              plan.popular
                ? "border-purple-500 bg-white dark:border-purple-500 dark:bg-gray-800/50"
                : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 right-3">
                <Badge color="success" size="sm">
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                {plan.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {plan.description}
              </p>
              <div className="mb-3">
                <span className="text-3xl font-bold text-gray-800 dark:text-white">
                  {getPrice(plan)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Link href={`/plans/edit/${plan.id}`}>
              <Button
                size="sm"
                className={`w-full ${
                  plan.popular
                    ? "bg-blue-500 hover:bg-blue-600 text-white border-0"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                }`}
              >
                Edit Plan
              </Button>
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
}

