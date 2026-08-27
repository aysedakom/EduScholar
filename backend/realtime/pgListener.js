// backend/realtime/pgListener.js
const { Client } = require('pg');
const { broadcast } = require('./socketServer');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'January10';
const DB_NAME = process.env.DB_NAME || 'eduscholar';

let listenerClient = null;

/**
 * Initialize dedicated PostgreSQL LISTEN client
 */
async function initPgListener() {
  try {
    const config = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USER,
          password: DB_PASSWORD,
          database: DB_NAME,
        };

    listenerClient = new Client(config);
    await listenerClient.connect();

    console.log('[pgListener] Connected to PostgreSQL. Subscribing to NOTIFY channel "eduscholar_events"...');

    // Subscribe to the channel
    await listenerClient.query('LISTEN eduscholar_events');

    // Handle incoming NOTIFY events from database triggers
    listenerClient.on('notification', (msg) => {
      try {
        const payload = JSON.parse(msg.payload);
        console.log(`[pgListener] Database Event [${payload.table}:${payload.action}] received -> Broadcasting to WebSockets`);
        
        broadcast({
          type: 'DB_EVENT',
          channel: msg.channel,
          table: payload.table,
          action: payload.action,
          record: payload.record,
          timestamp: payload.timestamp || new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[pgListener] Error parsing notification payload:', err.message);
      }
    });

    listenerClient.on('error', (err) => {
      console.error('[pgListener] Connection error:', err.message);
      // Attempt reconnection after 5 seconds
      setTimeout(initPgListener, 5000);
    });

  } catch (err) {
    console.warn('[pgListener] Failed to initialize LISTEN client:', err.message);
    setTimeout(initPgListener, 5000);
  }
}

module.exports = {
  initPgListener,
};
