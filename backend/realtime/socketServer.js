// backend/realtime/socketServer.js
const { WebSocketServer, WebSocket } = require('ws');

let wss = null;

/**
 * Initialize WebSocket Server attached to existing HTTP server
 */
function initSocketServer(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    console.log(`[WebSocket] Client connected from ${req.socket.remoteAddress}`);

    // Send initial welcome message
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'EduScholar Real-time Event Stream Connected',
      timestamp: new Date().toISOString(),
    }));

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch (err) {
        // ignore non-json messages
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
    });

    ws.on('error', (err) => {
      console.warn('[WebSocket] Client error:', err.message);
    });
  });

  // Heartbeat ping interval every 30 seconds to keep connections alive
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('[WebSocket] Server listening on path /ws');
  return wss;
}

/**
 * Broadcast an event payload to all connected clients
 */
function broadcast(eventPayload) {
  if (!wss) return;
  const data = typeof eventPayload === 'string' ? eventPayload : JSON.stringify(eventPayload);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch (e) {
        console.error('[WebSocket] Broadcast error:', e.message);
      }
    }
  });
}

module.exports = {
  initSocketServer,
  broadcast,
};
