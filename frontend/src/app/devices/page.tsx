"use client";

import { useState, useMemo } from "react";
import { useNetworkData } from "@/hooks/useNetworkData";
import RiskScoreBadge from "../components/RiskScoreBadge";

export default function DevicesPage() {
  const { devices, loading } = useNetworkData();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"risk_score" | "ip" | "hostname">("risk_score");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const results = devices.filter(
      (d) =>
        d.ip.includes(q) ||
        d.hostname.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        d.mac.toLowerCase().includes(q)
    );
    return results.sort((a, b) => {
      if (sortBy === "risk_score") return b.risk_score - a.risk_score;
      return (a[sortBy] || "").localeCompare(b[sortBy] || "");
    });
  }, [devices, search, sortBy]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Device Inventory</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by IP, hostname, vendor, or MAC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border text-sm"
          style={{
            background: "var(--bg-tertiary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{
            background: "var(--bg-tertiary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        >
          <option value="risk_score">Sort by Risk</option>
          <option value="ip">Sort by IP</option>
          <option value="hostname">Sort by Hostname</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      ) : (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: "var(--border-color)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-tertiary)" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>IP</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Hostname</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Vendor</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Type</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>OS</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Ports</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <tr
                  key={device.mac}
                  className="border-t hover:bg-white/5 transition-colors"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <td className="px-4 py-3 font-mono">{device.ip}</td>
                  <td className="px-4 py-3">{device.hostname || "—"}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{device.vendor || "Unknown"}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
                    >
                      {device.device_type}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{device.os || "—"}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: "var(--text-muted)" }}>
                    {Object.keys(device.open_ports).length}
                  </td>
                  <td className="px-4 py-3">
                    <RiskScoreBadge score={device.risk_score} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
              {devices.length === 0 ? "No devices discovered yet." : "No devices match your search."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
