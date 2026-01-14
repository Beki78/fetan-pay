"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AdminRoleGuard from "@/components/auth/AdminRoleGuard";
import BreathingLogoLoader from "@/components/ui/loading/BreathingLogoLoader";
import { useSession } from "@/hooks/useSession";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isLoading } = useSession();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <BreathingLogoLoader size={100} />
      </div>
    );
  }

  return (
    <AdminRoleGuard>
      <div className="min-h-screen flex">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="p-4 w-full md:p-6 overflow-x-hidden">{children}</div>
        </div>
      </div>
    </AdminRoleGuard>
  );
}
