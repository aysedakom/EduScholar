// backend/config/db.js
// Dual-Pool PostgreSQL connection manager with automatic Cloud <-> Localhost failover.

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'January10';
const DB_NAME = process.env.DB_NAME || 'eduscholar';

const getCloudDatabaseUrl = () => {
  return (
    process.env.DATABASE_PRIVATE_URL ||
    process.env.DATABASE_URL_PRIVATE ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.VERCEL_POSTGRES_URL ||
    process.env.RAILWAY_DATABASE_URL ||
    'postgresql://neondb_owner:npg_suj9Gvxpb2ZJ@ep-purple-smoke-b5n7wfkx-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require'
  );
};

// 1. Create Localhost Pool (always active)
const localPool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
localPool.on('error', (err) => {
  console.warn('[db] Localhost pool notice:', err.message);
});

// 2. Create Cloud Pool (if URL exists)
const cloudUrl = getCloudDatabaseUrl();
let cloudPool = null;
if (cloudUrl) {
  const isLocal = cloudUrl.includes('localhost') || cloudUrl.includes('127.0.0.1');
  cloudPool = new Pool({
    connectionString: cloudUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  cloudPool.on('error', (err) => {
    console.warn('[db] Cloud pool notice:', err.message);
  });
}

// 3. Admin Pool (used for database creation check on Localhost)
const adminPool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: 'postgres',
  max: 5,
  connectionTimeoutMillis: 3000,
});
adminPool.on('error', (err) => {
  console.warn('[db] Admin pool notice:', err.message);
});

// Track cloud database health & recovery
let isCloudHealthy = Boolean(cloudPool);
let lastCloudAttempt = 0;
const CLOUD_RETRY_INTERVAL_MS = 15000;

function isNetworkOrConnectionError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const code = (err.code || '').toUpperCase();

  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === 'EPIPE' ||
    code === '57P01' || // admin_shutdown
    code === '57P02' || // crash_shutdown
    code === '57P03' || // cannot_connect_now
    msg.includes('connection timeout') ||
    msg.includes('timeout exceeded') ||
    msg.includes('connection terminated') ||
    msg.includes('could not connect') ||
    msg.includes('connect econnrefused') ||
    msg.includes('getaddrinfo enotfound') ||
    msg.includes('fetch failed') ||
    msg.includes('network error')
  );
}

/**
 * Execute query against cloud DB, auto-failing over to localhost DB if cloud DB is unreachable or network drops.
 */
async function queryWithFailover(text, params) {
  const now = Date.now();

  // Try cloud pool first if available
  if (cloudPool) {
    if (!isCloudHealthy && now - lastCloudAttempt > CLOUD_RETRY_INTERVAL_MS) {
      try {
        const testRes = await cloudPool.query('SELECT 1');
        if (testRes) {
          isCloudHealthy = true;
          console.log('[db] 🟢 Cloud PostgreSQL connection restored! Re-activating Cloud DB target.');
        }
      } catch (_) {
        lastCloudAttempt = now;
      }
    }

    if (isCloudHealthy) {
      try {
        return await cloudPool.query(text, params);
      } catch (err) {
        if (isNetworkOrConnectionError(err)) {
          isCloudHealthy = false;
          lastCloudAttempt = now;
          console.warn(`[db] ⚠️ Cloud DB network drop/timeout (${err.code || err.message}). Auto-failing over query to Localhost PostgreSQL (localhost:5432)...`);
          // Fallback execution on localPool below!
        } else {
          throw err;
        }
      }
    }
  }

  // Fallback / Primary execution on Localhost Pool
  return await localPool.query(text, params);
}

// Resilient pool proxy object matching node-pg Pool interface
const pool = {
  query: (text, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = undefined;
    }
    const p = queryWithFailover(text, params);
    if (typeof callback === 'function') {
      p.then((res) => callback(null, res)).catch((err) => callback(err));
      return;
    }
    return p;
  },
  on: (event, handler) => {
    localPool.on(event, handler);
    if (cloudPool) cloudPool.on(event, handler);
  },
  connect: async () => {
    if (cloudPool && isCloudHealthy) {
      try {
        return await cloudPool.connect();
      } catch (err) {
        if (isNetworkOrConnectionError(err)) {
          isCloudHealthy = false;
          console.warn('[db] ⚠️ Cloud pool connect failed, falling back to local pool client.');
        } else {
          throw err;
        }
      }
    }
    return await localPool.connect();
  },
  end: async () => {
    await localPool.end();
    if (cloudPool) await cloudPool.end();
  },
  localPool,
  cloudPool,
};

