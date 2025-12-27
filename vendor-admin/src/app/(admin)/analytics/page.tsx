"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TransactionMetrics from "@/components/analytics/TransactionMetrics";
import RevenueTrendChart from "@/components/analytics/RevenueTrendChart";
import ConfirmationChart from "@/components/analytics/ConfirmationChart";
import VendorPerformanceChart from "@/components/analytics/VendorPerformanceChart";
import PaymentMethodChart from "@/components/analytics/PaymentMethodChart";

export default function AnalyticsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Analytics & Reporting" />
      <div className="space-y-6">
        {/* Transaction Metrics */}
        <TransactionMetrics />

        {/* Charts Grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Revenue Trends - Full Width */}
          <div className="col-span-12">
            <RevenueTrendChart />
          </div>

          {/* Confirmation Chart */}
          <div className="col-span-12 lg:col-span-6">
            <ConfirmationChart />
          </div>

          {/* Payment Method Chart */}
          <div className="col-span-12 lg:col-span-6">
            <PaymentMethodChart />
          </div>

          {/* Vendor Performance - Full Width */}
          <div className="col-span-12">
            <VendorPerformanceChart />
          </div>
        </div>
      </div>
    </div>
  );
}

