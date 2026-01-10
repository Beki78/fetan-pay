"use client";

import React, { useState } from "react";
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
            <Detail 
              label="Claimed Amount" 
              value={`${Number(viewingPayment.claimedAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`} 
            />
            {viewingPayment.tipAmount && (
              <Detail 
                label="Tip Amount" 
                value={
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {Number(viewingPayment.tipAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                    </span>
                    {viewingPayment.verifiedBy?.role === "WAITER" && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        Waiter Tip
                      </span>
                    )}
                  </span>
                } 
              />
            )}
            <Detail 
              label="Verified By" 
              value={
                viewingPayment.verifiedBy ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {viewingPayment.verifiedBy.name || viewingPayment.verifiedBy.user?.name || viewingPayment.verifiedBy.email || viewingPayment.verifiedBy.user?.email || "—"}
                    </span>
                    {viewingPayment.verifiedBy.role && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Role: {viewingPayment.verifiedBy.role}
                      </span>
                    )}
                  </div>
                ) : "—"
              } 
            />
            <Detail label="Verified At" value={viewingPayment.verifiedAt ? new Date(viewingPayment.verifiedAt).toLocaleString() : "—"} />
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

function Detail({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200">
      <div className="text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 font-semibold break-all">{value}</div>
    </div>
  );
}

