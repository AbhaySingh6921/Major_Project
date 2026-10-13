import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Cpu,
  LayoutDashboard,
  Layers,
  PlusCircle,
  FileCheck2,
  Settings,
  Server,
  Activity,
  Coins,
  ArrowRightLeft,
  ArrowLeft,
  X,
  FileCode2,
} from 'lucide-react';
import { useMarketplace } from '../../../context/MarketplaceContext';

interface NavItem {
  label: string;
  to: string;
  icon: any;
  exact?: boolean;
  badge?: string;
  highlight?: boolean;
}

interface DashboardSidebarProps {
  role: 'requester' | 'provider';
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  role,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { jobs, assignedJobs, nodes, loginAs } = useMarketplace();

  // Navigation items for Service Requester
  const requesterNav: NavItem[] = [
    { label: 'Overview', to: '/requester', icon: LayoutDashboard, exact: true },
    {
      label: 'Compute Jobs',
      to: '/requester/jobs',
      icon: Layers,
      badge: jobs.length.toString(),
    },
    { label: 'New Compute Job', to: '/requester/new', icon: PlusCircle, highlight: true },
    {
      label: 'Results',
      to: '/requester/results',
      icon: FileCheck2,
      badge: jobs.filter((j) => j.status === 'VERIFIED' || j.status === 'SETTLED').length.toString(),
    },
    { label: 'Settings', to: '/requester/settings', icon: Settings },
  ];

  // Navigation items for Service Provider
  const providerNav: NavItem[] = [
    { label: 'Overview', to: '/provider', icon: LayoutDashboard, exact: true },
    {
      label: 'Compute Nodes',
      to: '/provider/nodes',
      icon: Server,
      badge: nodes.length.toString(),
    },
    {
      label: 'Assigned Jobs',
      to: '/provider/jobs',
      icon: Activity,
      badge: assignedJobs.filter((j) => j.status === 'ACCEPTED' || j.status === 'OPEN').length.toString(),
    },
    { label: 'Earnings & Ledger', to: '/provider/earnings', icon: Coins },
    { label: 'Settings', to: '/provider/settings', icon: Settings },
  ];

  const currentNav = role === 'requester' ? requesterNav : providerNav;

  const handleRoleSwitch = () => {
    const nextRole = role === 'requester' ? 'provider' : 'requester';
    loginAs(nextRole);
    navigate(`/${nextRole}`);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#09090B] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
            <NavLink
              to="/"
              className="flex items-center gap-2.5 text-zinc-900 dark:text-white font-semibold text-base tracking-tight"
            >
              <div className="w-7 h-7 rounded-lg bg-[#18181B] dark:bg-zinc-800 text-white flex items-center justify-center">
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <span>DeCompute</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 capitalize">
                {role}
              </span>
            </NavLink>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 lg:hidden rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {role === 'requester' ? 'Workload Management' : 'Node Operations'}
            </div>

            {currentNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#18181B] text-white dark:bg-zinc-800 dark:text-white shadow-subtle'
                        : item.highlight
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/40 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3.5 border-t border-[#E4E4E7] dark:border-[#27272A] space-y-2">
          {/* Quick Role Switcher Button */}
          <button
            onClick={handleRoleSwitch}
            className="w-full py-2 px-3 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500" />
              <span>Switch to {role === 'requester' ? 'Provider' : 'Requester'}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">1-click</span>
          </button>

          {/* Return to Landing Page */}
          <NavLink
            to="/"
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
