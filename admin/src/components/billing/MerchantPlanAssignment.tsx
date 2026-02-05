"use client";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Badge from "../ui/badge/Badge";
import { 
  CloseIcon, 
  UserCircleIcon, 
  CheckCircleIcon,
  CalenderIcon 
} from "@/icons";

interface MerchantPlanAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  merchant?: {
    id: string;
    name: string;
    email: string;
    currentPlan: string;
    status: string;
  };
  onAssignPlan: (assignment: any) => void;
}

const availablePlans = [
  { id: "free", name: "Free", price: 0 },
  { id: "starter", name: "Starter", price: 1740 },
  { id: "business", name: "Business", price: 11940 },
  { id: "custom", name: "Custom", price: 0 }
];

export default function MerchantPlanAssignment({
  isOpen,
  onClose,
  merchant,
  onAssignPlan,
}: MerchantPlanAssignmentProps) {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [durationType, setDurationType] = useState<"permanent" | "specific" | "trial">("permanent");
  const [endDate, setEndDate] = useState("");
  const [trialDays, setTrialDays] = useState("30");
  const [adminNotes, setAdminNotes] = useState("");
  const [provideFreeAccess, setProvideFreeAccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assignment = {
      merchantId: merchant?.id,
      planId: selectedPlan,
      durationType,
      endDate: durationType === "specific" ? endDate : null,
      trialDays: durationType === "trial" ? parseInt(trialDays) : null,
      adminNotes,
      provideFreeAccess,
      assignedAt: new Date().toISOString(),
      assignedBy: "Admin User" // This would come from auth context
    };

    onAssignPlan(assignment);
    
    // Reset form
    setSelectedPlan("");
    setDurationType("permanent");
    setEndDate("");
    setTrialDays("30");
    setAdminNotes("");
    setProvideFreeAccess(false);
  };

  if (!merchant) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl mx-4">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Assign Plan to Merchant
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Merchant Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full">
              <UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {merchant.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {merchant.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Current Plan:
                </span>
                <Badge color="info" size="sm">
                  {merchant.currentPlan}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Plan *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {plan.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.price === 0 && plan.id !== "free" 
                          ? "Custom Pricing" 
                          : `ETB ${plan.price.toLocaleString()}/month`
                        }
                      </div>
                    </div>
                    {selectedPlan === plan.id && (
                      <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Assignment Duration *
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="permanent"
                  name="durationType"
                  value="permanent"
                  checked={durationType === "permanent"}
                  onChange={(e) => setDurationType(e.target.value as any)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="permanent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Permanent Assignment
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="specific"
                  name="durationType"
                  value="specific"
                  checked={durationType === "specific"}
                  onChange={(e) => setDurationType(e.target.value as any)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="specific" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Specific End Date
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="trial"
                  name="durationType"
                  value="trial"
                  checked={durationType === "trial"}
                  onChange={(e) => setDurationType(e.target.value as any)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="trial" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Trial Period
                </label>
              </div>
            </div>
          </div>

          {/* Conditional Duration Fields */}
          {durationType === "specific" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {durationType === "trial" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trial Duration (Days) *
              </label>
              <Input
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                placeholder="30"
                min="1"
                max="365"
                required
              />
            </div>
          )}

          {/* Free Access Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="provideFreeAccess"
              checked={provideFreeAccess}
              onChange={(e) => setProvideFreeAccess(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="provideFreeAccess" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Provide free access (no billing required)
            </label>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Admin Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Optional notes about this plan assignment..."
            />
          </div>

          {/* Assignment Summary */}
          {selectedPlan && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Assignment Summary
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <div>
                  <strong>Plan:</strong> {availablePlans.find(p => p.id === selectedPlan)?.name}
                </div>
                <div>
                  <strong>Duration:</strong> {
                    durationType === "permanent" ? "Permanent" :
                    durationType === "specific" ? `Until ${endDate}` :
                    `${trialDays} days trial`
                  }
                </div>
                <div>
                  <strong>Billing:</strong> {provideFreeAccess ? "Free (Admin Override)" : "Standard Billing"}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedPlan}>
              Assign Plan
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}