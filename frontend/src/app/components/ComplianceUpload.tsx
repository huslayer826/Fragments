"use client";

import { useState } from "react";

interface ComplianceUploadProps {
  onUploadComplete: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ComplianceUpload({ onUploadComplete }: ComplianceUploadProps) {
  const [frameworkName, setFrameworkName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleUpload() {
    if (!frameworkName.trim() || !fileContent.trim()) return;

    setUploading(true);
    setResult(null);

    try {
      let content: unknown;
      try {
        content = JSON.parse(fileContent);
      } catch {
        setResult("Invalid JSON. Please paste valid JSON content.");
        setUploading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/compliance/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework_name: frameworkName,
          content,
          filename: "document.json",
        }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setResult(`Uploaded "${data.name}" with ${data.controls_parsed} controls.`);
      setFrameworkName("");
      setFileContent("");
      onUploadComplete();
    } catch {
      setResult("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: "var(--bg-tertiary)", borderColor: "var(--border-color)" }}
    >
      <h3 className="text-sm font-bold mb-3">Upload Compliance Framework</h3>

      <input
        type="text"
        placeholder="Framework name (e.g., CIS Controls v8)"
        value={frameworkName}
        onChange={(e) => setFrameworkName(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      />

      <textarea
        placeholder='Paste JSON controls: [{"control_id": "1.1", "title": "...", "description": "...", "category": "...", "severity": "medium"}]'
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        rows={6}
        className="w-full px-3 py-2 rounded-lg border text-sm font-mono mb-3"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !frameworkName.trim() || !fileContent.trim()}
        className="px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
        style={{ background: "var(--accent-orange)", color: "#000" }}
      >
        {uploading ? "Uploading..." : "Upload Framework"}
      </button>

      {result && (
        <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          {result}
        </p>
      )}
    </div>
  );
}
