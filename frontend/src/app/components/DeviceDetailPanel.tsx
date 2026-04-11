"use client";

import type { TopologyNode } from "@/lib/api";
import RiskScoreBadge from "./RiskScoreBadge";

interface DeviceDetailPanelProps {
  device: TopologyNode | null;
  onClose: () => void;
}

export default function DeviceDetailPanel({ device, onClose }: DeviceDetailPanelProps) {
  if (!device) return null;

  const ports = Object.entries(device.open_ports || {});

  return (
    <div
      className="w-80 border-l overflow-y-auto h-full"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
    >
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
        <h3 className="font-bold text-sm">{device.hostname || device.ip}</h3>
        <button
          onClick={onClose}
          className="text-sm px-2 py-1 rounded hover:bg-white/10"
          style={{ color: "var(--text-muted)" }}
        >
          ✕
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <RiskScoreBadge score={device.risk_score} size="lg" />
        </div>

        <InfoRow label="IP Address" value={device.ip} />
        <InfoRow label="MAC" value={device.id} />
        <InfoRow label="Hostname" value={device.hostname || "—"} />
        <InfoRow label="Vendor" value={device.vendor || "Unknown"} />
        <InfoRow label="Type" value={device.device_type} />

        {ports.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
              Open Ports
            </p>
            <div className="space-y-1">
              {ports.map(([port, service]) => (
                <div
                  key={port}
                  className="flex justify-between text-sm font-mono px-2 py-1 rounded"
                  style={{ background: "var(--bg-surface)" }}
                >
                  <span style={{ color: "var(--accent-orange)" }}>{port}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{service}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}
