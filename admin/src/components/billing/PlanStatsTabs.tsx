"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { ConfirmationModal } from "../ui/modal/ConfirmationModal";
import { useModal } from "@/hooks/useModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { BellIcon, UserCircleIcon } from "@/icons";
import { toast } from "sonner";
import { 
  useGetPlansQuery, 
  useGetPlanStatisticsQuery,
  useGetBillingTransactionsQuery 
} from "@/lib/redux/features/pricingApi";
import { fetchMerchantsForPlan } from "@/lib/services/pricingApi";

export default function PlanStatsTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAction, setSelectedAction] = useState<{
    type: 'notify' | 'toggle' | 'bulk-notify';
    userId?: string;
    userEmail?: string;
    userType?: 'free' | 'downgraded';
  } | null>(null);
  
  // State for plan merchants
  const [planMerchants, setPlanMerchants] = useState<Record<string, any[]>>({});
  const [loadingMerchants, setLoadingMerchants] = useState<Record<string, boolean>>({});
  
  // Modal hooks
  const { isOpen: isConfirmModalOpen, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal();
  
  // RTK Query hooks
  const { data: plansResponse, isLoading: plansLoading } = useGetPlansQuery({ 
    status: 'ACTIVE',
    limit: 100 
  });
  const { data: statistics, isLoading: statsLoading } = useGetPlanStatisticsQuery();
  const { data: transactionsResponse } = useGetBillingTransactionsQuery({ limit: 100 });

  const plans = plansResponse?.data || [];
  const transactions = transactionsResponse?.data || [];

  // Create tabs for active plans + overview
  const overviewTab = {
    id: "overview",
    label: "Overview",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  };

  const planTabs = plans.map(plan => {
    const planStats = statistics?.plans.find(p => p.id === plan.id);
    const subscriberCount = planStats?.activeSubscribers || 0;
    
    return {
      id: plan.id,
      label: `${plan.name} (${subscriberCount})`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
  });

  const allTabs = [overviewTab, ...planTabs];

  const handleViewDetails = (userId: string) => {
    router.push(`/merchants/${userId}`);
  };

  const handleTogglePlan = (userId: string, userEmail: string, currentStatus: string) => {
    setSelectedAction({
      type: 'toggle',
      userId,
      userEmail
    });
    openConfirmModal();
  };

  const handleNotifyUser = (userId: string, userEmail: string) => {
    setSelectedAction({
      type: 'notify',
      userId,
      userEmail
    });
    openConfirmModal();
  };

  const handleBulkNotify = (userType: 'free' | 'downgraded') => {
    setSelectedAction({
      type: 'bulk-notify',
      userType
    });
    openConfirmModal();
  };

  const handleConfirmAction = async () => {
    if (!selectedAction) return;

    try {
      switch (selectedAction.type) {
        case 'notify':
          // TODO: Implement notification API call
          toast.success(`Notification sent to ${selectedAction.userEmail}`);
          break;
        case 'toggle':
          // TODO: Implement toggle plan API call
          toast.success(`Plan status updated for ${selectedAction.userEmail}`);
          break;
        case 'bulk-notify':
          // TODO: Implement bulk notification API call
          const userTypeLabel = selectedAction.userType === 'free' ? 'free plan' : 'downgraded';
          toast.success(`Bulk notification sent to all ${userTypeLabel} users`);
          break;
      }
      closeConfirmModal();
      setSelectedAction(null);
    } catch (error: any) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    }
  };

  // Function to load merchants for a specific plan
  const loadMerchantsForPlan = async (planId: string) => {
    if (loadingMerchants[planId] || planMerchants[planId]) return;

    setLoadingMerchants(prev => ({ ...prev, [planId]: true }));
    try {
      const response = await fetchMerchantsForPlan(planId, 1, 50);
      setPlanMerchants(prev => ({ ...prev, [planId]: response.data }));
    } catch (error) {
      console.error('Error loading merchants for plan:', error);
      toast.error('Failed to load merchants');
    } finally {
      setLoadingMerchants(prev => ({ ...prev, [planId]: false }));
    }
  };

  // Load merchants when tab changes to a plan tab
  React.useEffect(() => {
    if (activeTab !== "overview" && plans.find(p => p.id === activeTab)) {
      loadMerchantsForPlan(activeTab);
    }
  }, [activeTab, plans]);

  const handleAssignPlan = (userId: string) => {
    router.push(`/merchants/${userId}/change-plan`);
  };

  const getConfirmationContent = () => {
    if (!selectedAction) return { title: "", message: "", confirmText: "", variant: "primary" as const };

    switch (selectedAction.type) {
      case 'notify':
        return {
          title: "Send Notification",
          message: `Are you sure you want to send a notification to ${selectedAction.userEmail}?`,
          confirmText: "Send Notification",
          variant: "primary" as const
        };
      case 'toggle':
        return {
          title: "Toggle Plan Status",
          message: `Are you sure you want to toggle the plan status for ${selectedAction.userEmail}?`,
          confirmText: "Toggle Status",
          variant: "warning" as const
        };
      case 'bulk-notify':
        const userTypeLabel = selectedAction.userType === 'free' ? 'free plan' : 'downgraded';
        return {
          title: "Bulk Notification",
          message: `Are you sure you want to send notifications to all ${userTypeLabel} users?`,
          confirmText: "Send Bulk Notification",
          variant: "primary" as const
        };
      default:
        return { title: "", message: "", confirmText: "", variant: "primary" as const };
    }
  };

  const renderOverview = () => {
    if (plansLoading || statsLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-500 dark:text-gray-400">Loading statistics...</div>
          </div>
        </div>
      );
    }

    const totalSubscribers = statistics?.plans.reduce((sum, plan) => sum + plan.activeSubscribers, 0) || 0;
    const totalRevenue = statistics?.totalRevenue || 0;
    const totalPlans = plans.length;
    const activePlans = plans.filter(p => p.status === "ACTIVE").length;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalPlans}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Plans</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {activePlans}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Plans</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalSubscribers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Subscribers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ETB {totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
          </div>
        </div>

        {/* Plans Breakdown */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Plans Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Plan Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Subscribers
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Monthly Revenue
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {statistics?.plans.map((planStat) => {
                  const plan = plans.find(p => p.id === planStat.id);
                  if (!plan) return null;
                  
                  return (
                    <TableRow 
                      key={plan.id}
                      className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                    >
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {plan.name}
                          </div>
                          {plan.isPopular && (
                            <Badge color="info" size="sm">Popular</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.description}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {plan.price === 0 ? "Free" : `ETB ${plan.price.toLocaleString()}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          /{plan.billingCycle.toLowerCase()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {planStat.activeSubscribers.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          ETB {planStat.monthlyRevenue.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge 
                          color={plan.status === "ACTIVE" ? "success" : "secondary"} 
                          size="sm"
                        >
                          {plan.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Transaction ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Merchant
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Plan
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                  >
                    Date
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.slice(0, 5).map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {transaction.transactionId}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {transaction.merchant.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {transaction.plan.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {transaction.currency} {transaction.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  const renderPlanStats = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    const planStats = statistics?.plans.find(p => p.id === planId);
    
    if (!plan || !planStats) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">No data available for this plan</div>
          </div>
        </div>
      );
    }

    // Get transactions for this plan
    const planTransactions = transactions.filter(t => t.planId === planId);
    const avgTransactionAmount = planTransactions.length > 0 
      ? planTransactions.reduce((sum, t) => sum + t.amount, 0) / planTransactions.length
      : 0;

    return (
      <div className="space-y-6">
        {/* Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {planStats.activeSubscribers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Subscribers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ETB {planStats.monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {planTransactions.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ETB {Math.round(avgTransactionAmount).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Transaction</div>
          </div>
        </div>

        {/* Plan Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {plan.name} Plan Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Plan Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Price:</span>
                  <span className="text-gray-900 dark:text-white">
                    {plan.price === 0 ? "Free" : `ETB ${plan.price.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Billing Cycle:</span>
                  <span className="text-gray-900 dark:text-white">{plan.billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">API Limit:</span>
                  <span className="text-gray-900 dark:text-white">{plan.apiLimit}/min</span>
                </div>
                {plan.verificationLimit && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Verification Limit:</span>
                    <span className="text-gray-900 dark:text-white">{plan.verificationLimit.toLocaleString()}/month</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Features</h4>
              <div className="flex flex-wrap gap-1">
                {plan.features.map((feature, index) => (
                  <Badge key={index} color="secondary" size="sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions for this Plan */}
        {planTransactions.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent {plan.name} Transactions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                  <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Transaction ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Merchant
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {planTransactions.slice(0, 10).map((transaction) => (
                    <TableRow 
                      key={transaction.id}
                      className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                    >
                      <TableCell className="px-5 py-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          {transaction.transactionId}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.merchant.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.merchant.contactEmail || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.currency} {transaction.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge 
                          color={transaction.status === "VERIFIED" ? "success" : 
                                transaction.status === "PENDING" ? "warning" : "secondary"} 
                          size="sm"
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(transaction.merchantId)}
                            className="text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            View Merchant
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleNotifyUser(transaction.merchantId, transaction.merchant.contactEmail || '')}
                            className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                          >
                            <BellIcon className="w-4 h-4 mr-1" />
                            Notify
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Merchants on this Plan */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {plan.name} Plan Subscribers ({planStats.activeSubscribers})
            </h3>
            {plan.name === 'Free' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleBulkNotify('free')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
              >
                <BellIcon className="w-4 h-4 mr-1" />
                Notify All Free Users
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            {loadingMerchants[planId] ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Loading merchants...</div>
                </div>
              </div>
            ) : planMerchants[planId] && planMerchants[planId].length > 0 ? (
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                  <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Merchant
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Contact
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Subscription Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {planMerchants[planId].map((merchant) => (
                    <TableRow 
                      key={merchant.id}
                      className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                    >
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserCircleIcon className="w-8 h-8 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {merchant.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {merchant.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">
                            {merchant.contactEmail || "—"}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {merchant.contactPhone || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge 
                          color={merchant.subscriptionType === 'explicit' ? "success" : "secondary"} 
                          size="sm"
                        >
                          {merchant.subscriptionType === 'explicit' ? 'Explicit' : 'Default Free'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(merchant.subscription?.startDate || merchant.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge 
                          color={merchant.status === "ACTIVE" ? "success" : "secondary"} 
                          size="sm"
                        >
                          {merchant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(merchant.id)}
                            className="text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleNotifyUser(merchant.id, merchant.contactEmail || '')}
                            className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                          >
                            <BellIcon className="w-4 h-4 mr-1" />
                            Notify
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAssignPlan(merchant.id)}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
                          >
                            Change Plan
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  No merchants found for this plan
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (plansLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading plan statistics...</div>
        </div>
      </div>
    );
  }

  const confirmationContent = getConfirmationContent();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Plan Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor subscription plans and user activity
          </p>
        </div>
      </div>

      <Tabs 
        tabs={allTabs.map(tab => ({
          id: tab.id,
          label: tab.label,
          icon: tab.icon
        }))} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Tab Panels */}
      <TabPanel activeTab={activeTab} tabId="overview">
        {renderOverview()}
      </TabPanel>

      {plans.map(plan => (
        <TabPanel key={plan.id} activeTab={activeTab} tabId={plan.id}>
          {renderPlanStats(plan.id)}
        </TabPanel>
      ))}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmationContent.title}
        message={confirmationContent.message}
        confirmText={confirmationContent.confirmText}
        confirmVariant={confirmationContent.variant}
        isLoading={false}
      />
    </div>
  );
}