import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Fetan Pay - Instant Bank Transfer Verification for Ethiopian Banks",
    template: "%s | Fetan Pay",
  },
  description:
    "Fetan Pay provides instant, reliable bank transfer verification across Ethiopian banks including CBE, Telebirr, Awash Bank, BOA, and Dashen Bank. Verify payments without moving money - perfect for restaurants, e-commerce, pharmacies, and businesses in Ethiopia.",
  keywords: [
    "bank transfer verification",
    "payment verification Ethiopia",
    "CBE payment verification",
    "Telebirr verification",
    "Awash Bank verification",
    "BOA payment verification",
    "Dashen Bank verification",
    "Ethiopian payment gateway",
    "instant payment verification",
    "bank transfer API",
    "payment verification API",
    "Ethiopia fintech",
    "payment processing Ethiopia",
    "transaction verification",
    "payment confirmation",
    "bank transfer API Ethiopia",
    "mobile money verification",
    "payment gateway Ethiopia",
  ],
  authors: [{ name: "Fetan Pay" }],
  creator: "Fetan Pay",
  publisher: "Fetan Pay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fetanpay.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fetanpay.com",
    siteName: "Fetan Pay",
    title: "Fetan Pay - Instant Bank Transfer Verification for Ethiopian Banks",
    description:
      "Instantly verify bank transfers across Ethiopian banks without moving money. Trusted by businesses across Ethiopia for reliable payment verification.",
    images: [
      {
        url: "/logo/fetan-logo.png",
        width: 1200,
        height: 630,
        alt: "Fetan Pay - Instant Bank Transfer Verification",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fetan Pay - Instant Bank Transfer Verification",
    description:
      "Instantly verify bank transfers across Ethiopian banks without moving money. Trusted by businesses across Ethiopia.",
    images: ["/logo/fetan-logo.png"],
    creator: "@fetanpay",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo/fetan-logo.png",
    shortcut: "/logo/fetan-logo.png",
    apple: "/logo/fetan-logo.png",
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
