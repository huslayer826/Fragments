"use client";

import { useState, useEffect } from "react";
import { api, type Alert } from "@/lib/api";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "var(--status-critical)",
  high: "var(--status-elevated)",
  medium: "var(--status-warning)",
  low: "var(--status-healthy)",
};

const SEVERITY_ICONS: Record<string, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

export default function ThreatFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const data = await api.getAlerts(filter ? { severity: filter } : undefined);
      setAlerts(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledge(id: number) {
    await api.acknowledgeAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  }

  const filtered = filter ? alerts.filter((a) => a.severity === filter) : alerts;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {["", "critical", "high", "medium", "low"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1 rounded text-xs font-medium transition-colors"
            style={{
              background: filter === s ? "var(--accent-orange)" : "var(--bg-surface)",
              color: filter === s ? "#000" : "var(--text-secondary)",
            }}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading alerts...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No alerts.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border"
              style={{
                background: alert.acknowledged ? "var(--bg-tertiary)" : "var(--bg-surface)",
                borderColor: "var(--border-color)",
                opacity: alert.acknowledged ? 0.6 : 1,
              }}
            >
              <span className="text-lg">{SEVERITY_ICONS[alert.severity] || "⚪"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{
                      color: SEVERITY_COLORS[alert.severity] || "var(--text-secondary)",
                      border: `1px solid ${SEVERITY_COLORS[alert.severity] || "var(--border-color)"}`,
                    }}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {alert.alert_type}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--text-primary)" }}>{alert.message}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="text-xs px-2 py-1 rounded hover:bg-white/10"
                  style={{ color: "var(--text-muted)" }}
                >
                  Ack
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
