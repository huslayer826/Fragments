"use client";

interface FragmentsLogoProps {
  size?: number;
  variant?: "icon" | "wordmark" | "wordmark-accent";
  className?: string;
}

const MIN_SIZE = 24;

export default function FragmentsLogo({
  size = 32,
  variant = "icon",
  className = "",
}: FragmentsLogoProps) {
  const safeSize = Math.max(MIN_SIZE, size);
  const gradientId = `frag-logo-grad-${variant}`;

  const icon = (
    <svg
      width={safeSize}
      height={safeSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Fragments"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8794F" />
          <stop offset="0.55" stopColor="#D65A31" />
          <stop offset="1" stopColor="#B84A28" />
        </linearGradient>
      </defs>
      {/* Outer rounded square */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill={`url(#${gradientId})`} />
      {/* Negative-space fragments */}
      <path
        d="M14 14 H28 V22 H22 V32 H14 Z"
        fill="#222831"
      />
      <path
        d="M36 14 H50 V28 H42 V22 H36 Z"
        fill="#222831"
      />
      <path
        d="M14 38 H22 V44 H28 V52 H14 Z"
        fill="#222831"
      />
      <path
        d="M36 36 H50 V50 H42 V44 H36 Z"
        fill="#222831"
      />
    </svg>
  );

  if (variant === "icon") {
    return <span className={`inline-flex ${className}`}>{icon}</span>;
  }

  const wordmarkColor = variant === "wordmark-accent" ? "var(--orange)" : "var(--white)";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {icon}
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 700,
          fontSize: Math.round(safeSize * 0.55),
          letterSpacing: "-0.01em",
          color: wordmarkColor,
        }}
      >
        Fragments
      </span>
    </span>
  );
}
