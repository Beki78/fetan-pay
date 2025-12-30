"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { CheckCircleIcon, DollarLineIcon } from "@/icons";

// Mock data
const mockCurrentPlan = {
  name: "Growth Plan",
  price: 199,
  billingCycle: "monthly", // or "annual"
  nextBillingDate: "2024-02-15",
  status: "Active",
  features: [
    "10,000 verifications per month",
    "Full API access",
    "2 API keys",
    "Webhook support",
    "Advanced analytics & reporting",
    "Transaction history (12 months)",
    "Unlimited bank accounts",
    "Export functionality (CSV, PDF)",
    "Frontend UI Package (NO watermark)",
  ],
};

export default function CurrentPlan() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
            Current Plan
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your subscription and billing information
          </p>
        </div>
        <Badge color="success" size="sm">
          {mockCurrentPlan.status}
        </Badge>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-900/20">
                <DollarLineIcon className="text-brand-600 size-6 dark:text-brand-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {mockCurrentPlan.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Billed {mockCurrentPlan.billingCycle === "monthly" ? "monthly" : "annually"}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
              ${mockCurrentPlan.price}
              <span className="text-base font-normal text-gray-500 dark:text-gray-400">
                /{mockCurrentPlan.billingCycle === "monthly" ? "mo" : "yr"}
              </span>
            </p>
            {mockCurrentPlan.billingCycle === "annual" && (
              <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                Save 10% with annual billing
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Next billing date
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {new Date(mockCurrentPlan.nextBillingDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
          Plan Features
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mockCurrentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="sm" variant="outline" className="flex-1">
          Change Plan
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Update Billing
        </Button>
      </div>
    </div>
  );
}

