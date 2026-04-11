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
    <div className="frag-card">
      <h3
        className="mb-4"
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "14px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-primary)",
        }}
      >
        Upload Compliance Framework
      </h3>

      <input
        type="text"
        placeholder="Framework name (e.g., CIS Controls v8)"
        value={frameworkName}
        onChange={(e) => setFrameworkName(e.target.value)}
        className="frag-input w-full mb-3"
      />

      <textarea
        placeholder='Paste JSON controls: [{"control_id": "1.1", "title": "...", "description": "...", "category": "...", "severity": "medium"}]'
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        rows={6}
        className="frag-input w-full mb-4"
        style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !frameworkName.trim() || !fileContent.trim()}
        className="frag-btn-primary"
      >
        {uploading ? "Uploading…" : "Upload Framework"}
      </button>

      {result && (
        <p
          className="mt-4"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
        >
          {result}
        </p>
      )}
    </div>
  );
}
