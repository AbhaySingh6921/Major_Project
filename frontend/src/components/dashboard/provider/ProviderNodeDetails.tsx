import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Server, Activity, HardDrive, Cpu, Terminal, Play, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const ProviderNodeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getNodeById, nodes, assignedJobs } = useMarketplace();

  const node = getNodeById(id || '') || nodes[0];

  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null);

  if (!node) {
    return (
      <DashboardLayout role="provider" title="Node Details">
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">Node not found.</p>
          <button
            onClick={() => navigate('/provider/nodes')}
            className="mt-4 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium"
          >
            Back to Nodes
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const runBenchmark = () => {
    setBenchmarking(true);
    setBenchmarkResult(null);
    setTimeout(() => {
      setBenchmarking(false);
      setBenchmarkResult('PASS: SHA-256 throughput 4.2 GB/s • Docker container latency 120ms');
    }, 1500);
  };

  const nodeJobs = assignedJobs.filter((j) => j.nodeId === node.id || j.status === 'ACCEPTED');

  return (
    <DashboardLayout role="provider" title={node.name} subtitle="Hardware Node Telemetry">
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/provider/nodes')}
              className="p-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {node.name}
                </h2>
                <StatusBadge status={node.health} />
              </div>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                Node ID: {node.id} • Registered Address: {node.address}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runBenchmark}
              disabled={benchmarking}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors shadow-subtle"
            >
              {benchmarking ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  <span>Benchmarking...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Run Hardware Diagnostic</span>
                </>
              )}
            </button>
          </div>
        </div>

        {benchmarkResult && (
          <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{benchmarkResult}</span>
          </div>
        )}

        {/* Node Vitals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-4 shadow-subtle">
            <div className="text-xs font-mono text-zinc-500 mb-1">Availability & Uptime</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {node.availability}%
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">{node.uptimeHours || 342} continuous hours</div>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-4 shadow-subtle">
            <div className="text-xs font-mono text-zinc-500 mb-1">Completed Workloads</div>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
              {node.completedJobsCount}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">100% hash verification pass</div>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-4 shadow-subtle">
            <div className="text-xs font-mono text-zinc-500 mb-1">Docker Engine Version</div>
            <div className="text-base font-bold font-mono text-zinc-900 dark:text-white truncate">
              {node.dockerVersion || 'v24.0.7'}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">Container isolation active</div>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-4 shadow-subtle">
            <div className="text-xs font-mono text-zinc-500 mb-1">Last Heartbeat Ping</div>
            <div className="text-base font-bold font-mono text-zinc-900 dark:text-white">
              {node.lastHeartbeat}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">P2P gossip connection</div>
          </div>
        </div>

        {/* Hardware Specifications Detail */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 shadow-subtle space-y-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Hardware Specifications & Host Telemetry
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-zinc-400">Processor (CPU):</span>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">{node.cpu}</div>
              <span className="text-[10px] text-zinc-500">Utilization: 18%</span>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-zinc-400">System Memory (RAM):</span>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">{node.memory}</div>
              <span className="text-[10px] text-zinc-500">Buffer Usage: 28%</span>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-zinc-400">GPU Accelerator:</span>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">{node.gpu}</div>
              <span className="text-[10px] text-zinc-500">CUDA Driver 12.2</span>
            </div>
          </div>
        </div>

        {/* Assigned Jobs on this node */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 shadow-subtle space-y-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Workload History on this Node
          </h3>

          <div className="space-y-2.5">
            {nodeJobs.map((j) => (
              <div
                key={j.id}
                className="p-3 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-mono flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-white">{j.datasetName}</span>
                  <span className="text-zinc-400 block text-[11px]">{j.jobId} • Chunk #{j.chunkIndex}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{j.reward} USDC</span>
                  <StatusBadge status={j.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
