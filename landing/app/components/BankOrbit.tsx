"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Bank logos positioned along the visible 2nd quadrant arc (top-left portion)
const banks = [
  { name: "TeleBirr", logo: "/banks/Telebirr.png", initialAngle: 180 },
  { name: "CBE", logo: "/banks/CBE.png", initialAngle: 210 },
  { name: "BOA", logo: "/banks/BOA.png", initialAngle: 240 },
  { name: "Awash", logo: "/banks/Awash.png", initialAngle: 270 },
];

const ORBIT_DURATION = 30000;
const LOGO_SIZE = 110;
const ORBIT_RADIUS = 750;

// Verified checkmark SVG component
function VerifiedIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 66 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="33" cy="33" r="30" fill="#22c55e" />
      <path
        d="M20 33L29 42L46 25"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
  // Verify when passing the 9 o'clock position (180 degrees)
  const isNearFetanLogo = normalizedAngle > 170 && normalizedAngle < 190;

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
            "linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.6))",
          border: "1px solid rgba(255, 255, 255, 0.38)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          transform: `rotate(${currentRotation}deg)`,
        }}
      >
        <div
          className="transition-all duration-300"
          style={{
            opacity: isNearFetanLogo ? 0 : 1,
            transform: isNearFetanLogo ? "scale(0.8)" : "scale(1)",
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
            opacity: isNearFetanLogo ? 1 : 0,
            transform: isNearFetanLogo ? "scale(1)" : "scale(0.8)",
          }}
        >
          <VerifiedIcon size={LOGO_SIZE * 0.55} />
        </div>
      </div>
    </div>
  );
}

export default function BankOrbit() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newRotation = (elapsed / ORBIT_DURATION) * 360;
      setRotation(newRotation % 360);
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

      {/* Fetan Pay logo - positioned at ~150° (10 o'clock position) */}
      <div
        className="absolute z-10"
        style={{
          left: `calc(50% - ${ORBIT_RADIUS * 0.87}px - 140px)`,
          top: `calc(50% - ${ORBIT_RADIUS * 0.5}px - 140px)`,
        }}
      >
        {/* Outer container */}
        <div
          className="w-[280px] h-[280px] rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.1))",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 20px 80px rgba(0, 0, 0, 0.06)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Inner container */}
          <div
            className="w-[200px] h-[200px] rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.95))",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 8px 40px rgba(0, 0, 0, 0.05)",
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
