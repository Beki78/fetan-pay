import Link from "next/link";
import Badge from "./Badge";

export default function CallToAction() {
  return (
    <section className="py-16 px-4 relative z-10 bg-white">
      <div
        className="max-w-7xl mx-auto rounded-[50px] py-16 px-8"
        style={{
          background: "linear-gradient(180deg, #FAFEFF 0%, #EAFCFD 100%)",
        }}
      >
        <div className="text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge
              icon="/icons/cta/iconsax-mouse-circle.svg"
              iconAlt="ready to get started"
              animationDelay="200"
            >
              Ready to get started?
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
              marginBottom: "16px",
            }}
          >
            Start verifying payments in minutes
          </h2>

          {/* Description */}
          <p
            className="text-xl py-8 leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto"
            style={{
              fontFamily: "var(--font-geist)",
              maxWidth: "720px",
              marginBottom: "48px",
            }}
          >
            Get started with Fetan Pay today and streamline your payment
            verification process.
          </p>

          {/* CTA Button */}
          <div
            className="flex items-center justify-center opacity-0 animate-fade-in-up"
            style={{
              animationDelay: "500ms",
            }}
          >
            <Link
              href="/get-started"
              className="flex items-center bg-[#174686] text-[#f6f7fa] transition-all duration-300 hover:bg-[#0d3463] group"
              style={{
                fontFamily: "var(--font-inter)",
                height: "54px",
                width: "171px",
                borderRadius: "40px",
                border: "1px solid #899cfd",
                paddingLeft: "8px",
                paddingRight: "8px",
              }}
            >
              <span className="flex-1 text-center text-[16px] font-medium leading-[27px]">
                Get Started
              </span>
              <span className="w-[38px] h-[38px] bg-white rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#174686"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
