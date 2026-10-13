import React, { useState, useEffect } from 'react';
import { Cpu, Menu, X, Terminal, ArrowUpRight, ShieldCheck, LogOut, FileText } from 'lucide-react';
import { AuthState } from '../types';

interface NavbarProps {
  auth: AuthState;
  onOpenAuth: (roleIntent?: 'requester' | 'provider') => void;
  onOpenWorkspace: () => void;
  onDisconnect: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  auth,
  onOpenAuth,
  onOpenWorkspace,
  onDisconnect,
  onOpenDocs,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-[#FAFAFA]/90 backdrop-blur-md border-b border-[#E4E4E7]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand: Logo & Wordmark */}
        <a
          href="#"
          className="flex items-center gap-2.5 text-[#18181B] font-semibold text-lg tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-[#18181B] text-white flex items-center justify-center shadow-subtle">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <span>DeCompute</span>
          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 hidden sm:inline-block">
            Mainnet Beta
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#71717A]">
          <button
            onClick={() => scrollTo('how-it-works')}
            className="hover:text-[#18181B] transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo('roles')}
            className="hover:text-[#18181B] transition-colors"
          >
            For Requesters
          </button>
          <button
            onClick={() => scrollTo('roles')}
            className="hover:text-[#18181B] transition-colors"
          >
            For Providers
          </button>
          <button
            onClick={() => scrollTo('technical-credibility')}
            className="hover:text-[#18181B] transition-colors"
          >
            Architecture
          </button>
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1 hover:text-[#18181B] transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Documentation
          </button>
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="hidden md:flex items-center gap-3">
          {auth.isAuthenticated && auth.walletAddress ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E4E4E7] text-xs font-mono text-zinc-700 shadow-subtle">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-medium capitalize text-zinc-900">{auth.role}:</span>
                <span>{auth.walletAddress.slice(0, 6)}...{auth.walletAddress.slice(-4)}</span>
              </div>
              <button
                onClick={onOpenWorkspace}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-[#18181B] text-white hover:bg-zinc-800 transition-colors shadow-subtle flex items-center gap-1"
              >
                <span>Console</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-300" />
              </button>
              <button
                onClick={onDisconnect}
                title="Disconnect Wallet"
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth()}
                className="px-3.5 py-2 text-sm font-medium text-[#18181B] hover:text-zinc-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('requester')}
                className="px-4 py-2 text-sm font-medium rounded-md bg-[#18181B] text-white hover:bg-zinc-800 transition-colors shadow-subtle"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden gap-2">
          {auth.isAuthenticated ? (
            <button
              onClick={onOpenWorkspace}
              className="px-3 py-1.5 text-xs font-medium rounded bg-[#18181B] text-white"
            >
              Console
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('requester')}
              className="px-3 py-1.5 text-xs font-medium rounded bg-[#18181B] text-white"
            >
              Get Started
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#18181B] hover:bg-zinc-100 rounded-md transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E4E4E7] bg-white px-4 pt-3 pb-6 shadow-dropdown animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-3 text-sm font-medium text-[#18181B]">
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-left py-2 hover:text-emerald-700 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('roles')}
              className="text-left py-2 hover:text-emerald-700 transition-colors"
            >
              For Requesters
            </button>
            <button
              onClick={() => scrollTo('roles')}
              className="text-left py-2 hover:text-emerald-700 transition-colors"
            >
              For Providers
            </button>
            <button
              onClick={() => scrollTo('technical-credibility')}
              className="text-left py-2 hover:text-emerald-700 transition-colors"
            >
              Architecture & Specs
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDocs();
              }}
              className="text-left py-2 flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-zinc-500" />
              Documentation
            </button>
            <div className="pt-3 border-t border-[#E4E4E7] flex flex-col gap-2">
              {auth.isAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#71717A]">
                    Connected as <span className="font-semibold capitalize text-zinc-900">{auth.role}</span> ({auth.walletAddress})
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenWorkspace();
                    }}
                    className="w-full py-2.5 rounded-md bg-[#18181B] text-white text-sm font-medium text-center"
                  >
                    Open Console
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onDisconnect();
                    }}
                    className="w-full py-2 rounded-md border border-[#E4E4E7] text-zinc-700 text-xs font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2.5 rounded-md border border-[#E4E4E7] text-[#18181B] text-sm font-medium text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('requester');
                    }}
                    className="w-full py-2.5 rounded-md bg-[#18181B] text-white text-sm font-medium text-center"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
