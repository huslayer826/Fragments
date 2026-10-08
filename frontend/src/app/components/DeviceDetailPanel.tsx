"use client";

import { useEffect, useState } from "react";
import { api, type Device, type TopologyNode } from "@/lib/api";
import RiskScoreBadge from "./RiskScoreBadge";

interface DeviceDetailPanelProps {
  device: TopologyNode | null;
  onClose: () => void;
}

const INSECURE = new Set(["telnet", "ftp", "tftp", "rlogin", "rsh", "rexec", "adb"]);

export default function DeviceDetailPanel({ device, onClose }: DeviceDetailPanelProps) {
  const [details, setDetails] = useState<Device | null>(null);

  useEffect(() => {
    setDetails(null);
    if (device) api.getDevice(device.id).then(setDetails).catch(() => setDetails(null));
  }, [device]);

  if (!device) return null;

  const ports = Object.entries(device.open_ports || {});

  return (
    <aside
      className="w-80 flex-shrink-0 overflow-y-auto rounded-xl"
      style={{
        background: "var(--bg-card)",
        border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
      }}
    >
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate" style={{ fontWeight: 600, fontSize: "16px" }}>
            {device.hostname || device.ip}
          </h3>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-ghost)" }}>
            {device.ip}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="material-symbols-outlined rounded-md p-1 hover:bg-[var(--bg-elevated)]"
          style={{ fontSize: 18, color: "var(--text-ghost)" }}
        >
          close
        </button>
      </div>

      <div className="px-5 pb-5 space-y-5">
        <RiskScoreBadge score={device.risk_score} size="lg" />

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <InfoRow label="Vendor" value={device.vendor || "Unknown"} />
          <InfoRow label="Type" value={device.device_type} />
          <InfoRow label="OS" value={details?.os || "—"} />
          <InfoRow label="Trusted" value={details ? (details.is_trusted ? "Yes" : "No") : "—"} />
          <div className="col-span-2">
            <InfoRow label="MAC" value={device.id} mono />
          </div>
        </dl>

        {details && details.cves.length > 0 && (
          <div>
            <p className="frag-label mb-2">Known vulnerabilities</p>
            <div className="flex flex-wrap gap-1.5">
              {details.cves.map((cve) => (
                <a
                  key={cve}
                  href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md px-2 py-1"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--status-critical)",
                    background: "color-mix(in srgb, var(--status-critical) 12%, transparent)",
                  }}
                >
                  {cve}
                </a>
              ))}
            </div>
          </div>
        )}

        {ports.length > 0 && (
          <div>
            <p className="frag-label mb-2">Open ports</p>
            <div className="space-y-1">
              {ports.map(([port, service]) => {
                const insecure = INSECURE.has(String(service).toLowerCase());
                return (
                  <div
                    key={port}
                    className="flex justify-between px-3 py-2 rounded-md"
                    style={{
                      background: "var(--bg-deeper)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: insecure ? "var(--status-high)" : "var(--text-primary)" }}>{port}</span>
                    <span style={{ color: insecure ? "var(--status-high)" : "var(--text-secondary)" }}>
                      {service}
                      {insecure && " · unencrypted"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="frag-label">{label}</dt>
      <dd
        className="truncate"
        style={{
          marginTop: "4px",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          fontSize: "13px",
          color: "var(--text-primary)",
        }}
      >
        {value}
      </dd>
    </div>
  );
}
