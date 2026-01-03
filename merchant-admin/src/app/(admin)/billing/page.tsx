"use client";
import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import AlertBanner from "@/components/ui/alert/AlertBanner";
import SubscribePaymentModal from "@/components/billing/SubscribePaymentModal";
import { CheckCircleIcon, ArrowRightIcon } from "@/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccountStatus } from "@/hooks/useAccountStatus";

// TODO: Replace mock subscription + history with API data

// Mock subscription data
const currentSubscription = {
  planName: "Free Plan",
  subtitle: "1 Day free trial",
  status: "Active",
  verificationsUsed: 0,
  verificationsLimit: 100,
  daysRemaining: 1,
  expiresAt: "Dec 31, 2025",
  amountPaid: 0.00,
  startedAt: "Dec 30, 2025",
  features: [
    "100 verifications",
    "Analytics",
    "60 API req/min",
    "Webhooks",
    "Priority support",
  ],
};

// Mock subscription history
const subscriptionHistory = [
  {
    plan: "Free",
    status: "Active",
    period: "Dec 30, 2025 - Dec 31, 2025",
    usage: "0 / 100",
    amount: "ETB 0.00",
    paymentRef: "—",
  },
];

// All available plans - Based on kifiya-pricing.md
// Pricing converted from USD to ETB (approximate 1 USD = 60 ETB)
const plans = [
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
      "Basic analytics",
      "All verification methods",
      "Multi-bank support",
      "Frontend UI (with watermark)",
      "Bank account management (up to 2 accounts)",
    ],
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 1740, // $29/month ≈ ETB 1,740
    billingCycle: "month",
    description: "Perfect for small businesses and startups",
    features: [
      "1,000 verifications/month",
      "Full API access",
      "2 API keys",
      "Vendor dashboard",
      "Webhook support",
      "Advanced analytics",
      "Transaction history (6 months)",
      "All verification methods",
      "Bank account management (up to 5 accounts)",
      "Frontend UI (with watermark)",
    ],
    popular: true,
  },
  {
    id: "business", // Renamed from 'growth' to 'business' to match markdown
    name: "Business",
    price: 11940, // $199/month ≈ ETB 11,940
    billingCycle: "month",
    description: "Perfect for growing businesses and medium-sized companies",
    features: [
      "10,000 verifications/month",
      "Full API access",
      "2 API keys",
      "Vendor dashboard",
      "Webhook support",
      "Advanced analytics & reporting",
      "Transaction history (12 months)",
      "Unlimited bank accounts",
      "Custom webhook endpoints",
      "Export functionality (CSV, PDF)",
      "Frontend UI (NO watermark)",
      "Custom integration support",
    ],
    popular: false,
  },
  {
    id: "custom",
    name: "Custom",
    price: 0, // Custom pricing
    billingCycle: "month",
    description: "Perfect for large enterprises and businesses with specific needs",
    features: [
      "Custom verification limits",
      "Full API access",
      "2 API keys",
      "Vendor dashboard",
      "Webhook support",
      "Advanced analytics & reporting",
      "Unlimited transaction history",
      "Unlimited bank accounts",
      "Custom webhook endpoints",
      "Export functionality (all formats)",
      "Frontend UI (NO watermark + white-label)",
      "Custom system integration",
      "Volume discounts",
      "White-label options",
      "Custom features development",
      "On-premise deployment (optional)",
    ],
    popular: false,
    isCustom: true,
  },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgradePlans, setShowUpgradePlans] = useState(false);
  const { status: accountStatus, isPending } = useAccountStatus();

  // TODO: Replace with subscription status from API/context
  const hasActiveSubscription = accountStatus === "active";

  // Helper function to check if account is pending (avoids TypeScript narrowing issues)
  const isAccountPending = (): boolean => isPending;

  const handleGetStarted = (plan: typeof plans[0]) => {
    if (isAccountPending()) {
      // Don't open modal if account is pending
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleUpgradePlan = () => {
    // Show plans section and scroll to it
    setShowUpgradePlans(true);
    setTimeout(() => {
      const plansSection = document.getElementById("plans-section");
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: "smooth", block: "start" });
        // Add a slight highlight effect
        plansSection.classList.add("ring-2", "ring-purple-500", "ring-opacity-50");
        setTimeout(() => {
          plansSection.classList.remove("ring-2", "ring-purple-500", "ring-opacity-50");
        }, 2000);
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const usagePercentage =
    currentSubscription.verificationsLimit > 0
      ? Math.min(
          (currentSubscription.verificationsUsed /
            currentSubscription.verificationsLimit) *
            100,
          100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          Subscription
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your subscription plan
        </p>
      </div>

      {/* Pending Approval Warning */}
      {isAccountPending() && (
        <AlertBanner
          variant="warning"
          title="Account Pending Approval"
          message="Your merchant account is currently pending. You need to be approved before you can subscribe to a plan. Please ensure your payment provider is configured and wait for admin approval."
        />
      )}

      {/* Active Subscription View */}
      {hasActiveSubscription && accountStatus === "active" ? (
        <>
          {/* Current Plan Card */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  {currentSubscription.planName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentSubscription.subtitle}
                </p>
              </div>
              <Badge color="success" size="sm">
                {currentSubscription.status}
              </Badge>
            </div>

            {/* Three Data Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Verifications Used */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Verifications Used
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {currentSubscription.verificationsUsed} /{" "}
                  {currentSubscription.verificationsLimit}
                </p>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-purple-500 dark:bg-purple-400 transition-all duration-300"
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentSubscription.verificationsLimit -
                    currentSubscription.verificationsUsed}{" "}
                  remaining
                </p>
              </div>

              {/* Days Remaining */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Days Remaining
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {currentSubscription.daysRemaining}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Expires {currentSubscription.expiresAt}
                </p>
              </div>

              {/* Amount Paid */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Amount Paid
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  ETB {currentSubscription.amountPaid.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Started {currentSubscription.startedAt}
                </p>
              </div>
            </div>

            {/* Plan Features */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                Plan Features
              </h3>
              <div className="flex flex-wrap gap-4 mb-4">
                {currentSubscription.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpgradePlan}
                className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Upgrade Plan
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upgrade Banner */}
          {!showUpgradePlans && (
            <div className="rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-500/10 p-4 mb-6">
              <div className="flex items-center justify-between">
    <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                    Want more features?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upgrade your plan to unlock more verifications and features.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleUpgradePlan}
                  className="bg-purple-500 hover:bg-purple-600 text-white border-0 shrink-0"
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          )}

          {/* Subscription History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Subscription History
              </h3>
              {!showUpgradePlans && (
                <button
                  onClick={handleUpgradePlan}
                  className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  Upgrade Plan
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
              <div className="w-full overflow-x-auto">
                <Table className="w-full">
                    <TableHeader className="border-b border-gray-100 dark:border-white/5">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          PLAN
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          STATUS
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          PERIOD
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          USAGE
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          AMOUNT
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          PAYMENT REF
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                      {subscriptionHistory.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <span className="font-medium text-gray-800 dark:text-white">
                              {item.plan}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <Badge color="success" size="sm">
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-gray-200">
                            {item.period}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-gray-200">
                            {item.usage}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-gray-200">
                            {item.amount}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-gray-200">
                            {item.paymentRef}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </div>
            </div>
          </div>

          {/* Plans Section (for upgrade) - Only show when showUpgradePlans is true */}
          {showUpgradePlans && (
            <div id="plans-section" className="mt-8 scroll-mt-6 transition-all duration-300">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  Upgrade Your Plan
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select a plan to upgrade to
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans
                  .filter((p) => p.id !== "free")
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-xl border p-5 transition-all flex flex-col justify-between ${
                        plan.popular
                          ? "border-purple-500 bg-white dark:border-purple-500 dark:bg-gray-800/50"
                          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
                        }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 right-3">
                          <Badge color="primary" size="sm">
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                          {plan.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {plan.description}
                        </p>
                        <div className="mb-3">
                          {plan.isCustom ? (
                            <span className="text-2xl font-bold text-gray-800 dark:text-white">
                              Custom Pricing
                            </span>
                          ) : (
                            <>
                              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                                ETB {plan.price.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                /{plan.billingCycle}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          if (isAccountPending()) return;
                          if (plan.isCustom) {
                            window.open('mailto:sales@kifiya-auth.com', '_blank');
                          } else {
                            handleGetStarted(plan);
                          }
                        }}
                        disabled={isAccountPending()}
                        className={`w-full ${
                          isAccountPending()
                            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border-0"
                            : plan.id === "starter"
                              ? "bg-purple-500 hover:bg-purple-600 text-white border-0"
                              : plan.isCustom
                                ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                          }`}
                      >
                        {isAccountPending()
                          ? "Approval Required"
                          : plan.isCustom
                            ? "Contact Sales"
                            : "Upgrade Now"}
                      </Button>
                    </div>
                  ))}
                </div>
            </div>
          )}
        </>
      ) : (
        /* No Active Subscription - Show Plans */
        <>
          {!isAccountPending() && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                No Active Subscription
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose a plan below to start verifying payments.
              </p>
            </div>
          )}

          {/* Plans Section */}
          <div id="plans-section">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Choose Your Plan
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select the plan that best fits your business needs
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-5 transition-all flex flex-col justify-between ${
                    plan.popular
                      ? "border-purple-500 bg-white dark:border-purple-500 dark:bg-gray-800/50"
                      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 right-3">
                      <Badge color="primary" size="sm">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                      {plan.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {plan.description}
                    </p>
                    <div className="mb-3">
                      {plan.isCustom ? (
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">
                          Custom Pricing
                        </span>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-gray-800 dark:text-white">
                            ETB {plan.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            /{plan.billingCycle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      if (isAccountPending()) return;
                      if (plan.isCustom) {
                        window.open('mailto:sales@kifiya-auth.com', '_blank');
                      } else {
                        handleGetStarted(plan);
                      }
                    }}
                    disabled={isAccountPending()}
                    className={`w-full ${
                      isAccountPending()
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border-0"
                        : plan.id === "starter"
                          ? "bg-purple-500 hover:bg-purple-600 text-white border-0"
                          : plan.isCustom
                            ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                    }`}
                  >
                    {isAccountPending()
                      ? "Approval Required"
                      : plan.isCustom
                        ? "Contact Sales"
                        : "Get Started"}
                  </Button>
                </div>
              ))}
            </div>
      </div>
        </>
      )}

      {/* Payment Modal */}
      {selectedPlan && (
        <SubscribePaymentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          plan={{
            id: selectedPlan.id,
            name: selectedPlan.name,
            price: selectedPlan.price,
            billingCycle: selectedPlan.billingCycle,
          }}
        />
      )}
    </div>
  );
}
