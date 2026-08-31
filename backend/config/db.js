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

      // Ensure 24 accredited Quezon City partner institutions are maintained
      const partnerSchoolsSeed = [
        ['SCH-QC-001', 'Bestlink College of the Philippines (BCP)', 'BCP Novaliches', 'Private', '1071 Quirino Highway, Brgy. Kaligayahan, Novaliches, Quezon City', 'Engr. Charlie I. Cariño (Registrar / Dean)', '(02) 8417-4355', 'registrar@bcp.edu.ph', 'Accredited', 0, 2500, 'BSIT, BSCS, BSCpE, BSBA, BSHM, BSED, BEED, BSCRIM', '2024-01-01', '2028-12-31'],
        ['SCH-QC-002', 'Quezon City University (QCU - San Bartolome Main)', 'QCU Main', 'LGU University', '673 Quirino Highway, San Bartolome, Novaliches, Quezon City', 'Dr. Aris Ramos (University Registrar)', '(02) 8806-3000', 'registrar@qcu.edu.ph', 'Accredited', 0, 3000, 'BSIT, BSCS, BSA, BSBA, BSIE, BECED', '2024-01-01', '2028-12-31'],
        ['SCH-QC-003', 'Quezon City University (QCU - Batasan Campus)', 'QCU Batasan', 'LGU University', 'Batasan Hills, District 2, Quezon City', 'Prof. Melinda De Jesus (Campus Coordinator)', '(02) 8951-4022', 'batasan.registrar@qcu.edu.ph', 'Accredited', 0, 1500, 'BSIT, BSBA, BSA, BSED', '2024-01-01', '2028-12-31'],
        ['SCH-QC-004', 'Quezon City University (QCU - San Francisco Campus)', 'QCU San Francisco', 'LGU University', 'San Francisco del Monte, District 1, Quezon City', 'Prof. Danilo Reyes (Campus Coordinator)', '(02) 8372-8812', 'sanfrancisco.registrar@qcu.edu.ph', 'Accredited', 0, 1200, 'BSIT, BSBA, BSIE', '2024-01-01', '2028-12-31'],
        ['SCH-QC-005', 'University of the Philippines Diliman (UPD)', 'UP Diliman', 'SUC', 'Diliman, Quezon City, Metro Manila', 'Prof. Carla Gomez (Office of Scholarships)', '(02) 8981-8500', 'scholarships@upd.edu.ph', 'Accredited', 0, 1500, 'All Priority STEM, Social Sciences, Allied Health, Engineering', '2024-01-01', '2028-12-31'],
        ['SCH-QC-006', 'Polytechnic University of the Philippines (PUP QC)', 'PUP QC', 'SUC', 'Don Fabian St., Commonwealth, Quezon City', 'Prof. Ramon Santos (Branch Director)', '(02) 8952-7818', 'pupqc@pup.edu.ph', 'Accredited', 0, 1000, 'BSIT, BSBA, BPA, BSED, BS Accountancy', '2024-01-01', '2028-12-31'],
        ['SCH-QC-007', 'Our Lady of Fatima University (OLFU QC)', 'OLFU QC', 'Private', 'Regalado Ave., Fairview, Quezon City', 'Dr. Ma. Cristina Santos (Dean / Student Affairs)', '(02) 8935-2960', 'admissions.qc@fatima.edu.ph', 'Accredited', 0, 1200, 'BS Nursing, BS Pharmacy, BS Medical Tech, BS Physical Therapy, BSIT, BSBA', '2024-01-01', '2028-12-31'],
        ['SCH-QC-008', 'National University (NU Fairview / QC)', 'NU Fairview', 'Private', 'SM City Fairview Complex, Quirino Highway, Quezon City', 'Dir. Rafael Alcantara (Academic Registrar)', '(02) 8401-7700', 'admissions@nu-fairview.edu.ph', 'Accredited', 0, 800, 'BS Architecture, BS Civil Engg, BS Computer Science, BSIT, BS Tourism', '2024-01-01', '2028-12-31'],
        ['SCH-QC-009', 'Technological Institute of the Philippines (TIP QC)', 'TIP QC', 'Private', '938 Aurora Blvd., Cubao, Quezon City', 'Engr. David Tan (Student Financial Assistance)', '(02) 8911-0964', 'info.qc@tip.edu.ph', 'Accredited', 0, 1000, 'BS Computer Engg, BSEE, BSME, BSCE, BSCS, BSIT', '2024-01-01', '2028-12-31'],
        ['SCH-QC-010', 'Far Eastern University Diliman (FEU Diliman)', 'FEU Diliman', 'Private', 'Sampaguita Ave., Mapayapa Village, Quezon City', 'Ms. Teresa Mendoza (Admissions Officer)', '(02) 8931-6060', 'admissions@feudiliman.edu.ph', 'Accredited', 0, 600, 'BS Accountancy, BSBA, BSIT, Senior High School Academic Track', '2024-01-01', '2028-12-31'],
        ['SCH-QC-011', 'FEU - Nicanor Reyes Medical Foundation (FEU-NRMF)', 'FEU-NRMF', 'Private', 'Regalado Ave., West Fairview, Quezon City', 'Dr. Enrique Villanueva (Dean of Medical Services)', '(02) 8983-8000', 'admissions@feunrmf.edu.ph', 'Accredited', 0, 500, 'BS Medical Technology, BS Physical Therapy, BS Radiologic Tech, BS Nursing', '2024-01-01', '2028-12-31'],
        ['SCH-QC-012', 'Trinity University of Asia (TUA)', 'TUA', 'Private', 'Cathedral Heights, 275 E. Rodriguez Sr. Ave., Quezon City', 'Dr. Cynthia Bautista (Registrar & Admissions)', '(02) 8702-2882', 'admissions@tua.edu.ph', 'Accredited', 0, 700, 'BS Nursing, BS Medical Tech, BS Psychology, BSBA, BSED, BSIT', '2024-01-01', '2028-12-31'],
        ['SCH-QC-013', 'Ateneo de Manila University (ADMU)', 'Ateneo', 'Private', 'Katipunan Ave., Loyola Heights, Quezon City', 'Dir. Joaquin Reyes (Office of Admission and Aid)', '(02) 8426-6001', 'finaid@ateneo.edu', 'Partner Active', 0, 500, 'BS Management, BS Computer Science, BS Applied Math, AB Economics', '2024-06-01', '2028-06-01'],
        ['SCH-QC-014', 'New Era University (NEU)', 'NEU', 'Private', 'No. 9 Central Ave., New Era, Diliman, Quezon City', 'Prof. Ernesto Cruz (University Registrar)', '(02) 8981-4221', 'info@neu.edu.ph', 'Accredited', 0, 900, 'BS Civil Engg, BSEE, BS Accountancy, BS Nursing, BSIT, BS Medical Tech', '2024-01-01', '2028-12-31'],
        ['SCH-QC-015', 'Miriam College (MC)', 'Miriam College', 'Private', 'Katipunan Ave., Loyola Heights, Quezon City', 'Ms. Victoria Salazar (Financial Assistance Desk)', '(02) 8930-1393', 'scholarships@mc.edu.ph', 'Partner Active', 0, 400, 'BS Child Development, BS International Studies, BS Communication', '2024-01-01', '2028-12-31'],
        ['SCH-QC-016', 'UST - Angelicum College', 'UST Angelicum', 'Private', '112 Sen. Mariano J. Cuenco St., Santa Mesa Heights, Quezon City', 'Rev. Fr. Arthur Dingel (Director)', '(02) 8732-2000', 'admissions@ustangelicum.edu.ph', 'Accredited', 0, 500, 'BSIT, BSBA, AB Communication, Senior High School Academic Track', '2024-01-01', '2028-12-31'],
        ['SCH-QC-017', 'St. Paul University Quezon City (SPUQC)', 'SPUQC', 'Private', 'Aurora Blvd. cor. Gilmore Ave., New Manila, Quezon City', 'Sr. Bernadette Racadio (Office of Admissions)', '(02) 8726-7986', 'spuqc_admissions@spuqc.edu.ph', 'Accredited', 0, 450, 'BS Nursing, BS Psychology, BSBA, BSED, BS Tourism', '2024-01-01', '2028-12-31'],
        ['SCH-QC-018', 'World Citi Colleges (WCC QC)', 'World Citi Colleges', 'Private', '960 Aurora Blvd., Anonas, Quezon City', 'Prof. Allan Soriano (Registrar)', '(02) 8913-8380', 'info@worldciticolleges.edu.ph', 'Accredited', 0, 600, 'BS Nursing, BS Medical Tech, BS Aeronautical Engg, BS Aviation', '2024-01-01', '2028-12-31'],
        ['SCH-QC-019', 'STI College (Novaliches / Cubao / Fairview)', 'STI College QC', 'Private', 'Quirino Highway, Novaliches, Quezon City', 'Mr. Dennis Garcia (Campus Administrator)', '(02) 8936-2244', 'novaliches@sti.edu', 'Accredited', 0, 800, 'BSIT, BSCS, BS Information Systems, BS Tourism, BS Hospitality', '2024-01-01', '2028-12-31'],
        ['SCH-QC-020', 'AMA Computer University (AMA QC)', 'AMA University', 'Private', 'Maximina St., Villa Arca Subd., Project 8, Quezon City', 'Engr. Manuel Santos (Registrar)', '(02) 8737-5555', 'customer_service@ama.edu.ph', 'Accredited', 0, 650, 'BS Computer Science, BSIT, BS Computer Engg, BS Cybersecurity', '2024-01-01', '2028-12-31'],
        ['SCH-QC-021', 'Metro Manila College (MMC Novaliches)', 'MMC Novaliches', 'Private', 'U-Site, Brgy. Kaligayahan, Novaliches, Quezon City', 'Dr. Aurora Miranda (Academic Vice President)', '(02) 8936-7080', 'info@metromanilacollege.edu.ph', 'Accredited', 0, 800, 'BS Criminology, BEED, BSED, BSBA, BSIT, BSHM', '2024-01-01', '2028-12-31'],
        ['SCH-QC-022', 'Access Computer College Novaliches', 'Access College', 'Private', 'Quirino Highway cor. Zabarte Rd., Novaliches, Quezon City', 'Ms. Lorena Bautista (Branch Registrar)', '(02) 8930-0588', 'admissions@access.edu.ph', 'Accredited', 0, 500, 'BSIT, BSBA, BS Hotel and Restaurant Management, Associate in Computer Tech', '2024-01-01', '2028-12-31'],
        ['SCH-QC-023', 'Capitol Medical Center Colleges (CMCC)', 'CMCC', 'Private', 'Quezon Ave. cor. Scout Magbanua St., Quezon City', 'Dr. Maria Elena Ocampo (Dean of Health Sciences)', '(02) 8372-8888', 'colleges@capitolmedical.org', 'Accredited', 0, 400, 'BS Nursing, BS Medical Tech, BS Radiologic Tech', '2024-01-01', '2028-12-31'],
        ['SCH-QC-024', 'Eulogio Amang Rodriguez Institute of Science and Technology (EARIST QC)', 'EARIST QC', 'SUC', 'Bagtican St., Brgy. Sto. Cristo, Bago Bantay, Quezon City', 'Prof. Gilberto Ramos (Campus Director)', '(02) 8928-1120', 'earistqc@earist.edu.ph', 'Accredited', 0, 700, 'BS Industrial Tech, BS Electrical Tech, BS Electronics Tech, BS Mechanical Tech, BSED', '2024-01-01', '2028-12-31']
      ];

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
      console.log('[db] 24 accredited partner schools catalog synchronized in database.');
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
