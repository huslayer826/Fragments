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

  async function loadFrameworks() {
    try {
      const res = await fetch(`${API_BASE}/api/compliance/frameworks`);
      setFrameworks(await res.json());
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadFrameworks();
  }, []);

  async function handleAssess(frameworkId: string) {
    setAssessing(frameworkId);
    setLastResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/compliance/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework_id: frameworkId }),
      });
      const data: AssessmentResult = await res.json();
      setLastResult(data);
    } catch {
      // ignore
    } finally {
      setAssessing(null);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Compliance Assessment</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ComplianceUpload onUploadComplete={loadFrameworks} />

          {/* Frameworks list */}
          <div className="mt-6">
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-secondary)" }}>
              Uploaded Frameworks
            </h3>
            {frameworks.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No frameworks uploaded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {frameworks.map((fw) => (
                  <div
                    key={fw.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
                  >
                    <div>
                      <p className="text-sm font-medium">{fw.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {fw.controls_count} controls
                      </p>
                    </div>
                    <button
                      onClick={() => handleAssess(fw.id)}
                      disabled={assessing === fw.id}
                      className="px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                      style={{ background: "var(--accent-orange)", color: "#000" }}
                    >
                      {assessing === fw.id ? "Assessing..." : "Assess"}
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
            <div
              className="rounded-lg border p-4"
              style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-color)" }}
            >
              <h3 className="text-sm font-bold mb-3">Assessment Results</h3>
              <p className="text-sm mb-2">
                <strong>{lastResult.framework}</strong> — {lastResult.controls_assessed} controls
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded" style={{ background: "var(--bg-surface)" }}>
                  <p className="text-lg font-bold" style={{ color: "var(--status-healthy)" }}>
                    {lastResult.compliant}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Compliant</p>
                </div>
                <div className="text-center p-2 rounded" style={{ background: "var(--bg-surface)" }}>
                  <p className="text-lg font-bold" style={{ color: "var(--status-warning)" }}>
                    {lastResult.partial}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Partial</p>
                </div>
                <div className="text-center p-2 rounded" style={{ background: "var(--bg-surface)" }}>
                  <p className="text-lg font-bold" style={{ color: "var(--status-critical)" }}>
                    {lastResult.non_compliant}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Non-Compliant</p>
                </div>
              </div>

              <a
                href={`${API_BASE}/api/compliance/report/${lastResult.assessment_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: "var(--accent-orange)", color: "#000" }}
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
