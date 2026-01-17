"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Bank logos positioned along the visible 2nd quadrant arc (top-left portion)
const banks = [
  { name: "TeleBirr", logo: "/banks/Telebirr.png", initialAngle: 180 },
  { name: "CBE", logo: "/banks/CBE.png", initialAngle: 210 },
  { name: "BOA", logo: "/banks/BOA.png", initialAngle: 240 },
  { name: "Awash", logo: "/banks/Awash.png", initialAngle: 270 },
  { name: "Dashen", logo: "/banks/Dashen.png", initialAngle: 300 },
];

const ORBIT_DURATION = 30000;
const LOGO_SIZE = 110;
const ORBIT_RADIUS = 750;
const FETAN_LOGO_ANGLE = 150; // Position of Fetan logo in degrees (10 o'clock)
const INITIAL_ROTATION = -90; // Start animation at -90° so first bank icon appears at 270° position
const RESTART_ROTATION = 60; // When rotation reaches 60°, Awash (270°) is at 210°

// Verified checkmark SVG component - using the provided verifyicon.svg
function VerifiedIcon({ size }: { size: number }) {
  return (
    <Image
      src="/icons/hero/verifyicon.svg"
      alt="Verified"
      width={size}
      height={size}
      className="object-contain"
    />
  );
}

function BankLogo({
  name,
  logo,
  initialAngle,
  currentRotation,
}: {
  name: string;
  logo: string;
  initialAngle: number;
  currentRotation: number;
}) {
  const currentAngle = initialAngle - currentRotation;
  const normalizedAngle = ((currentAngle % 360) + 360) % 360;
  // Show verify icon from 150° (Fetan logo position) to 210°
  // Bank icons rotate counterclockwise, so they reach 150° first, then continue to 210°
  const isVerified =
    normalizedAngle >= FETAN_LOGO_ANGLE && normalizedAngle < 210;

  const angleRad = (initialAngle * Math.PI) / 180;
  const x = Math.cos(angleRad) * ORBIT_RADIUS;
  const y = Math.sin(angleRad) * ORBIT_RADIUS;

  return (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px - ${LOGO_SIZE / 2}px)`,
        top: `calc(50% + ${y}px - ${LOGO_SIZE / 2}px)`,
      }}
    >
      <div
        className="rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          background:
            "linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.38)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(14.365782737731934px)",
        }}
      >
        <div
          className="transition-all duration-300"
          style={{
            opacity: isVerified ? 0 : 1,
            transform: isVerified ? "scale(0.8)" : "scale(1)",
          }}
        >
          <Image
            src={logo}
            alt={name}
            width={LOGO_SIZE * 0.65}
            height={LOGO_SIZE * 0.65}
            className="object-contain"
          />
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{
            opacity: isVerified ? 1 : 0,
            transform: isVerified ? "scale(1)" : "scale(0.8)",
          }}
        >
          <VerifiedIcon size={LOGO_SIZE * 0.55} />
        </div>
      </div>
    </div>
  );
}

export default function BankOrbit() {
  const [rotation, setRotation] = useState(INITIAL_ROTATION);

  useEffect(() => {
    let startTime = Date.now();
    let lastRotation = INITIAL_ROTATION;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      // Calculate rotation from -90° and loop continuously
      let newRotation = INITIAL_ROTATION + (elapsed / ORBIT_DURATION) * 360;

      // When the last verification icon (Awash at 270°) reaches 210°, restart from -90°
      // Awash reaches 210° when: 270° - rotation = 210°, so rotation = 60°
      // Check if we've crossed the restart threshold (60°)
      if (newRotation >= RESTART_ROTATION && lastRotation < RESTART_ROTATION) {
        // Reset to -90° when last verify icon reaches 210°
        newRotation = INITIAL_ROTATION;
        startTime = Date.now();
      }

      lastRotation = newRotation;

      // Normalize to 0-360 range for display
      const normalizedRotation = ((newRotation % 360) + 360) % 360;
      setRotation(normalizedRotation);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // The orbit center will be positioned at bottom-right of the container
  // Only the 2nd quadrant (top-left arc from 180° to 270°) will be visible

  return (
    <div
      className="absolute opacity-0 animate-fade-in animation-delay-400"
      style={{
        width: "1800px",
        height: "1800px",
        // Position so center is at bottom-right corner of viewport
        right: "-900px",
        bottom: "-900px",
      }}
    >
      {/* Glassy orbit track - ~150px wide ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer edge of track */}
        <div
          className="absolute rounded-full"
          style={{
            width: "1650px",
            height: "1650px",
            border: "1px solid rgba(208, 248, 251, 0.4)",
          }}
        />

        {/* Glassy track fill */}
        <div
          className="absolute rounded-full"
          style={{
            width: "1650px",
            height: "1650px",
            background:
              "radial-gradient(circle at center, transparent 674px, rgba(232, 254, 255, 0.1) 675px, rgba(232, 254, 255, 0.2) 750px, rgba(232, 254, 255, 0.1) 825px, transparent 826px)",
          }}
        />

        {/* Inner edge of track */}
        <div
          className="absolute rounded-full"
          style={{
            width: "1350px",
            height: "1350px",
            border: "1px solid rgba(208, 248, 251, 0.4)",
          }}
        />
      </div>

      {/* Rotating container for banks */}
      <div
        className="absolute inset-0"
        style={{
          transform: `rotate(${-rotation}deg)`,
        }}
      >
        {banks.map((bank) => (
          <BankLogo
            key={bank.name}
            name={bank.name}
            logo={bank.logo}
            initialAngle={bank.initialAngle}
            currentRotation={rotation}
          />
        ))}
      </div>

      {/* Fetan Pay logo - positioned at 150° (10 o'clock position) */}
      <div
        className="absolute z-10"
        style={{
          left: `calc(50% - ${ORBIT_RADIUS * 0.87}px - 140px)`,
          top: `calc(50% - ${ORBIT_RADIUS * 0.5}px - 140px)`,
        }}
      >
        {/* Outer container - glassy background with opacity */}
        <div
          className="w-[280px] h-[280px] rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.38)",
            boxShadow: "0 20px 80px rgba(0, 0, 0, 0.06)",
            backdropFilter: "blur(14.365782737731934px)",
          }}
        >
          {/* Inner container - glassy background matching bank icons */}
          <div
            className="w-[200px] h-[200px] rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.38)",
              boxShadow: "0 8px 40px rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(14.365782737731934px)",
            }}
          >
            <Image
              src="/logo/fetan-logo.png"
              alt="Fetan Pay"
              width={130}
              height={120}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
