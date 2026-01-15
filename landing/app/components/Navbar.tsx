"use client";

import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "#features" },
  { name: "About", href: "#about" },
  { name: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 animate-fade-in animation-delay-100">
      <div className="max-w-[1728px] mx-auto px-8 py-6 flex items-center relative">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/fetan-logo.png"
            alt="Fetan Pay"
            width={90}
            height={90}
            priority
            className="object-contain"
          />
        </Link>

        {/* Centered Nav Pill */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <nav className="flex items-center px-3 py-3 bg-white border border-[#174686]/40 rounded-full shadow-lg">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-6 py-3 rounded-full text-[#174686] text-[18px] leading-[26px] transition-all duration-300 hover:bg-[#eafcfd] ${
                  index === 0 ? "bg-[#eafcfd]" : ""
                }`}
                style={{ fontFamily: "var(--font-geist)" }}
              >
                {link.name}
              </Link>
            ))}

            {/* Get Started Button - 171x54, border-radius 40, stroke #899cfd */}
            <Link
              href="/get-started"
              className="flex items-center ml-3 bg-[#174686] text-[#f6f7fa] transition-all duration-300 hover:bg-[#0d3463] group"
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
              <span className="w-[38px] h-[38px] bg-white rounded-full flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
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
          </nav>
        </div>
      </div>
    </header>
  );
}
