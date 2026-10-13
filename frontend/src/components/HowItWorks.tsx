import React from 'react';
import { UserCheck, GitCommit, LineChart, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Choose your role',
      icon: UserCheck,
      description:
        'Select whether to request computing resources to process workloads or contribute verified computing nodes to the decentralized network.',
      tag: 'Role Verification',
    },
    {
      number: '02',
      title: 'Connect to the network',
      icon: GitCommit,
      description:
        'Requesters submit CSV workloads partitioned into 5 chunks with escrow funding; providers register and lock stake via ProviderRegistry.',
      tag: 'Onboarding & Escrow',
    },
    {
      number: '03',
      title: 'Track execution',
      icon: LineChart,
      description:
        'Monitor subjob processing, verify cryptographic output hashes against expected results, and access aggregated outputs or claim settled rewards.',
      tag: 'Verifiable Settlement',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#FAFAFA] border-t border-[#E4E4E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono font-medium text-emerald-700 uppercase tracking-wider mb-2">
            Execution Lifecycle
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#18181B] mb-3">
            How It Works
          </h2>
          <p className="text-base text-[#71717A]">
            A transparent three-stage process linking compute requesters and node providers through cryptographic smart contracts.
          </p>
        </div>

        {/* Steps Grid / Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Subtle connecting connector on desktop */}
          <div className="hidden md:block absolute top-12 left-24 right-24 h-[1px] bg-[#E4E4E7] -z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative z-10 bg-white border border-[#E4E4E7] rounded-xl p-7 shadow-subtle hover:border-zinc-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Number and Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-bold text-[#18181B]">
                      {step.number}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {step.tag}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-[#E4E4E7] flex items-center justify-center text-[#18181B] mb-5">
                    <Icon className="w-5 h-5 text-zinc-800" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-[#18181B] mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#71717A] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <span>Step {idx + 1} of 3</span>
                  <span className="text-emerald-700 font-medium">Verified state</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
