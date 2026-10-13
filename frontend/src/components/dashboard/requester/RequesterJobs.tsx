import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Download, ExternalLink, Filter, ArrowUpDown, Cpu } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { EmptyState } from '../shared/EmptyState';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const RequesterJobs: React.FC = () => {
  const navigate = useNavigate();
  const { jobs } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'VERIFIED' | 'SETTLED'>('ALL');

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.datasetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(job.blockchainJobId).includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'IN_PROGRESS') return job.status === 'IN_PROGRESS' || job.status === 'OPEN';
    return job.status === statusFilter;
  });

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
    <DashboardLayout role="requester" title="Compute Jobs" subtitle="Workload Registry">
      <div className="space-y-6">
        
        {/* Top Controls: Search, Filters, and New Job CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by dataset name or Job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-500 shadow-subtle"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#121215] p-1 text-xs">
              {(['ALL', 'IN_PROGRESS', 'VERIFIED', 'SETTLED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    statusFilter === s
                      ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-medium shadow-subtle'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'Active' : s}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate('/requester/new')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle flex-shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Job</span>
            </button>
          </div>

        </div>

        {/* Jobs Table */}
        {filteredJobs.length === 0 ? (
          <EmptyState
            title="No matching compute jobs found"
            description="Try modifying your search criteria or filter options, or deploy a new workload to the network."
            actionLabel="Deploy New Compute Job"
            onAction={() => navigate('/requester/new')}
          />
        ) : (
          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[11px]">
                    <th className="py-3 px-5">Workload Name</th>
                    <th className="py-3 px-4">Job ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Chunks Verified</th>
                    <th className="py-3 px-4">Escrow Reward</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
                  {filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      onClick={() => navigate(`/requester/jobs/${job.id}`)}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-zinc-400" />
                          <span className="truncate max-w-[220px]">{job.datasetName}</span>
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
                          <div className="w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
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
                      <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                        {job.createdAt}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/requester/jobs/${job.id}`)}
                            className="px-2.5 py-1 rounded border border-[#E4E4E7] dark:border-[#27272A] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors font-medium text-[11px]"
                          >
                            Details
                          </button>
                          {(job.status === 'VERIFIED' || job.status === 'SETTLED') && (
                            <button
                              onClick={(e) => downloadResults(job.id, e)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors font-medium text-[11px]"
                            >
                              <Download className="w-3 h-3" />
                              <span>CSV</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
