import Image from "next/image";
import { ReactNode } from "react";

interface BadgeProps {
  icon?: string;
  iconAlt?: string;
  iconWidth?: number;
  iconHeight?: number;
  children: ReactNode;
  className?: string;
  animationDelay?: string;
}

export default function Badge({
  icon,
  iconAlt = "icon",
  iconWidth = 25,
  iconHeight = 25,
  children,
  className = "",
  animationDelay = "200",
}: BadgeProps) {
  return (
    <div
      className={`opacity-0 animate-fade-in-up ${className}`}
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Badge - 478x58, border-radius 100, stroke #d0f8fb - Responsive */}
      <div
        className="inline-flex items-center gap-2 sm:gap-[10px] h-8 sm:h-9 lg:h-[40px] px-4 sm:px-5 lg:px-6"
        style={{
          borderRadius: "100px",
          border: "1px solid #d0f8fb",
          background:
            "linear-gradient(to right, #eafcfd, rgba(234, 252, 253, 0.2))",
        }}
      >
        {icon && (
          <Image
            src={icon}
            alt={iconAlt}
            width={iconWidth}
            height={iconHeight}
          />
        )}
        {/* Text - Geist Regular 400, fontSize 20, lineHeight 26, color #174686 - Responsive */}
        <span
          className="text-sm sm:text-base lg:text-[20px] leading-5 sm:leading-6 lg:leading-[26px]"
          style={{
            fontFamily: "var(--font-geist)",
            fontWeight: 400,
            color: "#174686",
          }}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
