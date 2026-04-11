"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ReportPage() {
  const [generating, setGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setReportUrl(null);

    try {
      const res = await fetch(`${API_BASE}/api/report`, { method: "POST" });
      if (!res.ok) throw new Error("Report generation failed");
      const data = await res.json();
      setReportUrl(`${API_BASE}${data.report_url}`);
    } catch {
      setError("Failed to generate report. Make sure a scan has been run first.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Security Report</h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Generate a comprehensive PDF security assessment report including device inventory,
        vulnerability findings, topology overview, segmentation recommendations, and remediation checklist.
      </p>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="px-6 py-3 rounded-lg font-medium text-sm disabled:opacity-50"
        style={{ background: "var(--accent-orange)", color: "#000" }}
      >
        {generating ? "Generating Report..." : "Generate Report"}
      </button>

      {error && (
        <p className="mt-4 text-sm" style={{ color: "var(--status-critical)" }}>{error}</p>
      )}

      {reportUrl && (
        <div
          className="mt-6 p-4 rounded-lg border"
          style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-color)" }}
        >
          <p className="text-sm mb-3" style={{ color: "var(--status-healthy)" }}>
            Report generated successfully.
          </p>
          <a
            href={reportUrl}
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
  );
}
