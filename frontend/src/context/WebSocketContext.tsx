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

            // Notify specific table subscribers
            const tableSubs = subscribersRef.current.get(dbEvent.table);
            if (tableSubs) {
              tableSubs.forEach((cb) => cb(dbEvent));
            }

            // Trigger custom event so header notification bell badge updates in real time
            window.dispatchEvent(new Event('qc_new_notification'));

            // Real-time user popout toast feedback for key application & notification events
            if (dbEvent.table === 'applications') {
              const rec = dbEvent.record || {};
              const appCode = rec.application_code || rec.reference_id || 'QCSP-APP';
              const progName = rec.program_name || rec.title || 'Scholarship Program';

              if (dbEvent.action === 'INSERT') {
                toast.success('Scholarship Application Submitted', {
                  description: `Application for ${progName} (${appCode}) has been registered and is under verification.`,
                  duration: 8000,
                });
              } else if (dbEvent.action === 'UPDATE') {
                const rawStatus = String(rec.status || '').toLowerCase();
                if (rawStatus === 'approved' || rawStatus === 'granted') {
                  toast.success('🎉 Application Approved!', {
                    description: `Congratulations! Your application for ${progName} has passed and been approved. Proceed to your Document Vault for your Official Award Certificate.`,
                    duration: 10000,
                  });
                } else if (rawStatus === 'rejected' || rawStatus === 'disapproved' || rawStatus === 'denied') {
                  toast.error('Application Status Update', {
                    description: `Your application for ${progName} was not approved. Remarks: ${rec.remarks || rec.notes || 'Documentary requirements or qualification criteria not met.'}`,
                    duration: 10000,
                  });
                } else {
                  toast.info(`Application Status: ${rec.status}`, {
                    description: `Application (${appCode}) is now ${rec.status}.`,
                    duration: 6000,
                  });
                }
              }
            } else if (dbEvent.table === 'notifications') {
              const notif = dbEvent.record || {};
              if (notif.type === 'success') {
                toast.success(notif.title || 'Portal Notice', {
                  description: notif.message,
                  duration: 8000,
                });
              } else if (notif.type === 'error') {
                toast.error(notif.title || 'Portal Alert', {
                  description: notif.message,
                  duration: 8000,
                });
              } else {
                toast.info(notif.title || 'Portal Notice', {
                  description: notif.message,
                  duration: 7000,
                });
              }
            } else if (dbEvent.table === 'school_aid_distributions') {
              toast.success(`Disbursement Update: Batch ${dbEvent.record.batch_code} is now ${dbEvent.record.status}`);
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
