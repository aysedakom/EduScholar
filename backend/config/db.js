// backend/config/db.js
// PostgreSQL connection pool + automatic database/table initialization.

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'January10';
const DB_NAME = process.env.DB_NAME || 'eduscholar';

// Helper to construct pool configuration
const createPoolConfig = (database) => {
  if (process.env.DATABASE_URL) {
    const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }
  return {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: database || undefined,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
};

// Admin pool (no database selected) - used to create the database if missing
const adminPool = new Pool(createPoolConfig(null));

// Main app pool
const pool = new Pool(createPoolConfig(DB_NAME));

/**
 * Ensure the target database exists.
 * If the DB does not exist, create it.
 */
async function ensureDatabaseExists() {
  try {
    const check = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );
    if (check.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`[db] Created database "${DB_NAME}"`);
    } else {
      console.log(`[db] Database "${DB_NAME}" connected`);
    }
  } catch (err) {
    console.warn(`[db] ensureDatabaseExists warning: ${err.message}`);
  }
}

/**
 * Run schema if tables do not exist
 */
async function ensureTables() {
  try {
    const check = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'`
    );
    if (check.rowCount === 0) {
      console.log('[db] Tables missing, initializing schema...');
      const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schema);
      console.log('[db] Schema initialized');

      const { seed } = require('../db/seed');
      await seed();
    } else {
      // Ensure user_otps table exists on existing installations
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_otps (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          email VARCHAR(200) NOT NULL,
          otp_code VARCHAR(10) NOT NULL,
          otp_purpose VARCHAR(50) DEFAULT 'login' CHECK (otp_purpose IN ('login', 'register', 'reset_password')),
          expires_at TIMESTAMPTZ NOT NULL,
          attempts INTEGER DEFAULT 0,
          consumed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email, otp_purpose, consumed_at);
      `);
    }
  } catch (err) {
    console.warn('[db] ensureTables warning:', err.message);
  }
}

let dbInitialized = false;

async function initDb() {
  try {
    await ensureDatabaseExists();
    await ensureTables();
    dbInitialized = true;
  } catch (err) {
    console.warn('[db] initDb warning:', err.message);
  }
}

const getDb = () => pool;

module.exports = { pool, adminPool, initDb, ensureDatabaseExists, getDb };
