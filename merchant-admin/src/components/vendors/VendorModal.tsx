"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";

interface Vendor {
  id?: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  team: string;
  status: "Active" | "Inactive";
}

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendor: Vendor) => void;
  vendor?: Vendor | null;
  mode: "add" | "edit";
}

const branches = [
  "Addis Ababa Main",
  "Dire Dawa Branch",
  "Hawassa Branch",
  "Mekelle Branch",
];

const teams = ["Sales Team A", "Sales Team B", "Sales Team C", "Support Team"];

export default function VendorModal({
  isOpen,
  onClose,
  onSave,
  vendor,
  mode,
}: VendorModalProps) {
  const [formData, setFormData] = useState<Vendor>({
    name: "",
    email: "",
    phone: "",
    branch: branches[0],
    team: teams[0],
    status: "Active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (vendor && mode === "edit") {
      setFormData(vendor);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        branch: branches[0],
        team: teams[0],
        status: "Active",
      });
    }
    setErrors({});
  }, [vendor, mode, isOpen]);

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

    if (!formData.branch) {
      newErrors.branch = "Branch is required";
    }

    if (!formData.team) {
      newErrors.team = "Team is required";
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
            {mode === "add" ? "Add New Vendor" : "Edit Vendor"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {mode === "add"
              ? "Fill in the information to create a new vendor account."
              : "Update the vendor information below."}
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
                  placeholder="Enter vendor name"
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
                  placeholder="vendor@example.com"
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
                  Branch <span className="text-error-500">*</span>
                </Label>
                <Select
                  value={formData.branch}
                  onChange={(value) =>
                    setFormData({ ...formData, branch: value })
                  }
                  options={branches.map((branch) => ({
                    value: branch,
                    label: branch,
                  }))}
                  error={!!errors.branch}
                />
              </div>

              <div>
                <Label>
                  Team <span className="text-error-500">*</span>
                </Label>
                <Select
                  value={formData.team}
                  onChange={(value) =>
                    setFormData({ ...formData, team: value })
                  }
                  options={teams.map((team) => ({
                    value: team,
                    label: team,
                  }))}
                  error={!!errors.team}
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
                      status: value as "Active" | "Inactive",
                    })
                  }
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                />
              </div>
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
                ? "Add Vendor"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

