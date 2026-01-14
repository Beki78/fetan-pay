"use client";
import React from "react";
import Image from "next/image";

interface BreathingLogoLoaderProps {
  size?: number;
  className?: string;
}

export default function BreathingLogoLoader({
  size = 120,
  className = "",
}: BreathingLogoLoaderProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ minHeight: `${size}px` }}
    >
      <div
        className="relative animate-breath"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <Image
          src="/images/logo/fetan-logo.png"
          alt="Fetan Pay Logo"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
