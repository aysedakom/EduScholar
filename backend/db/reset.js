// backend/db/reset.js
// Standalone script to completely reset and reseed the PostgreSQL database.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { seed } = require('./seed');

async function resetDatabase() {
  console.log('====================================================');
  console.log('  EDUSCHOLAR DATABASE RESET & RESEED SCRIPT');
  console.log('====================================================');

  try {
    console.log('[reset] Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[reset] Executing schema reset in PostgreSQL...');
    await pool.query(schemaSql);
    console.log('[reset] Schema reset completed.');

    console.log('[reset] Seeding fresh dataset...');
    await seed();

    console.log('====================================================');
    console.log('  ✅ ALL DATABASE TABLES SUCCESSFULLY RESET & SEEDED');
    console.log('====================================================');
  } catch (error) {
    console.error('[reset] ❌ Failed to reset database:', error);
    throw error;
  }
}

module.exports = { resetDatabase };

if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('[reset] Process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[reset] Fatal error:', err);
      process.exit(1);
    });
}
