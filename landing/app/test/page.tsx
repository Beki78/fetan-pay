"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useVerifyReceiptImageMutation, useVerifyReceiptMutation } from "@/lib/api";
import type { VerifyRequest } from "@/lib/api";

const providerTabs: Provider[] = ["Telebirr", "CBE", "Dashen", "Abyssinia", "Awash", "CBE Birr"];
const modeTabs = ["Add by Reference Number", "Upload Receipt"] as const;
type Mode = (typeof modeTabs)[number];

const providerLogos: Partial<Record<Provider, string>> = {
  Telebirr: "/banks/Telebirr.png",
  CBE: "/banks/CBE.png",
  "CBE Birr": "/banks/CBE.png",
  Awash: "/banks/Awash.png",
  Abyssinia: "/banks/BOA.png",
};

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
  const [mode, setMode] = useState<Mode>("Add by Reference Number");
  const [activeTab, setActiveTab] = useState<Provider>(providerTabs[0]);
  const [reference, setReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("251911000000");
  const [hasAttempted, setHasAttempted] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedReference, setExtractedReference] = useState<string | null>(null);
  const [detectedProvider, setDetectedProvider] = useState<Provider | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const suppressRefReset = useRef(false);
  const [verifyReceipt, { data, error, isLoading, reset }] = useVerifyReceiptMutation();
  const [verifyReceiptImage, { data: imageData, error: imageError, isLoading: isImageLoading, reset: resetImage }] = useVerifyReceiptImageMutation();
  const [uploadInfo, setUploadInfo] = useState<string | null>(null);
  const [forwardUrl, setForwardUrl] = useState<string>("");

  useEffect(() => {
    if (mode !== "Add by Reference Number") {
      setHasAttempted(false);
      return;
    }

    if (suppressRefReset.current) {
      suppressRefReset.current = false;
      if (activeTab === "CBE Birr") {
        setPhoneNumber("251911000000");
      }
      setHasAttempted(false);
      return;
    }

    const nextRef = defaultReferences[activeTab as Provider] ?? "";
    setReference(nextRef);
    if (activeTab === "CBE Birr") {
      setPhoneNumber("251911000000");
    }
    setHasAttempted(false);
  }, [activeTab, mode]);

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

  const handleVerify = async (source: "reference" | "upload") => {
    setUploadError(null);
    setUploadInfo(null);

    if (!reference) {
      if (source === "upload") {
        setUploadError("Upload a receipt so we can read the details, then click Verify.");
      }
      return;
    }

    setHasAttempted(true);
    await verifyReceipt({ provider: activeTab, reference, phoneNumber });
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);
    setUploadInfo(null);
  reset();
  resetImage();
    setHasAttempted(false);
  setExtractedReference(null);
  setDetectedProvider(null);

    try {
      const resp = await verifyReceiptImage({ file }).unwrap();

      if (resp.error) {
        setUploadError(resp.error);
        return;
      }

      const messageParts: string[] = [];

      const typeToProvider: Record<string, Provider> = {
        telebirr: "Telebirr",
        cbe: "CBE",
        awash: "Awash",
        boa: "Abyssinia",
        dashen: "Dashen",
      };

      const detectedProvider = resp.type ? typeToProvider[resp.type] : undefined;
      if (detectedProvider) {
        suppressRefReset.current = true;
        setActiveTab(detectedProvider);
        setDetectedProvider(detectedProvider);
        const friendly =
          detectedProvider === "CBE"
            ? "We detected a CBE receipt. We'll use the CBE checker."
            : detectedProvider === "Telebirr"
              ? "We detected a Telebirr receipt. We'll use the Telebirr checker."
              : detectedProvider === "Awash"
                ? "We detected an Awash receipt. We'll use the Awash checker."
                : detectedProvider === "Abyssinia"
                  ? "We detected a Bank of Abyssinia receipt. We'll use the Abyssinia checker."
                  : detectedProvider === "Dashen"
                    ? "We detected a Dashen receipt. We'll use the Dashen checker."
                    : null;
        if (friendly) messageParts.push(friendly);
      } else {
        setDetectedProvider(null);
      }

      if (resp.reference) {
        suppressRefReset.current = true;
        setReference(resp.reference);
        setExtractedReference(resp.reference);
        messageParts.push(`Reference: ${resp.reference}`);
      }

      if (resp.forward_to) {
        const base = process.env.NEXT_PUBLIC_VERIFIER_API?.replace(/\/verify-image$/, "") ?? "";
        const url = `${base}${resp.forward_to}`;
        setForwardUrl(url);
        messageParts.push("We’ll route this to the right bank checker for you.");
      } else {
        setForwardUrl("");
      }

      if (resp.accountSuffix === "required_from_user") {
        messageParts.push("For CBE receipts, please enter the account suffix to finish.");
      }

      if (messageParts.length) {
        setUploadInfo(messageParts.join(" | "));
      }
    } catch (err: any) {
      const apiError = err?.data?.error || err?.error || "Upload failed. Please try again.";
      setUploadError(apiError);
    }
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
              Choose how you want to test: add by reference number with a provider, or upload a receipt and let us read it.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-[0_20px_80px_rgba(2,6,23,0.55)] backdrop-blur">
              <div className="flex flex-wrap gap-3" role="tablist">
                {modeTabs.map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={mode === tab}
                    onClick={() => {
                      setMode(tab);
                      setHasAttempted(false);
                      setUploadError(null);
                      setUploadInfo(null);
                      setForwardUrl("");
                      setExtractedReference(null);
                      suppressRefReset.current = false;
                      reset();
                      resetImage();
                      if (tab === "Add by Reference Number" && !reference) {
                        const nextRef = defaultReferences[activeTab as Provider];
                        setReference(nextRef ?? "");
                      }
                      if (tab === "Upload Receipt") {
                        setReference("");
                      }
                    }}
                    className={combine(
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      mode === tab
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "border border-border bg-background/70 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {mode === "Add by Reference Number" && (
                <div className="mt-8 space-y-4">
                  <div className="flex flex-wrap gap-3" role="tablist">
                    {providerTabs.map((tab) => (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        className={combine(
                          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                          activeTab === tab
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "border border-border bg-background/70 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {providerLogos[tab] ? (
                          <img
                            src={providerLogos[tab] as string}
                            alt={`${tab} logo`}
                            className="h-5 w-5 rounded-full border border-border bg-white object-contain"
                          />
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background/70 text-[10px] font-bold uppercase">
                            {tab.slice(0, 2)}
                          </span>
                        )}
                        <span>{tab}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
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
                    {extractedReference && (
                      <p className="text-[11px] text-emerald-700">Extracted from upload: {extractedReference}</p>
                    )}
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

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleVerify("reference")}
                      disabled={isLoading || !reference}
                      className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
                    >
                      {isLoading ? "Verifying..." : "Verify"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextRef = defaultReferences[activeTab as Provider];
                        setReference(nextRef ?? "");
                        setHasAttempted(false);
                        setPhoneNumber(activeTab === "CBE Birr" ? "251911000000" : phoneNumber);
                        setUploadError(null);
                        suppressRefReset.current = false;
                        reset();
                        resetImage();
                        setUploadInfo(null);
                        setForwardUrl("");
                      }}
                      className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-background"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {mode === "Upload Receipt" && (
                <div className="mt-8 space-y-4">
                  <div className="space-y-3">
                    <div
                      className={combine(
                        "group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition",
                        isDragging ? "border-primary bg-primary/5" : "border-border bg-background/50 hover:border-primary/70"
                      )}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const droppedFile = e.dataTransfer.files?.[0];
                        void handleFileUpload(droppedFile ?? null);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16V8m0 0-3 3m3-3 3 3M4 16.5V15a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1.5M6 19h12"
                          />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">Drag & drop your receipt</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, HEIC, WebP, or PDF. Max one file.</p>
                      </div>
                      <div className="text-xs font-semibold text-primary">Click to browse</div>
                      <input
                        ref={fileInputRef}
                        id="receipt-file"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"
                        className="sr-only"
                        onChange={(event) => handleFileUpload(event.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>

                  {isImageLoading && (
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                      <span>Reading your receipt…</span>
                    </div>
                  )}
                  {uploadInfo && (
                    <div className="rounded-lg border border-emerald-300/60 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900">
                      <span className="font-semibold">Good news:</span> {uploadInfo}
                    </div>
                  )}
                  {uploadError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {uploadError}
                    </div>
                  )}
                  {imageError && !uploadError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {(imageError as any)?.data?.error || "We couldn’t read that receipt. Please try another file."}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="upload-reference">
                      Reference (confirm or edit)
                    </label>
                    <div className="relative">
                      <input
                        id="upload-reference"
                        type="text"
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        placeholder="Reference detected from receipt"
                        className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        {detectedProvider ?? "Pending"}
                      </span>
                    </div>
                    {extractedReference && (
                      <p className="text-[11px] text-emerald-700">Extracted from upload: {extractedReference}</p>
                    )}
                  </div>
                  {forwardUrl && (
                    <div className="rounded-xl border border-border bg-background/70 px-3 py-2 text-xs text-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">We’ll check this link for you</span>
                      </div>
                      <input
                        readOnly
                        value={forwardUrl}
                        className="mt-2 w-full rounded-lg border border-border bg-background/80 px-2 py-1 text-[11px] text-foreground"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => handleVerify("upload")}
                      disabled={isLoading || !reference}
                      className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
                    >
                      {isLoading ? "Verifying..." : "Verify detected receipt"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReference("");
                        setHasAttempted(false);
                        setUploadError(null);
                        suppressRefReset.current = false;
                        reset();
                        resetImage();
                        setUploadInfo(null);
                        setForwardUrl("");
                        setDetectedProvider(null);
                        setExtractedReference(null);
                      }}
                      className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-background"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
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