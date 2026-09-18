import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: React.ReactNode;
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activeRole, onRoleChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <AppSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeRole={activeRole}
      />

      <div className="flex min-w-0 flex-1 flex-col h-[100dvh] overflow-hidden">
        <AppHeader
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          activeRole={activeRole}
          onRoleChange={onRoleChange}
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
};
