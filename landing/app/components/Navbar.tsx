"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { name: "How it works", href: "#how-it-works", smoothScroll: true },
  { name: "Features", href: "#features", smoothScroll: true },
  { name: "Integration", href: "#integration", smoothScroll: true },
  { name: "Pricing", href: "#pricing", smoothScroll: true },
  { name: "Docs", href: "https://docs.fetanpay.et/", smoothScroll: false },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  // Close mobile menu when clicking outside or on link
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: (typeof navLinks)[0]
  ) => {
    if (link.smoothScroll && link.href.startsWith("#")) {
      e.preventDefault();

      if (!isHomePage) {
        // Navigate to home page first, then scroll
        router.push(`/${link.href}`);
        return;
      }

      const targetId = link.href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
    // Close menu for all links
    setIsMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 animate-fade-in animation-delay-100 bg-white">
        <div className="max-w-[1728px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className="flex items-center z-10 lg:ml-20">
            <Image
              src="/logo/headerlogo.svg"
              alt="Fetan Pay"
              width={150}
              height={150}
              priority
              className="object-contain w-24 sm:w-32 md:w-36 lg:w-[150px]"
            />
          </Link>

          {/* Desktop Nav Pill - Hidden on mobile */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
            <nav className="flex items-center px-3 py-2 bg-white border border-[#174686]/40 rounded-full shadow-lg">
              {navLinks.map((link) => {
                const handleClick = (
                  e: React.MouseEvent<HTMLAnchorElement>
                ) => {
                  if (link.smoothScroll && link.href.startsWith("#")) {
                    e.preventDefault();

                    if (!isHomePage) {
                      // Navigate to home page first, then scroll
                      router.push(`/${link.href}`);
                      return;
                    }

                    const targetId = link.href.substring(1);
                    const element = document.getElementById(targetId);
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }
                };

                // Special styling for Docs link
                const isDocs = link.name === "Docs";

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={handleClick}
                    target={isDocs ? "_blank" : undefined}
                    rel={isDocs ? "noopener noreferrer" : undefined}
                    className={`px-6 py-2 rounded-full text-[#174686] text-[18px] leading-[26px] transition-all duration-300 ${
                      isDocs
                        ? "border border-[rgba(59,59,59,0.12)] hover:bg-gray-50"
                        : "hover:bg-[#eafcfd]"
                    }`}
                    style={{
                      fontFamily: "var(--font-geist)",
                      borderRadius: isDocs ? "100px" : "inherit",
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Get Started Button - Desktop only, positioned on right */}
          <div className="hidden lg:flex items-center z-10 mr-20">
            <Link
              href="https://merchant.fetanpay.et/signup"
              onClick={handleGetStarted}
              target="_blank"
              rel="noopener noreferrer"
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden z-50 p-2 rounded-lg bg-[#174686] text-white hover:bg-[#0d3463] transition-colors"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <g clipPath="url(#clip0_4418_9850)">
                <path
                  d="M3 7H21"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M3 12H21"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M3 17H21"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_4418_9850">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[100] lg:hidden transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            } shadow-2xl`}
          >
            <div className="flex flex-col h-full">
              {/* Top Section */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                {/* Logo */}
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <Image
                    src="/logo/headerlogo.svg"
                    alt="Fetan Pay"
                    width={120}
                    height={120}
                    priority
                    className="object-contain"
                  />
                </Link>

                {/* Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 bg-[#174686] rounded-full flex items-center justify-center text-white hover:bg-[#0d3463] transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M5 5l10 10M15 5l-10 10" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-6">
                <div className="flex flex-col">
                  {navLinks.map((link) => {
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link)}
                        className="relative px-6 py-4 text-gray-700 text-base font-medium transition-colors border-b border-gray-200 hover:bg-gray-50"
                        style={{ fontFamily: "var(--font-geist)" }}
                      >
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Bottom Action Button */}
              <div className="p-6 border-t border-gray-200">
                <Link
                  href="https://merchant.fetanpay.et/signup"
                  onClick={handleGetStarted}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 px-6 rounded-full bg-[#174686] text-white font-medium hover:bg-[#0d3463] transition-colors group"
                  style={{
                    fontFamily: "var(--font-inter)",
                    borderRadius: "40px",
                    border: "1px solid #899cfd",
                  }}
                >
                  <span className="flex-1 text-center text-[16px] font-medium leading-[27px]">
                    Get Started
                  </span>
                  <span className="w-[38px] h-[38px] bg-white rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ml-2">
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
        </>
      )}
    </>
  );
}
