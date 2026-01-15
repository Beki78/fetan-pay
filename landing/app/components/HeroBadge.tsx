export default function HeroBadge() {
  return (
    <div className="opacity-0 animate-fade-in-up animation-delay-200">
      {/* Badge - 478x58, border-radius 100, stroke #d0f8fb */}
      <div
        className="inline-flex items-center gap-[10px]"
        style={{
          height: "58px",
          paddingLeft: "24px",
          paddingRight: "24px",
          borderRadius: "100px",
          border: "1px solid #d0f8fb",
          background:
            "linear-gradient(to right, #eafcfd, rgba(234, 252, 253, 0.2))",
        }}
      >
        {/* Icon - 25x25 checkmark in circle */}
        <svg
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12.5"
            cy="12.5"
            r="11.5"
            stroke="#174686"
            strokeWidth="1.5"
          />
          <path
            d="M7.5 12.5L11 16L17.5 9.5"
            stroke="#174686"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Text - Geist Regular 400, fontSize 20, lineHeight 26, color #174686 */}
        <span
          style={{
            fontFamily: "var(--font-geist)",
            fontSize: "20px",
            lineHeight: "26px",
            fontWeight: 400,
            color: "#174686",
          }}
        >
          Zero money movement • Instant verification
        </span>
      </div>
    </div>
  );
}
