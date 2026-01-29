"use client";
import { useState } from "react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { CheckCircleIcon } from "@/icons";
import SubscribePaymentModal from "./SubscribePaymentModal";
import { useGetPublicPlansQuery } from "@/lib/services/pricingServiceApi";

export default function PlanComparison() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API query
  const { data: plansResponse, isLoading, error } = useGetPublicPlansQuery({
    status: 'ACTIVE',
    limit: 100,
    sortBy: 'displayOrder',
    sortOrder: 'asc'
  });

  const plans = plansResponse?.data || [];

  const getPrice = (plan: any) => {
    if (plan.price === 0 && plan.name !== "Free") {
      return "Custom Pricing";
    }
    return `ETB ${plan.price.toLocaleString()}/${plan.billingCycle.toLowerCase()}`;
  };

  const handleGetStarted = (plan: any) => {
    if (plan.price === 0 && plan.name !== "Free") {
      // Custom plan - redirect to contact sales
      window.open('mailto:sales@fetanpay.com', '_blank');
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading plans...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">Failed to load plans</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Choose Your Plan</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select the plan that best fits your business needs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl border p-5 transition-all ${
              plan.isPopular
                ? "border-purple-500 bg-white dark:border-purple-500 dark:bg-gray-800/50"
                : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
            }`}
          >
            {plan.isPopular && (
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

            <div className="space-y-2">
              <Button
                size="sm"
                onClick={() => handleGetStarted(plan)}
                className={`w-full ${
                  plan.isPopular
                    ? "bg-purple-500 hover:bg-purple-600 text-white border-0"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                }`}
              >
                {plan.price === 0 && plan.name !== "Free" ? "Contact Sales" : "Get Started"}
              </Button>
              
              {/* Plan limits info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {plan.verificationLimit && (
                  <div>Verifications: {plan.verificationLimit.toLocaleString()}/month</div>
                )}
                <div>API Calls: {plan.apiLimit.toLocaleString()}/min</div>
              </div>
            </div>
          </div>
        ))}
      </div>

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

