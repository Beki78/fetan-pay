"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  status: "Active" | "Revoked";
  usageStats: {
    totalCalls: number;
    successCalls: number;
    failedCalls: number;
  };
}

interface EditKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  apiKey: ApiKey | null;
}

export default function EditKeyModal({ isOpen, onClose, onSave, apiKey }: EditKeyModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (apiKey) {
      setName(apiKey.name);
    }
  }, [apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5 lg:p-6">
      <h4 className="font-semibold text-gray-800 mb-2 text-title-sm dark:text-white/90">
        Edit API Key Name
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Update the name for your API key to make it easier to identify.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label>
            Key Name <span className="text-error-500">*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Production Key, Development Key"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={!name.trim()}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

