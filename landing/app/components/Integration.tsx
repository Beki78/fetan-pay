import Badge from "./Badge";

export default function Integration() {
  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 bg-white relative z-10">
      <div className="mx-auto" style={{ maxWidth: "1450px" }}>
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

          {/* Title - Responsive */}
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[75px] font-normal opacity-0 animate-fade-in-up animation-delay-300 text-center mx-auto tracking-tight lg:tracking-[-2.16px] px-4"
            style={{
              fontFamily: "var(--font-geist)",
              background: "linear-gradient(to right, #061a32, #0d3463)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              maxWidth: "1200px",
            }}
          >
            Seamless integration with your existing systems
          </h2>

          {/* Description - Responsive */}
          <p
            className="text-base sm:text-lg md:text-xl lg:text-xl py-4 sm:py-6 md:py-8 leading-6 sm:leading-7 md:leading-8 lg:leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto px-4"
            style={{
              fontFamily: "var(--font-geist)",
              maxWidth: "720px",
            }}
          >
            Secure authentication, merchant-scoped access, clean documentation,
            and real-time responses—built for developers.
          </p>

          {/* Code Card - Responsive */}
          <div
            className="opacity-0 animate-fade-in-up rounded-[20px] sm:rounded-[24px] lg:rounded-[32px] p-4 sm:p-6 md:p-8"
            style={{
              background:
                "linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              animationDelay: "500ms",
            }}
          >
            {/* macOS Window Controls */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div
                className="rounded-full w-2 h-2 sm:w-3 sm:h-3"
                style={{
                  backgroundColor: "#ff5f57",
                }}
              />
              <div
                className="rounded-full w-2 h-2 sm:w-3 sm:h-3"
                style={{
                  backgroundColor: "#ffbd2e",
                }}
              />
              <div
                className="rounded-full w-2 h-2 sm:w-3 sm:h-3"
                style={{
                  backgroundColor: "#28ca42",
                }}
              />
            </div>

            <div className="mb-4">
              <h3
                className="text-xl sm:text-2xl lg:text-[28px] font-normal text-[#174686] mb-2 sm:mb-3 lg:mb-2 leading-7 sm:leading-8 lg:leading-[42px]"
                style={{
                  fontFamily: "var(--font-geist)",
                }}
              >
                RESTful API
              </h3>
              <p
                className="text-sm sm:text-base lg:text-[18px] text-[#696969] leading-5 sm:leading-6 lg:leading-[27px]"
                style={{
                  fontFamily: "var(--font-geist)",
                  fontWeight: 400,
                }}
              >
                Example API call
              </p>
            </div>

            {/* Code Block - Responsive */}
            <div
              className="rounded-[12px] sm:rounded-[14px] lg:rounded-[16px] p-3 sm:p-4 md:p-6 overflow-x-auto"
              style={{
                backgroundColor: "#0a1e39",
                fontFamily: "Consolas, monospace",
              }}
            >
              <pre
                className="text-xs sm:text-sm lg:text-[14px] leading-5 sm:leading-6 lg:leading-[22.4px]"
                style={{
                  color: "#e6edf3",
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
