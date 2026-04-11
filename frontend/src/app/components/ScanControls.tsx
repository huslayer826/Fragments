"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface ScanControlsProps {
  onScanComplete: () => void;
  deviceCount: number;
}

export default function ScanControls({ onScanComplete, deviceCount }: ScanControlsProps) {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "scanning" | "complete">("idle");

  async function handleScan() {
    setScanning(true);
    setStatus("scanning");
    try {
      await api.triggerScan();
      setStatus("complete");
      onScanComplete();
    } catch (err) {
      setStatus("idle");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleScan}
        disabled={scanning}
        className="px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        style={{
          background: scanning ? "var(--bg-surface)" : "var(--accent-orange)",
          color: scanning ? "var(--text-secondary)" : "#000",
        }}
      >
        {scanning ? "Scanning..." : "Scan Network"}
      </button>
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor:
              status === "scanning"
                ? "var(--status-warning)"
                : status === "complete"
                  ? "var(--status-healthy)"
                  : "var(--text-muted)",
          }}
        />
        {status === "scanning" && "Scanning network..."}
        {status === "complete" && `Found ${deviceCount} devices`}
        {status === "idle" && "Ready"}
      </div>
    </div>
  );
}
