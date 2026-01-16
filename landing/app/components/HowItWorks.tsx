import Image from "next/image";
import Badge from "./Badge";

interface StepProps {
  number: number;
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
  showArrow?: boolean;
}

function Step({
  number,
  icon,
  iconAlt,
  title,
  description,
  showArrow = true,
}: StepProps) {
  return (
    <div className="flex flex-col items-center relative w-full">
      {/* Numbered Circle - Left aligned */}
      <div
        className="flex items-center justify-center rounded-full mb-3 self-start"
        style={{
          display: "flex",
          width: "57.651px",
          height: "55.069px",
          padding: "8.605px",
          justifyContent: "center",
          alignItems: "center",
          gap: "33.558px",
          background: "rgba(132, 183, 255, 0.26)",
          borderRadius: "50%",
          fontFamily: "var(--font-geist)",
          fontSize: "20.651px",
          fontWeight: 600,
          color: "#174686",
        }}
      >
        {number}
      </div>

      {/* Icon with Gradient Circle - Centered */}
      <div
        className="flex flex-col items-center justify-center mb-4"
        style={{
          display: "flex",
          width: "138.534px",
          height: "136.727px",
          padding: "13.692px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "10.269px",
          borderRadius: "83.886px",
          border: "3.967px solid rgba(255, 255, 255, 0.38)",
          background:
            "linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.60) 100%)",
          boxShadow: "0 0 26.056px 0 rgba(22, 93, 188, 0.16)",
          backdropFilter: "blur(14.365782737731934px)",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Image src={icon} alt={iconAlt} width={75} height={75} />
      </div>

      {/* Content */}
      <div className="text-center px-2 w-full">
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

      {/* Arrow Connector - Positioned with gap from icon */}
      {showArrow && (
        <div
          className="absolute hidden xl:block z-0"
          style={{
            top: "calc(55.069px + 12px + 68.3635px)",
            left: "calc(50% + 69.267px + 24px)",
            transform: "translateY(-50%)",
          }}
        >
          <Image
            src="/icons/howitworks/arrowup.svg"
            alt="arrow"
            width={400}
            height={88}
            className="object-contain"
            style={{ width: "150px", height: "auto", minWidth: "150px" }}
          />
        </div>
      )}
    </div>
  );
}

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: "/icons/howitworks/firsticon.svg",
      iconAlt: "Payment transaction",
      title: "Payment Sent",
      description:
        "Your customer sends a payment using their preferred bank or mobile money service.",
    },
    {
      number: 2,
      icon: "/icons/howitworks/iconsax-scan-barcode.svg",
      iconAlt: "QR code scan",
      title: "Reference Entry",
      description:
        "Scan the receipt QR code or manually enter the transaction reference using the Fetan Pay.",
    },
    {
      number: 3,
      icon: "/icons/howitworks/lense.svg",
      iconAlt: "Magnifying glass",
      title: "Instant Verification",
      description:
        "Fetan Pay checks the transaction instantly and verifies the amount, validity, and payment provider.",
    },
    {
      number: 4,
      icon: "/icons/howitworks/fourth.svg",
      iconAlt: "Shield with checkmark",
      title: "Status Result",
      description:
        "Receive an immediate Verified or Unverified status with clear reasons when verification fails.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge
            icon="/icons/howitworks/howitworksbadgeicon.svg"
            iconAlt="sparkle"
            animationDelay="200"
          >
            How It Works
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
          Simple, reliable payment verification in four steps
        </h2>

        {/* Subtitle */}
        <p
          className="text-xl py-8 leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto"
          style={{
            fontFamily: "var(--font-geist)",
            maxWidth: "720px",
          }}
        >
          Verify bank transfers in four clear steps, without manual checks or
          guesswork.
        </p>

        {/* Steps */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-20 relative px-4  mx-auto mt-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="opacity-0 animate-fade-in-up flex-1 max-w-[280px] lg:max-w-none"
              style={{
                animationDelay: `${500 + index * 100}ms`,
              }}
            >
              <Step
                number={step.number}
                icon={step.icon}
                iconAlt={step.iconAlt}
                title={step.title}
                description={step.description}
                showArrow={index < steps.length - 1}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
