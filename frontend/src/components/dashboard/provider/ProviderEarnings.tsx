import React, { useState } from 'react';
import { Coins, ShieldCheck, ArrowDownLeft, ArrowUpRight, CheckCircle2, Plus, Lock } from 'lucide-react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatCard } from '../shared/StatCard';
import { useMarketplace } from '../../../context/MarketplaceContext';

export const ProviderEarnings: React.FC = () => {
  const { auth, transactions, stakeMoreCollateral } = useMarketplace();

  const [stakeInput, setStakeInput] = useState('50');
  const [stakeModalOpen, setStakeModalOpen] = useState(false);

  const totalRewards = transactions
    .filter((t) => t.type === 'reward' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDepositStake = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(stakeInput);
    if (amt > 0) {
      stakeMoreCollateral(amt);
      setStakeModalOpen(false);
    }
  };

  return (
    <DashboardLayout role="provider" title="Earnings & Ledger" subtitle="Settlement Accounting">
      <div className="space-y-6">
        
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Financial Settlements & Collateral Ledger
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Audit trail of task rewards disbursed from ComputeMarketplace and collateral staked in ProviderRegistry
            </p>
          </div>

          <button
            onClick={() => setStakeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deposit Collateral Stake</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Staked Collateral"
            value={`${auth.stakedAmount || 250} USDC`}
            icon={ShieldCheck}
            subValue="ProviderRegistry.sol active stake"
          />
          <StatCard
            label="Total Settled Earnings"
            value={`${totalRewards.toFixed(2)} USDC`}
            icon={Coins}
            trend="Net of 5% protocol fee"
            trendPositive={true}
          />
          <StatCard
            label="Liquid Wallet Balance"
            value={`${auth.usdcBalance || 790} USDC`}
            icon={Coins}
            subValue="Available ERC-20 MockUSDC"
          />
        </div>

        {/* Protocol Fee Notice */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-[#E4E4E7] dark:border-[#27272A] text-xs space-y-1">
          <div className="font-semibold text-zinc-900 dark:text-white flex items-center justify-between">
            <span>Settlement Accounting Rules:</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">5% Platform Fee</span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
            Upon successful SHA-256 output hash verification, ComputeMarketplace.sol automatically retains a 5% protocol fee and immediately disburses 95% of the escrow reward to the executing provider's address.
          </p>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl overflow-hidden shadow-subtle">
          <div className="p-5 border-b border-[#E4E4E7] dark:border-[#27272A]">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Transaction History
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Transaction Hash</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-5">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.type === 'reward'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                      }`}>
                        {t.type === 'reward' ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-zinc-500" />}
                        <span className="uppercase">{t.type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                      +{t.amount} USDC
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {t.txHash}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {t.timestamp}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400 text-[11px]">
                      {t.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deposit Stake Modal */}
        {stakeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 shadow-dropdown space-y-4">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Deposit Collateral Stake
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Deposit additional MockUSDC tokens to increase your node's eligible job allocation limit.
              </p>

              <form onSubmit={handleDepositStake} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Stake Amount (USDC)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setStakeModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] text-zinc-700 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle"
                  >
                    Confirm Stake
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
