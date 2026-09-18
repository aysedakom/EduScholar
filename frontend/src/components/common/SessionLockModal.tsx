import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldAlert, LogOut, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth';
import { Button } from '../ui/Button';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 Minutes (300,000 ms)

export const SessionLockModal: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Persistent session lock: check both explicit lock flag and last active timestamp across refreshes
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (localStorage.getItem('eduscholar_session_locked') === 'true') return true;
    const lastActive = Number(localStorage.getItem('eduscholar_last_active') || 0);
    if (lastActive > 0 && Date.now() - lastActive >= INACTIVITY_TIMEOUT_MS) {
      localStorage.setItem('eduscholar_session_locked', 'true');
      return true;
    }
    return false;
  });

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    // If already locked in storage, maintain lock
    if (localStorage.getItem('eduscholar_session_locked') === 'true') {
      if (!isLocked) setIsLocked(true);
      return;
    }
    if (isLocked) return;

    // Track active timestamp in localStorage
    localStorage.setItem('eduscholar_last_active', Date.now().toString());

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (user) {
        localStorage.setItem('eduscholar_session_locked', 'true');
        setIsLocked(true);
        toast.warning('Session locked due to 5 minutes of inactivity.', { duration: 6000 });
      }
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    if (!user) {
      setIsLocked(false);
      localStorage.removeItem('eduscholar_session_locked');
      localStorage.removeItem('eduscholar_last_active');
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // If already locked from storage, do not listen to background activities
    if (isLocked || localStorage.getItem('eduscholar_session_locked') === 'true') {
      if (!isLocked) setIsLocked(true);
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

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password to unlock your session.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      // Validate credentials against backend authentication
      await authApi.login(user.email, password);

      // Successfully unlocked
      localStorage.removeItem('eduscholar_session_locked');
      localStorage.setItem('eduscholar_last_active', Date.now().toString());
      setIsLocked(false);
      setPassword('');
      setError('');
      toast.success('Session unlocked successfully! Welcome back.');
      resetTimer();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Incorrect password. Please verify and try again.';
      setError(msg);
      if (err?.response?.status === 423 || err?.response?.data?.isLocked) {
        toast.error('Account Temporarily Locked', {
          description: '3 failed attempts reached. Logging out for security...',
        });
        setTimeout(() => {
          localStorage.removeItem('eduscholar_session_locked');
          logout();
        }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
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
            Hi <span className="font-bold text-foreground">{user.name}</span>, your session was locked after 5 minutes of inactivity for security.
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
              localStorage.removeItem('eduscholar_session_locked');
              localStorage.removeItem('eduscholar_last_active');
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
