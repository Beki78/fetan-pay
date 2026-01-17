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
      className="rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] h-full w-full flex flex-col"
      style={{ padding: 0, margin: 0 }}
    >
      <div
        className="h-full w-full flex items-center justify-center p-2 sm:p-4"
        style={{ height: "100%", margin: 0 }}
      >
        <Image
          src={icon}
          alt={iconAlt}
          width={300}
          height={300}
          className="w-full h-auto object-contain max-h-[200px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-[350px]"
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
    <section className="py-8 sm:py-12 md:py-16 px-4 relative z-10 bg-white">
      <div
        className="mx-auto rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8"
        style={{
          maxWidth: "1450px",
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
          Built for real-world business needs
        </h2>

        {/* Subtitle - Responsive */}
        <p
          className="text-base sm:text-lg md:text-xl lg:text-xl py-4 sm:py-6 md:py-8 leading-6 sm:leading-7 md:leading-8 lg:leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto px-4"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(11,1fr)] max-w-[1400px] mx-auto mt-12 core-features-grid"
          style={{
            gap: "16px",
            rowGap: "16px",
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media (min-width: 1024px) {
              .core-features-grid {
                grid-template-rows: 400px 400px !important;
                row-gap: 0px !important;
              }
              .feature-card-0 { grid-column: span 4 !important; }
              .feature-card-1 { grid-column: span 3 !important; }
              .feature-card-2 { grid-column: span 4 !important; }
              .feature-card-3 { grid-column: span 3 !important; }
              .feature-card-4 { grid-column: span 5 !important; }
              .feature-card-5 { grid-column: span 3 !important; }
            }
          `,
            }}
          />
          {features.map((feature, index) => {
            return (
              <div
                key={feature.title}
                className={`opacity-0 animate-fade-in-up feature-card-${index} w-full`}
                style={{
                  minHeight: "250px",
                  height: "auto",
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
