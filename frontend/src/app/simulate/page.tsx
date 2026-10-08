"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, type Device, type TopologyData } from "@/lib/api";
import NetworkGraph from "../components/NetworkGraph";
import PageHeader from "../components/PageHeader";
import { getRiskColor } from "../components/RiskScoreBadge";

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
  const [topology, setTopology] = useState<TopologyData | null>(null);
  const [selectedMac, setSelectedMac] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getDevices(), api.getTopology()])
      .then(([d, t]) => {
        const sorted = [...d].sort((a, b) => b.risk_score - a.risk_score);
        setDevices(sorted);
        setTopology(t);
        // Start from the riskiest device — the most likely foothold
        if (sorted.length) setSelectedMac(sorted[0].mac);
      })
      .catch((e: Error) => setError(e.message || "Failed to load devices"));
  }, []);

  async function handleSimulate() {
    if (!selectedMac) return;
    setSimulating(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/ai/attack-sim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: selectedMac }),
      });
      if (!res.ok) throw new Error(`Simulation failed (${res.status})`);
      const data: SimResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed");
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Attack simulation"
        subtitle="Pick a compromised device and see how an attacker could move laterally through the network."
      />

      <div className="flex gap-3 mb-6">
        <select
          value={selectedMac}
          onChange={(e) => {
            setSelectedMac(e.target.value);
            setResult(null);
          }}
          className="frag-input flex-1"
        >
          {devices.map((d) => (
            <option key={d.mac} value={d.mac}>
              {d.hostname || d.vendor || "Unknown"} · {d.ip} · risk {Math.round(d.risk_score)}
            </option>
          ))}
        </select>
        <button
          onClick={handleSimulate}
          disabled={!selectedMac || simulating}
          className="frag-btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            bolt
          </span>
          {simulating ? "Simulating…" : "Simulate compromise"}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}

      <div className="flex gap-6" style={{ height: "max(560px, calc(100vh - 250px))" }}>
        <div className="flex-1 min-w-0">
          <NetworkGraph data={topology} selectedId={selectedMac} path={result?.path} />
        </div>

        {result && (
          <aside
            className="w-96 flex-shrink-0 overflow-y-auto rounded-xl p-5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
            }}
          >
            <p className="frag-label mb-4">
              {result.steps.length} hop{result.steps.length === 1 ? "" : "s"}
            </p>

            {result.steps.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No lateral movement paths found. This device is isolated.
              </p>
            ) : (
              <ol className="relative">
                <Hop index={0} host={result.steps[0].from_host} ip={result.steps[0].from_ip} label="Foothold" />
                {result.steps.map((step, i) => (
                  <Hop
                    key={i}
                    index={i + 1}
                    host={step.to_host}
                    ip={step.to_ip}
                    label={step.method}
                    risk={step.risk}
                    last={i === result.steps.length - 1}
                  />
                ))}
              </ol>
            )}

            <div
              className="frag-md mt-5 pt-5 text-[13px]"
              style={{ borderTop: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)" }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.narration}</ReactMarkdown>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Hop({
  index,
  host,
  ip,
  label,
  risk,
  last,
}: {
  index: number;
  host: string;
  ip: string;
  label: string;
  risk?: number;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-3 pb-4">
      {!last && (
        <span
          className="absolute left-[11px] top-6 bottom-0 w-px"
          style={{ background: "color-mix(in srgb, var(--status-critical) 40%, transparent)" }}
        />
      )}
      <span
        className="relative flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          background: index === 0 ? "var(--bg-elevated)" : "var(--status-critical)",
          border: index === 0 ? "1px solid var(--status-critical)" : "none",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm" style={{ fontWeight: 600 }}>
            {host || ip}
          </p>
          {risk !== undefined && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: getRiskColor(risk) }}>
              risk {Math.round(risk)}
            </span>
          )}
        </div>
        <p className="truncate" style={{ fontSize: "12px", color: "var(--text-ghost)" }}>
          {host && <span style={{ fontFamily: "var(--font-mono)" }}>{ip} · </span>}
          {label}
        </p>
      </div>
    </li>
  );
}
