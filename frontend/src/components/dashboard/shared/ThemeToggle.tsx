import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-subtle flex items-center justify-center"
        title={`Current theme: ${theme} (${resolvedTheme})`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-emerald-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] p-1.5 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
          <button
            onClick={() => {
              setTheme('light');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
              theme === 'light'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </span>
            {theme === 'light' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              setTheme('dark');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dark</span>
            </span>
            {theme === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              setTheme('system');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
              theme === 'system'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-zinc-400" />
              <span>System</span>
            </span>
            {theme === 'system' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          </button>
        </div>
      )}
    </div>
  );
};
