"use client";

interface RiskScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function getRiskColor(score: number): string {
  if (score <= 20) return "var(--status-healthy)";
  if (score <= 50) return "var(--status-warning)";
  if (score <= 75) return "var(--status-elevated)";
  return "var(--status-critical)";
}

function getRiskLabel(score: number): string {
  if (score <= 20) return "Low";
  if (score <= 50) return "Medium";
  if (score <= 75) return "High";
  return "Critical";
}

export default function RiskScoreBadge({ score, size = "md" }: RiskScoreBadgeProps) {
  const color = getRiskColor(score);
  const label = getRiskLabel(score);
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-medium ${sizeClasses[size]}`}
      style={{ color, borderColor: color, border: "1px solid" }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {Math.round(score)} {label}
    </span>
  );
}

export { getRiskColor, getRiskLabel };
