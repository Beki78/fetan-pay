"use client";

import { useState } from "react";
import VerificationHistoryTable from "@/components/payments/VerificationHistoryTable";
import { type PaymentRecord } from "@/lib/services/paymentsServiceApi";

export default function PaymentsPage() {
  const [viewingPayment, setViewingPayment] = useState<PaymentRecord | null>(null);
  const selectedId = viewingPayment?.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Payment Verifications</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Merchant-scoped verification history (VERIFIED / UNVERIFIED)
        </p>
      </div>

      {viewingPayment ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Verification Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reference {viewingPayment.reference}</p>
            </div>
            <button
              onClick={() => setViewingPayment(null)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Back
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Detail label="Provider" value={viewingPayment.provider} />
            <Detail label="Status" value={viewingPayment.status} />
            <Detail label="Claimed Amount" value={String(viewingPayment.claimedAmount)} />
            <Detail label="Verified At" value={viewingPayment.verifiedAt ?? "—"} />
            <Detail label="Mismatch Reason" value={viewingPayment.mismatchReason ?? "—"} />
            <Detail label="Receiver" value={viewingPayment.receiverAccount?.receiverAccount ?? "—"} />
          </div>
        </div>
      ) : (
        <VerificationHistoryTable onView={(p) => setViewingPayment(p)} selectedId={selectedId} />
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200">
      <div className="text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 font-semibold break-all">{value}</div>
    </div>
  );
}

