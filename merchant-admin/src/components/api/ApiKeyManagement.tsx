"use client";
import React, { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Button from "../ui/button/Button";
import ApiKeyCard from "./ApiKeyCard";
import GenerateKeyModal from "./GenerateKeyModal";
import RevokeKeyModal from "./RevokeKeyModal";
import EditKeyModal from "./EditKeyModal";
import { PlusIcon } from "@/icons";
import {
  useListApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  type ApiKey,
} from "@/lib/services/apiKeysServiceApi";
import { toast } from "sonner";

export default function ApiKeyManagement() {
  const { data: apiKeys = [], isLoading, refetch } = useListApiKeysQuery();
  const [createApiKey, { isLoading: isCreating }] = useCreateApiKeyMutation();
  const [revokeApiKey, { isLoading: isRevoking }] = useRevokeApiKeyMutation();

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const handleGenerateKey = async (name: string, expiresAt?: string, scopes?: string[]) => {
    try {
      const result = await createApiKey({
        name: name.trim(),
        expiresAt,
        scopes,
      }).unwrap();

      setNewlyCreatedKey(result.key);
      setIsGenerateModalOpen(false);
      toast.success("API key created successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create API key");
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await revokeApiKey(id).unwrap();
      toast.success("API key revoked successfully");
      setIsRevokeModalOpen(false);
      setSelectedKey(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to revoke API key");
    }
  };

  const handleEditKey = (apiKey: ApiKey) => {
    setSelectedKey(apiKey);
    setIsEditModalOpen(true);
  };

  const activeKeys = apiKeys.filter((key) => key.status === "ACTIVE");
  const canGenerateNew = true; // No limit in backend, but can be enforced here if needed

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading API keys...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            API Keys
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your API keys for programmatic access to FetanPay.
          </p>
        </div>
        <Button
          onClick={() => setIsGenerateModalOpen(true)}
          disabled={!canGenerateNew || isCreating}
          startIcon={<PlusIcon />}
          size="sm"
        >
          Generate New Key
        </Button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <ApiKeyCard
            key={apiKey.id}
            apiKey={apiKey}
            onRevoke={(id) => {
              setSelectedKey(apiKeys.find((k) => k.id === id) || null);
              setIsRevokeModalOpen(true);
            }}
            onEdit={handleEditKey}
          />
        ))}
      </div>

      {apiKeys.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No API keys found. Generate your first key to get started.
          </p>
        </div>
      )}

      <GenerateKeyModal
        isOpen={isGenerateModalOpen}
        onClose={() => {
          setIsGenerateModalOpen(false);
          setNewlyCreatedKey(null);
        }}
        onGenerate={handleGenerateKey}
        newlyCreatedKey={newlyCreatedKey}
        onKeyCopied={() => setNewlyCreatedKey(null)}
      />

      <RevokeKeyModal
        isOpen={isRevokeModalOpen}
        onClose={() => {
          setIsRevokeModalOpen(false);
          setSelectedKey(null);
        }}
        onConfirm={() => selectedKey && handleRevokeKey(selectedKey.id)}
        apiKeyName={selectedKey?.name || ""}
        isLoading={isRevoking}
      />

      <EditKeyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedKey(null);
        }}
        apiKey={selectedKey}
      />
    </div>
  );
}
