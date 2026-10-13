import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Layers, CheckCircle2, Clock, Coins, ArrowRight, Download, Server, Cpu } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatCard } from '../shared/StatCard';
import { StatusBadge } from '../shared/StatusBadge';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const RequesterOverview: React.FC = () => {
  const navigate = useNavigate();
  const { auth, jobs, nodes } = useMarketplace();

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === 'IN_PROGRESS' || j.status === 'OPEN').length;
  const verifiedJobs = jobs.filter((j) => j.status === 'VERIFIED' || j.status === 'SETTLED').length;
  const totalEscrow = jobs.reduce((sum, j) => sum + j.totalReward, 0);

  const recentJobs = jobs.slice(0, 4);

  const downloadResults = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const csvContent =
      'data:text/csv;charset=utf-8,chunk_id,status,verification_hash\n' +
      job.chunks.map((c) => `${c.chunkIndex},${c.status},${c.expectedOutputHash}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `job-${job.blockchainJobId}-final-results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout role="requester" title="Requester Overview" subtitle="System Status & Metrics">
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 sm:p-7 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Decentralized Escrow Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Welcome back, Requester
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              Submit compute-intensive workloads to decentralized provider nodes. Workloads are deterministically split into 5 sub-tasks with non-custodial smart contract escrow.
            </p>
          </div>

          <button
            onClick={() => navigate('/requester/new')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs sm:text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Compute Job</span>
          </button>
        </div>

        {/* 4 Key Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Submitted Jobs"
            value={totalJobs}
            icon={Layers}
            subValue="Lifetime workloads"
          />
          <StatCard
            label="Active Executions"
            value={activeJobs}
            icon={Clock}
            trend={activeJobs > 0 ? `${activeJobs} in flight` : 'Idle queue'}
            trendPositive={activeJobs > 0}
          />
          <StatCard
            label="Verified & Settled"
            value={verifiedJobs}
            icon={CheckCircle2}
            trend="100% hash verified"
            trendPositive={true}
          />
          <StatCard
            label="Total Escrow Committed"
            value={`${totalEscrow} USDC`}
            icon={Coins}
            subValue="Smart contract deposits"
          />
        </div>

        {/* Recent Compute Jobs Table */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl overflow-hidden shadow-subtle">
          <div className="p-5 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Recent Compute Jobs
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Latest workload partitions and execution states
              </p>
            </div>

            <button
              onClick={() => navigate('/requester/jobs')}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View all jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-5">Workload Name</th>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Chunk Progress</th>
                  <th className="py-3 px-4">Escrow Reward</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
                {recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => navigate(`/requester/jobs/${job.id}`)}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-zinc-400" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{job.datasetName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                      #{job.blockchainJobId}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all"
                            style={{ width: `${(job.completedChunks / job.totalChunks) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                          {job.completedChunks}/{job.totalChunks}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      {job.totalReward} USDC
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {job.status === 'VERIFIED' || job.status === 'SETTLED' ? (
                        <button
                          onClick={(e) => downloadResults(job.id, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium text-[11px]"
                        >
                          <Download className="w-3 h-3" />
                          <span>Results</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">Processing...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Network Availability Indicator */}
        <div className="bg-[#FAFAFA] dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 border border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white">
                Network Execution Capacity
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {nodes.length} verified compute nodes active across 3 geographic regions (US-East, EU-Central, AP-South).
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
              Avg. Chunk Latency: 14.2s
            </span>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
