"use client";

import React, { useState, useMemo } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import {
  useGetPricingReceiversQuery,
  useCreatePricingReceiverMutation,
  useUpdatePricingReceiverMutation,
  useDeletePricingReceiverMutation,
  type TransactionProvider,
  type PricingReceiverStatus,
  type PricingReceiverAccount,
} from "@/lib/redux/features/pricingApi";

const PROVIDER_OPTIONS: Array<{ code: TransactionProvider; name: string }> = [
  { code: "CBE", name: "Commercial Bank of Ethiopia" },
  { code: "TELEBIRR", name: "Telebirr" },
  { code: "AWASH", name: "Awash Bank" },
  { code: "BOA", name: "Bank of Abyssinia" },
  { code: "DASHEN", name: "Dashen Bank" },
];

const STATUS_OPTIONS: PricingReceiverStatus[] = ["ACTIVE", "INACTIVE"];

export default function PricingReceiversPage() {
  const { data: receivers, isLoading, error } = useGetPricingReceiversQuery();
  const [createReceiver, { isLoading: isCreating }] = useCreatePricingReceiverMutation();
  const [updateReceiver, { isLoading: isUpdating }] = useUpdatePricingReceiverMutation();
  const [deleteReceiver, { isLoading: isDeleting }] = useDeletePricingReceiverMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [provider, setProvider] = useState<TransactionProvider>("CBE");
  const [receiverAccount, setReceiverAccount] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverLabel, setReceiverLabel] = useState("");
  const [status, setStatus] = useState<PricingReceiverStatus>("ACTIVE");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const anyErr = error as any;
    return anyErr?.data?.message ?? "Failed to load pricing receivers";
  }, [error]);

  const resetForm = () => {
    setEditingId(null);
    setProvider("CBE");
    setReceiverAccount("");
    setReceiverName("");
    setReceiverLabel("");
    setStatus("ACTIVE");
  };

  const handleEdit = (receiver: PricingReceiverAccount) => {
    setEditingId(receiver.id);
    setProvider(receiver.provider);
    setReceiverAccount(receiver.receiverAccount);
    setReceiverName(receiver.receiverName || "");
    setReceiverLabel(receiver.receiverLabel || "");
    setStatus(receiver.status);
  };

  const handleSubmit = async () => {
    if (!receiverAccount.trim() || !receiverName.trim()) {
      setMessage({ type: "error", text: "Account number and name are required" });
      return;
    }

    setMessage(null);
    try {
      const data = {
        provider,
        receiverAccount: receiverAccount.trim(),
        receiverName: receiverName.trim(),
        receiverLabel: receiverLabel.trim() || undefined,
        status,
      };

      if (editingId) {
        await updateReceiver({ id: editingId, data }).unwrap();
        setMessage({ type: "success", text: "Pricing receiver updated successfully" });
      } else {
        await createReceiver(data).unwrap();
        setMessage({ type: "success", text: "Pricing receiver created successfully" });
      }
      resetForm();
    } catch (e: any) {
      setMessage({ type: "error", text: e?.data?.message ?? "Failed to save pricing receiver" });
    }
  };

  const handleDelete = async (id: string) => {
    setMessage(null);
    try {
      await deleteReceiver(id).unwrap();
      setMessage({ type: "success", text: "Pricing receiver deleted successfully" });
      setDeleteConfirmId(null);
    } catch (e: any) {
      setMessage({ type: "error", text: e?.data?.message ?? "Failed to delete pricing receiver" });
    }
  };

  const statusBadge = (s: PricingReceiverStatus) => {
    return s === "ACTIVE" ? (
      <Badge variant="light" color="success">
        Active
      </Badge>
    ) : (
      <Badge variant="light" color="warning">
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          Pricing Receivers
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure accounts where merchants send money for plan subscriptions. Merchants will see these accounts when they upgrade their plans.
        </p>
      </div>

      {errorMessage && <Alert variant="error" title="Error" message={errorMessage} />}
      {message && (
        <Alert
          variant={message.type === "success" ? "success" : "error"}
          title={message.type === "success" ? "Success" : "Error"}
          message={message.text}
        />
      )}

      {/* Create/Update form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {editingId ? "Update Pricing Receiver" : "Add Pricing Receiver"}
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as TransactionProvider)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              {PROVIDER_OPTIONS.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PricingReceiverStatus)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Account Number <span className="text-error-500">*</span>
            </label>
            <Input
              value={receiverAccount}
              onChange={(e) => setReceiverAccount(e.target.value)}
              placeholder="e.g., 1000675169601"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Account Name <span className="text-error-500">*</span>
            </label>
            <Input
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="e.g., MIKYAS MULAT ASMARE"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Label (Optional)
            </label>
            <Input
              value={receiverLabel}
              onChange={(e) => setReceiverLabel(e.target.value)}
              placeholder="e.g., FetanPay Pricing - CBE"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Optional label to help identify this receiver account
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          {editingId && (
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isCreating || isUpdating}
              className="border-gray-300 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isCreating || isUpdating || !receiverAccount.trim() || !receiverName.trim()}
            className="whitespace-nowrap"
          >
            {isCreating || isUpdating
              ? "Saving…"
              : editingId
              ? "Update Receiver"
              : "Add Receiver"}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Configured Receivers
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          These accounts will be visible to merchants for plan subscriptions.
        </p>

        <div className="bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden border-0">
          {isLoading ? (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">Loading…</div>
          ) : receivers && receivers.length > 0 ? (
            receivers.map((receiver, idx) => (
              <div
                key={receiver.id}
                className={`px-4 py-4 ${
                  idx !== receivers.length - 1
                    ? "border-b border-gray-200 dark:border-gray-700"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                          {PROVIDER_OPTIONS.find((p) => p.code === receiver.provider)?.name ||
                            receiver.provider}
                        </h3>
                        {statusBadge(receiver.status)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Account: <span className="font-mono">{receiver.receiverAccount}</span>
                        {receiver.receiverName && (
                          <>
                            {" · "}
                            Name: {receiver.receiverName}
                          </>
                        )}
                        {receiver.receiverLabel && (
                          <>
                            {" · "}
                            Label: {receiver.receiverLabel}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(receiver)}
                      disabled={isDeleting}
                      className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setDeleteConfirmId(receiver.id)}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600 text-white border-0 px-3 py-1.5 text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
              No pricing receivers configured yet.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Pricing Receiver
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete this pricing receiver? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="border-gray-300 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white border-0"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}