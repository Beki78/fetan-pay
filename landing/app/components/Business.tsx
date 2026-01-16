import Image from "next/image";
import Badge from "./Badge";

interface BusinessCardProps {
  title: string;
  description: string;
  icon: string;
  iconAlt: string;
}

function BusinessCard({
  title,
  description,
  icon,
  iconAlt,
}: BusinessCardProps) {
  return (
    <div
      className="rounded-[28px] p-6 h-full flex flex-col bg-white"
      style={{
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="mb-4 shrink-0 min-h-[120px] flex items-center justify-center">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: "100px",
            height: "100px",
            background: "linear-gradient(180deg, #FAFEFF 0%, #EAFCFD 100%)",
            border: "1px solid #d0f8fb",
          }}
          aria-label={iconAlt}
        >
          <Image
            src={icon}
            alt={iconAlt}
            width={60}
            height={60}
            className="object-contain"
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center text-center">
        <h3
          style={{
            fontFamily: "var(--font-geist)",
            fontSize: "24px",
            fontWeight: 600,
            color: "#174686",
            marginBottom: "8px",
            lineHeight: "32px",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-geist)",
            fontSize: "16px",
            lineHeight: "24px",
            color: "#4d4d4d",
            fontWeight: 400,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Business() {
  const businessTypes = [
    {
      title: "Restaurants & cafés",
      description:
        "Confirm payment for dine-in and delivery orders in real-time without manual checks.",
      icon: "/icons/business/iconsax-serving-dome.svg",
      iconAlt: "Restaurant and cafe icon",
    },
    {
      title: "Pharmacies",
      description:
        "Verify payments for prescriptions and medical supplies instantly and securely.",
      icon: "/icons/business/iconsax-ai-syringe.svg",
      iconAlt: "Pharmacy icon",
    },
    {
      title: "E-commerce platforms",
      description:
        "Verify customer payments instantly before processing orders and shipping products.",
      icon: "/icons/business/iconsax-shopping-cart.svg",
      iconAlt: "E-commerce platform icon",
    },
    {
      title: "Supermarkets & stores",
      description:
        "Confirm payment for retail purchases with real-time verification at checkout.",
      icon: "/icons/business/iconsax-shop.svg",
      iconAlt: "Supermarket and store icon",
    },
    {
      title: "Service providers & agencies",
      description:
        "Verify payments for appointments, memberships, and service bookings instantly.",
      icon: "/icons/business/iconsax-setting-2.svg",
      iconAlt: "Service provider icon",
    },
    {
      title: "Developers",
      description:
        "Integrate payment verification APIs into your applications and platforms seamlessly.",
      icon: "/icons/business/iconsax-code-1.svg",
      iconAlt: "Developer icon",
    },
  ];

  return (
    <section className="py-16 px-4 relative z-10 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge
            icon="/icons/howitworks/howitworksbadgeicon.svg"
            iconAlt="business use cases"
            animationDelay="200"
          >
            Business Use Cases
          </Badge>
        </div>

        {/* Title */}
        <h2
          className="text-[72px] leading-[75px] font-normal opacity-0 animate-fade-in-up animation-delay-300 text-center mx-auto"
          style={{
            fontFamily: "var(--font-geist)",
            letterSpacing: "-2.16px",
            background: "linear-gradient(to right, #061a32, #0d3463)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            maxWidth: "1200px",
          }}
        >
          Trusted by businesses across Ethiopia
        </h2>

        {/* Subtitle */}
        <p
          className="text-xl py-8 leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto"
          style={{
            fontFamily: "var(--font-geist)",
            maxWidth: "720px",
          }}
        >
          From small cafes to large e-commerce platforms, businesses rely on
          Fetan Pay for instant, reliable payment verification.
        </p>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1400px] mx-auto mt-12">
          {businessTypes.map((business, index) => (
            <div
              key={business.title}
              className="opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${500 + index * 100}ms`,
              }}
            >
              <BusinessCard
                title={business.title}
                description={business.description}
                icon={business.icon}
                iconAlt={business.iconAlt}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
