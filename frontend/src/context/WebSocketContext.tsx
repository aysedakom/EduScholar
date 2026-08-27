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

            // Real-time user toast feedback for key events
            if (dbEvent.table === 'applications') {
              if (dbEvent.action === 'INSERT') {
                toast.info(`New Application Filed: ${dbEvent.record.application_code || dbEvent.record.program_name}`);
              } else if (dbEvent.action === 'UPDATE') {
                toast.success(`Application Updated: ${dbEvent.record.application_code || ''} [Status: ${dbEvent.record.status}]`);
              }
            } else if (dbEvent.table === 'notifications') {
              toast.info(`Portal Notice: ${dbEvent.record.title || 'New update available'}`);
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
