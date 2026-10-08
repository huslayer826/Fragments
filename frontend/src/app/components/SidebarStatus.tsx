"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function SidebarStatus() {
  const [mode, setMode] = useState<string | null>(null);
  const [devices, setDevices] = useState(0);
  const [alerts, setAlerts] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [health, stats] = await Promise.all([api.health(), api.getStats()]);
        setMode(health.mode ?? "live");
        setDevices(stats.total_devices);
        setAlerts(stats.unacknowledged_alerts);
      } catch {
        setMode(null);
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const online = mode !== null;
  const color = online ? "var(--status-healthy)" : "var(--status-critical)";

  return (
    <div
      className="px-5 py-4 space-y-1.5"
      style={{
        borderTop: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "var(--text-ghost)",
      }}
    >
      <div className="flex items-center gap-2" style={{ color }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        {online ? `${mode} mode` : "Backend offline"}
      </div>
      {online && (
        <div>
          {devices} devices · {alerts} open alerts
        </div>
      )}
    </div>
  );
}
