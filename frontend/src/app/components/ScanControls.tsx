"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface ScanControlsProps {
  onScanComplete: () => void;
}

export default function ScanControls({ onScanComplete }: ScanControlsProps) {
  const [scanning, setScanning] = useState(false);

  async function handleScan() {
    setScanning(true);
    try {
      await api.triggerScan();
      onScanComplete();
    } finally {
      setScanning(false);
    }
  }

  return (
    <button onClick={handleScan} disabled={scanning} className="frag-btn-primary flex items-center gap-2">
      <span className={`material-symbols-outlined ${scanning ? "animate-spin" : ""}`} style={{ fontSize: 16 }}>
        {scanning ? "progress_activity" : "radar"}
      </span>
      {scanning ? "Scanning…" : "Scan network"}
    </button>
  );
}
