"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { EyeIcon, EyeCloseIcon } from "@/icons";
import {
  MerchantUser,
  useCreateMerchantUserMutation,
  useUpdateMerchantUserMutation,
} from "@/lib/services/merchantUsersServiceApi";

interface UserForm {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  password?: string;
  confirmPassword?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user?: MerchantUser) => void;
  user?: MerchantUser | null;
  mode: "add" | "edit";
  merchantId: string | null;
}

const roles = [
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "SALES", label: "Sales" },
  { value: "WAITER", label: "Waiter" },
];

export default function UserModal({
  isOpen,
  onClose,
  onSave,
  user,
  mode,
  merchantId,
}: UserModalProps) {
  const [formData, setFormData] = useState<UserForm>({
    name: "",
    email: "",
    phone: "",
    role: roles[0].value,
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [createUser] = useCreateMerchantUserMutation();
  const [updateUser] = useUpdateMerchantUserMutation();

  useEffect(() => {
    if (user && mode === "edit") {
      setFormData({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || roles[0].value,
        password: "",
        confirmPassword: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: roles[0].value,
        password: "",
        confirmPassword: "",
      });
    }
    setErrors({});
    setSubmitError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [user, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (mode === "add") {
      if (!formData.password || formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!merchantId) {
      setSubmitError("Merchant ID unavailable. Reload and try again.");
      return;
    }

    setIsSaving(true);
    setSubmitError(null);
    try {
      if (mode === "edit") {
        if (!formData.id) {
          throw new Error("User id is missing");
        }

        const updated = await updateUser({
          merchantId,
          id: formData.id,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
        }).unwrap();
        onSave(updated);
      } else {
        const created = await createUser({
          merchantId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || "",
          role: formData.role,
        }).unwrap();
        onSave(created);
      }
      onClose();
    } catch (err) {
      console.error("Failed to create user", err);
      setSubmitError((err as Error)?.message || "Failed to create user");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {mode === "add" ? "Add New User" : "Edit User"}
          </h4>
          
        </div>
        {submitError && (
          <p className="px-2 text-sm text-error-500 mb-3">{submitError}</p>
        )}
        <form className="flex flex-col">
          <div className="custom-scrollbar max-h-[500px] overflow-y-auto px-2 pb-3">
            <div className="space-y-5">
              {/* Full Name and Email - Same Row */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>
                    Full Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    error={!!errors.email}
                    hint={errors.email}
                  />
                </div>
              </div>

              {/* Phone Number and Role - Same Row */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>
                    Phone Number <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    onChange={(value) => setFormData({ ...formData, role: value })}
                    options={roles.map((role) => ({ value: role.value, label: role.label }))}
                    error={!!errors.role}
                  />
                </div>
              </div>

              {/* Password and Confirm Password - Same Row (Only for Add Mode) */}
              {mode === "add" && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password || ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimum 8 characters"
                        error={!!errors.password}
                        hint={errors.password}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeCloseIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>
                      Confirm Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword || ""}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        error={!!errors.confirmPassword}
                        hint={errors.confirmPassword}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? (
                          <EyeCloseIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
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
              {isSaving ? "Saving..." : mode === "add" ? "Add User" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
