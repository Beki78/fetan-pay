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
      {/* Numbered Circle - Left aligned - Responsive */}
      <div
        className="flex items-center justify-center rounded-full mb-3 self-start sm:self-center lg:self-start w-12 h-12 sm:w-[57.651px] sm:h-[55.069px] text-lg sm:text-[20.651px]"
        style={{
          padding: "8.605px",
          background: "rgba(132, 183, 255, 0.26)",
          fontFamily: "var(--font-geist)",
          fontWeight: 600,
          color: "#174686",
        }}
      >
        {number}
      </div>

      {/* Icon with Gradient Circle - Centered - Responsive */}
      <div
        className="flex flex-col items-center justify-center mb-4 mx-auto w-[110px] h-[110px] sm:w-[138.534px] sm:h-[136.727px] rounded-full"
        style={{
          padding: "13.692px",
          border: "3.967px solid rgba(255, 255, 255, 0.38)",
          background:
            "linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.60) 100%)",
          boxShadow: "0 0 26.056px 0 rgba(22, 93, 188, 0.16)",
          backdropFilter: "blur(14.365782737731934px)",
        }}
      >
        <Image
          src={icon}
          alt={iconAlt}
          width={75}
          height={75}
          className="w-12 h-12 sm:w-[75px] sm:h-[75px]"
        />
      </div>

      {/* Content - Responsive */}
      <div className="text-center px-2 w-full">
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
    <section className="py-8 sm:py-12 md:py-16 px-4 bg-white relative z-10">
      <div className="mx-auto" style={{ maxWidth: "1450px" }}>
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

        {/* Title - Responsive */}
        <h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[75px] font-normal opacity-0 animate-fade-in-up animation-delay-300 text-center mx-auto tracking-tight lg:tracking-[-2.16px]"
          style={{
            fontFamily: "var(--font-geist)",
            background: "linear-gradient(to right, #061a32, #0d3463)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            maxWidth: "1200px",
          }}
        >
          Simple, reliable payment verification in four steps
        </h2>

        {/* Subtitle - Responsive */}
        <p
          className="text-base sm:text-lg md:text-xl lg:text-xl py-4 sm:py-6 md:py-8 leading-6 sm:leading-7 md:leading-8 lg:leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center mx-auto px-4"
          style={{
            fontFamily: "var(--font-geist)",
            maxWidth: "720px",
          }}
        >
          Verify bank transfers in four clear steps, without manual checks or
          guesswork.
        </p>

        {/* Steps - Responsive */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 relative px-4 mx-auto mt-8 sm:mt-10 md:mt-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="opacity-0 animate-fade-in-up flex-1 w-full sm:w-auto max-w-[280px] lg:max-w-none"
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
