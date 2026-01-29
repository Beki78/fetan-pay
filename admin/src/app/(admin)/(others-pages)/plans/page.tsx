"use client";
import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import PlanManagement from "@/components/billing/PlanManagement";

const PlansPage = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Plans Management" />
      <ComponentCard
        title="Pricing Plans"
        desc="Create, edit, and manage pricing plans for merchants"
      >
        <PlanManagement />
      </ComponentCard>
    </div>
  );
};

export default PlansPage;
