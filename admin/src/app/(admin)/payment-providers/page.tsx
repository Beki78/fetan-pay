"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import {
  useDeletePaymentProviderMutation,
  useGetPaymentProvidersQuery,
  useUpsertPaymentProviderMutation,
  type ProviderCode,
  type ProviderStatus,
} from "@/lib/services/paymentProvidersServiceApi";

const CODE_OPTIONS: Array<{ code: ProviderCode; name: string; defaultLogo: string }> = [
  { code: "CBE", name: "Commercial Bank of Ethiopia", defaultLogo: "CBE.png" },
  { code: "TELEBIRR", name: "Telebirr", defaultLogo: "Telebirr.png" },
  { code: "AWASH", name: "Awash Bank", defaultLogo: "Awash.png" },
  { code: "BOA", name: "Bank of Abyssinia", defaultLogo: "BOA.png" },
  { code: "DASHEN", name: "Dashen Bank", defaultLogo: "" },
  { code: "AMHARA", name: "Amhara Bank", defaultLogo: "Amhara.png" },
  { code: "BIRHAN", name: "Birhan Bank", defaultLogo: "Birhan.png" },
  { code: "CBEBIRR", name: "CBE Birr", defaultLogo: "CBEBIRR.png" },
  { code: "COOP", name: "Cooperative Bank of Oromia", defaultLogo: "COOP.png" },
  { code: "ENAT", name: "Enat Bank", defaultLogo: "Enat.jpg" },
  { code: "GADDA", name: "Gadda Bank", defaultLogo: "Gadda.png" },
  { code: "HIBRET", name: "Hibret Bank", defaultLogo: "Hibret.jpg" },
  { code: "WEGAGEN", name: "Wegagen Bank", defaultLogo: "Wegagen.png" },
];

const STATUS_OPTIONS: ProviderStatus[] = ["ACTIVE", "COMING_SOON", "DISABLED"];

export default function AdminPaymentProvidersPage() {
  const { data, isLoading, error } = useGetPaymentProvidersQuery();
  const [upsert, { isLoading: isSaving }] = useUpsertPaymentProviderMutation();
  const [remove, { isLoading: isDeleting }] = useDeletePaymentProviderMutation();

  const providers = data?.providers ?? [];

  const [code, setCode] = useState<ProviderCode>("CBE");
  const [name, setName] = useState<string>("Commercial Bank of Ethiopia");
  const [status, setStatus] = useState<ProviderStatus>("ACTIVE");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const anyErr = error as any;
    return anyErr?.data?.message ?? "Failed to load providers";
  }, [error]);

  const handlePickCode = (next: ProviderCode) => {
    setCode(next);
    const preset = CODE_OPTIONS.find((x) => x.code === next);
    if (preset) {
      setName(preset.name);
    }
  };

  const handleCreateOrUpdate = async () => {
    setMessage(null);
    try {
      const preset = CODE_OPTIONS.find((x) => x.code === code);
      const logoKey = preset?.defaultLogo || "";
      
      await upsert({
        code,
        name: name.trim(),
        status,
        ...(logoKey.trim() ? { logoKey: logoKey.trim() } : {}),
      }).unwrap();
      setMessage({ type: "success", text: "Provider saved" });
    } catch (e: any) {
      setMessage({ type: "error", text: e?.data?.message ?? "Failed to save provider" });
    }
  };

  const handleDelete = async (providerCode: ProviderCode) => {
    setMessage(null);
    try {
      await remove({ code: providerCode }).unwrap();
      setMessage({ type: "success", text: "Provider deleted" });
    } catch (e: any) {
      setMessage({ type: "error", text: e?.data?.message ?? "Failed to delete provider" });
    }
  };

  const statusBadge = (s: ProviderStatus) => {
    switch (s) {
      case "ACTIVE":
        return (
          <Badge variant="light" color="success">
            Active
          </Badge>
        );
      case "COMING_SOON":
        return (
          <Badge variant="light" color="light">
            Coming Soon
          </Badge>
        );
      case "DISABLED":
        return (
          <Badge variant="light" color="warning">
            Disabled
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Payment Providers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage provider catalog.</p>
      </div>

      {errorMessage && <Alert variant="error" title="Error" message={errorMessage} />}
      {message && <Alert variant={message.type === "success" ? "success" : "error"} title={message.type === "success" ? "Done" : "Error"} message={message.text} />}

      {/* Create/Update form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add / Update Provider</h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Provider Code</label>
            <select
              value={code}
              onChange={(e) => handlePickCode(e.target.value as ProviderCode)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              {CODE_OPTIONS.map((p) => (
                <option key={p.code} value={p.code}>{p.code}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProviderStatus)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white dark:bg-gray-700 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
              <Image
                src={(() => {
                  const preset = CODE_OPTIONS.find((x) => x.code === code);
                  return preset?.defaultLogo ? `/images/banks/${preset.defaultLogo}` : "/images/banks/CBE.png";
                })()}
                alt={name}
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800 dark:text-white">Preview</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Logo will be automatically selected</div>
            </div>
          </div>

          <Button onClick={handleCreateOrUpdate} disabled={isSaving || !name.trim()} className="whitespace-nowrap">
            {isSaving ? "Saving…" : "Save Provider"}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Provider Catalog</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This list feeds merchant-admin Payment Providers page.</p>

        <div className="bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden border-0">
          {isLoading ? (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">Loading…</div>
          ) : providers.length ? (
            providers.map((p, idx) => (
              <div
                key={p.id}
                className={`px-4 py-4 ${idx !== providers.length - 1 ? "border-b border-gray-200 dark:border-gray-700" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white dark:bg-gray-700 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                      <Image
                        src={p.logoUrl ? `/images/banks/${p.logoUrl}` : "/images/banks/CBE.png"}
                        alt={p.name}
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white truncate">{p.name}</h3>
                        {statusBadge(p.status)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Code: <span className="font-mono">{p.code}</span> · Logo: <span className="font-mono">{p.logoUrl ?? "-"}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handlePickCode(p.code);
                        setName(p.name);
                        setStatus(p.status);
                      }}
                      className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(p.code)}
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
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No providers yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
