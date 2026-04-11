"use client";

import { useState, useEffect } from "react";
import { useNetworkData } from "@/hooks/useNetworkData";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { TopologyNode } from "@/lib/api";
import NetworkGraph from "./components/NetworkGraph";
import DeviceDetailPanel from "./components/DeviceDetailPanel";
import ScanControls from "./components/ScanControls";
import TopologyStats from "./components/TopologyStats";

export default function DashboardPage() {
  const { topology, stats, loading, refresh } = useNetworkData();
  const { connected, on } = useWebSocket();
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
    <div className="flex h-[calc(100vh-3rem)]">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Network Dashboard</h2>
            <span
              className="w-2 h-2 rounded-full"
              title={connected ? "WebSocket connected" : "WebSocket disconnected"}
              style={{
                backgroundColor: connected ? "var(--status-healthy)" : "var(--status-critical)",
              }}
            />
          </div>
          <ScanControls
            onScanComplete={refresh}
            deviceCount={topology?.nodes.length ?? 0}
          />
        </div>

        <TopologyStats stats={stats} loading={loading} />

        <div className="flex-1">
          <NetworkGraph
            data={topology}
            onNodeClick={(node) => setSelectedDevice(node)}
            pulsingNodes={newDeviceMacs}
          />
        </div>
      </div>

      {selectedDevice && (
        <DeviceDetailPanel
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}
