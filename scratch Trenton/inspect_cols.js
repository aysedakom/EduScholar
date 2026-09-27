const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function inspectCols(connStr, label) {
  const pool = new Pool({ 
    connectionString: connStr, 
    ssl: connStr.includes('neon.tech') ? { rejectUnauthorized: false } : false 
  });
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log(label, 'users columns:', res.rows.map(r => r.column_name));
  } catch (err) {
    console.error(label, 'Error:', err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  await inspectCols('postgresql://postgres:January10@localhost:5432/eduscholar', 'Local DB');
}
run();
