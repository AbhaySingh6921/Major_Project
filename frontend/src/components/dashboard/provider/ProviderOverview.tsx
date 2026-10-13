import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Activity, CheckCircle2, Coins, Play, ShieldCheck, ArrowRight, Terminal, HardDrive } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatCard } from '../shared/StatCard';
import { StatusBadge } from '../shared/StatusBadge';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const ProviderOverview: React.FC = () => {
  const navigate = useNavigate();
  const { auth, nodes, assignedJobs, transactions, acceptAndExecuteSubJob } = useMarketplace();

  const totalNodes = nodes.length;
  const activeSubJobs = assignedJobs.filter((j) => j.status === 'ACCEPTED').length;
  const openSubJobs = assignedJobs.filter((j) => j.status === 'OPEN').length;
  const completedJobs = nodes.reduce((sum, n) => sum + n.completedJobsCount, 0);

  // Calculate earnings from transactions
  const totalEarnings = transactions
    .filter((t) => t.type === 'reward' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout role="provider" title="Provider Overview" subtitle="Node Telemetry & Earnings">
      <div className="space-y-8">
        
        {/* Node Daemon Status Banner */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 sm:p-7 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ProviderRegistry Collateral Verified ({auth.stakedAmount || 250} USDC)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Worker Daemons Operational
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              Connected to Ethereum P2P compute protocol. Your registered nodes receive chunk tasks, execute computation inside isolated Docker containers, and submit SHA-256 output hashes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/provider/nodes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-subtle"
            >
              <Server className="w-4 h-4 text-zinc-500" />
              <span>Manage Nodes</span>
            </button>
            <button
              onClick={() => navigate('/provider/jobs')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
            >
              <Activity className="w-4 h-4" />
              <span>View Open Workloads</span>
            </button>
          </div>
        </div>

        {/* 4 Core Vitals Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Registered Nodes"
            value={totalNodes}
            icon={Server}
            trend="100% online"
            trendPositive={true}
          />
          <StatCard
            label="Assigned / Open SubJobs"
            value={`${activeSubJobs} active / ${openSubJobs} open`}
            icon={Activity}
            subValue="Gossip broadcast queue"
          />
          <StatCard
            label="Lifetime Completed Chunks"
            value={completedJobs}
            icon={CheckCircle2}
            trend="100% hash validity"
            trendPositive={true}
          />
          <StatCard
            label="Settled USDC Earnings"
            value={`${totalEarnings.toFixed(2)} USDC`}
            icon={Coins}
            subValue="Net of 5% platform protocol fee"
          />
        </div>

        {/* Live Workload Execution Queue */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl overflow-hidden shadow-subtle">
          <div className="p-5 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Assigned & Available Chunk Tasks
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tasks allocated to your worker daemon or available for instant execution
              </p>
            </div>

            <button
              onClick={() => navigate('/provider/jobs')}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View all subjobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-5">Workload & Chunk</th>
                  <th className="py-3 px-4">Task Status</th>
                  <th className="py-3 px-4">Input Hash</th>
                  <th className="py-3 px-4">Reward</th>
                  <th className="py-3 px-5 text-right">Execution Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
                {assignedJobs.slice(0, 4).map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-white">
                      <div>
                        <span>{sub.datasetName}</span>
                        <span className="block text-[11px] font-mono text-zinc-400">
                          {sub.jobId} • Chunk #{sub.chunkIndex}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">
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
                      ) : sub.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => acceptAndExecuteSubJob(sub.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium hover:bg-black transition-colors"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Run in Docker</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => acceptAndExecuteSubJob(sub.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Accept & Execute</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registered Nodes Quick Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Registered Hardware Nodes
            </h3>
            <button
              onClick={() => navigate('/provider/nodes')}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View all nodes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => navigate(`/provider/nodes/${node.id}`)}
                className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-5 shadow-subtle hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-zinc-500" />
                    <span>{node.name}</span>
                  </div>
                  <StatusBadge status={node.health} size="sm" />
                </div>

                <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>CPU:</span>
                    <span className="text-zinc-900 dark:text-zinc-200">{node.cpu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory:</span>
                    <span className="text-zinc-900 dark:text-zinc-200">{node.memory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPU:</span>
                    <span className="text-zinc-900 dark:text-zinc-200">{node.gpu}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Heartbeat: {node.lastHeartbeat}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {node.availability}% uptime
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
