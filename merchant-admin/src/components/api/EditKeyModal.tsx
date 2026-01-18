"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import type { ApiKey } from "@/lib/services/apiKeysServiceApi";

interface EditKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: ApiKey | null;
}

export default function EditKeyModal({ isOpen, onClose, apiKey }: EditKeyModalProps) {
  if (!apiKey) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5 lg:p-6">
      <h4 className="font-semibold text-gray-800 mb-2 text-title-sm dark:text-white/90">
        API Key Details
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        View details for your API key.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <Label>Key Name</Label>
          <Input value={apiKey.name} readOnly />
        </div>
        <div>
          <Label>Key Prefix</Label>
          <Input value={apiKey.keyPrefix} readOnly className="font-mono" />
        </div>
        <div>
          <Label>Status</Label>
          <Input value={apiKey.status} readOnly />
        </div>
        {apiKey.expiresAt && (
          <div>
            <Label>Expires At</Label>
            <Input
              value={new Date(apiKey.expiresAt).toLocaleString()}
              readOnly
            />
          </div>
        )}
        {apiKey.lastUsedAt && (
          <div>
            <Label>Last Used</Label>
            <Input
              value={new Date(apiKey.lastUsedAt).toLocaleString()}
              readOnly
            />
          </div>
        )}
        {apiKey.scopes && apiKey.scopes.length > 0 && (
          <div>
            <Label>Scopes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {apiKey.scopes.map((scope) => (
                <span
                  key={scope}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-info-200 bg-info-50 p-4 dark:border-info-800 dark:bg-info-900/20 mb-6">
        <p className="text-sm text-info-800 dark:text-info-300">
          <strong>Note:</strong> API key names cannot be edited. To change the name, revoke this key
          and create a new one.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onClose} type="button">
          Close
        </Button>
      </div>
    </Modal>
  );
}
