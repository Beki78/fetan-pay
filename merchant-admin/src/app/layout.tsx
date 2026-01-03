import './globals.css';
import type { Metadata } from 'next';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'FetanPay - Payment Management',
  description: 'FetanPay - Manage your payments, transactions, and payment providers',
  icons: {
    icon: '/images/logo/fetan-logo.png',
    shortcut: '/images/logo/fetan-logo.png',
    apple: '/images/logo/fetan-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans dark:bg-gray-900">
        <ThemeProvider>
          <SidebarProvider>
            <Providers>{children}</Providers>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
