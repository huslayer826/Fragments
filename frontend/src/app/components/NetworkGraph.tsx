"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { TopologyData, TopologyNode } from "@/lib/api";
import { getRiskColor } from "./RiskScoreBadge";

interface NetworkGraphProps {
  data: TopologyData | null;
  onNodeClick?: (node: TopologyNode) => void;
  selectedId?: string | null;
  /** Ordered device ids (MACs) of an attack path to draw over the map. */
  path?: string[];
  pulsingNodes?: Set<string>;
}

interface PlacedNode extends TopologyNode {
  x: number;
  y: number;
  r: number;
  angle: number;
}

const TYPE_ORDER = ["server", "desktop", "laptop", "printer", "iot", "phone", "unknown"];
const LABEL_GAP = 14;

function nodeRadius(n: TopologyNode): number {
  if (n.is_router) return 22;
  const ports = Object.keys(n.open_ports || {}).length;
  return Math.max(9, Math.min(15, 9 + ports * 1.4));
}

function layout(data: TopologyData, width: number, height: number): PlacedNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const routers = data.nodes.filter((n) => n.is_router);
  const others = data.nodes
    .filter((n) => !n.is_router)
    .sort((a, b) => {
      const ta = TYPE_ORDER.indexOf(a.device_type);
      const tb = TYPE_ORDER.indexOf(b.device_type);
      return (ta === -1 ? 99 : ta) - (tb === -1 ? 99 : tb) || b.risk_score - a.risk_score;
    });

  // An ellipse uses wide panels better; leave room for outward-facing labels
  const ry = Math.max(120, height / 2 - 70);
  const rx = Math.max(120, Math.min(width / 2 - 170, ry * 1.45));

  const placed: PlacedNode[] = routers.map((n, i) => ({
    ...n,
    x: cx + i * 60,
    y: cy,
    r: nodeRadius(n),
    angle: 0,
  }));
  others.forEach((n, i) => {
    const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2;
    placed.push({
      ...n,
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
      r: nodeRadius(n),
      angle,
    });
  });
  return placed;
}

