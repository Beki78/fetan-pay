"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Badge from "./Badge";
import { fetchPublicPlans } from "../../lib/api";
import { Plan } from "../../lib/types";
import { MERCHANT_SIGNUP_URL } from "../../lib/config";

interface PricingTierProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonHref: string;
  verificationLimit?: number | null;
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
  verificationLimit,
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
        target={buttonHref.startsWith("http") ? "_blank" : undefined}
        rel={buttonHref.startsWith("http") ? "noopener noreferrer" : undefined}
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">(
    "MONTHLY",
  );

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const response = await fetchPublicPlans();
        // Sort plans by display order
        const sortedPlans = response.data.sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );
        setPlans(sortedPlans);
      } catch (err) {
        console.error("Error loading plans:", err);
        setError("Failed to load pricing plans");
        // Fallback to hardcoded data if API fails
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  // Fallback data in case API fails
  const fallbackPlans: Plan[] = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for testing the platform - 7-day free trial",
      price: 0,
      billingCycle: "MONTHLY",
      verificationLimit: 20,
      apiLimit: 1000,
      features: [
        "7-day free trial",
        "20 verifications during trial",
        "1 team member",
        "Unlimited webhooks",
        "Basic analytics",
        "All verification methods",
        "Multi-bank support",
        "Bank account management (up to 2 accounts)",
        "Transaction history (30 days)",
      ],
      status: "ACTIVE",
      isPopular: false,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small businesses and startups",
      price: 179,
      billingCycle: "MONTHLY",
      verificationLimit: 100,
      apiLimit: 10000,
      features: [
        "100 verifications/month",
        "5 team members (employees)",
        "Unlimited webhooks",
        "Advanced analytics",
        "Tips collection",
        "Bank account management (up to 5 accounts)",
        "Verification by usage",
      ],
      status: "ACTIVE",
      isPopular: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "business",
      name: "Business",
      description: "Perfect for growing businesses and medium-sized companies",
      price: 999,
      billingCycle: "MONTHLY",
      verificationLimit: 1000,
      apiLimit: 100000,
      features: [
        "1000 verifications/month",
        "Full API access",
        "Unlimited API keys",
        "15 team members (employees)",
        "Unlimited webhooks",
        "Advanced analytics & reporting",
        "Tips collection",
        "Custom branding",
        "Bank account management (up to 10 accounts)",
        "Verification by usage",
      ],
      status: "ACTIVE",
      isPopular: false,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "custom",
      name: "Custom",
      description:
        "Perfect for large enterprises, fintech companies, and businesses with specific needs",
      price: 0, // Custom pricing
      billingCycle: "MONTHLY",
      verificationLimit: null, // Unlimited
      apiLimit: 100000,
      features: [
        "Custom verification limits",
        "Full API access",
        "Unlimited API keys",
        "Unlimited team members (employees)",
        "Vendor dashboard",
        "Unlimited webhooks",
        "Advanced analytics & reporting",
        "Tips collection",
        "Custom branding",
        "Transaction history (unlimited)",
        "All verification methods",
        "Bank account management (unlimited)",
        "Custom webhook endpoints",
        "Frontend UI Package (NO watermark)",
        "White-label solution",
        "On-premise deployment option",
        "Custom integrations",
        "Dedicated support",
        "Volume discounts",
        "Custom pricing",
      ],
      status: "ACTIVE",
      isPopular: false,
      displayOrder: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Yearly Plans
    {
      id: "starter-yearly",
      name: "Starter Yearly",
      description:
        "Perfect for small businesses and startups - Save 20% with yearly billing",
      price: 1720,
      billingCycle: "YEARLY",
      verificationLimit: 100,
      apiLimit: 10000,
      features: [
        "100 verifications/month",
        "5 team members (employees)",
        "Unlimited webhooks",
        "Advanced analytics",
        "Tips collection",
        "Bank account management (up to 5 accounts)",
        "Verification by usage",
        "20% discount (2 months free)",
      ],
      status: "ACTIVE",
      isPopular: true,
      displayOrder: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "business-yearly",
      name: "Business Yearly",
      description:
        "Perfect for growing businesses and medium-sized companies - Save 20% with yearly billing",
      price: 9590,
      billingCycle: "YEARLY",
      verificationLimit: 1000,
      apiLimit: 100000,
      features: [
        "1000 verifications/month",
        "Full API access",
        "Unlimited API keys",
        "15 team members (employees)",
        "Unlimited webhooks",
        "Advanced analytics & reporting",
        "Tips collection",
        "Custom branding",
        "Bank account management (up to 10 accounts)",
        "Verification by usage",
        "20% discount (2.4 months free)",
      ],
      status: "ACTIVE",
      isPopular: false,
      displayOrder: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Transform API data to display format
  const transformPlanToDisplay = (plan: Plan) => {
    const formatPrice = (price: number) => {
      if (price === 0 && plan.name.toLowerCase() === "free") return "Free";
      if (price === 0) return "Free";
      if (plan.name.toLowerCase().includes("custom")) return "Custom";
      return `ETB ${price.toLocaleString()}`;
    };

    const formatPeriod = (billingCycle: string, planName: string) => {
      // Special case for free plan - show "7-day trial"
      if (planName.toLowerCase() === "free") {
        return "7-day trial";
      }

      switch (billingCycle) {
        case "MONTHLY":
          return "month";
        case "YEARLY":
          return "year";
        case "WEEKLY":
          return "week";
        case "DAILY":
          return "day";
        default:
          return "month";
      }
    };

    const getButtonText = (plan: Plan) => {
      if (plan.name.toLowerCase().includes("custom")) return "Contact Sales";
      return "Get Started";
    };

    const getButtonHref = (plan: Plan) => {
      if (plan.name.toLowerCase().includes("custom"))
        return "mailto:fetanpay@gmail.com";
      return MERCHANT_SIGNUP_URL;
    };

    return {
      name: plan.name,
      price: formatPrice(plan.price),
      period: formatPeriod(plan.billingCycle, plan.name),
      description: plan.description,
      features: plan.features,
      isPopular: plan.isPopular,
      buttonText: getButtonText(plan),
      buttonHref: getButtonHref(plan),
      verificationLimit: plan.verificationLimit,
    };
  };

  // Filter plans based on selected billing cycle
  const filteredPlans = plans.filter((plan) => {
    if (billingCycle === "MONTHLY") {
      return plan.billingCycle === "MONTHLY";
    } else {
      // For yearly, only show yearly plans (exclude Free and Custom)
      return plan.billingCycle === "YEARLY";
    }
  });

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-white relative z-10">
        <div className="mx-auto" style={{ maxWidth: "1450px" }}>
          <div className="flex justify-center mb-6">
            <Badge
              icon="/icons/howitworks/howitworksbadgeicon.svg"
              iconAlt="pricing"
              animationDelay="200"
            >
              Pricing
            </Badge>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[75px] font-normal text-center mx-auto tracking-tight lg:tracking-[-2.16px] px-4"
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
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#174686]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error && plans.length === 0) {
    return (
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-white relative z-10">
        <div className="mx-auto" style={{ maxWidth: "1450px" }}>
          <div className="flex justify-center mb-6">
            <Badge
              icon="/icons/howitworks/howitworksbadgeicon.svg"
              iconAlt="pricing"
              animationDelay="200"
            >
              Pricing
            </Badge>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[75px] font-normal text-center mx-auto tracking-tight lg:tracking-[-2.16px] px-4"
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
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Unable to load pricing plans</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#174686] text-white rounded-full hover:bg-[#0d3463] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

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

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8 sm:mb-10 md:mb-12">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                billingCycle === "MONTHLY"
                  ? "bg-[#174686] text-white shadow-md"
                  : "text-[#174686] hover:bg-gray-200"
              }`}
              style={{
                fontFamily: "var(--font-inter)",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("YEARLY")}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 relative ${
                billingCycle === "YEARLY"
                  ? "bg-[#174686] text-white shadow-md"
                  : "text-[#174686] hover:bg-gray-200"
              }`}
              style={{
                fontFamily: "var(--font-inter)",
              }}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Error message if API failed but we have fallback data */}
        {error && (
          <div className="text-center mb-4">
            <p className="text-amber-600 text-sm">
              Using cached pricing data. Some information may be outdated.
            </p>
          </div>
        )}

        {/* Pricing Cards - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-10 md:mt-12">
          {filteredPlans.map((plan, index) => {
            const displayPlan = transformPlanToDisplay(plan);
            return (
              <div
                key={`${plan.id}-${billingCycle}`}
                className="opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${500 + index * 100}ms`,
                }}
              >
                <PricingTier
                  name={displayPlan.name.replace(" Yearly", "")} // Remove "Yearly" from display name
                  price={displayPlan.price}
                  period={displayPlan.period}
                  description={displayPlan.description}
                  features={displayPlan.features}
                  isPopular={displayPlan.isPopular}
                  buttonText={displayPlan.buttonText}
                  buttonHref={displayPlan.buttonHref}
                  verificationLimit={displayPlan.verificationLimit}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
