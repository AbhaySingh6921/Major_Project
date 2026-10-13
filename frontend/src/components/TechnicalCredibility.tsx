import React, { useState } from 'react';
import { Shield, FileCheck, Layers, Lock, Cpu, Server, CheckCircle2, ChevronRight } from 'lucide-react';

export const TechnicalCredibility: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'verification' | 'escrow' | 'workloads' | 'contracts'>('verification');

  const specs = [
    {
      id: 'verification',
      title: 'Execution Verification',
      icon: FileCheck,
      headline: 'Deterministic SHA-256 Dual-Hash Validation',
      description:
        'Every submitted workload is split into 5 deterministic chunks. Providers submit cryptographic output hashes that are verified against expected state hashes before escrow settlement is released.',
      details: [
        { label: 'Partition Size', value: '5 sub-jobs per parent workload' },
        { label: 'Hashing Primitive', value: 'SHA-256 input and output verification' },
        { label: 'Aggregation', value: 'Automated CSV chunk recombination' },
      ],
    },
    {
      id: 'escrow',
      title: 'Escrow & Staking',
      icon: Lock,
      headline: 'Non-Custodial Smart Contract Escrow',
      description:
        'Requesters deposit reward tokens (ERC-20 USDC) upon job creation. Funds remain locked in ComputeMarketplace.sol and are only disbursed upon cryptographic verification.',
      details: [
        { label: 'Payment Token', value: 'USDC (ERC-20 standard)' },
        { label: 'Platform Fee', value: '5% retained at contract settlement' },
        { label: 'Provider Collateral', value: 'Staked via ProviderRegistry.sol' },
      ],
    },
    {
      id: 'workloads',
      title: 'Supported Workloads',
      icon: Layers,
      headline: 'Structured Data Processing & ML Inference',
      description:
        'Currently optimized for structured tabular and CSV dataset processing with deterministic line splitting, as well as containerized Docker compute-runner tasks.',
      details: [
        { label: 'Current Data Format', value: 'CSV / Structured tabular data' },
        { label: 'Execution Environment', value: 'Docker containerized runner daemon' },
        { label: 'Max File Size', value: '50 MB per job upload' },
      ],
    },
    {
      id: 'contracts',
      title: 'Smart Contracts',
      icon: Shield,
      headline: 'Auditable Solidity Primitives (v0.8.24)',
      description:
        'Core protocol logic runs on OpenZeppelin-secured contracts including ReentrancyGuard, Ownable access control, and active job locks.',
      details: [
        { label: 'Marketplace', value: 'ComputeMarketplace.sol' },
        { label: 'Registry', value: 'ProviderRegistry.sol' },
        { label: 'Security Model', value: 'ReentrancyGuard & Active Job Locks' },
      ],
    },
  ];

  const currentSpec = specs.find((s) => s.id === activeTab) || specs[0];

  return (
    <section id="technical-credibility" className="py-20 bg-[#FAFAFA] border-t border-[#E4E4E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono font-medium text-emerald-700 uppercase tracking-wider mb-2">
            Technical Specifications
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#18181B] mb-3">
            Built on verifiable primitives
          </h2>
          <p className="text-base text-[#71717A]">
            Technical credibility rooted in concrete repository architecture, deterministic hashing, and smart contract escrow.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 pb-6 border-b border-[#E4E4E7] mb-8">
          {specs.map((spec) => {
            const Icon = spec.icon;
            const isSelected = activeTab === spec.id;
            return (
              <button
                key={spec.id}
                onClick={() => setActiveTab(spec.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#18181B] text-white shadow-subtle'
                    : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:text-[#18181B] hover:border-zinc-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{spec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Spec Content Display */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-8 shadow-subtle">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-7">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Architecture
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#18181B] mt-3 mb-3">
                {currentSpec.headline}
              </h3>
              <p className="text-sm text-[#71717A] leading-relaxed mb-6">
                {currentSpec.description}
              </p>

              <div className="space-y-2.5">
                {currentSpec.details.map((detail, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-xs font-mono"
                  >
                    <span className="text-zinc-500">{detail.label}</span>
                    <span className="text-zinc-900 font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-zinc-950 text-zinc-300 rounded-lg p-5 font-mono text-xs border border-zinc-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-[11px] text-zinc-500">
                <span>protocol_spec.sol</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-zinc-300">
{`// ComputeMarketplace & ProviderRegistry
struct SubJob {
  uint256 subJobId;
  address provider;
  bytes32 inputHash;
  bytes32 expectedOutputHash;
  bytes32 outputHash;
  SubJobStatus status;
}

// Verification requirement:
// outputHash == expectedOutputHash`}
              </pre>
              <div className="mt-4 pt-3 border-t border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
                <span>ReentrancyGuard • OpenZeppelin</span>
                <span>Active Job Locks</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
