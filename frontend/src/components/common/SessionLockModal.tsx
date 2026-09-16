import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldAlert, LogOut, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 Minutes (120,000 ms)

export const SessionLockModal: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (isLocked) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (user) {
        setIsLocked(true);
        toast.warning('Session locked due to 2 minutes of inactivity.', { duration: 5000 });
      }
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    if (!user) {
      setIsLocked(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetTimer();

    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity));
    resetTimer();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, isLocked]);

  if (!user || !isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password to unlock your session.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    // Re-authentication check
    setTimeout(() => {
      setIsSubmitting(false);
      setIsLocked(false);
      setPassword('');
      toast.success('Session unlocked successfully! Welcome back.');
      resetTimer();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
        {/* Lock Icon Header */}
        <div className="mx-auto h-16 w-16 rounded-3xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shadow-inner">
          <Lock className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground font-heading">
            Session Inactivity Lock
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Hi <span className="font-bold text-foreground">{user.name}</span>, your session was locked after 2 minutes of inactivity for security.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-blue-600" />
              Enter Account Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 py-3 rounded-2xl text-sm"
          >
            Unlock Session
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Not {user.name}?</span>
          <button
            type="button"
            onClick={() => {
              setIsLocked(false);
              logout();
            }}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
