import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const productLinks = [
    { name: "How it works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Integration", href: "#integration" },
    { name: "Pricing", href: "#pricing" },
    { name: "Docs", href: "https://docs.fetanpay.com" },
  ];

  return (
    <footer
      className="relative z-10"
      style={{
        backgroundColor: "#0a1e39",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Left Section - Company Info */}
          <div className="flex flex-col">
            <Link href="/" className="mb-6">
              <Image
                src="/logo/headerlogo.svg"
                alt="Fetan Pay"
                width={162}
                height={63}
                className="object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "16px",
                lineHeight: "25.6px",
                color: "#eafcfd",
                fontWeight: 400,
                maxWidth: "400px",
              }}
            >
              Instantly verify bank transfers across Ethiopian banks without
              sending, storing, or moving money.
            </p>
          </div>

          {/* Middle Section - Product Links */}
          <div className="flex flex-col">
            <h3
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "16px",
                fontWeight: 500,
                color: "#ffffff",
                marginBottom: "16px",
                lineHeight: "24px",
              }}
            >
              Product
            </h3>
            <ul className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: "var(--font-geist)",
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "#eafcfd",
                      fontWeight: 400,
                      transition: "color 0.3s ease",
                    }}
                    className="hover:opacity-80"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright and Legal Links */}
        <div
          style={{
            borderTop: "1px solid rgba(160, 185, 211, 0.2)",
            paddingTop: "24px",
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "14px",
                lineHeight: "21px",
                color: "#eafcfd",
                fontWeight: 400,
              }}
            >
              © 2026 Fetan Pay. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                style={{
                  fontFamily: "var(--font-geist)",
                  fontSize: "14px",
                  lineHeight: "21px",
                  color: "#eafcfd",
                  fontWeight: 400,
                  transition: "opacity 0.3s ease",
                }}
                className="hover:opacity-80"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                style={{
                  fontFamily: "var(--font-geist)",
                  fontSize: "14px",
                  lineHeight: "21px",
                  color: "#eafcfd",
                  fontWeight: 400,
                  transition: "opacity 0.3s ease",
                }}
                className="hover:opacity-80"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
