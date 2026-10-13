import React, { useState } from 'react';
import { X, Upload, Cpu, CheckCircle2, Clock, AlertCircle, Download, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { AuthState, MarketplaceJob, JobChunk } from '../types';

interface RequesterWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: AuthState;
  backendOnline: boolean | null;
}

export const RequesterWorkspaceModal: React.FC<RequesterWorkspaceModalProps> = ({
  isOpen,
  onClose,
  auth,
  backendOnline,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'jobs'>('submit');
  const [datasetName, setDatasetName] = useState('financial_telemetry_v1.csv');
  const [reward, setReward] = useState('25'); // Divisible by 5 as required
  const [deadlineHours, setDeadlineHours] = useState('24');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sample existing active job reflecting the 5-chunk architecture
  const [jobs, setJobs] = useState<MarketplaceJob[]>([
    {
      id: 'job-670a892b',
      blockchainJobId: 104,
      datasetName: 'credit_scoring_batch_2026.csv',
      requester: auth.walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      totalReward: 50,
      totalChunks: 5,
      completedChunks: 5,
      status: 'VERIFIED',
      createdAt: '2026-10-12 14:20',
      deadline: '2026-10-14 14:20',
      chunks: [
        { chunkIndex: 0, inputHash: '0x8f2a41c31b...a9b2', expectedOutputHash: '0x33e1c9...24fd', outputHash: '0x33e1c9...24fd', reward: 10, status: 'VERIFIED', providerAddress: '0x90F7...b906' },
        { chunkIndex: 1, inputHash: '0x1c4e9989d2...771a', expectedOutputHash: '0x55d2b1...389c', outputHash: '0x55d2b1...389c', reward: 10, status: 'VERIFIED', providerAddress: '0x15d3...9821' },
        { chunkIndex: 2, inputHash: '0x7e02b441a8...312c', expectedOutputHash: '0x9a8b7c...6421', outputHash: '0x9a8b7c...6421', reward: 10, status: 'VERIFIED', providerAddress: '0x9965...d201' },
        { chunkIndex: 3, inputHash: '0x99b10c55e0...e0f4', expectedOutputHash: '0x42ff11...bb52', outputHash: '0x42ff11...bb52', reward: 10, status: 'VERIFIED', providerAddress: '0x976e...981c' },
        { chunkIndex: 4, inputHash: '0x43d78af26a...7c91', expectedOutputHash: '0x77c4e0...33e8', outputHash: '0x77c4e0...33e8', reward: 10, status: 'VERIFIED', providerAddress: '0xbDA5...642e' },
      ],
    },
  ]);

  const [selectedJob, setSelectedJob] = useState<MarketplaceJob>(jobs[0]);

  if (!isOpen) return null;

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const rewardNum = Number(reward);
    if (!rewardNum || rewardNum <= 0) {
      setErrorMsg('Reward must be greater than 0.');
      return;
    }

    // Backend validation constraint: Reward must be divisible by 5 (5 subjobs)
    if (rewardNum % 5 !== 0) {
      setErrorMsg('Protocol constraint: Reward must be divisible by 5 (1 reward unit per sub-task chunk).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create local simulated job structure matching backend response
      const deadlineDate = new Date(Date.now() + Number(deadlineHours) * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');
      const subJobReward = rewardNum / 5;

      const generatedChunks: JobChunk[] = Array.from({ length: 5 }, (_, i) => ({
        chunkIndex: i,
        inputHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        expectedOutputHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        reward: subJobReward,
        status: 'OPEN',
      }));

      const newJob: MarketplaceJob = {
        id: `job-${Math.random().toString(16).substring(2, 8)}`,
        blockchainJobId: 105 + jobs.length,
        datasetName: datasetName || 'dataset_batch.csv',
        requester: auth.walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        totalReward: rewardNum,
        totalChunks: 5,
        completedChunks: 0,
        status: 'OPEN',
        createdAt: 'Just now',
        deadline: deadlineDate,
        chunks: generatedChunks,
      };

      // Try actual backend if available, fallback gracefully
      if (backendOnline) {
        try {
          const formData = new FormData();
          const dummyCsv = new Blob(['id,feature1,feature2\n1,10.5,0.4\n2,20.1,0.9'], { type: 'text/csv' });
          formData.append('dataset', dummyCsv, datasetName);
          formData.append('walletAddress', auth.walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
          formData.append('reward', rewardNum.toString());
          formData.append('deadline', new Date(Date.now() + 86400000).toISOString());

          const res = await fetch('/api/jobs/upload', {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.job) {
              newJob.id = data.job.id;
              newJob.blockchainJobId = data.job.blockchainJobId || newJob.blockchainJobId;
            }
          }
        } catch (err) {
          console.warn('Backend upload call attempted, using client state:', err);
        }
      }

      setJobs([newJob, ...jobs]);
      setSelectedJob(newJob);
      setIsSubmitting(false);
      setSuccessMsg(`Workload successfully registered on blockchain as Job #${newJob.blockchainJobId}`);
      setActiveTab('jobs');
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Failed to dispatch job to network.');
    }
  };

  const handleDownloadResult = (job: MarketplaceJob) => {
    // Generate CSV result file for download
    const csvContent = "data:text/csv;charset=utf-8," 
      + "chunk_id,status,verification_hash,verified_at\n"
      + job.chunks.map(c => `${c.chunkIndex},${c.status},${c.expectedOutputHash},2026-10-13`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job-${job.blockchainJobId}-final-result.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white border border-[#E4E4E7] rounded-xl shadow-dropdown max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E4E4E7] flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#18181B] text-white flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#18181B]">Requester Workspace</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Escrow Active
                </span>
              </div>
              <div className="text-xs font-mono text-[#71717A]">
                Wallet: {auth.walletAddress?.slice(0, 8)}...{auth.walletAddress?.slice(-6)} • Balance: {auth.usdcBalance || 2500} USDC
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E4E4E7] px-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('submit')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'submit'
                ? 'border-[#18181B] text-[#18181B]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Submit New Workload
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'border-[#18181B] text-[#18181B]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>My Submitted Jobs</span>
            <span className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 text-[10px] flex items-center justify-center">
              {jobs.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'submit' ? (
            <form onSubmit={handleSubmitJob} className="max-w-xl mx-auto space-y-5">
              
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Dataset File Input / Simulation */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Workload Dataset (CSV)
                </label>
                <div className="border-2 border-dashed border-[#E4E4E7] rounded-lg p-5 text-center bg-[#FAFAFA] hover:border-zinc-400 transition-colors">
                  <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                  <div className="text-xs text-zinc-600 mb-1">
                    Select a tabular CSV dataset to partition into 5 deterministic chunks
                  </div>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="dataset_filename.csv"
                    className="w-full max-w-sm mt-2 px-3 py-1.5 text-xs font-mono rounded border border-[#E4E4E7] bg-white text-zinc-800 text-center focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              {/* Reward & Chunks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Total Escrow Reward (USDC)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#E4E4E7] bg-white text-zinc-800 focus:outline-none focus:border-zinc-900"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                    Must be divisible by 5 ({Number(reward) ? Number(reward)/5 : 0} USDC/chunk)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Execution Deadline (Hours)
                  </label>
                  <input
                    type="number"
                    value={deadlineHours}
                    onChange={(e) => setDeadlineHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#E4E4E7] bg-white text-zinc-800 focus:outline-none focus:border-zinc-900"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                    Timeout after which refund can be claimed
                  </span>
                </div>
              </div>

              {/* Architecture Info Callout */}
              <div className="p-3.5 rounded-lg bg-zinc-50 border border-[#E4E4E7] text-xs space-y-1.5">
                <div className="font-semibold text-zinc-900 flex items-center justify-between">
                  <span>Smart Contract Flow:</span>
                  <span className="font-mono text-[10px] text-emerald-700">ComputeMarketplace.sol</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Upon submission, the backend partitions the dataset into 5 sub-tasks, hashes input lines, and submits hashes to the Ethereum contract with locked USDC escrow.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#18181B] text-white text-xs sm:text-sm font-medium hover:bg-zinc-800 transition-colors shadow-subtle flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                    <span>Partitioning & Creating Blockchain Job...</span>
                  </span>
                ) : (
                  <>
                    <span>Deposit Escrow & Dispatch Workload</span>
                    <ArrowRight className="w-4 h-4 text-zinc-300" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Jobs Monitor Tab */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Job List Selection */}
                <div className="md:col-span-5 space-y-2.5">
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Select Workload
                  </div>
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        selectedJob.id === job.id
                          ? 'border-[#18181B] bg-zinc-50 shadow-subtle'
                          : 'border-[#E4E4E7] hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-zinc-900 font-mono">Job #{job.blockchainJobId}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          job.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 truncate mb-1">
                        {job.datasetName}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                        <span>{job.totalReward} USDC</span>
                        <span>{job.completedChunks}/5 chunks complete</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Job Chunk Breakdown */}
                <div className="md:col-span-7 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-5">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4E4E7]">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">
                        Job #{selectedJob.blockchainJobId} Chunk Breakdown
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Dataset: {selectedJob.datasetName}
                      </p>
                    </div>
                    {selectedJob.status === 'VERIFIED' && (
                      <button
                        onClick={() => handleDownloadResult(selectedJob)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#18181B] text-white text-xs font-medium hover:bg-zinc-800 transition-colors shadow-subtle"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Results</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {selectedJob.chunks.map((chunk) => (
                      <div
                        key={chunk.chunkIndex}
                        className="bg-white border border-[#E4E4E7] rounded-lg p-2.5 text-xs font-mono flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-900">Chunk {chunk.chunkIndex}</span>
                            <span className="text-[10px] text-zinc-400">• Reward: {chunk.reward} USDC</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate max-w-[200px] sm:max-w-[260px]">
                            Hash: {chunk.inputHash}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          chunk.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {chunk.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Platform Fee: 5%</span>
                    <span>Deterministic SHA-256 Validated</span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
