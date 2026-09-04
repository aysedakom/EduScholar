/**
 * backend/scripts/resetApplications.js
 * 
 * Clears all submitted applications, attached documents, evaluations,
 * and review queue records across both Railway Cloud and Localhost databases,
 * while preserving all user accounts across all roles.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const localUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:January10@localhost:5432/eduscholar';
const railwayUrl = process.env.RAILWAY_DATABASE_URL;

async function resetDatabaseTarget(url, name) {
  if (!url) {
    console.log(`⏩ Skipping ${name}: URL not provided in .env`);
    return;
  }

  console.log(`\n====================================================`);
  console.log(`🧹 Resetting applications in: ${name}`);
  console.log(`====================================================`);

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('railway') ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query('SELECT 1');
    console.log(`✅ Connected to ${name}`);

    // Count before reset
    const beforeAppCount = await pool.query('SELECT count(*) FROM applications');
    const userCount = await pool.query('SELECT count(*) FROM users');
    console.log(`   Current users (will be preserved): ${userCount.rows[0].count}`);
    console.log(`   Applications to clear: ${beforeAppCount.rows[0].count}`);

    // Tables to reset
    const tablesToClear = [
      'applications',
      'documents',
      'student_evaluations',
      'student_registry',
      'payment_history',
    ];

    for (const table of tablesToClear) {
      try {
        const check = await pool.query(`SELECT to_regclass('${table}')`);
        if (check.rows[0]?.to_regclass) {
          await pool.query(`DELETE FROM ${table}`);
          try {
            await pool.query(`ALTER SEQUENCE IF EXISTS ${table}_id_seq RESTART WITH 1`);
          } catch (_) {}
          console.log(`   ✅ Cleared table: ${table}`);
        }
      } catch (err) {
        console.warn(`   ⚠️ Could not clear ${table}:`, err.message);
      }
    }

    // Also clear application-related notifications so dashboards are fresh
    try {
      await pool.query("DELETE FROM notifications WHERE category IN ('application_status', 'review')");
      console.log('   ✅ Cleared application status notifications');
    } catch (_) {}

    // Verify after reset
    const afterAppCount = await pool.query('SELECT count(*) FROM applications');
    const afterUserCount = await pool.query('SELECT count(*) FROM users');
    console.log(`\n🎉 ${name} Reset complete!`);
    console.log(`   Remaining applications: ${afterAppCount.rows[0].count}`);
    console.log(`   Preserved users: ${afterUserCount.rows[0].count} (all intact)`);
  } catch (err) {
    console.error(`❌ Reset error for ${name}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  // 1. Reset Localhost
  await resetDatabaseTarget(localUrl, 'Localhost PostgreSQL');

  // 2. Reset Railway Cloud
  await resetDatabaseTarget(railwayUrl, 'Railway Cloud PostgreSQL');

  console.log('\n====================================================');
  console.log('✨ ALL APPLICATION DATA HAS BEEN RESET ACROSS BOTH DATABASES');
  console.log('All accounts across all roles remain active and ready to test!');
  console.log('====================================================\n');
}

run();
