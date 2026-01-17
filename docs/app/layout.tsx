import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import { APP_CONFIG } from "@/libs/config";

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
  icons: {
    icon: '/fetan-logo.png',
    shortcut: '/fetan-logo.png',
    apple: '/fetan-logo.png',
  },
};

const banner = <Banner storageKey="some-key">{APP_CONFIG.name} 1.0 is released 🎉</Banner>;
const navbar = (
  <Navbar
    logo={<b>{APP_CONFIG.name}</b>}
    // ... Your additional navbar options
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © {APP_CONFIG.name}.</Footer>;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
      // ... Your additional head options
      >
        {/* Remove default favicon and use custom logo */}
        <link rel="icon" href="/fetan-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/fetan-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/fetan-logo.png" />
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Fetan-System-Technology/kifiya-pay/tree/main/docs"
          footer={footer}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
