import Link from "next/link";
import Badge from "./Badge";

interface PricingTierProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonHref: string;
}

function PricingTier({
  name,
  price,
  period,
  description,
  features,
  isPopular = false,
  buttonText,
  buttonHref,
}: PricingTierProps) {
  return (
    <div
      className={`rounded-[28px] p-6 sm:p-8 h-full flex flex-col bg-white relative ${
        isPopular ? "border-2 border-[#174686]" : "border border-gray-200"
      }`}
      style={{
        boxShadow: isPopular
          ? "0 8px 32px rgba(23, 70, 134, 0.12)"
          : "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}
    >
      {isPopular && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium text-white"
          style={{
            background: "linear-gradient(180deg, #174686 0%, #0d3463 100%)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Most Popular
        </div>
      )}

      <div className="flex-1">
        <h3
          className="text-2xl sm:text-3xl font-semibold text-[#174686] mb-2"
          style={{
            fontFamily: "var(--font-geist)",
          }}
        >
          {name}
        </h3>
        <p
          className="text-sm sm:text-base text-[#4d4d4d] mb-6"
          style={{
            fontFamily: "var(--font-geist)",
          }}
        >
          {description}
        </p>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#174686]"
              style={{
                fontFamily: "var(--font-geist)",
              }}
            >
              {price}
            </span>
            <span
              className="text-base sm:text-lg text-[#4d4d4d]"
              style={{
                fontFamily: "var(--font-geist)",
              }}
            >
              /{period}
            </span>
          </div>
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => {
            const clipId = `clip0_4418_4935_${index}`;
            return (
              <li key={index} className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#174686"
                  className="mt-0.5 shrink-0"
                >
                  <g clipPath={`url(#${clipId})`}>
                    <path
                      opacity="0.4"
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      fill="#174686"
                    />
                    <path
                      d="M10.5799 15.5796C10.3799 15.5796 10.1899 15.4996 10.0499 15.3596L7.21994 12.5296C6.92994 12.2396 6.92994 11.7596 7.21994 11.4696C7.50994 11.1796 7.98994 11.1796 8.27994 11.4696L10.5799 13.7696L15.7199 8.62961C16.0099 8.33961 16.4899 8.33961 16.7799 8.62961C17.0699 8.91961 17.0699 9.39961 16.7799 9.68961L11.1099 15.3596C10.9699 15.4996 10.7799 15.5796 10.5799 15.5796Z"
                      fill="#174686"
                    />
                  </g>
                  <defs>
                    <clipPath id={clipId}>
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span
                  className="text-sm sm:text-base text-[#4d4d4d]"
                  style={{
                    fontFamily: "var(--font-geist)",
                  }}
                >
                  {feature}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <Link
        href={buttonHref}
        className={`flex items-center justify-center py-3 px-6 rounded-full font-medium transition-all duration-300 group ${
          isPopular
            ? "bg-[#174686] text-white hover:bg-[#0d3463]"
            : "bg-white text-[#174686] border-2 border-[#174686] hover:bg-[#eafcfd]"
        }`}
        style={{
          fontFamily: "var(--font-inter)",
          borderRadius: "40px",
        }}
      >
        <span className="text-center text-[16px] font-medium leading-[27px]">
          {buttonText}
        </span>
        {isPopular && (
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
        )}
      </Link>
    </div>
  );
}

export default function Pricing() {
  const pricingTiers = [
    {
      name: "Starter",
      price: "Free",
      period: "month",
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 100 verifications per month",
        "Basic transaction history",
        "Email support",
        "Multi-bank support",
        "API access",
      ],
      isPopular: false,
      buttonText: "Get Started",
      buttonHref: "#get-started",
    },
    {
      name: "Professional",
      price: "ETB 2,500",
      period: "month",
      description: "Ideal for growing businesses with higher volume",
      features: [
        "Up to 5,000 verifications per month",
        "Advanced transaction history",
        "Priority email support",
        "Sales reports & analytics",
        "Tip collection & tracking",
        "API access with webhooks",
      ],
      isPopular: true,
      buttonText: "Get Started",
      buttonHref: "#get-started",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "month",
      description: "For large organizations with custom needs",
      features: [
        "Unlimited verifications",
        "Custom transaction limits",
        "Dedicated account manager",
        "Advanced analytics & reporting",
        "Custom integrations",
        "SLA guarantee",
        "24/7 priority support",
      ],
      isPopular: false,
      buttonText: "Contact Sales",
      buttonHref: "#contact",
    },
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 bg-white relative z-10">
      <div className="mx-auto" style={{ maxWidth: "1450px" }}>
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge
            icon="/icons/howitworks/howitworksbadgeicon.svg"
            iconAlt="pricing"
            animationDelay="200"
          >
            Pricing
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
          Simple, transparent pricing for every business
        </h2>

        {/* Subtitle - Responsive */}
        <p
          className="text-base sm:text-lg md:text-xl lg:text-xl py-4 sm:py-6 md:py-8 leading-6 sm:leading-7 md:leading-8 lg:leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto px-4"
          style={{
            fontFamily: "var(--font-geist)",
            maxWidth: "720px",
          }}
        >
          Choose the plan that fits your business needs. All plans include
          instant verification and multi-bank support.
        </p>

        {/* Pricing Cards - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-10 md:mt-12">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className="opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${500 + index * 100}ms`,
              }}
            >
              <PricingTier
                name={tier.name}
                price={tier.price}
                period={tier.period}
                description={tier.description}
                features={tier.features}
                isPopular={tier.isPopular}
                buttonText={tier.buttonText}
                buttonHref={tier.buttonHref}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

