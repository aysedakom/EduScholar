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
        ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS district VARCHAR(100);
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS barangay VARCHAR(100);
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS address TEXT;
        ALTER TABLE student_registry ADD COLUMN IF NOT EXISTS district VARCHAR(100);

        -- Drop restrictive CHECK constraints on status/disbursement_status to allow Treasury payout authorization statuses
        ALTER TABLE student_registry DROP CONSTRAINT IF EXISTS student_registry_disbursement_status_check;
        ALTER TABLE student_registry DROP CONSTRAINT IF EXISTS student_registry_status_check;
        ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;

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

        -- 5. Treasury Fund Pools Table
        CREATE TABLE IF NOT EXISTS treasury_fund_pools (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          funder_agency VARCHAR(255),
          funder_type VARCHAR(150),
          revenue_source VARCHAR(255),
          total_budget NUMERIC(14,2) DEFAULT 0,
          disbursed_amount NUMERIC(14,2) DEFAULT 0,
          committed_amount NUMERIC(14,2) DEFAULT 0,
          fiscal_year VARCHAR(50) DEFAULT 'FY 2026-2027',
          status VARCHAR(50) DEFAULT 'Active',
          contact_person VARCHAR(150),
          tranches_released INTEGER DEFAULT 0,
          last_drawdown_date DATE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- 6. Treasury Drawdown Requests Table
        CREATE TABLE IF NOT EXISTS treasury_drawdown_requests (
          id VARCHAR(50) PRIMARY KEY,
          fund_id VARCHAR(50) REFERENCES treasury_fund_pools(id),
          fund_name VARCHAR(255),
          funder_agency VARCHAR(255),
          requested_amount NUMERIC(14,2) NOT NULL,
          tranche_name VARCHAR(255),
          target_programs JSONB DEFAULT '[]',
          justification TEXT,
          status VARCHAR(100) DEFAULT 'Submitted to Funder Treasury',
          requested_by VARCHAR(150),
          requested_date DATE DEFAULT CURRENT_DATE,
          approved_date DATE,
          voucher_number VARCHAR(100),
          disbursed_to_vault BOOLEAN DEFAULT FALSE,
          approval_notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Clear any existing sample seed data per user request
        DELETE FROM treasury_drawdown_requests;
        DELETE FROM treasury_fund_pools;
      `);

      // Ensure primary official accounts (Admin, Treasury, School Coordinator, Supervisor, System Admin, Student) have January10 password in cloud/local DB
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
          name: 'John Steaven Balansag',
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
        {
          name: 'System Administrator',
          email: 'sysadmin.edu2026@gmail.com',
          role: 'system_admin',
          dept: 'Quezon City IT & System Services',
          major: 'Infrastructure & Security Admin',
        },
        {
          name: 'Juan Dela Cruz (Student Scholar)',
          email: 'student.edu2026@gmail.com',
          role: 'student',
          dept: 'Quezon City University',
          major: 'B.S. Information Technology',
        },
        {
          name: 'Demo Student Account',
          email: 'student@gmail.com',
          role: 'student',
          dept: 'Quezon City University',
          major: 'B.S. Computer Science',
        },
      ];

      for (const u of seedUsers) {
        await pool.query(`
          INSERT INTO users (name, email, password, role, department, major, financial_aid_year, status, is_email_verified)
          VALUES ($1, $2, $3, $4, $5, $6, '2026-2027', 'active', true)
          ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password = $3, role = $4, is_email_verified = true, status = 'active'
        `, [u.name, u.email.toLowerCase().trim(), defaultPassHash, u.role, u.dept, u.major]);
      }
      console.log('[db] Primary system accounts (Admin, Treasury, Coordinator, Supervisor, SysAdmin, Student) synchronized with password "January10"');

      // Ensure ONLY the 3 official accredited Quezon City partner institutions are maintained
      const partnerSchoolsSeed = [
        ['SCH-QC-001', 'Bestlink College of the Philippines (BCP)', 'BCP Novaliches', 'Private', '1071 Quirino Highway, Brgy. Kaligayahan, Novaliches, Quezon City', 'Engr. Charlie I. Cariño (Registrar / Dean)', '(02) 8417-4355', 'bcp.edu67@gmail.com', 'Accredited', 0, 2500, 'BSIT, BSCS, BSCpE, BSBA, BSHM, BSED, BEED, BSCRIM', '2024-01-01', '2028-12-31'],
        ['SCH-QC-002', 'Quezon City University (QCU)', 'QCU', 'LGU University', '673 Quirino Highway, San Bartolome, Novaliches, Quezon City', 'Dr. Aris Ramos (University Registrar)', '(02) 8806-3000', 'qcu.edu67@gmail.com', 'Accredited', 0, 3000, 'BSIT, BSCS, BSA, BSBA, BSIE, BECED', '2024-01-01', '2028-12-31'],
        ['SCH-QC-003', 'St. Claire College of Caloocan', 'St. Claire', 'Private', 'Caloocan / QC Border Campus', 'Prof. Maria Santos (Campus Coordinator)', '(02) 8951-4022', 'stclaire.edu67@gmail.com', 'Accredited', 0, 1500, 'BSIT, BSBA, BSA, BSED, BEED', '2024-01-01', '2028-12-31']
      ];

      await pool.query(`DELETE FROM partner_schools WHERE school_id NOT IN ('SCH-QC-001', 'SCH-QC-002', 'SCH-QC-003')`);

      for (const s of partnerSchoolsSeed) {
        await pool.query(
          `INSERT INTO partner_schools 
           (school_id, name, short_name, school_type, address, contact_person, contact_number, email, partnership_status, active_scholars, scholarship_slots, programs_offered, partnership_start, partnership_end)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (school_id) DO UPDATE SET 
             name = EXCLUDED.name, 
             short_name = EXCLUDED.short_name, 
             school_type = EXCLUDED.school_type, 
             address = EXCLUDED.address, 
             contact_person = EXCLUDED.contact_person, 
             contact_number = EXCLUDED.contact_number, 
             email = EXCLUDED.email, 
             partnership_status = EXCLUDED.partnership_status, 
             active_scholars = EXCLUDED.active_scholars, 
             scholarship_slots = EXCLUDED.scholarship_slots, 
             programs_offered = EXCLUDED.programs_offered, 
             partnership_start = EXCLUDED.partnership_start, 
             partnership_end = EXCLUDED.partnership_end`,
          s
        );
      }
      console.log('[db] Accredited partner schools catalog (BCP, QCU, St. Claire) synchronized in database.');
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
