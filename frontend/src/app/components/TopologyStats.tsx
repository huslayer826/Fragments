"use client";

import type { Stats } from "@/lib/api";
import { getRiskColor } from "./RiskScoreBadge";

interface TopologyStatsProps {
  stats: Stats | null;
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
      }}
    >
      <p className="frag-label mb-2">{label}</p>
      <p
        className="truncate"
        style={{
          fontWeight: 700,
          fontSize: "26px",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: color || "var(--text-primary)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function TopologyStats({ stats }: TopologyStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl h-[82px] animate-pulse" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Devices" value={stats.total_devices} />
      <StatCard label="Average risk" value={stats.avg_risk_score} color={getRiskColor(stats.avg_risk_score)} />
      <StatCard
        label="Open alerts"
        value={stats.unacknowledged_alerts}
        color={stats.unacknowledged_alerts > 0 ? "var(--status-high)" : "var(--status-healthy)"}
      />
      <StatCard label="Last scan" value={stats.last_scan ? timeAgo(stats.last_scan) : "Never"} />
    </div>
  );
}
