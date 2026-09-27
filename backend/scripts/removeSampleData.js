/**
 * backend/scripts/removeSampleData.js
 * 
 * Removes the newly added sample student accounts while keeping all real data intact.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const localUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:January10@localhost:5432/eduscholar';
const railwayUrl = process.env.RAILWAY_DATABASE_URL;

const sampleEmails = [
  'maria.santos@gmail.com',
  'mark.cruz@gmail.com',
  'beatrice.reyes@gmail.com',
  'christian.alcantara@gmail.com',
  'sofia.mendoza@gmail.com',
  'gabriel.torres@gmail.com',
  'erika.dizon@gmail.com'
];

async function cleanTarget(url, name) {
  if (!url) return;
  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('railway') ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query('SELECT 1');
    console.log(`🧹 Cleaning sample data from ${name}...`);

    for (const email of sampleEmails) {
      await pool.query(`DELETE FROM student_registry WHERE email = $1`, [email]);
      await pool.query(`DELETE FROM documents WHERE user_id IN (SELECT id FROM users WHERE email = $1)`, [email]);
      await pool.query(`DELETE FROM applications WHERE user_id IN (SELECT id FROM users WHERE email = $1)`, [email]);
      await pool.query(`DELETE FROM users WHERE email = $1`, [email]);
    }
    console.log(`✅ Removed sample data from ${name}`);
  } catch (err) {
    console.error(`❌ Cleanup error on ${name}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  await cleanTarget(localUrl, 'Localhost PostgreSQL');
  await cleanTarget(railwayUrl, 'Railway Cloud PostgreSQL');
  console.log('✨ Cleanup finished.');
}

run();
