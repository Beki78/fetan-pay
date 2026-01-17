"use client";

import Link from "next/link";

export default function HeroContent() {
  return (
    <div className="flex flex-col gap-[24px]">
      {/* Headline - fontSize 72, lineHeight 75, letterSpacing -2.16 - Responsive */}
      <h1
        className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[75px] font-normal opacity-0 animate-fade-in-up animation-delay-300 mx-auto lg:mx-0 tracking-tight lg:tracking-[-2.16px]"
        style={{
          fontFamily: "var(--font-geist)",
          background: "linear-gradient(to right, #061a32, #0d3463)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          maxWidth: "720px",
        }}
      >
        Instantly verify bank transfers across Ethiopian banks
      </h1>

      {/* Subtitle - fontSize 23, lineHeight 30, maxWidth 720 - Responsive */}
      <p
        className="text-base sm:text-lg md:text-xl lg:text-[23px] leading-6 sm:leading-7 md:leading-8 lg:leading-[30px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 mx-auto lg:mx-0"
        style={{
          fontFamily: "var(--font-geist)",
          maxWidth: "720px",
        }}
      >
        Fetan Pay confirms whether a bank transfer was successfully completed —
        without sending, storing, or moving money.
      </p>

      {/* CTA Buttons - gap 12px between buttons - Responsive */}
      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-[12px] mt-[24px] opacity-0 animate-fade-in-up animation-delay-500">
        {/* Primary Button - 171x54, border-radius 40, stroke #899cfd - Responsive */}
        <Link
          href="https://merchant.fetanpay.et/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-[#174686] text-[#f6f7fa] transition-all duration-300 hover:bg-[#0d3463] group w-full sm:w-auto"
          style={{
            fontFamily: "var(--font-inter)",
            height: "54px",
            minWidth: "171px",
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

        {/* Secondary Button - 125x54, border-radius 100 - Responsive */}
        <Link
          href="https://docs.fetanpay.et/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white font-medium text-[#191d4d] text-[16px] leading-[27px] transition-all duration-300 hover:bg-gray-50 flex items-center justify-center w-full sm:w-auto"
          style={{
            fontFamily: "var(--font-inter)",
            height: "54px",
            minWidth: "125px",
            borderRadius: "100px",
            border: "1px solid rgba(59, 59, 59, 0.12)",
          }}
        >
          View Docs
        </Link>
      </div>
    </div>
  );
}
