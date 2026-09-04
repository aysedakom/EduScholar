

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const localUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:January10@localhost:5432/eduscholar';
const railwayUrl = process.env.RAILWAY_DATABASE_URL;

const TABLES_TO_SYNC = [
  'users',
  'student_profiles',
  'applications',
  'portal_settings',
  'departments',
  'system_logs',
];

async function syncDatabases() {
  const mode = process.argv.includes('--push') ? 'push' : 'pull';

  console.log('====================================================');
  console.log(`EduScholar Database Synchronizer (${mode.toUpperCase()} MODE)`);
  console.log('====================================================');

  if (!railwayUrl) {
    console.error('\n RAILWAY_DATABASE_URL is not set in backend/.env!');
    console.log('\nTo connect Railway and Localhost:');
    console.log('1. Go to your Railway dashboard: https://railway.app');
    console.log('2. Click your Postgres database service -> "Connect" tab');
    console.log('3. Copy the "Public Networking" or "DATABASE_URL" connection string');
    console.log('4. Add it to backend/.env like this:');
    console.log('   RAILWAY_DATABASE_URL=postgresql://postgres:password@junction.proxy.rlwy.net:port/railway\n');
    console.log('5. Then run: npm run db:pull (to copy Railway data into Localhost pgAdmin)');
    console.log('====================================================\n');
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
        const { rows } = await sourcePool.query(`SELECT * FROM ${table} ORDER BY id ASC`);
        console.log(`   Found ${rows.length} row(s) in ${sourceName}`);

        if (rows.length === 0) continue;

        let insertedOrUpdated = 0;
        for (const row of rows) {
          const keys = Object.keys(row);
          const columns = keys.join(', ');
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const values = keys.map((k) => row[k]);

          const updateSet = keys
            .filter((k) => k !== 'id')
            .map((k) => `${k} = EXCLUDED.${k}`)
            .join(', ');

          let sql;
          if (keys.includes('id') && updateSet.length > 0) {
            sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updateSet}`;
          } else if (keys.includes('id')) {
            sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;
          } else {
            sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
          }

          await targetPool.query(sql, values);
          insertedOrUpdated++;
        }

        console.log(`   ✅ Synced ${insertedOrUpdated} row(s) to ${targetName}`);

        if (rows.length > 0 && rows[0].id !== undefined) {
          try {
            await targetPool.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) + 1 FROM ${table}), 1), false);`);
          } catch (seqErr) {

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
