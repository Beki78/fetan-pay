"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PlanStatsTabs from "@/components/billing/PlanStatsTabs";

export default function PlanStatsPage() {
  return (
    <div>
      <PageBreadcrumb 
        pageTitle="Plan Statistics" 
      />
      
      <PlanStatsTabs />
    </div>
  );
}