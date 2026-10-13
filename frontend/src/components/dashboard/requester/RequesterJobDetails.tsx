import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Terminal, Cpu, CheckCircle2, ShieldCheck, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const RequesterJobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, jobs } = useMarketplace();

  const job = getJobById(id || '') || jobs[0];

  const [activeTab, setActiveTab] = useState<'chunks' | 'logs'>('chunks');

  if (!job) {
    return (
      <DashboardLayout role="requester" title="Job Details">
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">Job not found.</p>
          <button
            onClick={() => navigate('/requester/jobs')}
            className="mt-4 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium"
          >
            Back to Jobs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const downloadResults = () => {
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
    <DashboardLayout role="requester" title={`Job #${job.blockchainJobId}`} subtitle="Execution Inspection">
      <div className="space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/requester/jobs')}
              className="p-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {job.datasetName}
                </h2>
                <StatusBadge status={job.status} />
              </div>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                Internal ID: {job.id} • Blockchain Job #{job.blockchainJobId}
              </div>
            </div>
          </div>

          {(job.status === 'VERIFIED' || job.status === 'SETTLED') && (
            <button
              onClick={downloadResults}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Final Results</span>
            </button>
          )}
        </div>

        {/* 4 Overview Spec Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-4 shadow-subtle">
            <div className="text-xs font-mono text-zinc-500 mb-1">Escrow Reward</div>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
              {job.totalReward} USDC
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">5 chunks • {job.totalReward / 5} USDC/chunk</div>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-4 shadow-subtle">
            <div className="text-xs font-mono text-zinc-500 mb-1">Chunks Verified</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {job.completedChunks} / {job.totalChunks}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">Deterministic SHA-256</div>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-4 shadow-subtle">
            <div className="text-xs font-mono text-zinc-500 mb-1">Execution Deadline</div>
            <div className="text-xs font-mono font-medium text-zinc-900 dark:text-white truncate">
              {job.deadline}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">Refund available on expiry</div>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-4 shadow-subtle">
            <div className="text-xs font-mono text-zinc-500 mb-1">Requester Identity</div>
            <div className="text-xs font-mono text-zinc-900 dark:text-white truncate">
              {job.requester}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">Smart Contract Escrow Lock</div>
          </div>
        </div>

        {/* Tabs for Chunks vs Logs */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl overflow-hidden shadow-subtle">
          <div className="flex border-b border-[#E4E4E7] dark:border-[#27272A] px-5 text-xs font-mono">
            <button
              onClick={() => setActiveTab('chunks')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'chunks'
                  ? 'border-emerald-600 text-zinc-900 dark:text-white font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              5 Sub-Job Chunks ({job.completedChunks}/5 Verified)
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'border-emerald-600 text-zinc-900 dark:text-white font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Execution Logs</span>
            </button>
          </div>

          <div className="p-5">
            {activeTab === 'chunks' ? (
              <div className="space-y-3">
                {job.chunks.map((chunk) => (
                  <div
                    key={chunk.chunkIndex}
                    className="p-4 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-zinc-900/40 text-xs font-mono space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white">
                          Chunk #{chunk.chunkIndex}
                        </span>
                        <span className="text-zinc-500">• Reward: {chunk.reward} USDC</span>
                      </div>
                      <StatusBadge status={chunk.status} size="sm" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <div>
                        <span className="text-zinc-400">Input Hash: </span>
                        <span className="text-zinc-800 dark:text-zinc-200">{chunk.inputHash}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Expected Hash: </span>
                        <span className="text-zinc-800 dark:text-zinc-200">{chunk.expectedOutputHash}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Provider Output: </span>
                        <span className="text-zinc-800 dark:text-zinc-200">{chunk.outputHash || 'Pending worker computation...'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Worker Node: </span>
                        <span className="text-zinc-800 dark:text-zinc-200">{chunk.providerAddress || 'Unassigned / in queue'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-950 text-zinc-300 rounded-lg p-4 font-mono text-xs border border-zinc-800 space-y-1.5 max-h-96 overflow-y-auto">
                <div className="text-zinc-500 text-[11px] pb-2 border-b border-zinc-800">
                  --- DeCompute Execution Logs (Job #{job.blockchainJobId}) ---
                </div>
                {(job.logs && job.logs.length > 0 ? job.logs : [
                  `[00:00:01] Job initialized on ComputeMarketplace.sol`,
                  `[00:00:04] 5 sub-tasks hashed and distributed to gossip protocol`,
                  `[00:00:15] Listening for provider output commits...`
                ]).map((log, idx) => (
                  <div key={idx} className="text-zinc-300 leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
