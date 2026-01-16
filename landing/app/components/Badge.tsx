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
      {/* Badge - 478x58, border-radius 100, stroke #d0f8fb */}
      <div
        className="inline-flex items-center gap-[10px]"
        style={{
          height: "40px",
          paddingLeft: "24px",
          paddingRight: "24px",
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
        {/* Text - Geist Regular 400, fontSize 20, lineHeight 26, color #174686 */}
        <span
          style={{
            fontFamily: "var(--font-geist)",
            lineHeight: "26px",
            fontWeight: 400,
            color: "#174686",
            fontSize: "20px",
          }}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
