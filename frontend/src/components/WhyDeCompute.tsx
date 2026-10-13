import React from 'react';
import { Network, Activity, Sliders, CheckCheck } from 'lucide-react';

export const WhyDeCompute: React.FC = () => {
  const benefits = [
    {
      icon: Network,
      title: 'Distributed compute',
      description:
        'Connect workload demand directly with verified independent compute resources across decentralized provider nodes.',
    },
    {
      icon: Activity,
      title: 'Transparent execution',
      description:
        'Inspect granular workload states at every lifecycle step: upload, chunk partitioning, worker assignment, and verification.',
    },
    {
      icon: Sliders,
      title: 'Role-specific control',
      description:
        'Access tailored workspaces with dedicated tooling for requesters managing workloads and providers running worker daemons.',
    },
    {
      icon: CheckCheck,
      title: 'Verifiable operations',
      description:
        'Validate computational integrity through SHA-256 output hashes and non-custodial smart contract escrow on the Ethereum network.',
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-[#E4E4E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono font-medium text-emerald-700 uppercase tracking-wider mb-2">
            Architecture Principles
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#18181B] mb-3">
            Why DeCompute
          </h2>
          <p className="text-base text-[#71717A]">
            A marketplace engineered around verifiable execution primitives rather than speculative claims.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 hover:border-zinc-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-md bg-white border border-[#E4E4E7] flex items-center justify-center text-[#18181B] mb-4">
                    <Icon className="w-4 h-4 text-zinc-800" />
                  </div>
                  <h3 className="text-base font-semibold text-[#18181B] mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
