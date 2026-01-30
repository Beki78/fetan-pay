"use client";
import { useState } from "react";
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
import { useMerchant } from "@/hooks/useMerchant";
import { 
  useGetPublicPlansQuery, 
  useGetMerchantSubscriptionQuery,
  useGetMerchantBillingTransactionsQuery 
} from "@/lib/services/pricingServiceApi";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { status: accountStatus, isPending } = useAccountStatus();
  const { merchantId, isLoading: merchantLoading, error: merchantError } = useMerchant();

  // API queries - only run if we have a valid merchant ID
  const { data: plansResponse, isLoading: plansLoading } = useGetPublicPlansQuery({
    status: 'ACTIVE',
    limit: 100,
    sortBy: 'displayOrder',
    sortOrder: 'asc'
  });
  
  const { data: subscriptionResponse, isLoading: subscriptionLoading, error: subscriptionError } = useGetMerchantSubscriptionQuery(
    merchantId || '',
    { skip: !merchantId }
  );
  
  const { data: transactionsResponse, isLoading: transactionsLoading } = useGetMerchantBillingTransactionsQuery({
    merchantId: merchantId || '',
    limit: 10
  }, { skip: !merchantId });

  const plans = plansResponse?.data || [];
  const currentSubscription = subscriptionResponse?.subscription;
  const subscriptionHistory = transactionsResponse?.data || [];

  // Debug logging
  console.log('Merchant ID:', merchantId);
  console.log('Subscription Response:', subscriptionResponse);
  console.log('Current Subscription:', currentSubscription);
  console.log('Subscription Error:', subscriptionError);

  // If we don't have a merchant ID or subscription, create a mock free plan subscription for demo
  const mockFreeSubscription = !merchantId || !currentSubscription ? {
    id: 'demo-free-subscription',
    merchantId: merchantId || 'demo-merchant',
    planId: 'demo-free-plan',
    status: 'ACTIVE' as const,
    startDate: new Date().toISOString(),
    endDate: null,
    nextBillingDate: null,
    monthlyPrice: 0,
    billingCycle: 'MONTHLY' as const,
    currentUsage: { verifications_monthly: 15, apiCalls: 120 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    plan: {
      id: 'demo-free-plan',
      name: 'Free',
      description: 'Perfect for testing the platform and small businesses getting started',
      price: 0,
      billingCycle: 'MONTHLY' as const,
      limits: {
        verifications_monthly: 100,
        api_calls_monthly: 60
      },
      verificationLimit: 100,
      apiLimit: 60,
      features: [
        '100 verifications/month',
        'Full API access',
        '2 API keys',
        'Vendor dashboard',
        'Basic analytics',
        'All verification methods',
        'Multi-bank support',
        'Frontend UI (with watermark)',
        'Bank account management (up to 2 accounts)',
        'Transaction history (30 days)',
      ],
      status: 'ACTIVE' as const,
      isPopular: false,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: null,
    }
  } : null;

  // Use real subscription or mock subscription for demo
  const effectiveSubscription = currentSubscription || mockFreeSubscription;
  
  // TODO: Replace with subscription status from API/context
  const hasActiveSubscription = !!effectiveSubscription;
  const currentPlan = effectiveSubscription?.plan;

  // Helper function to check if account is pending (avoids TypeScript narrowing issues)
  const isAccountPending = (): boolean => isPending;

  const handleGetStarted = (plan: any) => {
    if (isAccountPending()) {
      // Don't open modal if account is pending
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleUpgradePlan = () => {
    // Scroll to plans section
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

  // Helper function to safely extract usage numbers
  const getUsageValue = (usage: any): number => {
    if (typeof usage === 'number') return usage;
    if (typeof usage === 'object' && usage?.increment) return usage.increment;
    return 0;
  };

  // Calculate usage percentage
  const usagePercentage = (effectiveSubscription?.plan?.verificationLimit || effectiveSubscription?.plan?.limits?.verifications_monthly) && effectiveSubscription?.currentUsage?.verifications_monthly
    ? Math.min((getUsageValue(effectiveSubscription.currentUsage.verifications_monthly) / (effectiveSubscription.plan.verificationLimit || effectiveSubscription.plan.limits?.verifications_monthly || 1)) * 100, 100)
    : 0;

  // Calculate days remaining
  const daysRemaining = effectiveSubscription?.endDate 
    ? Math.max(0, Math.ceil((new Date(effectiveSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (merchantLoading || plansLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading subscription data...</div>
        </div>
      </div>
    );
  }

  // Handle merchant loading error
  if (merchantError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            Failed to load merchant information
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {merchantError}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

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

      {/* Demo Notice */}
      {(!merchantId || !currentSubscription) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Demo Mode:</strong> {!merchantId 
                ? "Unable to load merchant information. This is showing sample data." 
                : "No active subscription found. This is showing sample data for the Free plan."
              }
            </p>
          </div>
        </div>
      )}

      {/* Active Subscription View */}
      {hasActiveSubscription && effectiveSubscription && accountStatus === "active" ? (
        <>
          {/* Current Plan Card */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  {effectiveSubscription.plan.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {effectiveSubscription.plan.description}
                </p>
              </div>
              <Badge 
                color={effectiveSubscription.status === "ACTIVE" ? "success" : "info"} 
                size="sm"
              >
                {effectiveSubscription.status}
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
                  {getUsageValue(effectiveSubscription.currentUsage?.verifications_monthly)} /{" "}
                  {effectiveSubscription.plan.verificationLimit || effectiveSubscription.plan.limits?.verifications_monthly || "Unlimited"}
                </p>
                {(effectiveSubscription.plan.verificationLimit || effectiveSubscription.plan.limits?.verifications_monthly) && (
                  <>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-purple-500 dark:bg-purple-400 transition-all duration-300"
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(effectiveSubscription.plan.verificationLimit || effectiveSubscription.plan.limits?.verifications_monthly || 0) - getUsageValue(effectiveSubscription.currentUsage?.verifications_monthly)}{" "}
                      remaining
                    </p>
                  </>
                )}
              </div>

              {/* Days Remaining */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {effectiveSubscription.plan.name === 'Free' ? 'Plan Status' : 'Days Remaining'}
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {effectiveSubscription.plan.name === 'Free' ? '∞' : daysRemaining}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {effectiveSubscription.plan.name === 'Free' 
                    ? 'No expiration'
                    : effectiveSubscription.endDate 
                      ? `Expires ${new Date(effectiveSubscription.endDate).toLocaleDateString()}`
                      : "No expiration"
                  }
                </p>
              </div>

              {/* Amount Paid */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Monthly Price
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {effectiveSubscription.plan.name === 'Free' ? 'Free' : `ETB ${effectiveSubscription.monthlyPrice.toLocaleString()}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Started {new Date(effectiveSubscription.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Plan Features */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                Plan Features
              </h3>
              <div className="flex flex-wrap gap-4 mb-4">
                {effectiveSubscription.plan.features.map((feature, index) => (
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

          {/* Subscription History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Billing History
              </h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
              <div className="w-full overflow-x-auto">
                {transactionsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <div className="text-gray-500 dark:text-gray-400">Loading billing history...</div>
                  </div>
                ) : subscriptionHistory.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No billing history available
                  </div>
                ) : (
                  <Table className="w-full">
                    <TableHeader className="border-b border-gray-100 dark:border-white/5">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          TRANSACTION ID
                        </TableCell>
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
                      {subscriptionHistory.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <span className="font-mono text-sm text-gray-800 dark:text-white">
                              {transaction.transactionId}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <span className="font-medium text-gray-800 dark:text-white">
                              {transaction.plan.name}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <Badge 
                              color={
                                transaction.status === "VERIFIED" ? "success" :
                                transaction.status === "PENDING" ? "warning" : "info"
                              } 
                              size="sm"
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-gray-200">
                            {new Date(transaction.billingPeriodStart).toLocaleDateString()} - {new Date(transaction.billingPeriodEnd).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-gray-200">
                            {transaction.currency} {transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-gray-200">
                            {transaction.paymentReference || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>

          {/* Plans Section (for upgrade) - Always visible */}
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
                  .filter((p) => p.name !== "Free" && p.id !== currentSubscription?.planId)
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-xl border p-5 transition-all flex flex-col justify-between ${
                        plan.isPopular
                          ? "border-purple-500 bg-white dark:border-purple-500 dark:bg-gray-800/50"
                          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
                        }`}
                    >
                      {plan.isPopular && (
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
                          {plan.price === 0 && plan.name !== "Free" ? (
                            <span className="text-2xl font-bold text-gray-800 dark:text-white">
                              Custom Pricing
                            </span>
                          ) : (
                            <>
                              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                                ETB {plan.price.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                /{plan.billingCycle.toLowerCase()}
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
                          if (plan.price === 0 && plan.name !== "Free") {
                            window.open('mailto:sales@fetanpay.com', '_blank');
                          } else {
                            handleGetStarted(plan);
                          }
                        }}
                        disabled={isAccountPending()}
                        className={`w-full ${
                          isAccountPending()
                            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border-0"
                            : plan.isPopular
                              ? "bg-purple-500 hover:bg-purple-600 text-white border-0"
                              : plan.price === 0 && plan.name !== "Free"
                                ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                          }`}
                      >
                        {isAccountPending()
                          ? "Approval Required"
                          : plan.price === 0 && plan.name !== "Free"
                            ? "Contact Sales"
                            : "Upgrade Now"}
                      </Button>
                    </div>
                  ))}
                </div>
            </div>
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
                    plan.isPopular
                      ? "border-purple-500 bg-white dark:border-purple-500 dark:bg-gray-800/50"
                      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
                  }`}
                >
                  {plan.isPopular && (
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
                      {plan.price === 0 && plan.name !== "Free" ? (
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">
                          Custom Pricing
                        </span>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-gray-800 dark:text-white">
                            ETB {plan.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            /{plan.billingCycle.toLowerCase()}
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
                      if (plan.price === 0 && plan.name !== "Free") {
                        window.open('mailto:sales@fetanpay.com', '_blank');
                      } else {
                        handleGetStarted(plan);
                      }
                    }}
                    disabled={isAccountPending()}
                    className={`w-full ${
                      isAccountPending()
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border-0"
                        : plan.isPopular
                          ? "bg-purple-500 hover:bg-purple-600 text-white border-0"
                          : plan.price === 0 && plan.name !== "Free"
                            ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-0"
                    }`}
                  >
                    {isAccountPending()
                      ? "Approval Required"
                      : plan.price === 0 && plan.name !== "Free"
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
