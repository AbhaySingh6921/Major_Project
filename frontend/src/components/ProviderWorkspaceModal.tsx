import React, { useState } from 'react';
import { X, Server, ShieldCheck, Play, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Terminal, Coins } from 'lucide-react';
import { AuthState } from '../types';

interface ProviderWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: AuthState;
  backendOnline: boolean | null;
}

interface OpenSubJob {
  id: string;
  jobId: string;
  subJobId: number;
  chunkIndex: number;
  reward: number;
  inputHash: string;
  status: 'OPEN' | 'ACCEPTED' | 'COMPLETED';
}

export const ProviderWorkspaceModal: React.FC<ProviderWorkspaceModalProps> = ({
  isOpen,
  onClose,
  auth,
  backendOnline,
}) => {
  const [stakedAmount, setStakedAmount] = useState<number>(auth.stakedAmount || 200);
  const [stakeInput, setStakeInput] = useState('50');
  const [isStaking, setIsStaking] = useState(false);
  const [nodeStatus, setNodeStatus] = useState<'idle' | 'executing' | 'online'>('online');
  const [executingSubJobId, setExecutingSubJobId] = useState<string | null>(null);

  // Available open subjobs matching GET /api/providers/subjobs/open
  const [openSubJobs, setOpenSubJobs] = useState<OpenSubJob[]>([
    {
      id: 'sub-01',
      jobId: 'job-104',
      subJobId: 3,
      chunkIndex: 3,
      reward: 10,
      inputHash: '0x99b10c55e0...e0f4',
      status: 'OPEN',
    },
    {
      id: 'sub-02',
      jobId: 'job-105',
      subJobId: 1,
      chunkIndex: 1,
      reward: 15,
      inputHash: '0x3a4b9c1d2e...99fa',
      status: 'OPEN',
    },
    {
      id: 'sub-03',
      jobId: 'job-105',
      subJobId: 2,
      chunkIndex: 2,
      reward: 15,
      inputHash: '0x88f110c4d7...12c8',
      status: 'OPEN',
    },
  ]);

  const [completedCount, setCompletedCount] = useState(14);
  const [earnedUSDC, setEarnedUSDC] = useState(140);

  if (!isOpen) return null;

  const handleStake = (amount: number) => {
    setIsStaking(true);
    setTimeout(() => {
      setStakedAmount((prev) => prev + amount);
      setIsStaking(false);
    }, 400);
  };

  const handleExecuteSubJob = (subJob: OpenSubJob) => {
    if (stakedAmount <= 0) {
      alert('You must have active collateral staked on ProviderRegistry.sol to accept sub-jobs.');
      return;
    }

    setExecutingSubJobId(subJob.id);
    setNodeStatus('executing');

    // Simulate Docker compute runner execution (download -> execute task -> compute output hash -> verify)
    setTimeout(() => {
      setOpenSubJobs((prev) =>
        prev.map((s) => (s.id === subJob.id ? { ...s, status: 'COMPLETED' } : s))
      );
      setCompletedCount((c) => c + 1);
      setEarnedUSDC((e) => e + subJob.reward);
      setExecutingSubJobId(null);
      setNodeStatus('online');
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white border border-[#E4E4E7] rounded-xl shadow-dropdown max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E4E4E7] flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#18181B] text-white flex items-center justify-center">
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#18181B]">Provider Node Portal</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Daemon Online
                </span>
              </div>
              <div className="text-xs font-mono text-[#71717A]">
                Node ID: {auth.walletAddress?.slice(0, 10)}... • Registered on ProviderRegistry.sol
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Node Vitals Grid */}
        <div className="p-6 border-b border-[#E4E4E7] grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white">
          <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
            <div className="text-xs font-mono text-zinc-500 mb-1 flex items-center justify-between">
              <span>Staked Collateral</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900">{stakedAmount} USDC</div>
            <div className="text-[11px] text-zinc-400 mt-1">ProviderRegistry Contract</div>
          </div>

          <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
            <div className="text-xs font-mono text-zinc-500 mb-1 flex items-center justify-between">
              <span>Completed Sub-Jobs</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900">{completedCount}</div>
            <div className="text-[11px] text-zinc-400 mt-1">100% verified output hashes</div>
          </div>

          <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
            <div className="text-xs font-mono text-zinc-500 mb-1 flex items-center justify-between">
              <span>Settled Earnings</span>
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700">{earnedUSDC} USDC</div>
            <div className="text-[11px] text-zinc-400 mt-1">Net of 5% platform fee</div>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Node Daemon Terminal Indicator */}
          <div className="bg-zinc-950 text-zinc-300 rounded-lg p-4 font-mono text-xs border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>
                worker-daemon: {nodeStatus === 'executing' ? (
                  <span className="text-yellow-400 animate-pulse">Running Docker Container for subjob...</span>
                ) : (
                  <span className="text-emerald-400">Listening on P2P gossip for open chunk broadcasts</span>
                )}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">Docker Engine v24.0</span>
          </div>

          {/* Open SubJobs Available on Network */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Open Sub-Jobs on Network (GET /api/providers/subjobs/open)
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {openSubJobs.filter((s) => s.status === 'OPEN').length} available
              </span>
            </div>

            <div className="space-y-3">
              {openSubJobs.map((sub) => {
                const isRunning = executingSubJobId === sub.id;
                const isDone = sub.status === 'COMPLETED';

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-zinc-900 font-mono">
                          {sub.jobId} • Chunk #{sub.chunkIndex}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                          Reward: {sub.reward} USDC
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 font-mono truncate max-w-sm">
                        Input Hash: {sub.inputHash}
                      </div>
                    </div>

                    <div>
                      {isDone ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Verified & Settled</span>
                        </div>
                      ) : isRunning ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 text-white text-xs font-mono">
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                          <span>Computing in Docker...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExecuteSubJob(sub)}
                          className="px-3.5 py-1.5 rounded bg-[#18181B] text-white text-xs font-medium hover:bg-zinc-800 transition-colors shadow-subtle flex items-center gap-1.5"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Accept & Execute Chunk</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staking Collateral Controls */}
          <div className="p-4 rounded-lg bg-white border border-[#E4E4E7]">
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2 font-mono">
              Provider Staking Management
            </h4>
            <p className="text-xs text-zinc-600 mb-3">
              Stake MockUSDC tokens on ProviderRegistry to maintain eligibility for job assignment. Locked stake cannot be withdrawn during active executions.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={stakeInput}
                onChange={(e) => setStakeInput(e.target.value)}
                className="w-28 px-3 py-1.5 text-xs font-mono rounded border border-[#E4E4E7] focus:outline-none focus:border-zinc-900"
              />
              <button
                onClick={() => handleStake(Number(stakeInput) || 50)}
                disabled={isStaking}
                className="px-3.5 py-1.5 rounded bg-zinc-100 text-zinc-800 hover:bg-zinc-200 text-xs font-medium border border-zinc-300 transition-colors"
              >
                {isStaking ? 'Staking...' : 'Deposit Additional Stake'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
