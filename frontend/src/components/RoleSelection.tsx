import React from 'react';
import { Cpu, Server, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { AuthState } from '../types';

interface RoleSelectionProps {
  auth: AuthState;
  onSelectRole: (role: 'requester' | 'provider') => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ auth, onSelectRole }) => {
  return (
    <section id="roles" className="py-20 border-t border-[#E4E4E7] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono font-medium text-emerald-700 uppercase tracking-wider mb-2">
            Targeted Workspaces
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#18181B] mb-3">
            How will you use DeCompute?
          </h2>
          <p className="text-base text-[#71717A]">
            Choose the experience that matches what you want to do.
          </p>
        </div>

        {/* Two Equal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card A: Service Requester */}
          <div className="group relative bg-white border border-[#E4E4E7] rounded-xl p-8 shadow-card hover:shadow-card-hover hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between">
            <div>
              {/* Header with Icon and Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-[#E4E4E7] flex items-center justify-center text-[#18181B] group-hover:border-zinc-400 transition-colors">
                  <Cpu className="w-6 h-6 text-[#18181B]" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Requester Portal
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-semibold text-[#18181B] mb-2.5">
                Run your workloads
              </h3>
              <p className="text-sm text-[#71717A] leading-relaxed mb-6">
                Submit a supported workload, configure its execution, and track its progress and results.
              </p>

              {/* Three concise benefits */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm text-zinc-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Submit and configure jobs with custom escrow rewards</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Monitor distributed chunk execution across provider nodes</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Access cryptographically verified aggregate results</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div>
              <button
                onClick={() => onSelectRole('requester')}
                className="w-full py-3 px-5 rounded-lg bg-[#18181B] text-white text-sm font-medium hover:bg-zinc-800 transition-colors shadow-subtle flex items-center justify-center gap-2 group-hover:gap-2.5"
              >
                <span>
                  {auth.isAuthenticated && auth.role === 'requester'
                    ? 'Open Requester Workspace'
                    : 'Start as a Requester'}
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-300" />
              </button>
              <div className="mt-3 text-center text-[11px] text-[#71717A]">
                Supports CSV data partitions • SHA-256 validation
              </div>
            </div>
          </div>

          {/* Card B: Service Provider */}
          <div className="group relative bg-white border border-[#E4E4E7] rounded-xl p-8 shadow-card hover:shadow-card-hover hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between">
            <div>
              {/* Header with Icon and Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-[#E4E4E7] flex items-center justify-center text-[#18181B] group-hover:border-zinc-400 transition-colors">
                  <Server className="w-6 h-6 text-[#18181B]" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Provider Node
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-semibold text-[#18181B] mb-2.5">
                Contribute compute
              </h3>
              <p className="text-sm text-[#71717A] leading-relaxed mb-6">
                Connect supported computing resources to the network and manage assigned workloads.
              </p>

              {/* Three concise benefits */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm text-zinc-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Register supported hardware and commit on-chain stake</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Monitor node daemon health and execute assigned work</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Track earnings and claim settled escrow rewards in USDC</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div>
              <button
                onClick={() => onSelectRole('provider')}
                className="w-full py-3 px-5 rounded-lg bg-[#18181B] text-white text-sm font-medium hover:bg-zinc-800 transition-colors shadow-subtle flex items-center justify-center gap-2 group-hover:gap-2.5"
              >
                <span>
                  {auth.isAuthenticated && auth.role === 'provider'
                    ? 'Open Provider Workspace'
                    : 'Become a Provider'}
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-300" />
              </button>
              <div className="mt-3 text-center text-[11px] text-[#71717A]">
                Requires ProviderRegistry on-chain staking
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
