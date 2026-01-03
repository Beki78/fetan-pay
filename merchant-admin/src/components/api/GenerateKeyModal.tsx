"use client";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface GenerateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name: string) => void;
}

export default function GenerateKeyModal({ isOpen, onClose, onGenerate }: GenerateKeyModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onGenerate(name.trim());
      setName("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5 lg:p-6">
      <h4 className="font-semibold text-gray-800 mb-2 text-title-sm dark:text-white/90">
        Generate New API Key
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Give your API key a descriptive name to help you identify it later.
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

        <div className="rounded-xl border border-info-200 bg-info-50 p-4 dark:border-info-800 dark:bg-info-900/20 mb-6">
          <p className="text-sm text-info-800 dark:text-info-300">
            <strong>Important:</strong> Make sure to copy your API key immediately after generation. You won't be able to see it again.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={!name.trim()}>
            Generate Key
          </Button>
        </div>
      </form>
    </Modal>
  );
}

