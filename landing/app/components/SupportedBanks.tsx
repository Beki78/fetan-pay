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
      className="py-16 px-4 relative z-10 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at bottom center, rgba(255, 248, 240, 0.5) 0%, transparent 70%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Bank Logos */}
          <div className="relative h-[450px] flex items-center justify-start">
            {banks.map((bank, index) => {
              const isCenter = bank.name === "CBE";
              const flowerPos = getFlowerPosition(
                "flowerAngle" in bank ? bank.flowerAngle : undefined,
                isCenter
              );

              return (
                <div
                  key={bank.name}
                  className="absolute opacity-0 animate-fade-in-up"
                  style={{
                    ...flowerPos,
                    animationDelay: `${500 + index * 100}ms`,
                    zIndex: isCenter ? 10 : 5,
                  }}
                >
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: isCenter ? "100px" : "90px",
                      height: isCenter ? "100px" : "90px",
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
                      className="object-contain"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side - Text Content */}
          <div className="flex flex-col">
            {/* Badge */}
            <div className="mb-6">
              <Badge
                icon="/icons/bankstowork/iconsax-building.svg"
                iconAlt="supported payment providers"
                animationDelay="200"
              >
                Supported Payment Providers
              </Badge>
            </div>

            {/* Title */}
            <h2
              className="text-[72px] leading-[75px] font-normal opacity-0 animate-fade-in-up animation-delay-300 text-start mx-auto"
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
              Works with Ethiopia&apos;s Major Banks
            </h2>

            {/* Subtitle */}
            <p
              className="text-xl  py-8 leading-[35px] text-[#4d4d4d] font-normal animate-fade-in-up animation-delay-400 text-start mx-auto"
              style={{
                fontFamily: "var(--font-geist)",
                maxWidth: "820px",
              }}
            >
              Whether you process a few payments a day or thousands, Fetan Pay
              adapts to your needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
