import React, { useState } from 'react';
import { X, FileText, Code2, BookOpen, Layers, Server, Shield, Copy, Check } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white border border-[#E4E4E7] rounded-xl shadow-dropdown max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E4E4E7] flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#18181B] text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#18181B]">DeCompute Protocol Documentation</h3>
              <p className="text-xs text-[#71717A]">
                Developer specifications, REST API reference, and smart contract architecture.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Docs Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 text-sm text-zinc-700">
          
          {/* Section 1: Protocol Architecture */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>1. Protocol Architecture & Chunk Partitioning</span>
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              DeCompute executes jobs through deterministic workload partitioning. When a requester uploads a CSV dataset, the backend orchestrator validates and splits the file into <strong>5 distinct sub-tasks</strong> using deterministic row offsets. Each chunk is hashed with SHA-256 before being committed to the <code>ComputeMarketplace.sol</code> contract.
            </p>
            <div className="bg-zinc-950 text-zinc-300 rounded-lg p-3.5 font-mono text-xs border border-zinc-800">
              <code>Dataset (CSV) → Split into 5 Chunks → Calculate SHA-256 Hashes → On-chain Escrow Lock</code>
            </div>
          </div>

          {/* Section 2: Smart Contracts */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>2. Core Smart Contracts (Solidity v0.8.24)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
                <div className="font-semibold text-zinc-900 text-xs font-mono mb-1">
                  ComputeMarketplace.sol
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Coordinates job lifecycle, verifies expected vs. computed output hashes, retains 5% platform protocol fees, and manages non-custodial escrow releases.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
                <div className="font-semibold text-zinc-900 text-xs font-mono mb-1">
                  ProviderRegistry.sol
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Handles provider registration and collateral token staking. Active job counter locks stake to prevent unstaking during job execution.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: REST API Endpoints */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>3. Orchestrator REST API Reference</span>
            </h4>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg border border-[#E4E4E7] bg-white flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">POST</span>
                  <span className="font-semibold text-zinc-900">/api/jobs/upload</span>
                </div>
                <span className="text-zinc-500 font-sans">
                  Multipart form submission. Requires <code>walletAddress</code>, <code>reward</code> (divisible by 5), <code>deadline</code>, and <code>dataset</code> CSV.
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[#E4E4E7] bg-white flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">GET</span>
                  <span className="font-semibold text-zinc-900">/api/providers/subjobs/open</span>
                </div>
                <span className="text-zinc-500 font-sans">
                  Returns available unassigned sub-job chunks with input hashes and reward rates.
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[#E4E4E7] bg-white flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">POST</span>
                  <span className="font-semibold text-zinc-900">/api/jobs/:jobId/aggregate</span>
                </div>
                <span className="text-zinc-500 font-sans">
                  Recombines verified chunk outputs, compares final hash, and compiles downloadable result.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Running a Provider Worker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>4. Running a Provider Worker Daemon</span>
              </h4>
              <button
                onClick={() => copyCode('cd backend/provider-worker && npm install && npm start', 'worker-cmd')}
                className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-mono"
              >
                {copiedSection === 'worker-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'worker-cmd' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-zinc-950 text-zinc-300 rounded-lg p-3.5 font-mono text-xs border border-zinc-800 overflow-x-auto">
{`# 1. Clone repository & install provider worker
git clone https://github.com/AbhaySingh6921/Major_Project.git
cd MajorProject/backend/provider-worker
npm install

# 2. Configure provider wallet private key in nano.env
PROVIDER_KEY="0x..."

# 3. Launch execution worker
npm start`}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4E4E7] bg-zinc-50 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>DeCompute Architecture Specification v1.0</span>
          <span>Open-Source Protocol</span>
        </div>

      </div>
    </div>
  );
};
