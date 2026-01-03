"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";

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

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user?: User | null;
  mode: "add" | "edit";
}

const roles = [
  "Sales Representative",
  "Waiter",
  "Cashier",
  "Manager",
  "Supervisor",
  "Employee",
];

const departments = [
  "Sales",
  "Service",
  "Finance",
  "Operations",
  "Management",
  "Support",
];

export default function UserModal({
  isOpen,
  onClose,
  onSave,
  user,
  mode,
}: UserModalProps) {
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    phone: "",
    role: roles[0],
    department: departments[0],
    status: "Pending",
    paymentVerified: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && mode === "edit") {
      setFormData(user);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: roles[0],
        department: departments[0],
        status: "Pending",
        paymentVerified: false,
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    // Mock API call
    setTimeout(() => {
      setIsSaving(false);
      onSave(formData);
      onClose();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {mode === "add" ? "Add New User" : "Edit User"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {mode === "add"
              ? "Create an account for an employee or team member. They can verify their payment access after account creation."
              : "Update the user information below."}
          </p>
        </div>
        <form className="flex flex-col">
          <div className="custom-scrollbar max-h-[500px] overflow-y-auto px-2 pb-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Label>
                  Full Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter user name"
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>

              <div>
                <Label>
                  Email Address <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  error={!!errors.email}
                  hint={errors.email}
                />
              </div>

              <div>
                <Label>
                  Phone Number <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+251 911 234 567"
                  error={!!errors.phone}
                  hint={errors.phone}
                />
              </div>

              <div>
                <Label>
                  Role <span className="text-error-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  options={roles.map((role) => ({
                    value: role,
                    label: role,
                  }))}
                  error={!!errors.role}
                />
              </div>

              <div>
                <Label>
                  Department <span className="text-error-500">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                  options={departments.map((dept) => ({
                    value: dept,
                    label: dept,
                  }))}
                  error={!!errors.department}
                />
              </div>

              <div>
                <Label>
                  Status <span className="text-error-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as "Active" | "Inactive" | "Pending",
                    })
                  }
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                    { value: "Pending", label: "Pending" },
                  ]}
                />
              </div>

              {mode === "edit" && (
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <input
                      type="checkbox"
                      id="paymentVerified"
                      checked={formData.paymentVerified}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentVerified: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    <Label htmlFor="paymentVerified" className="mb-0 cursor-pointer">
                      Payment Verified
                    </Label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Check this if the user has verified their payment access
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : mode === "add"
                ? "Add User"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

