import React, { useState } from 'react';
import { Save, Check, Server, Shield, Key, Sliders, HardDrive } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const ProviderSettings: React.FC = () => {
  const { auth } = useMarketplace();

  const [minReward, setMinReward] = useState('5');
  const [maxConcurrency, setMaxConcurrency] = useState('4');
  const [dockerSocket, setDockerSocket] = useState('/var/run/docker.sock');
  const [autoClaim, setAutoClaim] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout role="provider" title="Settings" subtitle="Provider Node Configuration">
      <div className="max-w-2xl space-y-6">
        
        <form onSubmit={handleSave} className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 sm:p-7 shadow-subtle space-y-6">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Worker Daemon & Hardware Policy
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Configure parameters governing how your worker daemons accept, execute, and verify workloads.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Registered Node Address */}
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Registered Provider Wallet (ProviderRegistry.sol)
              </label>
              <input
                type="text"
                disabled
                value={auth.walletAddress || ''}
                className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              />
            </div>

            {/* Min Reward Threshold */}
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Minimum Reward Acceptance Threshold (USDC)
              </label>
              <input
                type="number"
                value={minReward}
                onChange={(e) => setMinReward(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
              />
              <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                Daemons ignore subjobs with escrow reward below this threshold
              </span>
            </div>

            {/* Max Concurrent Jobs */}
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Maximum Concurrent Container Tasks
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={maxConcurrency}
                onChange={(e) => setMaxConcurrency(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
              />
              <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                Number of parallel Docker execution containers allowed
              </span>
            </div>

            {/* Docker Socket */}
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Docker Daemon Socket Path
              </label>
              <input
                type="text"
                value={dockerSocket}
                onChange={(e) => setDockerSocket(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
              />
            </div>

            {/* Auto-Claim Rewards Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoClaim}
                  onChange={(e) => setAutoClaim(e.target.checked)}
                  className="rounded border-[#E4E4E7] dark:border-[#27272A] text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  Automatically withdraw settled USDC rewards to wallet
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {saved ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Daemon policy saved!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Policy</span>
            </button>
          </div>
        </form>

        {/* Worker CLI Quick Reference Box */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 shadow-subtle space-y-3">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Worker Daemon CLI Configuration
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Sync your provider configuration directly with your local worker daemon:
          </p>
          <pre className="p-3 bg-zinc-950 text-zinc-300 rounded-lg text-xs font-mono border border-zinc-800 overflow-x-auto">
{`# Run daemon with custom policy
cd backend/provider-worker
MIN_REWARD=5 MAX_CONCURRENCY=4 npm start`}
          </pre>
        </div>

      </div>
    </DashboardLayout>
  );
};
