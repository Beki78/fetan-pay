"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { Tabs, TabPanel } from "../common/Tabs";
import { ConfirmationModal } from "../ui/modal/ConfirmationModal";
import { useModal } from "@/hooks/useModal";
import { 
  PlusIcon, 
  PencilIcon, 
  GridIcon,
  ListIcon
} from "@/icons";
import PlanComparison from "./PlanComparison";
import { toast } from "sonner";
import { 
  useGetPlansQuery, 
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useGetPlanStatisticsQuery,
  type Plan,
  type PlanStatus 
} from "@/lib/redux/features/pricingApi";

export default function PlanManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [actionType, setActionType] = useState<"delete" | "toggle" | null>(null);
  
  // Modal hooks
  const { isOpen: isConfirmModalOpen, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal();
  
  // RTK Query hooks
  const { data: plansResponse, isLoading, error, refetch } = useGetPlansQuery({ limit: 100 });
  const { data: statistics } = useGetPlanStatisticsQuery();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

  const plans = plansResponse?.data || [];

  const tabs = [
    {
      id: "overview",
      label: "Plans Overview",
      icon: <GridIcon />,
    },
    {
      id: "comparison",
      label: "Plan Comparison",
      icon: <ListIcon />,
    }
  ];

  const handleTogglePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setActionType("toggle");
    openConfirmModal();
  };

  const handleDeletePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setActionType("delete");
    openConfirmModal();
  };

  const handleConfirmAction = async () => {
    if (!selectedPlan || !actionType) return;

    try {
      if (actionType === "toggle") {
        const newStatus: PlanStatus = selectedPlan.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        await updatePlan({
          id: selectedPlan.id,
          data: { status: newStatus }
        }).unwrap();
        toast.success(`Plan ${newStatus === "ACTIVE" ? "enabled" : "disabled"} successfully`);
      } else if (actionType === "delete") {
        await deletePlan(selectedPlan.id).unwrap();
        toast.success("Plan deleted successfully");
      }
      closeConfirmModal();
      setSelectedPlan(null);
      setActionType(null);
    } catch (error: any) {
      console.error(`Error ${actionType}ing plan:`, error);
      toast.error(error?.data?.message || `Failed to ${actionType} plan`);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    router.push(`/plans/edit/${plan.id}`);
  };

  const handleCreatePlan = () => {
    router.push("/plans/create");
  };

  const getConfirmationContent = () => {
    if (!selectedPlan || !actionType) return { title: "", message: "", confirmText: "", variant: "primary" as const };

    if (actionType === "delete") {
      return {
        title: "Delete Plan",
        message: `Are you sure you want to delete "${selectedPlan.name}"? This action cannot be undone and will affect any merchants currently subscribed to this plan.`,
        confirmText: "Delete Plan",
        variant: "danger" as const
      };
    } else {
      const newStatus = selectedPlan.status === "ACTIVE" ? "disabled" : "enabled";
      return {
        title: `${newStatus === "enabled" ? "Enable" : "Disable"} Plan`,
        message: `Are you sure you want to ${newStatus === "enabled" ? "enable" : "disable"} "${selectedPlan.name}"? This will ${newStatus === "enabled" ? "make it available" : "hide it"} from merchants.`,
        confirmText: `${newStatus === "enabled" ? "Enable" : "Disable"} Plan`,
        variant: "primary" as const
      };
    }
  };

  // Calculate statistics
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.status === "ACTIVE").length;
  const totalActiveSubscribers = statistics?.plans.reduce((sum, plan) => sum + plan.activeSubscribers, 0) || 0;
  const totalMonthlyRevenue = statistics?.totalRevenue || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const confirmationContent = getConfirmationContent();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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
            {totalActiveSubscribers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Subscribers</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ETB {totalMonthlyRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Manage Plans
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, edit, and configure pricing plans for your merchants
          </p>
        </div>
        <Button onClick={handleCreatePlan}>
          <PlusIcon className=" mr-2" />
          Create New Plan
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Panels */}
      <TabPanel activeTab={activeTab} tabId="overview">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const planStats = statistics?.plans.find(p => p.id === plan.id);
            const activeSubscribers = planStats?.activeSubscribers || 0;
            const monthlyRevenue = planStats?.monthlyRevenue || 0;
            
            return (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 ${
                  plan.status === "ACTIVE"
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' 
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 opacity-75'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      {plan.isPopular && (
                        <Badge color="info" size="sm">Most Popular</Badge>
                      )}
                      <Badge 
                        color={plan.status === "ACTIVE" ? "success" : "secondary"} 
                        size="sm"
                      >
                        {plan.status === "ACTIVE" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.price === 0 && plan.name !== "Free" ? "Custom" : `ETB ${plan.price.toLocaleString()}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          /{plan.billingCycle.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <PencilIcon className="" />
                    </Button>
                    <Button
                      variant={plan.status === "ACTIVE" ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleTogglePlan(plan)}
                    >
                      {plan.status === "ACTIVE" ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlan(plan)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeSubscribers.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Active Subscribers
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ETB {monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Monthly Revenue
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Key Features:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} color="secondary" size="sm">
                        {feature}
                      </Badge>
                    ))}
                    {plan.features.length > 3 && (
                      <Badge color="secondary" size="sm">
                        +{plan.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="comparison">
        <PlanComparison />
      </TabPanel>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmationContent.title}
        message={confirmationContent.message}
        confirmText={confirmationContent.confirmText}
        confirmVariant={confirmationContent.variant}
        isLoading={isUpdating || isDeleting}
      />
    </div>
  );
}