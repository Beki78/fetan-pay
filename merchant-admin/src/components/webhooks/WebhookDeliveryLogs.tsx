"use client";
import React from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Badge, { BadgeColor } from "../ui/badge/Badge";
import { useGetDeliveryLogsQuery, useRetryDeliveryMutation } from "@/lib/services/webhooksServiceApi";
import { toast } from "sonner";

interface WebhookDeliveryLogsProps {
  isOpen: boolean;
  onClose: () => void;
  webhookId?: string;
}

export default function WebhookDeliveryLogs({
  isOpen,
  onClose,
  webhookId,
}: WebhookDeliveryLogsProps) {
  const { data: deliveries = [], isLoading, refetch } = useGetDeliveryLogsQuery(
    { webhookId: webhookId || "", limit: 50 },
    { skip: !webhookId || !isOpen }
  );
  const [retryDelivery, { isLoading: isRetrying }] = useRetryDeliveryMutation();

  const handleRetry = async (deliveryId: string) => {
    if (!webhookId) return;

    try {
      await retryDelivery({ webhookId, deliveryId }).unwrap();
      toast.success("Delivery retry initiated");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to retry delivery");
    }
  };

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case "SUCCESS":
        return "success";
      case "FAILED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "light";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[900px] p-5 lg:p-6">
      <h4 className="font-semibold text-gray-800 mb-2 text-title-sm dark:text-white/90">
        Webhook Delivery Logs
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        View delivery history and retry failed deliveries.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading logs...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No delivery logs found.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color={getStatusColor(delivery.status)}>{delivery.status}</Badge>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {delivery.event}
                    </span>
                    {delivery.statusCode && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Status: {delivery.statusCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {formatDate(delivery.createdAt)}
                  </p>
                  {delivery.deliveredAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Delivered: {formatDate(delivery.deliveredAt)}
                    </p>
                  )}
                  {delivery.errorMessage && (
                    <p className="text-xs text-error-600 dark:text-error-400 mt-1">
                      Error: {delivery.errorMessage}
                    </p>
                  )}
                </div>
                {delivery.status === "FAILED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRetry(delivery.id)}
                    disabled={isRetrying}
                  >
                    {isRetrying ? "Retrying..." : "Retry"}
                  </Button>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Attempt: {delivery.attemptNumber}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 mt-6">
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

