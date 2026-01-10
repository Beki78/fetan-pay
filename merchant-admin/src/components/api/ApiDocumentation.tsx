"use client";
import React, { useState } from "react";
import { Tabs, TabPanel } from "../common/Tabs";
import { LockIcon, DocsIcon, PaperPlaneIcon, BoltIcon } from "@/icons";

export default function ApiDocumentation() {
  const [activeTab, setActiveTab] = useState("authentication");

  const tabs = [
    { id: "authentication", label: "Authentication", icon: <LockIcon /> },
    { id: "endpoints", label: "Endpoints", icon: <PaperPlaneIcon /> },
    { id: "examples", label: "Code Examples", icon: <BoltIcon /> },
    { id: "webhooks", label: "Webhooks", icon: <DocsIcon /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          API Documentation
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete guide to integrating with the FetanPay Payment Verification API
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id)} />

        <TabPanel activeTab={activeTab} tabId="authentication">
          <div className="mt-6 space-y-6">
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-3">
                API Key Authentication
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                All API requests require authentication using your API key. Include your API key in the request headers.
              </p>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 mb-4">
                <code className="text-sm text-gray-800 dark:text-gray-300">
                  <div>Authorization: Bearer YOUR_API_KEY</div>
                </code>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                <code className="text-sm text-gray-800 dark:text-gray-300">
                  <div>X-API-Key: YOUR_API_KEY</div>
                </code>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="endpoints">
          <div className="mt-6 space-y-6">
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-3">
                Verify Payment
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Verify a payment transaction
              </p>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 mb-2">
                <code className="text-sm text-gray-800 dark:text-gray-300">
                  <div>POST /api/v1/payments/verify</div>
                </code>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                <pre className="text-xs text-gray-800 dark:text-gray-300">
                  {JSON.stringify(
                    {
                      payment_intent_id: "pi_1234567890",
                      transaction_reference: "TXN123456789",
                      bank_name: "CBE",
                      amount: 1000.00,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-3">
                List Payments
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Retrieve a list of payments
              </p>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                <code className="text-sm text-gray-800 dark:text-gray-300">
                  <div>GET /api/v1/payments?page=1&limit=20</div>
                </code>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="examples">
          <div className="mt-6 space-y-6">
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-3">
                JavaScript Example
              </h4>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                <pre className="text-xs text-gray-800 dark:text-gray-300">
                  {`const response = await fetch('https://api.fetanpay.com/v1/payments/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    payment_intent_id: 'pi_1234567890',
    transaction_reference: 'TXN123456789',
    bank_name: 'CBE',
    amount: 1000.00
  })
});

const data = await response.json();`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-3">
                Python Example
              </h4>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                <pre className="text-xs text-gray-800 dark:text-gray-300">
                  {`import requests

response = requests.post(
    'https://api.kifiya.com/v1/payments/verify',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'payment_intent_id': 'pi_1234567890',
        'transaction_reference': 'TXN123456789',
        'bank_name': 'CBE',
        'amount': 1000.00
    }
)

data = response.json()`}
                </pre>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="webhooks">
          <div className="mt-6 space-y-6">
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-3">
                Webhook Events
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Configure webhooks to receive real-time notifications about payment events.
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                  <h5 className="font-medium text-gray-800 dark:text-white/90 mb-1">
                    payment.verified
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Triggered when a payment is successfully verified
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                  <h5 className="font-medium text-gray-800 dark:text-white/90 mb-1">
                    payment.failed
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Triggered when payment verification fails
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </div>
    </div>
  );
}

