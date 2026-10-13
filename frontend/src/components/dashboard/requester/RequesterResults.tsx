import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileCheck2, Cpu, CheckCircle2, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { EmptyState } from '../shared/EmptyState';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const RequesterResults: React.FC = () => {
  const navigate = useNavigate();
  const { jobs } = useMarketplace();

  const completedJobs = jobs.filter((j) => j.status === 'VERIFIED' || j.status === 'SETTLED');

  const downloadResults = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const csvContent =
      'data:text/csv;charset=utf-8,chunk_id,status,verification_hash,rows_computed\n' +
      job.chunks
        .map((c) => `${c.chunkIndex},${c.status},${c.expectedOutputHash},${(job.rowCount || 100000) / 5}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `job-${job.blockchainJobId}-final-aggregated-result.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout role="requester" title="Workload Results" subtitle="Output Artifacts">
      <div className="space-y-6">
        
        {/* Header description */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Aggregated Workload Results
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Download deterministic CSV outputs verified against expected output hashes and settled by smart contracts.
            </p>
          </div>
          <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
            {completedJobs.length} Completed Artifacts Available
          </div>
        </div>

        {completedJobs.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No completed results available yet"
            description="Workloads will appear here as soon as provider nodes finish computing chunks and cryptographic verification succeeds."
            actionLabel="Deploy a Workload"
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
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Rows Computed</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
                  {completedJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate max-w-[220px]">{job.datasetName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                        #{job.blockchainJobId}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                        {job.rowCount?.toLocaleString() || '100,000'} rows
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                        {job.fileSizeMb || 14.2} MB
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => downloadResults(job.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Output</span>
                        </button>
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
