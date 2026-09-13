// frontend/src/context/WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface DatabaseEvent {
  type: 'DB_EVENT';
  channel: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  record: any;
  timestamp: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  lastEvent: DatabaseEvent | null;
  subscribeToTable: (tableName: string, callback: (event: DatabaseEvent) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<DatabaseEvent | null>(null);
  const subscribersRef = useRef<Map<string, Set<(event: DatabaseEvent) => void>>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname === 'localhost' ? 'localhost:5000' : window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[WebSocket] Real-time event stream active');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'DB_EVENT') {
            const dbEvent = payload as DatabaseEvent;
            setLastEvent(dbEvent);

            // Notify specific table subscribers (e.g. ApplicationProgressTracker, Header notifications)
            const tableSubs = subscribersRef.current.get(dbEvent.table);
            if (tableSubs) {
              tableSubs.forEach((cb) => cb(dbEvent));
            }

            // Trigger custom event so header notification bell badge updates in real time
            window.dispatchEvent(new Event('qc_new_notification'));

            // Strict once-only toast deduplication & 15-second freshness filter
            if (dbEvent.table === 'notifications') {
              const notif = dbEvent.record || {};
              const notifId = notif.id || `${notif.title}_${notif.created_at || dbEvent.timestamp}`;
              const toastKey = `qc_toast_shown_${notifId}`;
              
              // Calculate event age
              const eventTime = notif.created_at || dbEvent.timestamp;
              const ageMs = eventTime ? Date.now() - new Date(eventTime).getTime() : 999999;
              const isFresh = ageMs >= 0 && ageMs < 15000; // Fresh within 15 seconds

              let alreadyShown = false;
              try {
                if (localStorage.getItem(toastKey)) {
                  alreadyShown = true;
                }
              } catch (_) {}

              // Only pop up toast ONCE for fresh notifications created in real time right now
              if (isFresh && !alreadyShown) {
                try {
                  localStorage.setItem(toastKey, 'true');
                } catch (_) {}

                if (notif.type === 'success') {
                  toast.success(notif.title || 'Portal Notice', {
                    description: notif.message,
                    duration: 6000,
                  });
                } else if (notif.type === 'error') {
                  toast.error(notif.title || 'Portal Alert', {
                    description: notif.message,
                    duration: 6000,
                  });
                } else {
                  toast.info(notif.title || 'Portal Notice', {
                    description: notif.message,
                    duration: 5000,
                  });
                }
              }
            } else if (dbEvent.table === 'school_aid_distributions' && dbEvent.action === 'INSERT') {
              const distKey = `qc_dist_toast_${dbEvent.record?.id || Date.now()}`;
              if (!localStorage.getItem(distKey)) {
                try { localStorage.setItem(distKey, 'true'); } catch (_) {}
                toast.success(`Disbursement Update: Batch ${dbEvent.record.batch_code} is now ${dbEvent.record.status}`);
              }
            }
          }
        } catch (e) {
          // ignore parsing errors for non-json
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Automatic reconnection attempt after 4 seconds
        setTimeout(connect, 4000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      // Local development offline fallback
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribeToTable = useCallback((tableName: string, callback: (event: DatabaseEvent) => void) => {
    if (!subscribersRef.current.has(tableName)) {
      subscribersRef.current.set(tableName, new Set());
    }
    subscribersRef.current.get(tableName)!.add(callback);

    return () => {
      const subs = subscribersRef.current.get(tableName);
      if (subs) {
        subs.delete(callback);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastEvent, subscribeToTable }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
