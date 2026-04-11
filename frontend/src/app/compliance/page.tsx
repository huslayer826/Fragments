"use client";

import { useState, useEffect } from "react";
import ComplianceUpload from "../components/ComplianceUpload";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Framework {
  id: string;
  name: string;
  controls_count: number;
  upload_date: string;
}

interface AssessmentResult {
  assessment_id: number;
  framework: string;
  controls_assessed: number;
  compliant: number;
  partial: number;
  non_compliant: number;
  report_path: string;
}

export default function CompliancePage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [assessing, setAssessing] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadFrameworks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/compliance/frameworks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFrameworks(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load frameworks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFrameworks();
  }, []);

  async function handleAssess(frameworkId: string) {
    setAssessing(frameworkId);
    setLastResult(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/compliance/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework_id: frameworkId }),
      });
      if (!res.ok) throw new Error(`Assessment failed (${res.status})`);
      const data: AssessmentResult = await res.json();
      setLastResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assessment failed");
    } finally {
      setAssessing(null);
    }
  }

  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "var(--text-ghost)",
          marginBottom: "6px",
        }}
      >
        Posture
      </p>
      <h2
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 700,
          fontSize: "32px",
          letterSpacing: "-0.02em",
          marginBottom: "32px",
        }}
      >
        Compliance Assessment
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ComplianceUpload onUploadComplete={loadFrameworks} />

          <div>
            <h3
              className="mb-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-ghost)",
              }}
            >
              Uploaded Frameworks
            </h3>
            {loading ? (
              <div className="space-y-2">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl animate-pulse"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
                    }}
                  />
                ))}
              </div>
            ) : error ? (
              <p
                style={{
                  color: "var(--status-critical)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}
              >
                ◆ {error}
              </p>
            ) : frameworks.length === 0 ? (
              <p
                style={{
                  color: "var(--text-ghost)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}
              >
                No frameworks uploaded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {frameworks.map((fw) => (
                  <div
                    key={fw.id}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "var(--text-primary)",
                        }}
                      >
                        {fw.name}
                      </p>
                      <p
                        className="mt-1"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "var(--text-ghost)",
                        }}
                      >
                        {fw.controls_count} controls
                      </p>
                    </div>
                    <button
                      onClick={() => handleAssess(fw.id)}
                      disabled={assessing === fw.id}
                      className="frag-btn-secondary"
                    >
                      {assessing === fw.id ? "Assessing…" : "Assess"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assessment results */}
        <div>
          {lastResult && (
            <div className="frag-card">
              <h3
                className="mb-1"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Assessment Results
              </h3>
              <p
                className="mb-5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-ghost)",
                }}
              >
                {lastResult.framework} · {lastResult.controls_assessed} controls
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <ResultTile
                  label="Compliant"
                  value={lastResult.compliant}
                  color="var(--status-healthy)"
                />
                <ResultTile
                  label="Partial"
                  value={lastResult.partial}
                  color="var(--status-warning)"
                />
                <ResultTile
                  label="Non-Compliant"
                  value={lastResult.non_compliant}
                  color="var(--status-critical)"
                />
              </div>

              <a
                href={`${API_BASE}/api/compliance/report/${lastResult.assessment_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="frag-btn-primary inline-block"
              >
                Download PDF Report
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="text-center p-4 rounded-lg"
      style={{
        background: "var(--black)",
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "26px",
          fontWeight: 400,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        className="mt-2"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-ghost)",
        }}
      >
        {label}
      </p>
    </div>
  );
}