export default function NetworkGraph({
  data,
  onNodeClick,
  selectedId,
  path = [],
  pulsingNodes,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [data]);

  useEffect(() => {
    if (!svgRef.current) return;
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on("zoom", (event) => setTransform(event.transform.toString()));
    d3.select(svgRef.current).call(zoom);
  }, [data]);

  const nodes = useMemo(
    () => (data && size.width ? layout(data, size.width, size.height) : []),
    [data, size]
  );
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const pathSet = useMemo(() => new Set(path), [path]);
  const hasPath = path.length > 1;

  if (!data || data.nodes.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full min-h-96 rounded-xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
          color: "var(--text-ghost)",
          fontSize: "13px",
        }}
      >
        No devices yet. Run a scan to map the network.
      </div>
    );
  }

  const cx = size.width / 2;
  const cy = size.height / 2;

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden h-full"
      style={{
        background:
          "radial-gradient(circle at center, color-mix(in srgb, var(--bg-elevated) 55%, var(--bg-card)) 0%, var(--bg-card) 70%)",
        border: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
      }}
    >
      <svg ref={svgRef} width={size.width} height={size.height} className="block cursor-grab">
        <defs>
          <marker
            id="attack-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--status-critical)" />
          </marker>
        </defs>

        <g transform={transform}>
          {/* Faint orbit guide */}
          {nodes.length > 1 && (
            <ellipse
              cx={cx}
              cy={cy}
              rx={Math.max(...nodes.map((n) => Math.abs(n.x - cx)))}
              ry={Math.max(...nodes.map((n) => Math.abs(n.y - cy)))}
              fill="none"
              stroke="var(--bg-border)"
              strokeOpacity={0.25}
              strokeDasharray="2 6"
            />
          )}

          {/* Topology edges */}
          {data.edges.map((e) => {
            const s = byId.get(e.source);
            const t = byId.get(e.target);
            if (!s || !t) return null;
            const active = hovered === s.id || hovered === t.id || selectedId === t.id;
            return (
              <line
                key={`${e.source}-${e.target}`}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={active ? "var(--text-secondary)" : "var(--bg-border)"}
                strokeOpacity={hasPath ? 0.15 : active ? 0.8 : 0.45}
                strokeWidth={1}
              />
            );
          })}

          {/* Attack path overlay */}
          {hasPath &&
            path.slice(1).map((id, i) => {
              const s = byId.get(path[i]);
              const t = byId.get(id);
              if (!s || !t) return null;
              // Bow the arc toward the centre so hops between neighbours stay visible
              const mx = (s.x + t.x) / 2;
              const my = (s.y + t.y) / 2;
              const qx = mx + (cx - mx) * 0.35;
              const qy = my + (cy - my) * 0.35;
              const len = Math.hypot(t.x - qx, t.y - qy);
              const ex = t.x - ((t.x - qx) / len) * (t.r + 5);
              const ey = t.y - ((t.y - qy) / len) * (t.r + 5);
              return (
                <path
                  key={`hop-${i}`}
                  d={`M ${s.x} ${s.y} Q ${qx} ${qy} ${ex} ${ey}`}
                  fill="none"
                  stroke="var(--status-critical)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  markerEnd="url(#attack-arrow)"
                  className="attack-dash"
                />
              );
            })}

          {/* Nodes */}
          {nodes.map((n) => {
            const color = getRiskColor(n.risk_score);
            const dimmed = hasPath && !pathSet.has(n.id);
            const selected = selectedId === n.id;
            const step = path.indexOf(n.id);
            const cos = Math.cos(n.angle);
            const sin = Math.sin(n.angle);
            const anchor = n.is_router ? "middle" : cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
            const lx = n.is_router ? n.x : n.x + cos * (n.r + LABEL_GAP);
            const ly = n.is_router ? n.y + n.r + 18 : n.y + sin * (n.r + LABEL_GAP) + (sin > 0.3 ? 8 : sin < -0.3 ? -6 : 3);
            return (
              <g
                key={n.id}
                opacity={dimmed ? 0.25 : 1}
                style={{ cursor: onNodeClick ? "pointer" : "default", transition: "opacity 200ms" }}
                onClick={() => onNodeClick?.(n)}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`${n.hostname || n.ip} · ${n.ip} · risk ${Math.round(n.risk_score)}`}</title>
                {(n.risk_score > 50 || pulsingNodes?.has(n.id)) && (
                  <circle cx={n.x} cy={n.y} r={n.r + 7} fill={color} opacity={0.18} className="node-halo" />
                )}
                {selected && (
                  <circle cx={n.x} cy={n.y} r={n.r + 5} fill="none" stroke="var(--text-primary)" strokeWidth={1.5} />
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r}
                  fill={n.is_router ? "var(--bg-elevated)" : color}
                  stroke={n.is_router ? color : "var(--bg-deep)"}
                  strokeWidth={n.is_router ? 3 : 2.5}
                />
                {n.is_router && (
                  <text
                    x={n.x}
                    y={n.y + 6}
                    textAnchor="middle"
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, fill: "var(--text-primary)" }}
                  >
                    router
                  </text>
                )}
                {step >= 0 && hasPath && (
                  <g>
                    <circle cx={n.x + n.r * 0.8} cy={n.y - n.r * 0.8} r={8} fill="var(--status-critical)" />
                    <text
                      x={n.x + n.r * 0.8}
                      y={n.y - n.r * 0.8 + 3.5}
                      textAnchor="middle"
                      style={{ fontSize: 10, fontWeight: 700, fill: "#fff", fontFamily: "var(--font-mono)" }}
                    >
                      {step}
                    </text>
                  </g>
                )}
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    fill: selected || hovered === n.id ? "var(--text-primary)" : "var(--text-secondary)",
                    fontFamily: "var(--font-sans)",
                    pointerEvents: "none",
                  }}
                >
                  {n.hostname || n.ip}
                </text>
                {n.hostname && (
                  <text
                    x={lx}
                    y={ly + 14}
                    textAnchor={anchor}
                    style={{
                      fontSize: 10,
                      fill: "var(--text-ghost)",
                      fontFamily: "var(--font-mono)",
                      pointerEvents: "none",
                    }}
                  >
                    {n.ip}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div
        className="absolute left-4 bottom-4 flex items-center gap-4"
        style={{ fontSize: "11px", color: "var(--text-ghost)" }}
      >
        {[
          ["Low", 10],
          ["Medium", 40],
          ["High", 60],
          ["Critical", 90],
        ].map(([label, score]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: getRiskColor(score as number) }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
