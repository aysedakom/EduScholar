import { Bell, Menu, ChevronDown, CheckCheck, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { getSystemNotifications, saveSystemNotifications, mergeNotifications } from '../../utils/systemNotifications';
import { markAllNotificationsRead, getMyNotifications } from '../../api/notifications';
import type { AppNotification } from '../../types';

interface AppHeaderProps {
  onMenu: () => void;
}

function getUserInitials(name?: string): string {
  if (!name) return 'PM';
  const words = name.trim().split(/\s+/).filter(w => !w.endsWith('.'));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (name[0] || 'U').toUpperCase();
}

export function AppHeader({ onMenu }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, isTagalog } = useLanguage();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [eservicesOpen, setEservicesOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getSystemNotifications(user));

  useEffect(() => {
    let isMounted = true;
    const refresh = async () => {
      const localScoped = getSystemNotifications(user);
      try {
        const res = await getMyNotifications();
        if (isMounted && res.data?.notifications && Array.isArray(res.data.notifications)) {
          const merged = mergeNotifications(localScoped, res.data.notifications);
          setNotifications(merged);
          return;
        }
      } catch {
        // Fallback to local scoped
      }
      if (isMounted) {
        setNotifications(localScoped);
      }
    };

    refresh();
    window.addEventListener('qc_new_notification', refresh);
    return () => {
      isMounted = false;
      window.removeEventListener('qc_new_notification', refresh);
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveSystemNotifications(updated);
    try {
      await markAllNotificationsRead();
    } catch {
      // local state already updated
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (notifOpen && !target.closest('.notif-panel') && !target.closest('.notif-trigger')) {
        setNotifOpen(false);
      }
      if (eservicesOpen && !target.closest('.dropdown-eservices')) {
        setEservicesOpen(false);
      }
      if (open && !target.closest('.user-menu-dropdown')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen, eservicesOpen, open]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 md:px-6 shadow-md shadow-slate-200/80 dark:shadow-slate-950/50 text-slate-900 dark:text-slate-100 relative z-30 transition-colors duration-200">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onMenu}
          title="Toggle Navigation Sidebar"
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 sm:p-2.5 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand Name */}
        <Link to="/dashboard" className="flex lg:hidden items-center gap-2 min-w-0">
          <img src="/logo-system.png" alt="GovServe Logo" className="h-7 w-7 object-contain shrink-0" />
          <span className="font-heading font-black text-sm text-slate-900 dark:text-white truncate">GovServe</span>
        </Link>

        {/* Desktop Navigation Links: HOME, eSERVICES, CITIZEN'S CHARTER, CONTACT US */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <span>{t('nav.home')}</span>
          </Link>

          {/* eSERVICES Dropdown */}
          <div className="relative dropdown-eservices">
            <button
              onClick={() => setEservicesOpen(!eservicesOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <span>{t('nav.eservices')}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {eservicesOpen && (
              <div className="absolute left-0 top-11 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 p-2 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl mb-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t('nav.available')}</p>
                </div>

                {/* FIRST OPTION: Education and Scholarship */}
                <Link
                  to="/education-scholarship"
                  onClick={() => setEservicesOpen(false)}
                  className="block p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 transition-all mb-1 group"
                >
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-extrabold text-blue-900 dark:text-blue-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">{t('nav.eduScholarTitle')}</p>
                    <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">{t('nav.primary')}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">E-SCHOLAR Hub, LGU QC Grants, Alumni Sheet, QCU Portal</p>
                </Link>

                <a
                  href="https://govservedrrm.up.railway.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setEservicesOpen(false)}
                  className="block p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 transition-all mb-1 group"
                >
                  <p className="text-xs font-extrabold text-amber-900 dark:text-amber-300 group-hover:text-amber-700 dark:group-hover:text-amber-200">Disaster Risk Reduction (DRRM)</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Emergency Response, Weather & Evacuation Center Monitoring</p>
                </a>
              </div>
            )}
          </div>

          {/* CITIZEN'S CHARTER Link */}
          <a
            href="/citizens_charter.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span className="hidden sm:inline">{t('nav.charter')}</span>
            <span className="sm:hidden">{isTagalog ? 'KARTA' : 'CHARTER'}</span>
          </a>
        </nav>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Language Switcher (Clean white background in light mode) */}
        <LanguageSwitcher />

        {/* Theme Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
            className="notif-trigger relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div className="notif-panel fixed sm:absolute right-3 sm:right-0 top-16 sm:top-12 w-[calc(100vw-24px)] max-w-sm sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        n.read
                          ? 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                          : 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/60 text-slate-900 dark:text-slate-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                          {(n as any).sender || 'GovServe Education Automated System'}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.date}</span>
                      </div>
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="font-extrabold text-slate-900 dark:text-white leading-tight">{n.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-3 whitespace-pre-line mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-7 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* User Profile / Logout Dropdown */}
        <div className="relative user-menu-dropdown">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 rounded-2xl p-1.5 pl-2.5 pr-2 transition-all cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
          >
            <div className="text-right hidden md:block leading-tight">
              <p className="text-xs font-black tracking-tight text-slate-900 dark:text-white uppercase font-heading">
                {user?.name || 'PIA MARIE FANER'}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {user?.role === 'student'
                  ? (user?.application_code || user?.reference_id || user?.applicationId || user?.application_id || (user?.id ? `APP-2026-${String(user.id).padStart(4, '0')}` : 'APP-2026-0001'))
                  : (user?.role ? user.role.replace('_', ' ') : 'Administrator')}
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-extrabold text-xs text-white shadow-xs ring-2 ring-blue-600/20 shrink-0">
              {getUserInitials(user?.name)}
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0" />
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-52 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold font-mono">
                  {user?.role === 'student'
                    ? `Application ID: ${user?.application_code || user?.reference_id || user?.applicationId || user?.application_id || (user?.id ? `APP-2026-${String(user.id).padStart(4, '0')}` : 'APP-2026-0001')}`
                    : (user?.role ? user.role.replace('_', ' ') : 'Administrator')}
                </p>
                {user?.email && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-extrabold hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer transition-colors"
              >
                {t('nav.signout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
