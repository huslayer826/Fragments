"use client";

import { useState, useEffect } from "react";
import { api, type Device } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AttackStep {
  from_ip: string;
  from_host: string;
  to_ip: string;
  to_host: string;
  method: string;
  risk: number;
}

interface SimResult {
  path: string[];
  narration: string;
  steps: AttackStep[];
  source: string;
}

export default function SimulatePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedMac, setSelectedMac] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);

  useEffect(() => {
    api.getDevices().then(setDevices).catch(() => {});
  }, []);

  async function handleSimulate() {
    if (!selectedMac) return;
    setSimulating(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/ai/attack-sim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: selectedMac }),
      });
      const data: SimResult = await res.json();
      setResult(data);
    } catch {
      // ignore
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Attack Path Simulation</h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Select a device to simulate lateral movement from a compromised host.
      </p>

      <div className="flex gap-4 mb-6">
        <select
          value={selectedMac}
          onChange={(e) => setSelectedMac(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border text-sm"
          style={{
            background: "var(--bg-tertiary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">Select a device...</option>
          {devices.map((d) => (
            <option key={d.mac} value={d.mac}>
              {d.ip} — {d.hostname || d.vendor || "Unknown"} (Risk: {d.risk_score})
            </option>
          ))}
        </select>
        <button
          onClick={handleSimulate}
          disabled={!selectedMac || simulating}
          className="px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
          style={{ background: "var(--accent-orange)", color: "#000" }}
        >
          {simulating ? "Simulating..." : "Simulate Compromise"}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Attack path visualization */}
          {result.steps.length > 0 && (
            <div
              className="rounded-lg border p-4"
              style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-color)" }}
            >
              <h3 className="text-sm font-bold mb-3">Attack Path ({result.steps.length} hops)</h3>
              <div className="space-y-3">
                {result.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="px-3 py-2 rounded text-sm font-mono"
                      style={{ background: "var(--bg-surface)", color: "var(--text-primary)" }}
                    >
                      {step.from_ip}
                    </div>
                    <div className="flex flex-col items-center">
                      <span style={{ color: "var(--status-critical)" }}>→</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {step.method.length > 30 ? step.method.slice(0, 30) + "..." : step.method}
                      </span>
                    </div>
                    <div
                      className="px-3 py-2 rounded text-sm font-mono"
                      style={{ background: "var(--bg-surface)", color: "var(--status-critical)" }}
                    >
                      {step.to_ip}
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Risk: {step.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narration */}
          <div
            className="rounded-lg border p-4"
            style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-color)" }}
          >
            <h3 className="text-sm font-bold mb-3">Attack Narration</h3>
            <div
              className="text-sm whitespace-pre-wrap"
              style={{ color: "var(--text-secondary)" }}
            >
              {result.narration}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
