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
      <div className="mb-4 shrink-0 min-h-[100px] sm:min-h-[120px] flex items-center justify-center">
        <div
          className="rounded-full flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-[100px] lg:h-[100px]"
          style={{
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
            className="object-contain w-10 h-10 sm:w-12 sm:h-12 lg:w-[60px] lg:h-[60px]"
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center text-center">
        <h3
          className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#174686] mb-2 sm:mb-3 lg:mb-2 leading-6 sm:leading-7 lg:leading-8"
          style={{
            fontFamily: "var(--font-geist)",
          }}
        >
          {title}
        </h3>
        <p
          className="text-sm sm:text-base text-[#4d4d4d] leading-5 sm:leading-6"
          style={{
            fontFamily: "var(--font-geist)",
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
    <section className="py-8 sm:py-12 md:py-16 px-4 relative z-10 bg-white">
      <div className="mx-auto" style={{ maxWidth: "1450px" }}>
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

        {/* Title - Responsive */}
        <h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[75px] font-normal opacity-0 animate-fade-in-up animation-delay-300 text-center mx-auto tracking-tight lg:tracking-[-2.16px] px-4"
          style={{
            fontFamily: "var(--font-geist)",
            background: "linear-gradient(to right, #061a32, #0d3463)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            maxWidth: "1200px",
          }}
        >
          Trusted by businesses across Ethiopia
        </h2>

        {/* Subtitle - Responsive */}
        <p
          className="text-base sm:text-lg md:text-xl lg:text-xl py-4 sm:py-6 md:py-8 leading-6 sm:leading-7 md:leading-8 lg:leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto px-4"
          style={{
            fontFamily: "var(--font-geist)",
            maxWidth: "720px",
          }}
        >
          From small cafes to large e-commerce platforms, businesses rely on
          Fetan Pay for instant, reliable payment verification.
        </p>

        {/* Business Cards Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-[1400px] mx-auto mt-8 sm:mt-10 md:mt-12">
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
