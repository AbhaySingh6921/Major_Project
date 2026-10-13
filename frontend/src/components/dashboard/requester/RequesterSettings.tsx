import React, { useState } from 'react';
import { Save, Check, Shield, Download, Bell, Database } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const RequesterSettings: React.FC = () => {
  const { auth, jobs } = useMarketplace();

  const [gasPreference, setGasPreference] = useState<'standard' | 'fast' | 'aggressive'>('standard');
  const [defaultDeadline, setDefaultDeadline] = useState('24');
  const [maxEscrowCap, setMaxEscrowCap] = useState('500');
  const [rpcUrl, setRpcUrl] = useState('http://127.0.0.1:8545');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `decompute-requester-history-${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
  };

  return (
    <DashboardLayout role="requester" title="Settings" subtitle="Requester Configuration">
      <div className="max-w-2xl space-y-6">
        
        <form onSubmit={handleSave} className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 sm:p-7 shadow-subtle space-y-6">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Workload & Escrow Preferences
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Configure default parameters for smart contract transactions and job dispatching.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Connected Wallet */}
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Connected Requester Wallet
              </label>
              <input
                type="text"
                disabled
                value={auth.walletAddress || ''}
                className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              />
            </div>

            {/* Default Execution Deadline */}
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Default Execution Deadline (Hours)
              </label>
              <input
                type="number"
                value={defaultDeadline}
                onChange={(e) => setDefaultDeadline(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
              />
            </div>

            {/* Max Escrow Cap */}
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Maximum Escrow Cap (USDC)
              </label>
              <input
                type="number"
                value={maxEscrowCap}
                onChange={(e) => setMaxEscrowCap(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
              />
              <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                Safety threshold for single-transaction deposits
              </span>
            </div>

            {/* RPC Provider Endpoint */}
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ethereum RPC Endpoint
              </label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {saved ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Preferences saved successfully!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>

        {/* Data Export Box */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 shadow-subtle flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Export Job Ledger
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Download complete JSON audit history of submitted workloads and hash proofs.
            </p>
          </div>
          <button
            onClick={exportHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};
