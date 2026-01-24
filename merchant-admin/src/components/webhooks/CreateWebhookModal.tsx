"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { CopyIcon, CheckCircleIcon } from "@/icons";
import { useCreateWebhookMutation } from "@/lib/services/webhooksServiceApi";
import { toast } from "sonner";

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (webhook: { id: string; secret: string }) => void;
  newlyCreatedWebhook?: { id: string; secret: string } | null;
  onSecretCopied: () => void;
}

const AVAILABLE_EVENTS = [
  "payment.verified",
  "payment.unverified",
  "payment.duplicate",
  "wallet.charged",
  "wallet.insufficient",
];

export default function CreateWebhookModal({
  isOpen,
  onClose,
  onSuccess,
  newlyCreatedWebhook,
  onSecretCopied,
}: CreateWebhookModalProps) {
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["payment.verified"]);
  const [copied, setCopied] = useState(false);
  const [createWebhook, { isLoading }] = useCreateWebhookMutation();

  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setSelectedEvents(["payment.verified"]);
      setCopied(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || selectedEvents.length === 0) return;

    try {
      const result = await createWebhook({
        url: url.trim(),
        events: selectedEvents,
      }).unwrap();

      onSuccess({ id: result.id, secret: result.secret });
      toast.success("Webhook created successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create webhook");
    }
  };

  const handleCopySecret = () => {
    if (newlyCreatedWebhook?.secret) {
      navigator.clipboard.writeText(newlyCreatedWebhook.secret);
      setCopied(true);
      toast.success("Webhook secret copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        onSecretCopied();
      }, 2000);
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-5 lg:p-6">
      {!newlyCreatedWebhook ? (
        <>
          <h4 className="font-semibold text-gray-800 mb-2 text-title-sm dark:text-white/90">
            Create New Webhook
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Configure a webhook endpoint to receive real-time payment notifications.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <Label>
                Webhook URL <span className="text-error-500">*</span>
              </Label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-domain.com/webhooks/fetanpay"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be HTTPS. We&apos;ll send POST requests to this URL.
              </p>
            </div>

            <div className="mb-6">
              <Label>
                Events <span className="text-error-500">*</span>
              </Label>
              <div className="space-y-2 mt-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <label
                    key={event}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-800 dark:text-white/90">{event}</span>
                  </label>
                ))}
              </div>
              {selectedEvents.length === 0 && (
                <p className="text-xs text-error-500 mt-1">Select at least one event</p>
              )}
            </div>

            <div className="rounded-xl border border-info-200 bg-info-50 p-4 dark:border-info-800 dark:bg-info-900/20 mb-6">
              <p className="text-sm text-info-800 dark:text-info-300">
                <strong>Important:</strong> Make sure to copy your webhook secret immediately after
                creation. You won&apos;t be able to see it again.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button size="sm" variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={!url.trim() || selectedEvents.length === 0 || isLoading}
              >
                {isLoading ? "Creating..." : "Create Webhook"}
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
                Webhook Created Successfully
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your webhook has been created. Copy the secret now - you won&apos;t be able to see
                it again!
              </p>
            </div>
          </div>

          <div className="mb-6">
            <Label>Webhook Secret</Label>
            <div className="relative">
              <Input
                type="text"
                value={newlyCreatedWebhook.secret}
                readOnly
                className="pr-20 font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopySecret}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <CopyIcon className="w-4 h-4 mr-1" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20 mb-6">
            <p className="text-sm text-error-800 dark:text-error-300">
              <strong>Warning:</strong> Store this secret securely. It will not be shown again. Use
              this secret to verify webhook signatures.
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

