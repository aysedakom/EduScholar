import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define timeouts (in milliseconds)
const ADMIN_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes for QCYDO Admin, Treasury, Supervisors, School Coordinators
const STUDENT_TIMEOUT_MS = 45 * 60 * 1000; // 45 minutes for Students

export const SessionTimeoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    if (isAuthenticated) {
      logout();
      toast.error('Session Expired', {
        description: 'You have been automatically logged out due to inactivity for security purposes.',
        duration: 8000,
      });
      navigate('/login?view=credentials');
    }
  }, [isAuthenticated, logout, navigate]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticated && role) {
      // Determine timeout duration based on role
      const timeoutDuration = ['admin', 'treasury', 'supervisor', 'school_coordinator'].includes(role)
        ? ADMIN_TIMEOUT_MS
        : STUDENT_TIMEOUT_MS;

      timeoutRef.current = setTimeout(handleLogout, timeoutDuration);
    }
  }, [isAuthenticated, role, handleLogout]);

  useEffect(() => {
    // Only attach listeners if the user is authenticated
    if (!isAuthenticated) return;

    // Initialize the timeout
    resetTimeout();

    // Events to track user activity
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleActivity = () => {
      // Throttle resets to avoid excessive function calls (every 2 seconds max)
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        resetTimeout();
        throttleTimer = null;
      }, 2000);
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [isAuthenticated, resetTimeout]);

  return <>{children}</>;
};
