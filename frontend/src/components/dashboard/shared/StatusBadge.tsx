import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.toUpperCase();

  let styles = 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';

  if (norm === 'VERIFIED' || norm === 'HEALTHY' || norm === 'SETTLED' || norm === 'COMPLETED') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
  } else if (norm === 'IN_PROGRESS' || norm === 'ACCEPTED' || norm === 'PROCESSING') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60';
  } else if (norm === 'OPEN' || norm === 'IDLE') {
    styles = 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700';
  } else if (norm === 'HIGH LOAD' || norm === 'PENDING') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
  } else if (norm === 'DISPUTED' || norm === 'CANCELLED' || norm === 'OFFLINE') {
    styles = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60';
  }

  const px = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${px} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        norm === 'VERIFIED' || norm === 'HEALTHY' || norm === 'SETTLED'
          ? 'bg-emerald-500'
          : norm === 'IN_PROGRESS' || norm === 'ACCEPTED'
          ? 'bg-blue-500 animate-pulse'
          : norm === 'HIGH LOAD'
          ? 'bg-amber-500 animate-pulse'
          : norm === 'DISPUTED' || norm === 'OFFLINE'
          ? 'bg-red-500'
          : 'bg-zinc-400'
      }`} />
      <span>{status}</span>
    </span>
  );
};
