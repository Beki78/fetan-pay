"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import VendorTable from "@/components/vendors/VendorTable";
import VendorModal from "@/components/vendors/VendorModal";
import MerchantApprovalStatus from "@/components/common/MerchantApprovalStatus";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { useAccountStatus } from "@/hooks/useAccountStatus";

interface Vendor {
  id?: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  team: string;
  status: "Active" | "Inactive";
}

export default function VendorsPage() {
  const { status: accountStatus, isLoading: isStatusLoading } = useAccountStatus();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

  // Show loading spinner while checking account status
  if (isStatusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show approval status if merchant is not approved
  if (accountStatus === "pending") {
    return <MerchantApprovalStatus />;
  }

  const handleAdd = () => {
    setSelectedVendor(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditModalOpen(true);
  };

  const handleDelete = (vendorId: string) => {
    setVendorToDelete(vendorId);
    setIsDeleteModalOpen(true);
  };

  const handleView = (vendor: Vendor) => {
    // Navigate to vendor detail page or show details modal
    console.log("View vendor:", vendor);
    // You can implement a detail modal or navigate to detail page
  };

  const handleSave = (vendor: Vendor) => {
    if (selectedVendor && selectedVendor.id) {
      // Edit mode
      console.log("Updating vendor:", vendor);
    } else {
      // Add mode
      console.log("Adding vendor:", vendor);
    }
  };

  const handleConfirmDelete = () => {
    if (vendorToDelete) {
      console.log("Deleting vendor:", vendorToDelete);
      setIsDeleteModalOpen(false);
      setVendorToDelete(null);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Vendor Management" />
      <div className="space-y-6">
        <ComponentCard
          title="Vendors"
          desc="Manage your vendor accounts, assign branches and teams, and monitor activity"
        >
          <div className="space-y-4">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  All Vendors
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  View and manage all vendor accounts in your system
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleAdd}
                startIcon={
                  <PlusIcon className="w-4 h-4" />
                }
              >
                Add Vendor
              </Button>
            </div>

            {/* Vendor Table */}
            <VendorTable
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>
        </ComponentCard>
      </div>

      {/* Add Vendor Modal */}
      <VendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        mode="add"
      />

      {/* Edit Vendor Modal */}
      <VendorModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVendor(null);
        }}
        onSave={handleSave}
        vendor={selectedVendor}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setVendorToDelete(null);
        }}
        className="max-w-[400px] m-4"
      >
        <div className="p-6">
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            Confirm Deletion
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this vendor? This action cannot be
            undone.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setVendorToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-error-500 hover:bg-error-600"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

