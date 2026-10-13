import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { useTheme } from '../../../context/ThemeContext';

interface DashboardLayoutProps {
  role: 'requester' | 'provider';
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role,
  title,
  subtitle,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  // Apply dark mode only within the dashboard views
  useEffect(() => {
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      // Clean up and ensure landing page remains light mode
      document.documentElement.classList.remove('dark');
    };
  }, [resolvedTheme]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-[#18181B] dark:text-[#FAFAFA] flex flex-col font-sans transition-colors">
      {/* Sidebar */}
      <DashboardSidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
