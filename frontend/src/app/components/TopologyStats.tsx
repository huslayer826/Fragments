"use client";

import type { Stats } from "@/lib/api";

interface TopologyStatsProps {
  stats: Stats | null;
  loading: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--text-ghost)",
          marginBottom: "10px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 400,
          fontSize: "28px",
          letterSpacing: "-0.01em",
          color: color || "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default function TopologyStats({ stats, loading }: TopologyStatsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-5 animate-pulse h-24"
            style={{
              background: "var(--bg-card)",
              border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Devices" value={stats.total_devices} color="var(--orange)" />
      <StatCard
        label="Avg Risk"
        value={stats.avg_risk_score}
        color={
          stats.avg_risk_score > 50
            ? "var(--status-critical)"
            : stats.avg_risk_score > 25
              ? "var(--status-warning)"
              : "var(--status-healthy)"
        }
      />
      <StatCard
        label="Active Alerts"
        value={stats.unacknowledged_alerts}
        color={stats.unacknowledged_alerts > 0 ? "var(--status-critical)" : "var(--status-healthy)"}
      />
      <StatCard
        label="Last Scan"
        value={stats.last_scan ? new Date(stats.last_scan).toLocaleTimeString() : "Never"}
      />
    </div>
  );
}
