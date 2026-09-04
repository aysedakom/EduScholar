/**
 * backend/services/autoSyncService.js
 * 
 * Continuous Bidirectional Auto-Sync Engine between Railway Cloud PostgreSQL and Localhost PostgreSQL.
 * 
 * Features:
 * - Automatically pulls new records from Railway into Localhost.
 * - Automatically pushes new records from Localhost into Railway.
 * - Handles JSONB serialization properly.
 * - Non-blocking background worker with automatic error recovery and network drop tolerance.
 * - Exposes triggerSyncNow() for immediate event-driven replication after user/application creation.
 */

const { Pool } = require('pg');

const localUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:January10@localhost:5432/eduscholar';
const railwayUrl = process.env.RAILWAY_DATABASE_URL;

const TABLES_TO_SYNC = [
  'users',
  'applications',
  'documents',
  'portal_settings',
  'partner_schools',
  'scholarships',
  'bursaries',
  'opportunities',
  'system_logs',
];

let syncInterval = null;
let isSyncRunning = false;
let syncStats = {
  lastSyncTime: null,
  lastStatus: 'idle',
  totalPushed: 0,
  totalPulled: 0,
  consecutiveFailures: 0,
};

let localPool = null;
let railwayPool = null;

function getPools() {
  if (!railwayUrl) return null;
  if (!localPool) {
    localPool = new Pool({
      connectionString: localUrl,
      ssl: localUrl.includes('railway') ? { rejectUnauthorized: false } : false,
      max: 5,
    });
    localPool.on('error', (err) => console.warn('[AutoSync] Local pool warning:', err.message));
  }
  if (!railwayPool) {
    railwayPool = new Pool({
      connectionString: railwayUrl,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
    railwayPool.on('error', (err) => console.warn('[AutoSync] Railway pool warning:', err.message));
  }
  return { localPool, railwayPool };
}

/**
 * Replicate a single table in a given direction (source -> target)
 */
async function syncTableDirection(sourcePool, targetPool, table, direction) {
  try {
    // Verify existence on both
    const checkSource = await sourcePool.query(`SELECT to_regclass('${table}')`);
    if (!checkSource.rows[0]?.to_regclass) return 0;
    const checkTarget = await targetPool.query(`SELECT to_regclass('${table}')`);
    if (!checkTarget.rows[0]?.to_regclass) return 0;

    // Pull rows from source
    const { rows } = await sourcePool.query(`SELECT * FROM ${table} ORDER BY id ASC`);
    if (!rows || rows.length === 0) return 0;

    let syncedCount = 0;
    for (const row of rows) {
      const keys = Object.keys(row);
      const columns = keys.join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const values = keys.map((k) => {
        const val = row[k];
        if (val !== null && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
          return JSON.stringify(val);
        }
        return val;
      });

      let conflictCol = 'id';
      if (table === 'users' && keys.includes('email')) {
        conflictCol = 'email';
      } else if (table === 'partner_schools' && keys.includes('school_id')) {
        conflictCol = 'school_id';
      }

      const updateSet = keys
        .filter((k) => k !== conflictCol && k !== 'id')
        .map((k) => `${k} = EXCLUDED.${k}`)
        .join(', ');

      let sql;
      if (keys.includes(conflictCol) && updateSet.length > 0) {
        sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT (${conflictCol}) DO UPDATE SET ${updateSet}`;
      } else if (keys.includes(conflictCol)) {
        sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT (${conflictCol}) DO NOTHING`;
      } else {
        sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
      }

      await targetPool.query(sql, values);
      syncedCount++;
    }

    // Refresh sequence if numeric id
    if (rows.length > 0 && rows[0].id !== undefined) {
      try {
        await targetPool.query(
          `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) + 1 FROM ${table}), 1), false);`
        );
      } catch (e) {
        // non-fatal
      }
    }

    return syncedCount;
  } catch (err) {
    console.warn(`[AutoSync] Table ${table} (${direction}) skipped:`, err.message);
    return 0;
  }
}

/**
 * Executes a full synchronization cycle:
 * 1. Railway -> Localhost (Pull latest cloud updates)
 * 2. Localhost -> Railway (Push any local/offline changes)
 */
async function executeSyncCycle() {
  if (isSyncRunning) return;
  const pools = getPools();
  if (!pools) return;

  isSyncRunning = true;
  syncStats.lastStatus = 'syncing';

  try {
    // 1. Health check connections
    await pools.localPool.query('SELECT 1');
    await pools.railwayPool.query('SELECT 1');

    let pulledCount = 0;
    let pushedCount = 0;

    // Step 1: Railway -> Localhost
    for (const table of TABLES_TO_SYNC) {
      pulledCount += await syncTableDirection(pools.railwayPool, pools.localPool, table, 'pull');
    }

    // Step 2: Localhost -> Railway
    for (const table of TABLES_TO_SYNC) {
      pushedCount += await syncTableDirection(pools.localPool, pools.railwayPool, table, 'push');
    }

    syncStats.lastSyncTime = new Date().toISOString();
    syncStats.lastStatus = 'active';
    syncStats.totalPulled += pulledCount;
    syncStats.totalPushed += pushedCount;
    syncStats.consecutiveFailures = 0;
  } catch (err) {
    syncStats.consecutiveFailures++;
    syncStats.lastStatus = `network_unreachable: ${err.message}`;
    // Quiet warning on network drop - will retry on next cycle
    if (syncStats.consecutiveFailures <= 2) {
      console.warn('[AutoSync] Cloud connection paused (network disconnected or unreachable). Will auto-resume on reconnection.');
    }
  } finally {
    isSyncRunning = false;
  }
}

/**
 * Start the background continuous synchronization daemon
 */
function startAutoSync(intervalSeconds = 12) {
  if (!railwayUrl) {
    console.log('[AutoSync] RAILWAY_DATABASE_URL not detected in .env. Auto-sync daemon idle.');
    return;
  }

  if (syncInterval) {
    clearInterval(syncInterval);
  }

  console.log(`[AutoSync] 🚀 Auto-sync background daemon started (polling every ${intervalSeconds}s)...`);
  
  // Initial sync on startup
  setTimeout(() => {
    executeSyncCycle().catch(() => {});
  }, 2000);

  // Periodic replication loop
  syncInterval = setInterval(() => {
    executeSyncCycle().catch(() => {});
  }, intervalSeconds * 1000);
}

/**
 * Trigger an immediate replication cycle (e.g. after user signs up or applies)
 */
async function triggerSyncNow() {
  if (!railwayUrl) return;
  // Trigger asynchronously without blocking the request response
  setImmediate(() => {
    executeSyncCycle().catch((err) => {
      console.warn('[AutoSync] Triggered sync notice:', err.message);
    });
  });
}

/**
 * Return live sync health metrics
 */
function getSyncStatus() {
  return {
    daemonActive: Boolean(syncInterval),
    configured: Boolean(railwayUrl),
    ...syncStats,
  };
}

module.exports = {
  startAutoSync,
  triggerSyncNow,
  getSyncStatus,
  executeSyncCycle,
};
