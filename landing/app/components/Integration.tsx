import Badge from "./Badge";

export default function Integration() {
  return (
    <section className="py-16 px-4 bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge
              icon="/icons/integration/iconsax-link-2.svg"
              iconAlt="integration and api"
              animationDelay="200"
            >
              Integration & API
            </Badge>
          </div>

          {/* Title */}
          <h2
            className="text-[72px] leading-[75px] font-normal opacity-0 animate-fade-in-up animation-delay-300 text-center mx-auto"
            style={{
              fontFamily: "var(--font-geist)",
              letterSpacing: "-2.16px",
              background: "linear-gradient(to right, #061a32, #0d3463)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              maxWidth: "1200px",
            }}
          >
            Seamless integration with your existing systems
          </h2>

          {/* Description */}
          <p
            className="text-xl py-8 leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto"
            style={{
              fontFamily: "var(--font-geist)",
              maxWidth: "720px",
            }}
          >
            Secure authentication, merchant-scoped access, clean documentation,
            and real-time responses—built for developers.
          </p>

          {/* Code Card */}
          <div
            className="opacity-0 animate-fade-in-up rounded-[32px] p-8"
            style={{
              background:
                "linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              animationDelay: "500ms",
            }}
          >
            {/* macOS Window Controls */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="rounded-full"
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#ff5f57",
                }}
              />
              <div
                className="rounded-full"
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#ffbd2e",
                }}
              />
              <div
                className="rounded-full"
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#28ca42",
                }}
              />
            </div>

            <div className="mb-4">
              <h3
                style={{
                  fontFamily: "var(--font-geist)",
                  fontSize: "28px",
                  fontWeight: 400,
                  color: "#174686",
                  marginBottom: "8px",
                  lineHeight: "42px",
                }}
              >
                RESTful API
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-geist)",
                  fontSize: "18px",
                  color: "#696969",
                  fontWeight: 400,
                  lineHeight: "27px",
                }}
              >
                Example API call
              </p>
            </div>

            {/* Code Block */}
            <div
              className="rounded-[16px] p-6 overflow-x-auto"
              style={{
                backgroundColor: "#0a1e39",
                fontFamily: "Consolas, monospace",
              }}
            >
              <pre
                style={{
                  color: "#e6edf3",
                  fontSize: "14px",
                  lineHeight: "22.4px",
                  margin: 0,
                  fontFamily: "Consolas, monospace",
                }}
              >
                <code>{`const response = await fetch('/api/payments/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'CBE',
    reference: 'FT25346B61Q5',
    claimedAmount: 500.00
  })
});`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
