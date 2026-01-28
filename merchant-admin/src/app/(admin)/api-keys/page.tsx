"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { EyeIcon, EyeCloseIcon, CopyIcon, AlertIcon, InfoIcon } from "@/icons";
import {
  useListApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} from "@/lib/services/apiKeysServiceApi";
import { toast } from "sonner";
import GenerateKeyModal from "@/components/api/GenerateKeyModal";
import RevokeKeyModal from "@/components/api/RevokeKeyModal";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
          type="button"
        >
          <CopyIcon className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-sm text-gray-200 font-mono overflow-x-auto select-all cursor-text bg-gray-900 dark:bg-black p-4 rounded-lg">
        <code className="select-text">{code}</code>
      </pre>
    </div>
  );
}

export default function ApiKeysPage() {
  const { data: apiKeys = [], isLoading, refetch } = useListApiKeysQuery();
  const [createApiKey, { isLoading: isCreating }] = useCreateApiKeyMutation();
  const [revokeApiKey, { isLoading: isRevoking }] = useRevokeApiKeyMutation();

  // Get the first active API key
  const currentApiKey = apiKeys.find((key) => key.status === "ACTIVE") || apiKeys[0] || null;

  const [apiKeyValue, setApiKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Store newly created key in localStorage so we can show it
  useEffect(() => {
    const storedKey = localStorage.getItem("fetanpay_new_api_key");
    if (storedKey) {
      // Check if we have a current key and if the stored key matches
      if (currentApiKey && storedKey.startsWith(currentApiKey.keyPrefix)) {
        setNewlyCreatedKey(storedKey);
        setApiKeyValue(storedKey);
      } else if (!currentApiKey) {
        // No current key, but we have a stored one (shouldn't happen, but handle it)
        setNewlyCreatedKey(storedKey);
        setApiKeyValue(storedKey);
      }
    } else if (currentApiKey && !newlyCreatedKey) {
      // Show masked version for existing key
      setApiKeyValue(`${currentApiKey.keyPrefix}••••••••••••••••••••••••••••••••`);
    } else if (!currentApiKey) {
      setApiKeyValue("");
    }
  }, [currentApiKey, newlyCreatedKey]);

  const handleCopy = () => {
    // If we have a newly created key, copy that
    if (newlyCreatedKey) {
      navigator.clipboard.writeText(newlyCreatedKey);
      setCopied(true);
      toast.success("API key copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else if (currentApiKey) {
      // For existing keys, we can only copy the prefix
      navigator.clipboard.writeText(currentApiKey.keyPrefix);
      setCopied(true);
      toast.info("Key prefix copied. Full key is only shown on creation.");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("No API key available");
    }
  };

  const handleRegenerate = () => {
    if (currentApiKey) {
      // Show confirmation modal for regenerating existing key
      setIsRevokeModalOpen(true);
    } else {
      // No key exists, just create a new one
      setIsGenerateModalOpen(true);
    }
  };

  const handleGenerateKey = async (name: string, expiresAt?: string, scopes?: string[]) => {
    try {
      // If there's an existing key, revoke it first
      if (currentApiKey) {
        await revokeApiKey(currentApiKey.id).unwrap();
      }

      const result = await createApiKey({
        name: name.trim() || "API Key",
        expiresAt,
        scopes,
      }).unwrap();

      setNewlyCreatedKey(result.key);
      setApiKeyValue(result.key);
      // Store in localStorage as backup
      localStorage.setItem("fetanpay_new_api_key", result.key);
      setIsGenerateModalOpen(false);
      toast.success("API key created successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create API key");
    }
  };

  const handleRevokeAndRegenerate = async () => {
    if (!currentApiKey) return;

    try {
      await revokeApiKey(currentApiKey.id).unwrap();
      toast.success("Old key revoked. Creating new key...");
      
      // Create new key immediately
      const result = await createApiKey({
        name: "API Key",
      }).unwrap();

      setNewlyCreatedKey(result.key);
      setApiKeyValue(result.key);
      localStorage.setItem("fetanpay_new_api_key", result.key);
      setIsRevokeModalOpen(false);
      toast.success("New API key created successfully! Copy it now.");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to regenerate API key");
      setIsRevokeModalOpen(false);
    }
  };

  const maskKey = (key: string) => {
    if (!key || key.includes("•••")) return key;
    if (key.length <= 8) return "•".repeat(key.length);
    return key.substring(0, 8) + "•".repeat(Math.max(0, key.length - 16)) + key.substring(key.length - 8);
  };

  // Determine what to display
  const getDisplayKey = () => {
    if (newlyCreatedKey) {
      // Show full key if revealed, masked if hidden
      return showKey ? newlyCreatedKey : maskKey(newlyCreatedKey);
    } else if (currentApiKey) {
      // For existing keys, always show masked version
      return `${currentApiKey.keyPrefix}••••••••••••••••••••••••••••••••`;
    }
    return "";
  };

  const displayKey = getDisplayKey();

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="API Keys" />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
    <div>
        <PageBreadcrumb pageTitle="API Keys" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          API Keys
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Manage your API credentials for integration
        </p>
      </div>

      {/* Your API Key Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Your API Key
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Use this key to authenticate API requests
          </p>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <Input
              type={showKey && newlyCreatedKey ? "text" : "password"}
              value={displayKey}
              readOnly
              className="w-full pr-12 font-mono"
            />
            {newlyCreatedKey && (
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                type="button"
              >
                {showKey ? (
                  <EyeCloseIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20"
            >
              <CopyIcon className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              size="sm"
              onClick={handleRegenerate}
              disabled={isRevoking || isCreating}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              {isRevoking || isCreating ? "Regenerating..." : "Regenerate"}
            </Button>
          </div>
          {currentApiKey && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Created: {new Date(currentApiKey.createdAt).toLocaleString()}
            </p>
          )}
          {!currentApiKey && (
            <div className="rounded-lg border border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20 p-3">
              <p className="text-sm text-warning-800 dark:text-warning-300">
                No API key found. Click &quot;Regenerate&quot; to create your first API key.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* API Usage Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            API Usage
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            How to use your API key
          </p>
        </div>

        {/* Authentication Header */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Header
          </h3>
          <CodeBlock
            code={`Authorization: Bearer ${displayKey.includes("•••") ? displayKey : maskKey(displayKey)}`}
          />
        </div>

        {/* Verify Payment Example */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Verify Payment
          </h3>
          <CodeBlock
            code={`POST /api/v1/payments/verify
Content-Type: application/json
Authorization: Bearer ${displayKey.includes("•••") ? displayKey : maskKey(displayKey)}

{
  "provider": "CBE",
  "reference": "FT26017MLDG7755415774",
  "claimedAmount": 1000.00,
  "tipAmount": 50.0
}`}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Replace the masked key with your actual API key in the Authorization header.
          </p>
        </div>

        {/* Get Verification History Example */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Get Verification History
          </h3>
          <CodeBlock
            code={`GET /api/v1/payments/verification-history?page=1&pageSize=10
Authorization: Bearer ${displayKey.includes("•••") ? displayKey : maskKey(displayKey)}`}
          />
        </div>

        {/* Get Active Receiver Accounts Example */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Get Active Receiver Accounts
          </h3>
          <CodeBlock
            code={`GET /api/v1/payments/receiver-accounts/active
Authorization: Bearer ${displayKey.includes("•••") ? displayKey : maskKey(displayKey)}

# Or for specific provider:
GET /api/v1/payments/receiver-accounts/active?provider=CBE
Authorization: Bearer ${displayKey.includes("•••") ? displayKey : maskKey(displayKey)}`}
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="rounded-xl border border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20 p-6">
        <div className="flex items-start gap-3">
          <AlertIcon className="w-5 h-5 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-warning-800 dark:text-warning-300 mb-1">
              Security Notice
            </h3>
            <p className="text-sm text-warning-800 dark:text-warning-300">
              Keep your API key secure and never share it publicly. If you believe your key has been
              compromised, regenerate it immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Rate Limiting Information */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-6">
        <div className="flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Rate Limiting
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
              API requests are rate-limited to prevent abuse:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• <strong>10 requests per minute</strong> per API key</li>
              <li>• Rate limit resets every 60 seconds</li>
              <li>• HTTP 429 status code returned when limit exceeded</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GenerateKeyModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateKey}
        newlyCreatedKey={newlyCreatedKey}
        onKeyCopied={() => {
          setNewlyCreatedKey(null);
          localStorage.removeItem("fetanpay_new_api_key");
        }}
      />

      <RevokeKeyModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        onConfirm={handleRevokeAndRegenerate}
        apiKeyName={currentApiKey?.name || "API Key"}
        isLoading={isRevoking || isCreating}
        isRegenerating={true}
      />
    </div>
  );
}
