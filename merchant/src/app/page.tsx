import Image from "next/image";

const NAV_LINKS = [
  { label: "Dashboard", href: "/" },
  { label: "Scan & Verify", href: "/scan" },
  { label: "Payments", href: "/payments" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 px-6 py-12 font-sans text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <main className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-2xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-10 px-10 py-12 md:flex-row md:items-center md:justify-between md:px-14 md:py-16">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo/fetan-logo.png"
              alt="Fetan Pay"
              width={64}
              height={64}
              className="h-16 w-16 object-contain drop-shadow-sm"
              priority
            />
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-blue-200">Vendor Portal</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white">
                Welcome to Fetan Pay
              </h1>
              <p className="mt-2 max-w-xl text-base text-slate-600 dark:text-slate-200">
                Manage QR verifications, track transactions, and stay on top of payments — all in one place.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-sm font-medium md:text-base">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
              >
                <span>{link.label}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">Open</span>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
