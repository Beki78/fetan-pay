export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fetan Pay",
    description:
      "Fetan Pay provides instant bank transfer verification across Ethiopian banks without moving money.",
    url: "https://fetanpay.com",
    logo: "https://fetanpay.com/logo/fetan-logo.png",
    sameAs: [
      // Add your social media links here
      // "https://twitter.com/fetanpay",
      // "https://linkedin.com/company/fetanpay",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      // Add contact information when available
    },
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Fetan Pay",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Instant bank transfer verification API for Ethiopian banks. Verify payments from CBE, Telebirr, Awash Bank, BOA, and Dashen Bank without moving money.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ETB",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Payment Verification Service",
    provider: {
      "@type": "Organization",
      name: "Fetan Pay",
    },
    areaServed: {
      "@type": "Country",
      name: "Ethiopia",
    },
    description:
      "Instant bank transfer verification service for Ethiopian banks including CBE, Telebirr, Awash Bank, Bank of Abyssinia, and Dashen Bank.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
    </>
  );
}
