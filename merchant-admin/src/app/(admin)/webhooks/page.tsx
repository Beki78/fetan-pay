"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import MerchantApprovalStatus from "@/components/common/MerchantApprovalStatus";
import {
  CheckCircleIcon,
  AlertIcon,
  InfoIcon,
  EyeIcon,
  EyeCloseIcon,
  CopyIcon,
} from "@/icons";
import RegenerateSecretModal from "@/components/webhooks/RegenerateSecretModal";
import IPWhitelistManager from "@/components/webhooks/IPWhitelistManager";
import {
  useListWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useGetDeliveryLogsQuery,
  useTestWebhookMutation,
  useRegenerateSecretMutation,
} from "@/lib/services/webhooksServiceApi";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { toast } from "sonner";

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

export default function WebhooksPage() {
  // All hooks must be called at the top level, before any early returns
  const { status: accountStatus, isLoading: isStatusLoading } = useAccountStatus();
  const { data: webhooks = [], isLoading, refetch } = useListWebhooksQuery();
  const [createWebhook, { isLoading: isCreating }] = useCreateWebhookMutation();
  const [updateWebhook, { isLoading: isUpdating }] = useUpdateWebhookMutation();
  const [testWebhook, { isLoading: isTesting }] = useTestWebhookMutation();
  const [regenerateSecret, { isLoading: isRegenerating }] = useRegenerateSecretMutation();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "payment.verified",
    "payment.unverified",
  ]);

  // Get the first webhook or use empty state
  const currentWebhook = webhooks.length > 0 ? webhooks[0] : null;

  // Get delivery stats - must be called before early returns
  const { data: deliveries = [], refetch: refetchDeliveries } = useGetDeliveryLogsQuery(
    { webhookId: currentWebhook?.id || "", limit: 100 },
    { skip: !currentWebhook?.id }
  );

  // Check localStorage for stored secret - must be called before early returns
  useEffect(() => {
    if (currentWebhook) {
      setWebhookUrl(currentWebhook.url);
      setSelectedEvents(currentWebhook.events);
      
      // Check if we have a stored secret for this webhook
      const storedSecret = localStorage.getItem(`fetanpay_webhook_secret_${currentWebhook.id}`);
      if (storedSecret) {
        setWebhookSecret(storedSecret);
      } else {
        // We can't get the secret back, so show masked version
        setWebhookSecret("••••••••••••••••••••••••••••••••");
      }
    } else {
      setWebhookUrl("");
      setWebhookSecret("");
    }
  }, [currentWebhook]);

  // Show loading spinner while checking account status
  if (isStatusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show approval status if merchant is not approved
  if (accountStatus === "pending") {
    return <MerchantApprovalStatus />;
  }

  const handleCopy = () => {
    // Only copy if we have the actual secret (not masked)
    if (webhookSecret && !webhookSecret.includes("•••")) {
      navigator.clipboard.writeText(webhookSecret);
      setCopied(true);
      toast.success("Webhook secret copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.info("Secret is only shown on creation or regeneration");
    }
  };

  const handleSaveUrl = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }

    try {
      if (currentWebhook) {
        // Update existing webhook
        await updateWebhook({
          id: currentWebhook.id,
          data: {
            url: webhookUrl.trim(),
            events: selectedEvents,
          },
        }).unwrap();
        toast.success("Webhook URL updated successfully. You can now test it!");
      } else {
        // Create new webhook
        const result = await createWebhook({
          url: webhookUrl.trim(),
          events: selectedEvents,
        }).unwrap();
        setWebhookSecret(result.secret);
        // Store in localStorage
        localStorage.setItem(`fetanpay_webhook_secret_${result.id}`, result.secret);
        toast.success("Webhook created successfully! Copy the secret now, then test your endpoint.");
      }
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save webhook");
    }
  };

  const handleRegenerateSecret = async () => {
    if (!currentWebhook) {
      toast.error("Please create a webhook first");
      return;
    }

    try {
      const result = await regenerateSecret(currentWebhook.id).unwrap();
      setWebhookSecret(result.secret);
      // Store in localStorage
      localStorage.setItem(`fetanpay_webhook_secret_${currentWebhook.id}`, result.secret);
      setIsRegenerateModalOpen(false);
      toast.success("Webhook secret regenerated! Copy the new secret now.");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to regenerate secret");
      setIsRegenerateModalOpen(false);
    }
  };

  const handleTest = async () => {
    if (!currentWebhook) {
      toast.error("Please create a webhook first");
      return;
    }

    if (!webhookUrl.trim()) {
      toast.error("Please set a webhook URL first");
      return;
    }

    try {
      await testWebhook(currentWebhook.id).unwrap();
      toast.success(
        "Test webhook sent successfully! Check your endpoint to verify it was received or check the history on the deliveries section",
        {
          duration: 5000,
        }
      );
      
      // Refetch both webhooks and deliveries to update the UI immediately
      refetch();
      
      // Add a small delay to ensure the delivery is processed, then refetch deliveries
      setTimeout(() => {
        refetchDeliveries();
      }, 500);
      
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to send test webhook. Check your endpoint URL and try again.",
        {
          duration: 5000,
        }
      );
    }
  };

  const successCount = deliveries.filter((d) => d.status === "SUCCESS").length;
  const failureCount = deliveries.filter((d) => d.status === "FAILED").length;

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Webhooks" />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading webhooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <PageBreadcrumb pageTitle="Webhooks" />
        {/* <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Webhooks
        </h1> */}
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Configure webhook notifications for payment events
        </p>
      </div>

      {/* Webhook Endpoint Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Webhook Endpoint
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            We&apos;ll send POST requests to this URL when payment events occur
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Webhook URL
            </label>
            <Input
              type="url"
              placeholder="https://your-domain.com/webhooks/fetanpay"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={handleSaveUrl}
              disabled={isCreating || isUpdating}
              className="bg-purple-500 hover:bg-purple-600 text-white border-0"
            >
              {isCreating || isUpdating ? "Saving..." : "Save URL"}
            </Button>
            {currentWebhook && (
              <Button
                size="sm"
                onClick={handleTest}
                disabled={isTesting}
                className="bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                {isTesting ? "Sending..." : "Send Test"}
              </Button>
            )}
          </div>
          {currentWebhook && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              After saving your URL, click &quot;Send Test&quot; to verify your webhook endpoint is
              working correctly.
            </p>
          )}
        </div>
      </div>

      {/* Webhook Secret Section */}
      {currentWebhook && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Webhook Secret
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Use this secret to verify webhook signatures
            </p>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showSecret && webhookSecret && !webhookSecret.includes("•••") ? "text" : "password"}
                value={webhookSecret}
                readOnly
                className="w-full pr-12 font-mono"
              />
              {webhookSecret && !webhookSecret.includes("•••") && (
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  type="button"
                >
                  {showSecret ? (
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
                onClick={() => setIsRegenerateModalOpen(true)}
                disabled={isRegenerating}
                className="bg-red-500 hover:bg-red-600 text-white border-0"
              >
                Regenerate
              </Button>
              <Button
                size="sm"
                onClick={handleTest}
                disabled={isTesting || !currentWebhook}
                className="bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                {isTesting ? "Sending..." : "Send Test"}
              </Button>
            </div>
            {!currentWebhook && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Secret will be shown after creating the webhook
              </p>
            )}
          </div>
        </div>
      )}

      {/* IP Address Whitelisting Section */}
      <IPWhitelistManager />

      {/* Recent Deliveries Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Recent Deliveries
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Webhook delivery history for your account
            </p>
          </div>
          {currentWebhook && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {successCount} delivered
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {failureCount} failed
                </span>
              </div>
            </div>
          )}
        </div>
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
              No webhook deliveries yet
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Webhooks will appear here when payments are verified
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {deliveries.slice(0, 10).map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      delivery.status === "SUCCESS"
                        ? "bg-green-500"
                        : delivery.status === "FAILED"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {delivery.event}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(delivery.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {delivery.statusCode && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {delivery.statusCode}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook Events Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Webhook Events
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Events that trigger webhook notifications
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Payment Verified Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                payment.verified
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Triggered when a payment is successfully verified
            </p>
          </div>

          {/* Payment Unverified Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                payment.unverified
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Triggered when payment verification fails
            </p>
          </div>

          {/* Payment Duplicate Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                payment.duplicate
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Triggered when a duplicate payment is detected
            </p>
          </div>

          {/* Wallet Charged Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <InfoIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                wallet.charged
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Triggered when wallet is charged for verification fee
            </p>
          </div>

          {/* Wallet Insufficient Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <AlertIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                wallet.insufficient
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Triggered when wallet has insufficient balance
            </p>
          </div>

          {/* Test Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                test
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Sent when you click &quot;Send Test&quot; to verify your endpoint
            </p>
          </div>
        </div>
      </div>

      {/* Payload Example Section */}
      {/* <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Payload Example
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Sample webhook payload structure
          </p>
        </div>
        <CodeBlock
          code={`{
  "id": "evt_1234567890",
  "type": "payment.verified",
  "created": 1640995200,
  "data": {
    "payment": {
      "id": "pay_123",
      "reference": "FT26017MLDG7755415774",
      "provider": "CBE",
      "amount": 1000.00,
      "status": "VERIFIED",
      "verifiedAt": "2025-01-15T10:30:00Z"
    },
    "merchant": {
      "id": "merchant_123",
      "name": "Coffee Shop"
    }
  }
}`}
          language="json"
        />
      </div> */}

      {/* Headers Sent Section */}
      {/* <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Headers Sent
          </h2>
        </div>
        <CodeBlock
          code={`X-FetanPay-Signature: <HMAC-SHA256 signature>
X-FetanPay-Event: payment.verified
X-FetanPay-Delivery-Id: <delivery-id>
Content-Type: application/json`}
        />
      </div> */}

      {/* Signature Verification Section */}
      {/* <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Signature Verification
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Verify the webhook signature using the X-FetanPay-Signature header:
          </p>
        </div>
        <CodeBlock
          code={`// PHP Example
$payload = file_get_contents('php://input');
$signature = hash_hmac('sha256', $payload, $webhook_secret);
$valid = hash_equals($signature, $_SERVER['HTTP_X_FETANPAY_SIGNATURE']);

if (!$valid) {
    http_response_code(401);
    exit('Invalid signature');
}

$data = json_decode($payload, true);
// Process the webhook...`}
          language="php"
        />
      </div> */}

      {/* Best Practices Section */}
      {/* <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Best Practices
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Always verify the signature before processing
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Return a 2xx status code quickly to acknowledge receipt
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Process webhooks asynchronously if needed
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Handle duplicate events idempotently using payment reference
            </p>
          </div>
        </div>
      </div> */}

      {/* Regenerate Secret Modal */}
      <RegenerateSecretModal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        onConfirm={handleRegenerateSecret}
        isLoading={isRegenerating}
      />
    </div>
  );
}
