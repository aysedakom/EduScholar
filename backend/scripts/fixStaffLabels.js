/**
 * backend/scripts/fixStaffLabels.js
 * 
 * Fixes any chat messages in the database where sender_name was incorrectly set to 'Staff'
 * by updating them with the user's actual registered full name from the users table.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const localUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:January10@localhost:5432/eduscholar';
const railwayUrl = process.env.RAILWAY_DATABASE_URL;

async function fixTarget(url, dbName) {
  if (!url) return;
  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('railway') ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query('SELECT 1');
    console.log(`🛠️ Fixing chat message sender names in: ${dbName}...`);

    // 1. Update chat_messages from users table by matching sender_id
    const res1 = await pool.query(`
      UPDATE chat_messages 
      SET sender_name = users.name 
      FROM users 
      WHERE chat_messages.sender_id = users.id 
        AND (chat_messages.sender_name = 'Staff' OR chat_messages.sender_name IS NULL OR chat_messages.sender_name = '')
    `);

    // 2. Fix live_chat_messages as well if sender_id exists
    const res2 = await pool.query(`
      UPDATE live_chat_messages 
      SET sender_name = users.name 
      FROM users 
      WHERE live_chat_messages.sender_id = users.id 
        AND (live_chat_messages.sender_name = 'Staff' OR live_chat_messages.sender_name IS NULL OR live_chat_messages.sender_name = '')
    `);

    console.log(`✅ ${dbName}: Updated ${res1.rowCount} chat_messages and ${res2.rowCount} live_chat_messages with accurate user full names.`);

  } catch (err) {
    console.error(`❌ Error updating ${dbName}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  await fixTarget(localUrl, 'Localhost PostgreSQL');
  await fixTarget(railwayUrl, 'Railway Cloud PostgreSQL');
  console.log('✨ Fix completed.');
}

run();
