// frontend/src/hooks/useAutoRefresh.ts
import { useEffect, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

interface AutoRefreshOptions {
  tableNames?: string[];
  intervalMs?: number; // Background polling fallback interval (default: 8000ms)
  enableWindowFocus?: boolean;
}

/**
 * Custom hook to automatically refresh page data whenever:
 * 1. A real-time WebSocket DB event occurs on specified table(s)
 * 2. Background interval timer fires (polling fallback for local/online)
 * 3. User switches tabs back to the application
 */
export function useAutoRefresh(
  refreshFn: () => void | Promise<void>,
  options: AutoRefreshOptions = {}
) {
  const { tableNames = [], intervalMs = 8000, enableWindowFocus = true } = options;
  const { subscribeToTable } = useWebSocket();
  const refreshRef = useRef(refreshFn);

  useEffect(() => {
    refreshRef.current = refreshFn;
  }, [refreshFn]);

  // 1. Subscribe to WebSocket real-time table events
  useEffect(() => {
    if (!tableNames.length) return;

    const unsubscribers = tableNames.map((table) =>
      subscribeToTable(table, () => {
        refreshRef.current();
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [tableNames, subscribeToTable]);

  // 2. Fallback periodic polling interval
  useEffect(() => {
    if (intervalMs <= 0) return;

    const interval = setInterval(() => {
      refreshRef.current();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  // 3. Tab visibility / window focus auto-refresh
  useEffect(() => {
    if (!enableWindowFocus) return;

    const handleFocus = () => {
      refreshRef.current();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        refreshRef.current();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [enableWindowFocus]);
}
