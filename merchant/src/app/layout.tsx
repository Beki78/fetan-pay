import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/lib/config";
import { Providers } from "@/components/providers";
import { BottomNavigation } from "@/components/bottom-navigation";
import { CameraPermissionPrompt } from "@/components/camera-permission-prompt";
import { CameraPermissionProvider } from "@/contexts/CameraPermissionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - Vendor Portal`,
  description: APP_CONFIG.description,
  icons: {
    icon: "/images/logo/fetan-logo.png",
    shortcut: "/images/logo/fetan-logo.png",
    apple: "/images/logo/fetan-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} antialiased`}
      >
        <Providers>
          <CameraPermissionProvider>
            <CameraPermissionPrompt />
            {children}
            <BottomNavigation />
          </CameraPermissionProvider>
        </Providers>
      </body>
    </html>
  );
}
