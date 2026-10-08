"use client";

import { useState, useEffect } from "react";
import { useNetworkData } from "@/hooks/useNetworkData";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { TopologyNode } from "@/lib/api";
import NetworkGraph from "./components/NetworkGraph";
import DeviceDetailPanel from "./components/DeviceDetailPanel";
import ScanControls from "./components/ScanControls";
import TopologyStats from "./components/TopologyStats";
import PageHeader from "./components/PageHeader";

export default function DashboardPage() {
  const { topology, stats, error, refresh } = useNetworkData();
  const { on } = useWebSocket();
  const [selectedDevice, setSelectedDevice] = useState<TopologyNode | null>(null);
  const [newDeviceMacs, setNewDeviceMacs] = useState<Set<string>>(new Set());

  // Subscribe to real-time events
  useEffect(() => {
    const unsubs = [
      on("scan_complete", () => {
        refresh();
      }),
      on("device_joined", (data: unknown) => {
        const device = data as { mac: string };
        setNewDeviceMacs((prev) => new Set(prev).add(device.mac));
        // Clear pulse after 5 seconds
        setTimeout(() => {
          setNewDeviceMacs((prev) => {
            const next = new Set(prev);
            next.delete(device.mac);
            return next;
          });
        }, 5000);
        refresh();
      }),
      on("device_left", () => {
        refresh();
      }),
      on("port_change", () => {
        refresh();
      }),
      on("alert", () => {
        refresh();
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [on, refresh]);

  return (
    <div>
      <PageHeader
        title="Network"
        subtitle="Every device on the LAN, scored for risk. Click a device for details."
        actions={<ScanControls onScanComplete={refresh} />}
      />

      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl"
          style={{
            background: "color-mix(in srgb, var(--status-critical) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--status-critical) 35%, transparent)",
          }}
        >
          <p className="flex-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            <span style={{ color: "var(--status-critical)" }}>Backend unreachable.</span> {error}
          </p>
          <button onClick={refresh} className="frag-btn-secondary">
            Retry
          </button>
        </div>
      )}

      <TopologyStats stats={stats} />

      <div className="flex gap-6 mt-6" style={{ height: "max(560px, calc(100vh - 290px))" }}>
        <div className="flex-1 min-w-0">
          <NetworkGraph
            data={topology}
            onNodeClick={setSelectedDevice}
            selectedId={selectedDevice?.id}
            pulsingNodes={newDeviceMacs}
          />
        </div>
        {selectedDevice && (
          <DeviceDetailPanel device={selectedDevice} onClose={() => setSelectedDevice(null)} />
        )}
      </div>
    </div>
  );
}
