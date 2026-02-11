"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { CheckCircleIcon, AlertIcon, InfoIcon, EyeIcon, EyeCloseIcon, CopyIcon } from "@/icons";

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
          className="px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
          type="button"
        >
          <CopyIcon className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-sm text-gray-300 font-mono overflow-x-auto select-all cursor-text">
        <code className="select-text">{code}</code>
      </pre>
    </div>
  );
}

export default function WebhooksPage() {
  const [webhookUrl, setWebhookUrl] = useState("https://your-domain.com/webhooks/FetanPay");
  const [webhookSecret, setWebhookSecret] = useState("coPuSAjD••••••••••••••••NL7v");
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateSecret = () => {
    // Generate new secret logic
    const newSecret = "coPuSAjD" + "•".repeat(20) + "NL7v";
    setWebhookSecret(newSecret);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          Webhooks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure webhook notifications for payment events
        </p>
      </div>

      {/* Webhook Endpoint Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            Webhook Endpoint
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We&apos;ll send POST requests to this URL when payment events occur
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">
              Webhook URL
            </label>
            <Input
              type="url"
              placeholder="https://your-domain.com/webhooks/FetanPay"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white border-0"
          >
            Save URL
          </Button>
        </div>
      </div>

      {/* Webhook Secret Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            Webhook Secret
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use this secret to verify webhook signatures
          </p>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <Input
              type={showSecret ? "text" : "password"}
              value={webhookSecret}
              readOnly
              className="w-full pr-12"
            />
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              type="button"
            >
              {showSecret ? (
                <EyeCloseIcon className="" />
              ) : (
                <EyeIcon className="" />
              )}
            </button>
          </div>
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(webhookSecret)}
              className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20"
            >
              <CopyIcon className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              size="sm"
              onClick={handleRegenerateSecret}
              className="bg-orange-500 hover:bg-orange-600 text-white border-0"
            >
              Regenerate
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Deliveries Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              Recent Deliveries
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Webhook delivery history for your account
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">0 delivered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">0 failed</span>
            </div>
          </div>
        </div>
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
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
            No webhook deliveries yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Webhooks will appear here when payments are verified
          </p>
        </div>
      </div>

      {/* Webhook Events Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            Webhook Events
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Events that trigger webhook notifications
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Payment Verified Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircleIcon className=" text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                payment.verified
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Triggered when a payment is successfully verified
            </p>
          </div>

          {/* Payment Failed Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertIcon className=" text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                payment.failed
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Triggered when payment verification fails
            </p>
          </div>

          {/* Test Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <InfoIcon className=" text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
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
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            Payload Example
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sample webhook payload structure
          </p>
        </div>
        <div className="rounded-lg bg-gray-900 dark:bg-black p-4 overflow-x-auto relative">
          <CodeBlock
            code={`{
  "event": "payment.verified",
  "payment_intent_id": "TXN_abc123xyz",
  "amount": 500.00,
  "reference": "FT25346B61Q5",
  "status": "verified",
  "verified_at": "2025-12-13T14:30:00Z",
  "merchant_id": 1,
  "timestamp": "2025-12-13T14:30:05Z"
}`}
            language="json"
          />
        </div>
      </div>

      {/* Headers Sent Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            Headers Sent
          </h2>
        </div>
        <div className="rounded-lg bg-gray-900 dark:bg-black p-4 overflow-x-auto relative">
          <CodeBlock
            code={`X-FetanPay-Signature: <HMAC-SHA256 signature>
X-FetanPay-Event: payment.verified
Content-Type: application/json`}
          />
        </div>
      </div>

      {/* Signature Verification Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            Signature Verification
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verify the webhook signature using the X-FetanPay-Signature header:
          </p>
        </div>
        <div className="rounded-lg bg-gray-900 dark:bg-black p-4 overflow-x-auto relative">
          <CodeBlock
            code={`// PHP Example
$payload = file_get_contents('php://input');
$signature = hash_hmac('sha256', $payload, $webhook_secret);
$valid = hash_equals($signature, $_SERVER['HTTP_X_FetanPay_SIGNATURE']);

if (!$valid) {
    http_response_code(401);
    exit('Invalid signature');
}

$data = json_decode($payload, true);
// Process the webhook...`}
            language="php"
          />
        </div>
      </div>

      {/* Best Practices Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            Best Practices
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className=" text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Always verify the signature before processing
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className=" text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Return a 2xx status code quickly to acknowledge receipt
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className=" text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Process webhooks asynchronously if needed
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className=" text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Handle duplicate events idempotently using payment_intent_id
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

