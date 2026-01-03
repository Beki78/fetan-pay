"use client";
import React, { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Button from "../ui/button/Button";
import ApiKeyCard from "./ApiKeyCard";
import GenerateKeyModal from "./GenerateKeyModal";
import RevokeKeyModal from "./RevokeKeyModal";
import EditKeyModal from "./EditKeyModal";
import { PlusIcon } from "@/icons";

// Mock data
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

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production Key",
    key: "kif_live_sk_1234567890abcdefghijklmnopqrstuvwxyz",
    createdAt: "2024-01-01T10:00:00Z",
    lastUsed: "2024-01-15T14:30:00Z",
    status: "Active",
    usageStats: {
      totalCalls: 12450,
      successCalls: 12300,
      failedCalls: 150,
    },
  },
  {
    id: "2",
    name: "Development Key",
    key: "kif_test_sk_9876543210zyxwvutsrqponmlkjihgfedcba",
    createdAt: "2024-01-05T09:15:00Z",
    lastUsed: "2024-01-14T16:20:00Z",
    status: "Active",
    usageStats: {
      totalCalls: 3450,
      successCalls: 3400,
      failedCalls: 50,
    },
  },
];

export default function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);

  const handleGenerateKey = (name: string) => {
    // Mock: Generate new key
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name,
      key: `kif_live_sk_${Math.random().toString(36).substring(2, 38)}`,
      createdAt: new Date().toISOString(),
      status: "Active",
      usageStats: {
        totalCalls: 0,
        successCalls: 0,
        failedCalls: 0,
      },
    };
    setApiKeys([...apiKeys, newKey]);
    setIsGenerateModalOpen(false);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.map((key) => (key.id === id ? { ...key, status: "Revoked" as const } : key)));
    setIsRevokeModalOpen(false);
    setSelectedKey(null);
  };

  const handleRotateKey = (id: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === id
          ? {
              ...key,
              key: `kif_live_sk_${Math.random().toString(36).substring(2, 38)}`,
              lastUsed: undefined,
            }
          : key
      )
    );
  };

  const handleEditKey = (apiKey: ApiKey) => {
    setSelectedKey(apiKey);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (id: string, name: string) => {
    setApiKeys(apiKeys.map((key) => (key.id === id ? { ...key, name } : key)));
    setIsEditModalOpen(false);
    setSelectedKey(null);
  };

  const activeKeys = apiKeys.filter((key) => key.status === "Active");
  const canGenerateNew = activeKeys.length < 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            API Keys
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your API keys. You can have up to 2 active keys at a time.
          </p>
        </div>
        <Button
          onClick={() => setIsGenerateModalOpen(true)}
          disabled={!canGenerateNew}
          startIcon={<PlusIcon />}
          size="sm"
        >
          Generate New Key
        </Button>
      </div>

      {!canGenerateNew && (
        <div className="rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
          <p className="text-sm text-warning-800 dark:text-warning-300">
            You have reached the maximum limit of 2 active API keys. Revoke an existing key to generate a new one.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <ApiKeyCard
            key={apiKey.id}
            apiKey={apiKey}
            onRevoke={(id) => {
              setSelectedKey(apiKeys.find((k) => k.id === id) || null);
              setIsRevokeModalOpen(true);
            }}
            onRotate={handleRotateKey}
            onEdit={handleEditKey}
          />
        ))}
      </div>

      {apiKeys.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No API keys found. Generate your first key to get started.</p>
        </div>
      )}

      <GenerateKeyModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateKey}
      />

      <RevokeKeyModal
        isOpen={isRevokeModalOpen}
        onClose={() => {
          setIsRevokeModalOpen(false);
          setSelectedKey(null);
        }}
        onConfirm={() => selectedKey && handleRevokeKey(selectedKey.id)}
        apiKeyName={selectedKey?.name || ""}
      />

      <EditKeyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedKey(null);
        }}
        onSave={(name) => selectedKey && handleSaveEdit(selectedKey.id, name)}
        apiKey={selectedKey}
      />
    </div>
  );
}

