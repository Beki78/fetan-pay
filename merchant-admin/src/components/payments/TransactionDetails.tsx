"use client";

import { useMemo, useState } from "react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import Input from "../form/input/InputField";
import {
  type TransactionRecord,
  type TransactionProvider,
  type TransactionStatus,
} from "@/lib/services/transactionsServiceApi";
import { ChevronLeftIcon } from "@/icons";

const providerLabels: Record<TransactionProvider, string> = {
  CBE: "CBE",
  TELEBIRR: "Telebirr",
  AWASH: "Awash",
  BOA: "Bank of Abyssinia",
  DASHEN: "Dashen",
};

const statusMeta: Record<
  TransactionStatus,
  { label: string; badgeClass: string; toneClass: string; description: string }
> = {
  PENDING: {
    label: "Pending",
    badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-200",
    toneClass: "bg-orange-500/10 border-orange-500/20",
    description: "Waiting for payment verification",
  },
  VERIFIED: {
    label: "Verified",
    badgeClass: "bg-green-500/10 text-green-700 dark:text-green-200",
    toneClass: "bg-green-500/10 border-green-500/20",
    description: "Payment has been verified",
  },
  FAILED: {
    label: "Failed",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-200",
    toneClass: "bg-red-500/10 border-red-500/20",
    description: "Verification failed",
  },
  EXPIRED: {
    label: "Expired",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-200",
    toneClass: "bg-red-500/10 border-red-500/20",
    description: "Transaction has expired",
  },
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

interface TransactionDetailsProps {
  transaction: TransactionRecord;
  onBack: () => void;
}

export default function TransactionDetails({ transaction, onBack }: TransactionDetailsProps) {
  const { status, reference, provider, createdAt, verifiedAt, qrUrl, errorMessage, verificationPayload } =
    transaction;
  const meta = statusMeta[status];
  const [copied, setCopied] = useState(false);

  const formattedPayload = useMemo(() => {
    if (verificationPayload === undefined || verificationPayload === null) return null;
    try {
      return JSON.stringify(verificationPayload as Record<string, unknown>, null, 2);
    } catch {
      return String(verificationPayload);
    }
  }, [verificationPayload]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Back to transactions"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Transaction Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Reference {reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-100 bg-gray-100 dark:bg-gray-800">
          <span className={`px-2 py-1 rounded-md ${meta.badgeClass}`}>{meta.label}</span>
        </div>
      </div>

      <div className={`rounded-xl border p-6 ${meta.toneClass} dark:border-gray-700`}> 
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{meta.label}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{meta.description}</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
            <span className="font-semibold">Provider:</span>
            <Badge size="sm" variant="light" color="info">
              {providerLabels[provider] ?? provider}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Transaction Info</h3>
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Detail label="Reference" value={reference} />
              <Detail label="Status" value={meta.label} />
              <Detail label="Provider" value={providerLabels[provider] ?? provider} />
              <Detail label="Created" value={formatDate(createdAt)} />
              <Detail label="Verified At" value={formatDate(verifiedAt)} />
              <Detail label="QR URL" value={qrUrl} copyable />
            </dl>
            {errorMessage && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-900/30 dark:text-red-200">
                {errorMessage}
              </div>
            )}
          </div>

          {formattedPayload && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Verification Payload</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">Raw JSON</span>
              </div>
              <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                {formattedPayload}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">Payment Link</h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Share this link with the vendor or customer for verification reference.
            </p>
            <div className="flex gap-2">
              <Input type="text" value={qrUrl} readOnly className="flex-1" />
              <Button size="sm" onClick={handleCopy} className="whitespace-nowrap">
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Open link
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-6-6l6-6m0 0h-6m6 0v6"
                />
              </svg>
            </a>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={onBack}>
                Back to Transactions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) {
  const handleCopy = async () => {
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // ignore silently
    }
  };

  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200">
      <div className="text-gray-500 dark:text-gray-400">{label}</div>
      <div className="flex items-center gap-2 text-right">
        <span className="font-semibold break-all">{value}</span>
        {copyable && (
          <button onClick={handleCopy} className="text-xs text-blue-500 hover:underline">
            Copy
          </button>
        )}
      </div>
    </div>
  );
}
