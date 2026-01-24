"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useUpdateWebhookMutation } from "@/lib/services/webhooksServiceApi";
import { toast } from "sonner";
import type { Webhook } from "@/lib/services/webhooksServiceApi";

interface EditWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhook: Webhook | null;
  onSuccess: () => void;
}

const AVAILABLE_EVENTS = [
  "payment.verified",
  "payment.unverified",
  "payment.duplicate",
  "wallet.charged",
  "wallet.insufficient",
];

export default function EditWebhookModal({
  isOpen,
  onClose,
  webhook,
  onSuccess,
}: EditWebhookModalProps) {
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED" | "FAILED">("ACTIVE");
  const [updateWebhook, { isLoading }] = useUpdateWebhookMutation();

  useEffect(() => {
    if (webhook) {
      setUrl(webhook.url);
      setSelectedEvents(webhook.events);
      setStatus(webhook.status);
    }
  }, [webhook]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhook || !url.trim() || selectedEvents.length === 0) return;

    try {
      await updateWebhook({
        id: webhook.id,
        data: {
          url: url.trim(),
          events: selectedEvents,
          status,
        },
      }).unwrap();

      toast.success("Webhook updated successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update webhook");
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  if (!webhook) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-5 lg:p-6">
      <h4 className="font-semibold text-gray-800 mb-2 text-title-sm dark:text-white/90">
        Edit Webhook
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Update your webhook configuration.
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
        </div>

        <div className="mb-6">
          <Label>
            Status <span className="text-error-500">*</span>
          </Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "ACTIVE" | "PAUSED" | "FAILED")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          >
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="FAILED">Failed</option>
          </select>
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

        <div className="flex items-center justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            size="sm"
            type="submit"
            disabled={!url.trim() || selectedEvents.length === 0 || isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

