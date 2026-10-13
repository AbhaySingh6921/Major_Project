import React, { useState } from 'react';
import { Activity, Play, CheckCircle2, Clock, Terminal, RefreshCw, Cpu, Layers } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { EmptyState } from '../shared/EmptyState';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const ProviderJobs: React.FC = () => {
  const { assignedJobs, acceptAndExecuteSubJob } = useMarketplace();

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'OPEN' | 'VERIFIED'>('ALL');
  const [executingId, setExecutingId] = useState<string | null>(null);

  const filteredJobs = assignedJobs.filter((sub) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return sub.status === 'ACCEPTED';
    if (filter === 'OPEN') return sub.status === 'OPEN';
    if (filter === 'VERIFIED') return sub.status === 'VERIFIED';
    return true;
  });

  const handleExecute = async (id: string) => {
    setExecutingId(id);
    try {
      await acceptAndExecuteSubJob(id);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <DashboardLayout role="provider" title="Assigned Jobs" subtitle="Workload Queue & Execution">
      <div className="space-y-6">
        
        {/* Top Controls & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Assigned Workloads & Open Sub-Tasks
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Chunk tasks partitioned by requesters and waiting for decentralized execution
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#121215] p-1 text-xs">
            {(['ALL', 'ACTIVE', 'OPEN', 'VERIFIED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono transition-colors ${
                  filter === f
                    ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-medium shadow-subtle'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {f === 'ALL' ? 'All' : f === 'ACTIVE' ? 'Executing' : f === 'OPEN' ? 'Open Queue' : 'Settled'}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Table */}
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No workloads match filter"
            description="All active subjobs are either completed or awaiting new broadcast events from the network."
          />
        ) : (
          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[11px]">
                    <th className="py-3 px-5">Workload & Task</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Execution Progress</th>
                    <th className="py-3 px-4">Input SHA-256</th>
                    <th className="py-3 px-4">Reward Escrow</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
                  {filteredJobs.map((sub) => {
                    const isRunning = executingId === sub.id;

                    return (
                      <tr key={sub.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                            <div>
                              <span className="font-semibold">{sub.datasetName}</span>
                              <span className="block text-[11px] font-mono text-zinc-400">
                                {sub.jobId} • Chunk #{sub.chunkIndex}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={sub.status} />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="w-28 space-y-1">
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all duration-300"
                                style={{ width: `${sub.progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-zinc-400">
                              {sub.progress}% complete
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400 text-[11px] truncate max-w-[140px]">
                          {sub.inputHash}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {sub.reward} USDC
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          {sub.status === 'VERIFIED' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Settled</span>
                            </span>
                          ) : isRunning ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-mono">
                              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                              <span>Docker Computing...</span>
                            </span>
                          ) : sub.status === 'ACCEPTED' ? (
                            <button
                              onClick={() => handleExecute(sub.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium hover:bg-black transition-colors"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Run in Docker</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleExecute(sub.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Accept & Execute</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
