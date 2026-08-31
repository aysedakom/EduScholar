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
  if (process.env.DATABASE_URL) {
    console.log('[db] Using cloud DATABASE_URL, skipping CREATE DATABASE check');
    return;
  }
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
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_data TEXT;

        -- 1. Support Tickets Table
        CREATE TABLE IF NOT EXISTS support_tickets (
          id SERIAL PRIMARY KEY,
          ticket_code VARCHAR(50) UNIQUE NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          applicant_name VARCHAR(150),
          applicant_email VARCHAR(200),
          subject VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL DEFAULT 'General Inquiry',
          priority VARCHAR(30) DEFAULT 'Medium',
          status VARCHAR(30) DEFAULT 'Open',
          description TEXT NOT NULL,
          conversation_id VARCHAR(100),
          admin_notes TEXT,
          resolution_remarks TEXT,
          closed_at TIMESTAMPTZ,
          closed_by INTEGER REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id, status);
        CREATE INDEX IF NOT EXISTS idx_support_tickets_code ON support_tickets(ticket_code);

        -- 2. Chat Messages Table
        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          conversation_id VARCHAR(100) NOT NULL,
          sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          sender_name VARCHAR(150),
          sender_role VARCHAR(50) DEFAULT 'student',
          recipient_id INTEGER,
          recipient_role VARCHAR(50),
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at);

        -- 3. Announcements Table
        CREATE TABLE IF NOT EXISTS announcements (
          id SERIAL PRIMARY KEY,
          announcement_code VARCHAR(50) UNIQUE,
          title VARCHAR(255) NOT NULL,
          target_group VARCHAR(100) DEFAULT 'All Students',
          message TEXT NOT NULL,
          priority VARCHAR(30) DEFAULT 'normal',
          sent_by VARCHAR(150),
          created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          status VARCHAR(30) DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status, created_at);

        -- 4. Portal Settings Table
        CREATE TABLE IF NOT EXISTS portal_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Seed default portal settings if not present
        INSERT INTO portal_settings (setting_key, setting_value)
        VALUES ('application_portal', '{"isOpen": true, "academicYear": "AY 2026-2027", "term": "1st Semester", "openingDate": "2026-08-01", "closingDate": "2026-09-30", "closedMessage": "The Quezon City Scholarship Application Portal is currently closed for new submissions. Evaluators are processing active candidate queues.", "nextCycleOpening": "October 15, 2026"}'::jsonb)
        ON CONFLICT (setting_key) DO NOTHING;
      `);

      // Ensure primary official accounts (Admin, Treasury, School Coordinator, Supervisor) have January10 password in cloud/local DB
      const bcrypt = require('bcryptjs');
      const defaultPassHash = await bcrypt.hash('January10', 10);
      
      const seedUsers = [
        {
          name: 'ADMIN',
          email: 'support.edu2026@gmail.com',
          role: 'admin',
          dept: 'Quezon City Youth Development Office (QCYDO)',
          major: 'Scholarship Head Administrator',
        },
        {
          name: 'City Treasury Disbursing Officer',
          email: 'treasury.edu2026@gmail.com',
          role: 'treasury',
          dept: 'Quezon City Hall Treasury Office',
          major: 'Disbursement & Fund Settlement',
        },
        {
          name: 'School Coordinator',
          email: 'sr.edu2026@gmail.com',
          role: 'school_coordinator',
          dept: 'Quezon City University & Partner Schools',
          major: 'University Registrar & Endorsement',
        },
        {
          name: 'Scholarship Program Supervisor',
          email: 'sv.edu2026@gmail.com',
          role: 'supervisor',
          dept: 'Quezon City Youth Development Office (QCYDO)',
          major: 'Evaluation Executive Reviewer',
        },
      ];

      for (const u of seedUsers) {
        await pool.query(`
          INSERT INTO users (name, email, password, role, department, major, financial_aid_year, status, is_email_verified)
          VALUES ($1, $2, $3, $4, $5, $6, '2026-2027', 'active', true)
          ON CONFLICT (email) DO UPDATE SET password = $3, role = $4, is_email_verified = true, status = 'active'
        `, [u.name, u.email, defaultPassHash, u.role, u.dept, u.major]);
      }
      console.log('[db] Primary system accounts (Admin, Treasury, Coordinator, Supervisor) synchronized with password "January10"');
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
