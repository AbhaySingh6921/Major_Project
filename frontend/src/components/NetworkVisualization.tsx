import React, { useState, useEffect } from 'react';
import { Cpu, Server, CheckCircle2, RefreshCw, Database } from 'lucide-react';

interface NodeInfo {
  id: number;
  label: string;
  x: number;
  y: number;
  status: 'idle' | 'processing' | 'verified';
  chunkIndex: number;
  hash: string;
}

export const NetworkVisualization: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [hoveredNode, setHoveredNode] = useState<NodeInfo | null>(null);

  // 5 Distributed nodes surrounding the central dispatcher
  // Matching the 5-subjob chunking architecture of DeCompute
  const nodes: NodeInfo[] = [
    { id: 0, label: 'Node α (US-East)', x: 70, y: 75, status: 'verified', chunkIndex: 0, hash: '0x8f2a...c31b' },
    { id: 1, label: 'Node β (EU-Central)', x: 310, y: 65, status: 'verified', chunkIndex: 1, hash: '0x1c4e...89d2' },
    { id: 2, label: 'Node γ (AP-South)', x: 340, y: 220, status: 'processing', chunkIndex: 2, hash: '0x7e02...41a8' },
    { id: 3, label: 'Node δ (SA-East)', x: 200, y: 275, status: 'idle', chunkIndex: 3, hash: '0x99b1...55e0' },
    { id: 4, label: 'Node ε (CA-Central)', x: 50, y: 210, status: 'verified', chunkIndex: 4, hash: '0x43d7...f26a' },
  ];

  const centerNode = { x: 190, y: 160 };

  // Subtle cyclic step through workload distribution stages
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 5) + 1);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[480px] mx-auto bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-card select-none">
      {/* Header bar of visualization */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E4E4E7] text-xs font-mono text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-[#18181B]">Workload Chunk Distribution</span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
          5 Sub-jobs • SHA-256
        </span>
      </div>

      {/* SVG Canvas with subtle grid background */}
      <div className="relative w-full h-[310px] rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]/70 overflow-hidden flex items-center justify-center">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 tech-grid-bg opacity-40 pointer-events-none" />

        <svg className="w-full h-full" viewBox="0 0 380 320" fill="none">
          {/* Connecting Lines from Center Workload to Distributed Nodes */}
          {nodes.map((node, i) => {
            const isTarget = activeStep === i + 1;
            return (
              <g key={`line-${node.id}`}>
                {/* Base connector line */}
                <line
                  x1={centerNode.x}
                  y1={centerNode.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={isTarget ? '#059669' : '#E4E4E7'}
                  strokeWidth={isTarget ? '1.75' : '1.25'}
                  strokeDasharray={isTarget ? '4 3' : 'none'}
                  className="transition-colors duration-500"
                />

                {/* Animated packet moving along line when targeted */}
                {isTarget && (
                  <circle
                    r="3.5"
                    fill="#059669"
                    className="transition-all"
                  >
                    <animateMotion
                      path={`M${centerNode.x},${centerNode.y} L${node.x},${node.y}`}
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Central Workload Dispatcher Node */}
          <g transform={`translate(${centerNode.x - 24}, ${centerNode.y - 24})`}>
            <rect
              width="48"
              height="48"
              rx="10"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="1.5"
              className="filter drop-shadow-sm"
            />
            <foreignObject width="48" height="48">
              <div className="w-full h-full flex flex-col items-center justify-center text-[#18181B]">
                <Database className="w-5 h-5 text-[#18181B]" />
              </div>
            </foreignObject>
          </g>

          {/* Compute Nodes (5 sub-job execution nodes) */}
          {nodes.map((node, i) => {
            const isActive = activeStep === i + 1;
            const isHovered = hoveredNode?.id === node.id;
            const nodeRadius = 18;

            return (
              <g
                key={`node-${node.id}`}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Subtle active ping aura */}
                {isActive && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius + 6}
                    fill="#ECFDF5"
                    className="animate-pulse-subtle"
                  />
                )}

                {/* Main Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill="#FFFFFF"
                  stroke={isActive ? '#059669' : isHovered ? '#71717A' : '#E4E4E7'}
                  strokeWidth={isActive || isHovered ? '2' : '1.5'}
                />

                {/* Status Dot */}
                <circle
                  cx={node.x + 11}
                  cy={node.y - 11}
                  r="4"
                  fill={
                    node.status === 'verified'
                      ? '#059669'
                      : node.status === 'processing'
                      ? '#3B82F6'
                      : '#A1A1AA'
                  }
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                {/* Node Label / Chunk Indicator */}
                <text
                  x={node.x}
                  y={node.y + 3}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="Geist Mono, monospace"
                  fill={isActive ? '#059669' : '#18181B'}
                >
                  C{node.chunkIndex}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Node Tooltip upon Hover or Center Label */}
        {hoveredNode ? (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white border border-[#E4E4E7] rounded-lg p-2.5 shadow-sm text-xs flex items-center justify-between animate-in fade-in duration-150">
            <div>
              <div className="font-medium text-[#18181B] flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-zinc-600" />
                {hoveredNode.label}
              </div>
              <div className="text-[11px] font-mono text-[#71717A]">
                Chunk #{hoveredNode.chunkIndex} • Hash: {hoveredNode.hash}
              </div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium ${
              hoveredNode.status === 'verified'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : hoveredNode.status === 'processing'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
            }`}>
              {hoveredNode.status.toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/90 backdrop-blur-sm border border-[#E4E4E7] rounded-lg px-3 py-1.5 text-[11px] text-[#71717A] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Workload partitioned into 5 independent verifiable sub-tasks
            </span>
            <span className="font-mono text-zinc-500">P2P Escrow</span>
          </div>
        )}
      </div>

      {/* Illustrative Footer Note */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#71717A]">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Deterministic Chunk Splitting
        </span>
        <span className="font-mono text-[10px] text-zinc-400">
          Illustrative Network Simulation
        </span>
      </div>
    </div>
  );
};