/**
 * Ensure local PostgreSQL database "eduscholar" exists.
 */
async function ensureDatabaseExists() {
  try {
    const check = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );
    if (check.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`[db] Created local database "${DB_NAME}"`);
    } else {
      console.log(`[db] Local database "${DB_NAME}" connected`);
    }
  } catch (err) {
    console.warn(`[db] ensureDatabaseExists warning: ${err.message}`);
  }
}

/**
 * Ensure table schema and seed data are populated for a target pool
 */
async function ensureTablesForPool(targetPool, label) {
  try {
    const check = await targetPool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'`
    );
    if (check.rowCount === 0) {
      console.log(`[db] Tables missing on ${label}, initializing schema...`);
      const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await targetPool.query(schema);
      console.log(`[db] Schema initialized on ${label}`);

      const { seed } = require('../db/seed');
      await seed();
    } else {
      // Ensure student_registry is populated if empty
      const regCheck = await targetPool.query(`SELECT COUNT(*)::int as count FROM student_registry`);
      if (regCheck.rows[0].count === 0) {
        console.log(`[db] student_registry is empty on ${label}, running master seed()...`);
        const { seed } = require('../db/seed');
        await seed();
      }
      // Ensure user_otps table and updated schema migrations exist
      await targetPool.query(`
        CREATE TABLE IF NOT EXISTS user_otps (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          email VARCHAR(200) NOT NULL,
          otp_code VARCHAR(200) NOT NULL,
          otp_purpose VARCHAR(50) DEFAULT 'login' CHECK (otp_purpose IN ('login', 'register', 'verify_email', 'reset_password')),
          expires_at TIMESTAMPTZ NOT NULL,
          attempts INTEGER DEFAULT 0,
          consumed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email, otp_purpose, consumed_at);

        ALTER TABLE user_otps ALTER COLUMN otp_code TYPE VARCHAR(200);
        ALTER TABLE user_otps DROP CONSTRAINT IF EXISTS user_otps_otp_purpose_check;
        ALTER TABLE user_otps ADD CONSTRAINT user_otps_otp_purpose_check CHECK (otp_purpose IN ('login', 'register', 'verify_email', 'reset_password'));
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_data TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS district VARCHAR(100);
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS barangay VARCHAR(100);
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS address TEXT;
        ALTER TABLE student_registry ADD COLUMN IF NOT EXISTS district VARCHAR(100);

        ALTER TABLE student_registry DROP CONSTRAINT IF EXISTS student_registry_disbursement_status_check;
        ALTER TABLE student_registry DROP CONSTRAINT IF EXISTS student_registry_status_check;
        ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;

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

        CREATE TABLE IF NOT EXISTS live_chat_sessions (
          id SERIAL PRIMARY KEY,
          session_code VARCHAR(50) UNIQUE NOT NULL,
          guest_name VARCHAR(150) NOT NULL,
          guest_email VARCHAR(200),
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          category VARCHAR(100) NOT NULL,
          initial_message TEXT NOT NULL,
          status VARCHAR(30) DEFAULT 'Waiting' CHECK (status IN ('Waiting', 'Active', 'Resolved', 'Expired', 'Closed', 'Archived')),
          assigned_admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          assigned_admin_name VARCHAR(150),
          last_message_at TIMESTAMPTZ DEFAULT NOW(),
          last_user_activity_at TIMESTAMPTZ DEFAULT NOW(),
          closed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_status ON live_chat_sessions(status, created_at);

        CREATE TABLE IF NOT EXISTS live_chat_messages (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
          sender_type VARCHAR(30) NOT NULL CHECK (sender_type IN ('student', 'guest', 'admin', 'system')),
          sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          sender_name VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_live_chat_messages_session ON live_chat_messages(session_id, created_at);

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

        CREATE TABLE IF NOT EXISTS portal_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        INSERT INTO portal_settings (setting_key, setting_value)
        VALUES ('application_portal', '{"isOpen": true, "academicYear": "AY 2026-2027", "term": "1st Semester", "openingDate": "2026-08-01", "closingDate": "2026-09-30", "closedMessage": "The Quezon City Scholarship Application Portal is currently closed for new submissions. Evaluators are processing active candidate queues.", "nextCycleOpening": "October 15, 2026"}'::jsonb)
        ON CONFLICT (setting_key) DO NOTHING;

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

        ALTER TABLE bursaries ADD COLUMN IF NOT EXISTS income_tier VARCHAR(50) DEFAULT 'Tier 1 (< ₱15,000/mo)';
        ALTER TABLE bursaries ADD COLUMN IF NOT EXISTS required_documents JSONB DEFAULT '["Certificate of Indigency", "Proof of Household Income", "Student ID"]';

        CREATE TABLE IF NOT EXISTS work_study_jobs (
          id SERIAL PRIMARY KEY,
          job_code VARCHAR(50) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          department VARCHAR(150) NOT NULL,
          location VARCHAR(150) DEFAULT 'Quezon City Campus',
          hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 120.00,
          max_hours_per_week INTEGER DEFAULT 20,
          slots_available INTEGER DEFAULT 5,
          slots_filled INTEGER DEFAULT 0,
          supervisor_name VARCHAR(150),
          supervisor_email VARCHAR(200),
          description TEXT NOT NULL,
          requirements JSONB DEFAULT '[]',
          status VARCHAR(30) DEFAULT 'Open' CHECK (status IN ('Open', 'Closed', 'Filled')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS work_study_logs (
          id SERIAL PRIMARY KEY,
          log_code VARCHAR(50) UNIQUE NOT NULL,
          application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          job_id INTEGER REFERENCES work_study_jobs(id) ON DELETE CASCADE,
          work_date DATE NOT NULL,
          clock_in TIME NOT NULL,
          clock_out TIME NOT NULL,
          hours_logged NUMERIC(5,2) NOT NULL,
          tasks_completed TEXT NOT NULL,
          status VARCHAR(40) DEFAULT 'Pending Approval' CHECK (status IN ('Pending Approval', 'Approved', 'Rejected')),
          supervisor_remarks TEXT,
          approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          approved_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_work_study_logs_user ON work_study_logs(user_id, status);
        CREATE INDEX IF NOT EXISTS idx_work_study_logs_job ON work_study_logs(job_id, status);
      `);

      // Seed initial Work-Study jobs catalog if empty
      const wsCheck = await targetPool.query(`SELECT COUNT(*)::int as count FROM work_study_jobs`);
      if (wsCheck.rows[0].count === 0) {
        const initialJobs = [
          ['WS-QC-001', 'QCU Library Technical Assistant', 'University Library', 'QCU San Bartolome Campus', 120.00, 20, 5, 2, 'Ms. Maria Teresa Santos', 'library.supervisor@qcu.edu.ph', 'Assisting librarians with digital cataloging, shelf organization, and student inquiry desk service.', JSON.stringify(['Enrolled Student', 'Good Standing (GWA 2.25 or better)', 'Computer Literate'])],
          ['WS-QC-002', 'IT Computer Lab Technical Aide', 'College of Computer Studies', 'QCU IT Building Floor 3', 135.00, 15, 4, 1, 'Prof. Engr. Mark Anthony Reyes', 'itlab.supervisor@qcu.edu.ph', 'Maintaining PC hardware setup, network cable checks, software installations, and lab assistant duties during programming classes.', JSON.stringify(['BSIT / BSCS Student', 'Passing Grades', 'Basic Hardware & Linux Knowledge'])],
          ['WS-QC-003', 'Student Registrar Records Assistant', 'Office of the University Registrar', 'Admin Building Room 102', 115.00, 20, 6, 3, 'Dr. Aris Ramos (Registrar)', 'registrar.supervisor@qcu.edu.ph', 'Sorting student transcript requests, scanning enrollment forms, data entry, and student queuing management.', JSON.stringify(['Enrolled Student', 'Attention to Detail', 'Data Privacy Agreement Signee'])],
          ['WS-QC-004', 'QCYDO Youth Program Student Facilitator', 'Quezon City Youth Development Office', 'QC Hall Annex Bldg', 140.00, 15, 8, 4, 'Mr. John Steaven Balansag', 'qcydo.supervisor@qc.gov.ph', 'Coordinating community outreach programs, registration desk management for city scholar orientation events, and social media posting.', JSON.stringify(['Active QC Resident', 'Strong Communication Skills', 'Leadership Experience'])],
        ];

        for (const j of initialJobs) {
          await targetPool.query(
            `INSERT INTO work_study_jobs 
             (job_code, title, department, location, hourly_rate, max_hours_per_week, slots_available, slots_filled, supervisor_name, supervisor_email, description, requirements)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
             ON CONFLICT (job_code) DO NOTHING`,
            j
          );
        }
        console.log(`[db] Work-Study jobs catalog seeded on ${label}.`);
      }

      const bcrypt = require('bcryptjs');
      const defaultPassHash = await bcrypt.hash('January10', 10);
      
      const seedUsers = [
        {
          name: 'ADMIN / System Administrator',
          email: 'support.edu2026@gmail.com',
          role: 'admin',
          dept: 'Quezon City Youth Development Office (QCYDO) & IT Administration',
          major: 'Scholarship Head & System Administrator',
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
      ];

      for (const u of seedUsers) {
        await targetPool.query(`
          INSERT INTO users (name, email, password, role, department, major, financial_aid_year, status, is_email_verified)
          VALUES ($1, $2, $3, $4, $5, $6, '2026-2027', 'active', true)
          ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password = $3, role = $4, is_email_verified = true, status = 'active'
        `, [u.name, u.email.toLowerCase().trim(), defaultPassHash, u.role, u.dept, u.major]);
      }

      await targetPool.query(`DELETE FROM users WHERE email = 'sysadmin.edu2026@gmail.com'`);


      const partnerSchoolsSeed = [
        ['SCH-QC-001', 'Bestlink College of the Philippines (BCP)', 'BCP Novaliches', 'Private', '1071 Quirino Highway, Brgy. Kaligayahan, Novaliches, Quezon City', 'Engr. Charlie I. Cariño (Registrar / Dean)', '(02) 8417-4355', 'bcp.edu67@gmail.com', 'Accredited', 0, 2500, 'BSIT, BSCS, BSCpE, BSBA, BSHM, BSED, BEED, BSCRIM', '2024-01-01', '2028-12-31'],
        ['SCH-QC-002', 'Quezon City University (QCU)', 'QCU', 'LGU University', '673 Quirino Highway, San Bartolome, Novaliches, Quezon City', 'Dr. Aris Ramos (University Registrar)', '(02) 8806-3000', 'qcu.edu67@gmail.com', 'Accredited', 0, 3000, 'BSIT, BSCS, BSA, BSBA, BSIE, BECED', '2024-01-01', '2028-12-31'],
        ['SCH-QC-003', 'St. Claire College of Caloocan', 'St. Claire', 'Private', 'Caloocan / QC Border Campus', 'Prof. Maria Santos (Campus Coordinator)', '(02) 8951-4022', 'stclaire.edu67@gmail.com', 'Accredited', 0, 1500, 'BSIT, BSBA, BSA, BSED, BEED', '2024-01-01', '2028-12-31']
      ];

      await targetPool.query(`DELETE FROM partner_schools WHERE school_id NOT IN ('SCH-QC-001', 'SCH-QC-002', 'SCH-QC-003')`);

      for (const s of partnerSchoolsSeed) {
        await targetPool.query(
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
      console.log(`[db] Accredited partner schools catalog synchronized on ${label}.`);
    }
  } catch (err) {
    console.warn(`[db] ensureTablesForPool (${label}) warning:`, err.message);
  }
}

async function ensureTables() {
  await ensureTablesForPool(localPool, 'Localhost PostgreSQL');
  if (cloudPool && isCloudHealthy) {
    await ensureTablesForPool(cloudPool, 'Cloud PostgreSQL');
  }
}

let dbInitialized = false;

async function initDb() {
  if (dbInitialized) return;
  try {
    await ensureDatabaseExists();
    await ensureTables();
    dbInitialized = true;
  } catch (err) {
    console.warn('[db] initDb warning:', err.message);
  }
}

const getDb = () => pool;

module.exports = { pool, adminPool, localPool, cloudPool, initDb, ensureDatabaseExists, getDb };

