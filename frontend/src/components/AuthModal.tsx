import React, { useState } from 'react';
import { X, Wallet, Cpu, Server, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthState, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoleIntent?: 'requester' | 'provider' | null;
  onSuccess: (authData: AuthState) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRoleIntent,
  onSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<'requester' | 'provider'>(
    defaultRoleIntent || 'requester'
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [customAddress, setCustomAddress] = useState('');

  if (!isOpen) return null;

  // Preset demo accounts with realistic testnet addresses
  const presetAccounts = {
    requester: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    provider: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  };

  const handleConnect = async (useWeb3 = false) => {
    setIsConnecting(true);

    try {
      let address = customAddress.trim() || presetAccounts[selectedRole];

      // If user clicks Browser Wallet (MetaMask / injected)
      if (useWeb3 && typeof (window as any).ethereum !== 'undefined') {
        try {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_requestAccounts',
          });
          if (accounts && accounts[0]) {
            address = accounts[0];
          }
        } catch (err) {
          console.warn('Injected web3 connection failed, using test address:', err);
        }
      }

      setTimeout(() => {
        setIsConnecting(false);
        onSuccess({
          isAuthenticated: true,
          walletAddress: address,
          role: selectedRole,
          usdcBalance: selectedRole === 'requester' ? 2500 : 800,
          stakedAmount: selectedRole === 'provider' ? 200 : 0,
        });
        onClose();
      }, 500);
    } catch (e) {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-dropdown">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5 text-zinc-900" />
          </div>
          <h3 className="text-xl font-semibold text-[#18181B]">
            Connect to DeCompute
          </h3>
          <p className="text-xs text-[#71717A] mt-1">
            Choose your role and connect your Web3 wallet to access your workspace.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
            Selected Intent / Role
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedRole('requester')}
              className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                selectedRole === 'requester'
                  ? 'border-[#18181B] bg-zinc-50 shadow-subtle'
                  : 'border-[#E4E4E7] hover:border-zinc-300'
              }`}
            >
              <Cpu className="w-4 h-4 text-zinc-800 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-[#18181B]">Requester</div>
                <div className="text-[10px] text-zinc-500">Run compute jobs</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('provider')}
              className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                selectedRole === 'provider'
                  ? 'border-[#18181B] bg-zinc-50 shadow-subtle'
                  : 'border-[#E4E4E7] hover:border-zinc-300'
              }`}
            >
              <Server className="w-4 h-4 text-zinc-800 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-[#18181B]">Provider</div>
                <div className="text-[10px] text-zinc-500">Contribute nodes</div>
              </div>
            </button>
          </div>
        </div>

        {/* Connect Action Options */}
        <div className="space-y-3">
          <button
            onClick={() => handleConnect(false)}
            disabled={isConnecting}
            className="w-full py-2.5 px-4 rounded-lg bg-[#18181B] text-white text-sm font-medium hover:bg-zinc-800 transition-colors shadow-subtle flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Connecting...</span>
              </span>
            ) : (
              <>
                <span>Continue as {selectedRole === 'requester' ? 'Requester' : 'Provider'}</span>
                <ArrowRight className="w-4 h-4 text-zinc-300" />
              </>
            )}
          </button>

          {typeof (window as any).ethereum !== 'undefined' && (
            <button
              onClick={() => handleConnect(true)}
              className="w-full py-2 px-4 rounded-lg border border-[#E4E4E7] text-zinc-800 text-xs font-medium hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
            >
              <Wallet className="w-3.5 h-3.5 text-zinc-600" />
              <span>Connect Injected Browser Wallet (MetaMask)</span>
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Non-Custodial Escrow</span>
          <span>OpenZeppelin Guarded</span>
        </div>
      </div>
    </div>
  );
};
