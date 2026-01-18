"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { CopyIcon, CheckCircleIcon } from "@/icons";
import { toast } from "sonner";

interface GenerateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name: string, expiresAt?: string, scopes?: string[]) => void;
  newlyCreatedKey?: string | null;
  onKeyCopied: () => void;
}

export default function GenerateKeyModal({
  isOpen,
  onClose,
  onGenerate,
  newlyCreatedKey,
  onKeyCopied,
}: GenerateKeyModalProps) {
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setExpiresAt("");
      setCopied(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onGenerate(name.trim(), expiresAt || undefined);
    }
  };

  const handleCopyKey = () => {
    if (newlyCreatedKey) {
      navigator.clipboard.writeText(newlyCreatedKey);
      setCopied(true);
      toast.success("API key copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        onKeyCopied();
      }, 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-5 lg:p-6">
      {!newlyCreatedKey ? (
        <>
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

            <div className="mb-6">
              <Label>Expiration Date (Optional)</Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty for no expiration
              </p>
            </div>

            <div className="rounded-xl border border-info-200 bg-info-50 p-4 dark:border-info-800 dark:bg-info-900/20 mb-6">
              <p className="text-sm text-info-800 dark:text-info-300">
                <strong>Important:</strong> Make sure to copy your API key immediately after
                generation. You won&apos;t be able to see it again.
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
        </>
      ) : (
        <>
          <div className="flex items-start gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl dark:bg-success-900/20 flex-shrink-0">
              <CheckCircleIcon className="text-success-600 size-6 dark:text-success-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-2 text-title-sm dark:text-white/90">
                API Key Generated Successfully
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your API key has been created. Copy it now - you won&apos;t be able to see it
                again!
              </p>
            </div>
          </div>

          <div className="mb-6">
            <Label>Your API Key</Label>
            <div className="relative">
              <Input
                type="text"
                value={newlyCreatedKey}
                readOnly
                className="pr-20 font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyKey}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <CopyIcon className="w-4 h-4 mr-1" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20 mb-6">
            <p className="text-sm text-error-800 dark:text-error-300">
              <strong>Warning:</strong> Store this key securely. It will not be shown again. If you
              lose it, you&apos;ll need to generate a new key.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
