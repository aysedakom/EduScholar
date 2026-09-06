/**
 * backend/scripts/setToPending.js
 * Updates student_registry records to 'Scheduled' (Pending Treasury Review)
 * so the Treasury Disbursing Officer can test authorization manually.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const localUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:January10@localhost:5432/eduscholar';
const railwayUrl = process.env.RAILWAY_DATABASE_URL;

async function setTargetToPending(url, name) {
  if (!url) {
    console.log(`⏩ Skipping ${name}: URL not provided`);
    return;
  }

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('railway') ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query('SELECT 1');
    console.log(`✅ Connected to ${name}`);

    // Update student_registry records to 'Scheduled'
    const regRes = await pool.query(
      `UPDATE student_registry SET disbursement_status = 'Scheduled' RETURNING student_id, full_name, disbursement_status`
    );
    console.log(`   Updated ${regRes.rowCount} scholar records in student_registry to 'Scheduled' (Pending Review):`);
    regRes.rows.forEach((r) => {
      console.log(`   - ${r.full_name} (${r.student_id}): ${r.disbursement_status}`);
    });

    // Update applications to 'Approved'
    const appRes = await pool.query(
      `UPDATE applications SET status = 'Approved', progress = 80 WHERE LOWER(status) IN ('approved', 'disbursed', 'paid') RETURNING id, program_name, status`
    );
    console.log(`   Updated ${appRes.rowCount} application records to 'Approved'`);
  } catch (err) {
    console.error(`❌ Error updating ${name}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  await setTargetToPending(localUrl, 'Localhost PostgreSQL');
  await setTargetToPending(railwayUrl, 'Railway Cloud PostgreSQL');
  console.log('\n🎉 ALL APPLICANTS SET TO PENDING TREASURY REVIEW QUEUE!');
}

run();
