import React from 'react';
import { Cpu, Lock, ArrowUpRight, Github, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenRequester: () => void;
  onOpenProvider: () => void;
  onOpenAdmin: () => void;
  onOpenDocs: () => void;
  backendOnline: boolean | null;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRequester,
  onOpenProvider,
  onOpenAdmin,
  onOpenDocs,
  backendOnline,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-[#E4E4E7] pt-16 pb-12 text-[#71717A] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E4E4E7]">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5 text-[#18181B] font-semibold text-lg tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-[#18181B] text-white flex items-center justify-center">
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <span>DeCompute</span>
            </div>
            <p className="text-sm text-[#71717A] max-w-sm leading-relaxed">
              Connect to a decentralized computing network. Run compute workloads or contribute resources through transparent cryptographic smart contracts.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span>Backend API Status:</span>
              <span className="font-semibold text-zinc-900">
                {backendOnline ? 'Connected (:5000)' : 'Client-Side Gateway Active'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#18181B] font-semibold">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-[#18181B] transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenRequester}
                  className="hover:text-[#18181B] transition-colors"
                >
                  Requester Workspace
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenProvider}
                  className="hover:text-[#18181B] transition-colors"
                >
                  Provider Node Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('technical-credibility')}
                  className="hover:text-[#18181B] transition-colors"
                >
                  Architecture & Specifications
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Protocols */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#18181B] font-semibold">
              Protocol Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenDocs}
                  className="hover:text-[#18181B] transition-colors flex items-center gap-1"
                >
                  <span>Protocol Documentation</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('faq')}
                  className="hover:text-[#18181B] transition-colors"
                >
                  Knowledge Base & FAQ
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/AbhaySingh6921/Major_Project"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#18181B] transition-colors flex items-center gap-1"
                >
                  <Github className="w-3 h-3" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li className="pt-2">
                {/* Discreet Operator Console link */}
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors text-[11px] font-mono"
                  title="Authorized Operational Console"
                >
                  <Lock className="w-3 h-3 text-zinc-500" />
                  <span>Operator Console (Authorized)</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <div>
            © 2026 DeCompute Network. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Built with Solidity v0.8.24 & OpenZeppelin</span>
            <span className="font-mono text-[11px] text-zinc-400">v1.0.0-beta</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
