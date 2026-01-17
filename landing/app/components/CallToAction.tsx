import Link from "next/link";
import Badge from "./Badge";

export default function CallToAction() {
  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 relative z-10 bg-white">
      <div
        className="mx-auto rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8"
        style={{
          maxWidth: "1450px",
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
              marginBottom: "16px",
            }}
          >
            Start verifying payments in minutes
          </h2>

          {/* Description - Responsive */}
          <p
            className="text-base sm:text-lg md:text-xl lg:text-xl py-4 sm:py-6 md:py-8 leading-6 sm:leading-7 md:leading-8 lg:leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto px-4"
            style={{
              fontFamily: "var(--font-geist)",
              maxWidth: "720px",
              marginBottom: "32px",
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
