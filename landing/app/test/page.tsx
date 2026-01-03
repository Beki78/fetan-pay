"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useVerifyReceiptMutation } from "@/lib/api";
import type { VerifyRequest } from "@/lib/api";

const tabs: Provider[] = ["Telebirr", "CBE", "Dashen", "Abyssinia", "Awash", "CBE Birr"];

type Provider = VerifyRequest["provider"];

const defaultReferences: Record<Provider, string> = {
  Telebirr: "CLU7E7C9DH",
  CBE: "FT25347NSD0432348645",
  Dashen: "659WDTS253610003",
  Abyssinia: "FT251060KZQ920679",
  Awash: "-2H1RJ8MA49-35BMW3",
  "CBE Birr": "1234567890",
};
const combine = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<Provider>(tabs[0]);
  const [reference, setReference] = useState(defaultReferences[tabs[0]]);
  const [phoneNumber, setPhoneNumber] = useState("251911000000");
  const [hasAttempted, setHasAttempted] = useState(false);
  const [verifyReceipt, { data, error, isLoading, reset }] = useVerifyReceiptMutation();

  useEffect(() => {
    const nextRef = defaultReferences[activeTab] ?? "";
    setReference(nextRef);
    if (activeTab === "CBE Birr") {
      setPhoneNumber("251911000000");
    }
    setHasAttempted(false);
  }, [activeTab]);

  const referenceLabel =
    activeTab === "Telebirr"
      ? "Transaction Number"
      : activeTab === "CBE Birr"
        ? "Receipt Number"
        : "Reference";

  const referencePlaceholder =
    activeTab === "Telebirr"
      ? "e.g. CLU7E7C9DH"
      : activeTab === "CBE"
        ? "e.g. FT25362L3FT732348645"
        : activeTab === "Awash"
          ? "e.g. -2H1RJ8MA49-35BMW3"
          : activeTab === "CBE Birr"
            ? "e.g. 1234567890"
            : "Enter reference";

  const helperText =
    activeTab === "Awash"
      ? "Paste the token from the AwashPay URL (the part after the port)."
      : activeTab === "CBE"
        ? "Paste the FT reference (smart verification doesn't require a suffix)."
        : activeTab === "Telebirr"
          ? "Paste the Telebirr transaction number (e.g. CLU7E7C9DH)."
          : activeTab === "CBE Birr"
            ? "Provide receipt number and phone for CBE Birr lookups."
            : "Enter the receipt reference to preview a mock verification.";

  const resultPayload = (data as any)?.data ?? data;
  const hasLiveResult = Boolean(resultPayload);
  const normalizedEntries = hasLiveResult ? Object.entries(resultPayload as Record<string, unknown>) : [];

  const handleVerify = async () => {
    if (!reference) return;
    setHasAttempted(true);
    await verifyReceipt({ provider: activeTab, reference, phoneNumber });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden py-16">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(17,80,151,0.08),transparent_45%)]" aria-hidden />
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Verification
            </p>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Test Receipt Verification</h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Select a provider, paste a reference, and verify against the live sandbox. Results stay hidden until you click Verify.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-[0_20px_80px_rgba(2,6,23,0.55)] backdrop-blur">
              <div className="flex flex-wrap gap-3" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab as Provider)}
                    className={combine(
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      activeTab === tab
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "border border-border bg-background/70 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="reference">
                  {referenceLabel}
                </label>
                <div className="relative">
                  <input
                    id="reference"
                    type="text"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder={referencePlaceholder}
                    className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {activeTab}
                  </span>
                </div>
                {activeTab === "CBE Birr" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="phone">
                      Phone Number (E.164)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="e.g. 2519XXXXXXXX"
                      className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{helperText}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isLoading || !reference}
                  className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReference(defaultReferences[activeTab]);
                    setHasAttempted(false);
                    setPhoneNumber(activeTab === "CBE Birr" ? "251911000000" : phoneNumber);
                    reset();
                  }}
                  className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-background"
                >
                  Clear
                </button>
              </div>
            </div>

            {(hasAttempted || isLoading || data || error) && (
              <div className="space-y-3">
                <div className="rounded-4xl border border-border bg-card/70 p-8 shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Verification Result</h2>
                      <p className="text-sm text-muted-foreground">Based on {activeTab} receipt</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border bg-background/60 px-3 py-1">
                        Status: {resultPayload?.success === false ? "failed" : hasLiveResult ? "success" : "pending"}
                      </span>
                      <span className="rounded-full border border-border bg-background/60 px-3 py-1">Reference: {reference || "—"}</span>
                      <span className="rounded-full border border-border bg-background/60 px-3 py-1">Provider: {activeTab}</span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-muted-foreground">
                    {hasLiveResult && normalizedEntries.length > 0 ? (
                      normalizedEntries.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{String(label)}</span>
                          <span className="text-base font-medium text-foreground wrap-break-word max-w-[70ch]">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Run a verification to see live results here.</p>
                    )}
                  </div>
                  {error && (
                    <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {(error as any)?.data?.error || "Verification failed. Please check the reference and try again."}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground shadow-[0_10px_40px_rgba(2,6,23,0.65)]">
                  This service is not affiliated with any bank or payment provider. All verification is mocked using publicly available receipt details for testing and educational purposes only.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
  }