"use client";
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTable from "@/components/users/UserTable";
import UserModal from "@/components/users/UserModal";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";

interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: "Active" | "Inactive" | "Pending";
  paymentVerified: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const handleView = (user: User) => {
    // Navigate to user detail page
    router.push(`/users/${user.id}`);
  };

  const handleSave = (user: User) => {
    if (selectedUser && selectedUser.id) {
      // Edit mode
      console.log("Updating user:", user);
    } else {
      // Add mode
      console.log("Adding user:", user);
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      console.log("Deleting user:", userToDelete);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="User Management" />
      <div className="space-y-6">
        <ComponentCard
          title="Users & Team Members"
          desc="Create and manage accounts for your employees, sales staff, and team members. Verify their payment access and monitor activity."
        >
          <div className="space-y-4">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  All Users
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  View and manage all user accounts in your system
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleAdd}
                startIcon={
                  <PlusIcon className="w-4 h-4" />
                }
              >
                Add User
              </Button>
            </div>

            {/* User Table */}
            <UserTable
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>
        </ComponentCard>
      </div>

      {/* Add User Modal */}
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        mode="add"
      />

      {/* Edit User Modal */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSave}
        user={selectedUser}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        className="max-w-[400px] m-4"
      >
        <div className="p-6">
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            Confirm Deletion
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
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

