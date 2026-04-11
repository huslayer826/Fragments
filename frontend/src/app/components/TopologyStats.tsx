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
      className="rounded-lg p-4 border"
      style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-color)" }}
    >
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-2xl font-bold font-mono" style={{ color: color || "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

export default function TopologyStats({ stats, loading }: TopologyStatsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-4 border animate-pulse h-20"
            style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-color)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Devices" value={stats.total_devices} />
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
      <StatCard label="Last Scan" value={stats.last_scan ? new Date(stats.last_scan).toLocaleTimeString() : "Never"} />
    </div>
  );
}
