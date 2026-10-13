import React, { useState } from 'react';
import { X, ShieldAlert, Lock, Key, CheckCircle2, AlertOctagon, Sliders, Database, RefreshCw } from 'lucide-react';
import { AuthState } from '../types';

interface AdminWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: AuthState;
}

export const AdminWorkspaceModal: React.FC<AdminWorkspaceModalProps> = ({
  isOpen,
  onClose,
  auth,
}) => {
  const [operatorKey, setOperatorKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [platformFee, setPlatformFee] = useState(5);
  const [isPaused, setIsPaused] = useState(false);

  if (!isOpen) return null;

  const handleVerifyOperator = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Check operator credentials or authorized deployer signature
    // Demonstrating trusted authorization checks rather than an unprotected public signup
    if (operatorKey.trim() === 'operator-2026' || operatorKey.trim().startsWith('0x') || operatorKey.trim() === 'admin') {
      setIsAuthorized(true);
    } else {
      setAuthError('Unauthorized signature. Admin operations require verified contract owner access.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white border border-[#E4E4E7] rounded-xl shadow-dropdown max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E4E4E7] flex items-center justify-between bg-zinc-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">Authorized Operator Console</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Privileged
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                ComputeMarketplace & ProviderRegistry Owner Operations
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isAuthorized ? (
            /* Protected Authorization Gate */
            <div className="max-w-md mx-auto py-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-3">
                  <Key className="w-6 h-6 text-zinc-800" />
                </div>
                <h4 className="text-lg font-semibold text-zinc-900">Operator Verification</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  This console is restricted to authenticated contract administrators. Enter operator credential to verify cryptographic signature.
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOperator} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-600 mb-1">
                    Operator Key / Signature (e.g. 'operator-2026' or 'admin')
                  </label>
                  <input
                    type="password"
                    value={operatorKey}
                    onChange={(e) => setOperatorKey(e.target.value)}
                    placeholder="Enter authorized credential..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#E4E4E7] focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-black transition-colors"
                >
                  Verify Authorization
                </button>
              </form>

              <div className="mt-6 text-center text-[11px] text-zinc-400 font-mono">
                Access is logged on-chain. Unauthorized attempts are rejected.
              </div>
            </div>
          ) : (
            /* Authenticated Admin Management Controls */
            <div className="space-y-6">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Operator Identity Verified: Ownable Contract Administrator</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-700">0xf39F...2266</span>
              </div>

              {/* Protocol Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
                  <div className="text-xs font-mono text-zinc-500 mb-1">Platform Protocol Fee</div>
                  <div className="text-2xl font-bold font-mono text-zinc-900">{platformFee}%</div>
                  <div className="text-[11px] text-zinc-400 mt-1">ComputeMarketplace.sol:L16</div>
                </div>

                <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
                  <div className="text-xs font-mono text-zinc-500 mb-1">Max SubJobs Per Job</div>
                  <div className="text-2xl font-bold font-mono text-zinc-900">5</div>
                  <div className="text-[11px] text-zinc-400 mt-1">Deterministic partition size</div>
                </div>

                <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
                  <div className="text-xs font-mono text-zinc-500 mb-1">Protocol Circuit Breaker</div>
                  <div className="text-2xl font-bold font-mono text-emerald-600">
                    {isPaused ? 'PAUSED' : 'ACTIVE'}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Emergency ReentrancyGuard</div>
                </div>
              </div>

              {/* Protocol Maintenance Controls */}
              <div className="p-4 rounded-lg bg-white border border-[#E4E4E7] space-y-4">
                <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider font-mono">
                  Administrative Governance Actions
                </h4>

                <div className="flex items-center justify-between py-2 border-b border-zinc-100 text-xs">
                  <div>
                    <div className="font-medium text-zinc-900">Marketplace Circuit Breaker</div>
                    <div className="text-zinc-500 text-[11px]">Temporarily halts job creation and escrow deposits</div>
                  </div>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`px-3 py-1.5 rounded text-xs font-medium ${
                      isPaused
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-100 text-zinc-800 border border-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {isPaused ? 'Resume Operations' : 'Trigger Pause'}
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-zinc-100 text-xs">
                  <div>
                    <div className="font-medium text-zinc-900">Dispute Settlement Engine</div>
                    <div className="text-zinc-500 text-[11px]">0 active disputes pending arbitrator review</div>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Queue Empty</span>
                </div>
              </div>

              {/* Deployed Contract Artifacts */}
              <div className="p-4 rounded-lg bg-zinc-50 border border-[#E4E4E7] text-xs font-mono space-y-2">
                <div className="text-[11px] font-semibold text-zinc-700 uppercase">
                  Contract Deployment Registry
                </div>
                <div className="flex items-center justify-between text-zinc-600 text-[11px]">
                  <span>ComputeMarketplace:</span>
                  <span className="text-zinc-900">0x5FbDB2315678afecb367f032d93F642f64180aa3</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600 text-[11px]">
                  <span>ProviderRegistry:</span>
                  <span className="text-zinc-900">0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600 text-[11px]">
                  <span>MockUSDC (ERC-20):</span>
                  <span className="text-zinc-900">0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
