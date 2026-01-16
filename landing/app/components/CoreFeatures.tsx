import Image from "next/image";
import Badge from "./Badge";

interface FeatureCardProps {
  title?: string;
  description?: string;
  icon: string;
  iconAlt: string;
}

function FeatureCard({ icon, iconAlt }: FeatureCardProps) {
  return (
    <div
      className="rounded-[28px] h-full w-full flex flex-col"
      style={{ height: "400px", padding: 0, margin: 0 }}
    >
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ height: "100%", padding: 0, margin: 0 }}
      >
        <Image
          src={icon}
          alt={iconAlt}
          width={300}
          height={300}
          className="w-full h-full object-contain"
          style={{ maxHeight: "100%", width: "auto", height: "auto" }}
        />
      </div>
    </div>
  );
}

export default function CoreFeatures() {
  const features = [
    {
      title: "Real-Time Payment Verification",
      description:
        "Instantly confirm bank transfers with accurate, reliable status feedback.",
      icon: "/icons/corefeatures/realtimepayment.svg",
      iconAlt: "Real-time payment verification",
    },
    {
      title: "Flexible Verification Options",
      icon: "/icons/corefeatures/flexibleverification.svg",
      iconAlt: "Flexible verification options",
    },
    {
      title: "Tip Collection & Tracking",
      description:
        "Accept and track tips with detailed attribution and performance insights.",
      icon: "/icons/corefeatures/tipsandcollaction.svg",
      iconAlt: "Tip collection and tracking",
    },
    {
      title: "Multi-Bank Support",
      icon: "/icons/corefeatures/multibanksupport.png",
      iconAlt: "Multi-bank support",
    },
    {
      title: "Transaction History & Audit Logs",
      description:
        "Maintain a complete, searchable record of all verifications for reporting and accountability.",
      icon: "/icons/corefeatures/tranactionhistory.svg",
      iconAlt: "Transaction history and audit logs",
    },
    {
      title: "Sales Reports",
      description: "Clear reports for verified transactions and performance.",
      icon: "/icons/corefeatures/salesreport.svg",
      iconAlt: "Sales reports",
    },
  ];

  return (
    <section className="py-16 px-4 relative z-10 bg-white">
      <div
        className="max-w-7xl mx-auto rounded-[50px] py-16 px-8"
        style={{
          background: "linear-gradient(180deg, #FAFEFF 0%, #EAFCFD 100%)",
        }}
      >
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge
            icon="/icons/corefeatures/iconsax-category.svg"
            iconAlt="core features"
            animationDelay="200"
          >
            Core Features
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
          Built for real-world business needs
        </h2>

        {/* Subtitle */}
        <p
          className="text-xl py-8 leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto"
          style={{
            fontFamily: "var(--font-geist)",
            maxWidth: "820px",
          }}
        >
          Everything businesses need to verify payments accurately and operate
          with confidence.
        </p>

        {/* Feature Cards - Bento Grid 2x3 */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(11,1fr)] max-w-[1400px] mx-auto mt-12"
          style={{
            gridTemplateRows: "400px 400px",
            gap: "16px",
            rowGap: "0px",
          }}
        >
          {features.map((feature, index) => {
            // First row: 40%, 30%, 40% = 4fr, 3fr, 4fr
            // Second row: 30%, 40%, 30% = 3fr, 4fr, 3fr
            let colSpan = "";
            if (index === 0) {
              // First card - 40% (4 out of 11)
              colSpan = "4";
            } else if (index === 1) {
              // Second card - 30% (3 out of 11)
              colSpan = "3";
            } else if (index === 2) {
              // Third card - 40% (4 out of 11)
              colSpan = "4";
            } else if (index === 3) {
              // Fourth card - 30% (3.3 out of 11, use 3) - Second row first
              colSpan = "3";
            } else if (index === 4) {
              // Fifth card - 40% (4.4 out of 11, use 5 to get closer) - Second row middle
              colSpan = "5";
            } else if (index === 5) {
              // Sixth card - 30% (3.3 out of 11, use 3) - Second row last
              colSpan = "3";
            }

            return (
              <div
                key={feature.title}
                className="opacity-0 animate-fade-in-up"
                style={{
                  gridColumn: `span ${colSpan}`,
                  height: "400px",
                  padding: 0,
                  margin: 0,
                  animationDelay: `${500 + index * 100}ms`,
                }}
              >
                <FeatureCard icon={feature.icon} iconAlt={feature.iconAlt} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
