"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BillingTransactionsTable from "@/components/billing/BillingTransactionsTable";

export default function PlansTransactionsPage() {
  return (
    <div>
      <PageBreadcrumb 
        pageTitle="Plan Transactions" 
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Plan Transactions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all billing transactions for merchant plans
            </p>
          </div>
        </div>

        <ComponentCard
          title="Billing Transactions"
          desc="Complete history of plan subscriptions and payments"
        >
          <BillingTransactionsTable />
        </ComponentCard>
      </div>
    </div>
  );
}