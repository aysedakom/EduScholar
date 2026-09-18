import React from 'react';
import { Menu, Bell, Moon, Sun, Shield } from 'lucide-react';

interface AppHeaderProps {
  onMenuToggle: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuToggle,
  isDarkMode,
  onToggleDarkMode,
  activeRole,
  onRoleChange,
}) => {
  return (
    <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
            GovServe
          </span>
          <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
            Campus Aid Hub
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Interactive Role Switcher for Template Previewing */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hidden sm:inline">
            Role:
          </span>
          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value)}
            aria-label="Select role to preview"
            className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="student" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Student</option>
            <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Admin</option>
            <option value="system_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">System Admin</option>
            <option value="supervisor" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Supervisor</option>
            <option value="school_coordinator" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">School Coordinator</option>
            <option value="treasury" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Treasury</option>
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            PM
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Pia Marie Faner
            </span>
            <span className="block text-[10px] text-slate-500 font-mono">
              ID: 23010366
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
