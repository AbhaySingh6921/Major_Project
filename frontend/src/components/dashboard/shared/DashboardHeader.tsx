import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Wallet, Copy, Check, ArrowRightLeft, LogOut, ExternalLink, Globe } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useMarketplace } from '../../../context/MarketplaceContext';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onToggleSidebar,
}) => {
  const { auth, backendOnline, loginAs, logout } = useMarketplace();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyAddress = () => {
    if (auth.walletAddress) {
      navigator.clipboard.writeText(auth.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSwitchRole = (newRole: 'requester' | 'provider') => {
    loginAs(newRole);
    setAccountOpen(false);
    navigate(`/${newRole}`);
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#E4E4E7] dark:border-[#27272A] bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 lg:hidden text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {subtitle && (
              <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                / {subtitle}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search, Network Status, ThemeToggle, Account Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* Backend / Gateway Status indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
          <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
          <span>Localhost Testnet (Chain ID 31337)</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Account Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setAccountOpen(!accountOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 transition-colors shadow-subtle"
          >
            <div className="w-5 h-5 rounded-md bg-[#18181B] dark:bg-zinc-800 text-white flex items-center justify-center text-[10px] font-bold">
              {auth.role === 'requester' ? 'R' : 'P'}
            </div>
            <span className="hidden sm:inline">
              {auth.walletAddress ? `${auth.walletAddress.slice(0, 6)}...${auth.walletAddress.slice(-4)}` : 'Connect'}
            </span>
          </button>

          {accountOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#121215] p-3 shadow-dropdown z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              
              {/* Account Card */}
              <div className="pb-3 mb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Active Wallet • <span className="capitalize text-zinc-800 dark:text-zinc-200 font-semibold">{auth.role}</span>
                </div>
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                  <span className="truncate max-w-[170px]">{auth.walletAddress}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:text-zinc-900 dark:hover:text-white"
                    title="Copy wallet address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">USDC Balance:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {auth.usdcBalance} USDC
                  </span>
                </div>
                {auth.role === 'provider' && (
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Staked Collateral:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {auth.stakedAmount} USDC
                    </span>
                  </div>
                )}
              </div>

              {/* Role Switcher Option */}
              <div className="space-y-1 py-1">
                <div className="text-[10px] font-mono uppercase text-zinc-400 px-2 py-0.5">
                  Switch Role View
                </div>
                {auth.role === 'requester' ? (
                  <button
                    onClick={() => handleSwitchRole('provider')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Switch to Provider UI</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSwitchRole('requester')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Switch to Requester UI</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setAccountOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Return to Landing Page</span>
                </button>
              </div>

              {/* Disconnect */}
              <div className="pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => {
                    logout();
                    setAccountOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect Session</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
};
