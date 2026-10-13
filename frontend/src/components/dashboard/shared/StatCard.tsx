import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  trendPositive,
}) => {
  return (
    <div className="bg-white dark:bg-[#121215] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-5 shadow-subtle hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
        <span className="uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-bold font-mono text-[#18181B] dark:text-white tracking-tight">
        {value}
      </div>

      {(subValue || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {trend && (
            <span className={`font-mono font-medium ${trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
              {trend}
            </span>
          )}
          {subValue && <span>{subValue}</span>}
        </div>
      )}
    </div>
  );
};
