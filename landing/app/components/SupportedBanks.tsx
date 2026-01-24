import Image from "next/image";
import Badge from "./Badge";

export default function SupportedBanks() {
  const banks = [
    {
      logo: "/banks/CBE.png",
      name: "CBE",
      shadowColor: "rgba(255, 215, 0, 0.25)", // Softer golden/yellow
    },
    {
      logo: "/banks/Telebirr.png",
      name: "Telebirr",
      flowerAngle: 45, // Top-right petal
      shadowColor: "rgba(0, 123, 255, 0.25)", // Softer blue
    },
    {
      logo: "/banks/Awash.png",
      name: "Awash Bank",
      flowerAngle: 135, // Top-left petal
      shadowColor: "rgba(255, 140, 0, 0.25)", // Softer orange
    },
    {
      logo: "/banks/BOA.png",
      name: "Bank of Abyssinia",
      flowerAngle: 225, // Bottom-left petal
      shadowColor: "rgba(22, 93, 188, 0.25)", // Softer dark blue
    },
    {
      logo: "/banks/Dashen.png",
      name: "Dashen Bank",
      flowerAngle: 315, // Bottom-right petal
      shadowColor: "rgba(22, 70, 134, 0.25)", // Softer dark blue
    },
  ];

  // Calculate flower pattern positions (petals around center)
  const radius = 200; // Distance from center for petals
  const centerOffsetX = -80; // Push to the left to align with CoreFeatures
  const centerOffsetY = -50; // Push banks to the top
  const getFlowerPosition = (
    flowerAngle: number | undefined,
    isCenter: boolean
  ) => {
    if (isCenter) {
      return {
        top: `calc(50% + ${centerOffsetY}px)`,
        left: `calc(50% + ${centerOffsetX}px)`,
        transform: "translate(-50%, -50%)",
      };
    }
    if (!flowerAngle)
      return {
        top: `calc(50% + ${centerOffsetY}px)`,
        left: `calc(50% + ${centerOffsetX}px)`,
        transform: "translate(-50%, -50%)",
      };

    // Convert flower angle to radians (0° = right, 90° = bottom, 180° = left, 270° = top)
    const angleRad = (flowerAngle - 90) * (Math.PI / 180);
    const x = Math.cos(angleRad) * radius + centerOffsetX;
    const y = Math.sin(angleRad) * radius + centerOffsetY;

    return {
      top: `calc(50% + ${y}px)`,
      left: `calc(50% + ${x}px)`,
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <section
      className="py-8 sm:py-12 md:py-16 px-4 relative z-10 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at bottom center, rgba(255, 248, 240, 0.5) 0%, transparent 70%)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1450px" }}>
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-start">
          {/* Text Content - First on mobile, Right on desktop */}
          <div className="flex flex-col text-center lg:text-left order-1 lg:order-2">
            {/* Badge */}
            <div className="mb-6 flex justify-center lg:justify-start">
              <Badge
                icon="/icons/bankstowork/iconsax-building.svg"
                iconAlt="supported payment providers"
                animationDelay="200"
              >
                Supported Payment Providers
              </Badge>
            </div>

            {/* Title - Responsive */}
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[72px] leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[75px] font-normal opacity-0 animate-fade-in-up animation-delay-300 text-center lg:text-start mx-auto lg:mx-0 tracking-tight lg:tracking-[-2.16px] px-4 lg:px-0"
              style={{
                fontFamily: "var(--font-geist)",
                background: "linear-gradient(to right, #061a32, #0d3463)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                maxWidth: "1200px",
              }}
            >
              Works with Ethiopia&apos;s Major Banks
            </h2>

            {/* Subtitle - Responsive */}
            <p
              className="text-base sm:text-lg md:text-xl lg:text-xl py-4 sm:py-6 md:py-8 leading-6 sm:leading-7 md:leading-8 lg:leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-center lg:text-start mx-auto lg:mx-0 px-4 lg:px-0"
              style={{
                fontFamily: "var(--font-geist)",
                maxWidth: "820px",
              }}
            >
              Whether you process a few payments a day or thousands, Fetan Pay
              adapts to your needs.
            </p>
          </div>

          {/* Bank Logos - Single row on mobile, Flower pattern on desktop */}
          <div className="relative h-auto lg:h-[450px] flex flex-row lg:flex-col items-center justify-center gap-3 sm:gap-4 lg:justify-start lg:gap-0 order-2 lg:order-1 w-full lg:w-auto px-4 lg:px-0 py-6 lg:py-0">
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @media (min-width: 1024px) {
                .bank-logo-desktop {
                  position: absolute;
                }
              }
            `,
              }}
            />
            
            {banks.map((bank, index) => {
              const isCenter = bank.name === "CBE";
              const flowerAngle =
                "flowerAngle" in bank ? bank.flowerAngle : undefined;

              // Desktop: Original flower pattern
              const flowerPos = getFlowerPosition(flowerAngle, isCenter);

              return (
                <div
                  key={bank.name}
                  className="opacity-0 animate-fade-in-up flex-1 lg:flex-none bank-logo-desktop"
                  style={{
                    ...flowerPos,
                    animationDelay: `${500 + index * 100}ms`,
                    zIndex: isCenter ? 10 : 5,
                  }}
                >
                  <div
                    className={`rounded-full flex items-center justify-center mx-auto ${
                      isCenter
                        ? "w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-[100px] lg:h-[100px]"
                        : "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[90px] lg:h-[90px]"
                    }`}
                    style={{
                      background: "white",
                      boxShadow: `0 8px 32px ${bank.shadowColor}, 0 0 40px ${bank.shadowColor}`,
                      filter: "blur(0.5px)",
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    <Image
                      src={bank.logo}
                      alt={bank.name}
                      width={isCenter ? 60 : 55}
                      height={isCenter ? 60 : 55}
                      className={`object-contain ${
                        isCenter
                          ? "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-[60px] lg:h-[60px]"
                          : "w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-[55px] lg:h-[55px]"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
