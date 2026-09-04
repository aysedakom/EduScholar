/**
 * backend/scripts/syncDb.js
 * 
 * Synchronizes data between Railway cloud PostgreSQL and Localhost PostgreSQL.
 * 
 * Usage:
 *   node scripts/syncDb.js --pull    (Fetch latest records from Railway -> Localhost)
 *   node scripts/syncDb.js --push    (Send local records from Localhost -> Railway)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
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

async function syncDatabases() {
  const mode = process.argv.includes('--push') ? 'push' : 'pull';

  console.log('====================================================');
  console.log(`EduScholar Database Synchronizer (${mode.toUpperCase()} MODE)`);
  console.log('====================================================');

  if (!railwayUrl) {
    console.error('\n⚠️  RAILWAY_DATABASE_URL is not set in backend/.env!');
    console.log('Add it to backend/.env like this:');
    console.log('   RAILWAY_DATABASE_URL=postgresql://postgres:password@junction.proxy.rlwy.net:port/railway\n');
    process.exit(1);
  }

  const sourceUrl = mode === 'pull' ? railwayUrl : localUrl;
  const targetUrl = mode === 'pull' ? localUrl : railwayUrl;
  const sourceName = mode === 'pull' ? 'Railway Cloud' : 'Localhost';
  const targetName = mode === 'pull' ? 'Localhost' : 'Railway Cloud';

  console.log(`📡 Connecting to Source: ${sourceName}...`);
  const sourcePool = new Pool({ connectionString: sourceUrl, ssl: sourceUrl.includes('railway') ? { rejectUnauthorized: false } : false });

  console.log(`🎯 Connecting to Target: ${targetName}...`);
  const targetPool = new Pool({ connectionString: targetUrl, ssl: targetUrl.includes('railway') ? { rejectUnauthorized: false } : false });

  try {
    await sourcePool.query('SELECT 1');
    console.log(`✅ Connected to ${sourceName}`);
    await targetPool.query('SELECT 1');
    console.log(`✅ Connected to ${targetName}`);

    for (const table of TABLES_TO_SYNC) {
      try {
        console.log(`\n⏳ Syncing table: "${table}"...`);
        // Check if table exists in source
        const checkSource = await sourcePool.query(`SELECT to_regclass('${table}')`);
        if (!checkSource.rows[0]?.to_regclass) {
          console.log(`   ⏩ Table "${table}" does not exist in ${sourceName}, skipping.`);
          continue;
        }

        // Check if table exists in target
        const checkTarget = await targetPool.query(`SELECT to_regclass('${table}')`);
        if (!checkTarget.rows[0]?.to_regclass) {
          console.log(`   ⏩ Table "${table}" does not exist in ${targetName}, skipping.`);
          continue;
        }

        const { rows } = await sourcePool.query(`SELECT * FROM ${table} ORDER BY id ASC`);
        console.log(`   Found ${rows.length} row(s) in ${sourceName}`);

        if (rows.length === 0) continue;

        let insertedOrUpdated = 0;
        for (const row of rows) {
          const keys = Object.keys(row);
          const columns = keys.join(', ');
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

          // Properly serialize objects / arrays for PostgreSQL JSONB
          const values = keys.map((k) => {
            const val = row[k];
            if (val !== null && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
              return JSON.stringify(val);
            }
            return val;
          });

          // Determine conflict target
          let conflictCol = 'id';
          if (table === 'users' && keys.includes('email')) {
            conflictCol = 'email';
          } else if (table === 'portal_settings' && keys.includes('id')) {
            conflictCol = 'id';
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
          insertedOrUpdated++;
        }

        console.log(`   ✅ Synced ${insertedOrUpdated} row(s) to ${targetName}`);

        // Update serial sequence
        if (rows.length > 0 && rows[0].id !== undefined) {
          try {
            await targetPool.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) + 1 FROM ${table}), 1), false);`);
          } catch (seqErr) {
            // non-fatal
          }
        }
      } catch (tableErr) {
        console.warn(`   ⚠️ Could not sync table "${table}": ${tableErr.message}`);
      }
    }

    console.log('\n====================================================');
    console.log(`🎉 Sync complete! All data successfully transferred from ${sourceName} to ${targetName}.`);
    console.log('====================================================\n');
  } catch (err) {
    console.error(`\n❌ Synchronization failed: ${err.message}`);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

syncDatabases();
