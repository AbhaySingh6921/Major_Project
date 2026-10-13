import React from 'react';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { NetworkVisualization } from './NetworkVisualization';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onExploreHowItWorks,
}) => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E4E4E7] shadow-subtle mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-xs font-mono font-medium tracking-wide text-[#18181B] uppercase">
                DECENTRALIZED COMPUTE NETWORK
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#18181B] leading-[1.12] mb-6">
              Compute power.{' '}
              <span className="text-[#71717A] block sm:inline">
                Without the boundaries.
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-[#71717A] leading-relaxed max-w-2xl mb-8">
              Run compute-intensive workloads or contribute your own computing resources.
              DeCompute connects workload demand with distributed compute capacity through transparent cryptographic execution.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-6">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#18181B] text-white text-sm font-medium hover:bg-zinc-800 transition-all shadow-subtle group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onExploreHowItWorks}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white border border-[#E4E4E7] text-[#18181B] text-sm font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-subtle"
              >
                <span>Explore How It Works</span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* Concise explanation under CTAs */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#71717A] font-medium pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Need compute? Submit a workload. Have compute? Contribute resources.</span>
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <NetworkVisualization />
          </div>

        </div>
      </div>
    </section>
  );
};
