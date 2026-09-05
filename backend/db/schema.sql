-- backend/db/schema.sql
-- Complete PostgreSQL schema for EduScholar / Quezon City Campus Aid Hub

BEGIN;

-- Drop existing tables with CASCADE if resetting
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS treasury_budgets CASCADE;
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS student_evaluations CASCADE;
DROP TABLE IF EXISTS education_monitoring_reports CASCADE;
DROP TABLE IF EXISTS school_aid_distributions CASCADE;
DROP TABLE IF EXISTS student_registry CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS bursaries CASCADE;
DROP TABLE IF EXISTS scholarships CASCADE;
DROP TABLE IF EXISTS partner_schools CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS user_otps CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 1. USERS & PROFILES
-- ============================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'supervisor', 'school_coordinator', 'treasury', 'system_admin')),
  student_id VARCHAR(50),
  department VARCHAR(150),
  major VARCHAR(150),
  gpa NUMERIC(4,2),
  financial_aid_year VARCHAR(30) DEFAULT '2026-2027',
  avatar TEXT,
  phone VARCHAR(50),
  address TEXT,
  barangay VARCHAR(100),
  district VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Quezon City',
  province VARCHAR(100) DEFAULT 'Metro Manila',
  zip_code VARCHAR(20) DEFAULT '1100',
  is_pwd BOOLEAN DEFAULT FALSE,
  is_solo_parent BOOLEAN DEFAULT FALSE,
  is_indigenous BOOLEAN DEFAULT FALSE,
  is_4ps BOOLEAN DEFAULT FALSE,
  is_kasambahay_or_toda BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 1.1 AUTHENTICATION OTPS
-- ============================================================
CREATE TABLE user_otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(200) NOT NULL,
  otp_code VARCHAR(100) NOT NULL,
  otp_purpose VARCHAR(50) DEFAULT 'login' CHECK (otp_purpose IN ('login', 'register', 'verify_email', 'reset_password')),
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_otps_email ON user_otps(email, otp_purpose, consumed_at);

-- ============================================================
-- 1.2 EMAIL AUDIT LOGS (Dispatched Messages & Notifications)
-- ============================================================
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  recipient_email VARCHAR(200) NOT NULL,
  recipient_name VARCHAR(150),
  email_type VARCHAR(50) NOT NULL,                           -- verification_link | login_otp | password_reset | announcement
  subject VARCHAR(255) NOT NULL,
  code_or_url TEXT,
  dispatch_method VARCHAR(50) DEFAULT 'simulation',          -- brevo_api | smtp | simulation
  status VARCHAR(50) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email, sent_at);

-- ============================================================
-- 2. PARTNER SCHOOLS
-- ============================================================
CREATE TABLE partner_schools (
  id SERIAL PRIMARY KEY,
  school_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  school_type VARCHAR(50) NOT NULL DEFAULT 'LGU University' CHECK (school_type IN ('Private', 'Public', 'SUC', 'LUC', 'LGU University')),
  address TEXT NOT NULL,
  contact_person VARCHAR(150),
  contact_number VARCHAR(50),
  email VARCHAR(150),
  partnership_status VARCHAR(30) DEFAULT 'Accredited' CHECK (partnership_status IN ('Accredited', 'Partner Active', 'Pending', 'Expired')),
  active_scholars INTEGER DEFAULT 0,
  scholarship_slots INTEGER DEFAULT 500,
  programs_offered TEXT,
  partnership_start DATE,
  partnership_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. SCHOLARSHIPS (QCSP Programs)
-- ============================================================
CREATE TABLE scholarships (
  id SERIAL PRIMARY KEY,
  program_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  short_title VARCHAR(100) NOT NULL,
  category_id VARCHAR(50) NOT NULL,                           -- shs | tertiary | postgrad | continuing-vocational | creative-writing
  category_title VARCHAR(150) NOT NULL,
  level VARCHAR(100) NOT NULL,
  badge VARCHAR(100),
  summary TEXT,
  tuition_grant VARCHAR(100),
  stipend VARCHAR(100),
  total_max VARCHAR(100),
  amount NUMERIC(12,2) DEFAULT 0,
  min_gwa_text VARCHAR(100),
  min_gwa_number NUMERIC(4,2),
  qualifications JSONB DEFAULT '[]',
  required_documents JSONB DEFAULT '[]',
  deadline DATE,
  status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Upcoming', 'Closed', 'Ongoing')),
  slots INTEGER DEFAULT 1000,
  applied_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. BURSARIES (Need-Based Aid)
-- ============================================================
CREATE TABLE bursaries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL DEFAULT 'Emergency Hardship',
  amount NUMERIC(12,2) NOT NULL,
  deadline DATE,
  eligibility TEXT,
  funds_available NUMERIC(12,2) DEFAULT 500000,
  description TEXT,
  requirement_notes TEXT,
  status VARCHAR(20) DEFAULT 'Ongoing' CHECK (status IN ('Ongoing', 'Upcoming', 'Closed'))
);

-- ============================================================
-- 5. OPPORTUNITIES (External / Directory)
-- ============================================================
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  provider_name VARCHAR(200) NOT NULL,
  provider_logo TEXT,
  provider_type VARCHAR(100) DEFAULT 'Government',
  category VARCHAR(100) NOT NULL,                             -- Scholarship | Bursary | Work-Study | Grant
  funding_type VARCHAR(100) DEFAULT 'Merit-Based',
  eligibility_badge VARCHAR(150),
  deadline DATE,
  external_url TEXT,
  description TEXT,
  amount NUMERIC(12,2),
  location VARCHAR(150) DEFAULT 'Quezon City',
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closing_soon', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. APPLICATIONS
-- ============================================================
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  application_code VARCHAR(60) UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'Scholarship',             -- Scholarship | Work-Study | Bursary | Renewal
  program_id VARCHAR(50),
  program_name VARCHAR(255) NOT NULL,
  reference_id VARCHAR(100),
  title VARCHAR(255),
  district VARCHAR(100),
  barangay VARCHAR(100),
  amount NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Under Review' CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected', 'Paid', 'Renewal Processing')),
  submission_date DATE DEFAULT CURRENT_DATE,
  disbursement_date DATE,
  progress INTEGER DEFAULT 40,
  requirements_count INTEGER DEFAULT 4,
  completed_requirements INTEGER DEFAULT 4,
  job_id INTEGER,
  notes TEXT,
  form_data JSONB DEFAULT '{}',
  documents_submitted JSONB DEFAULT '[]',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. DOCUMENTS (Vault)
-- ============================================================
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,                             -- academic | identity | financial | endorsement | portfolio | employment
  upload_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(30) DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'rejected')),
  size VARCHAR(30) DEFAULT '1.2 MB',
  file_path TEXT,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  category VARCHAR(50) DEFAULT 'application_status',
  link VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. STUDENT REGISTRY (Scholars Roster)
-- ============================================================
CREATE TABLE student_registry (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  school VARCHAR(200) NOT NULL,
  program_id VARCHAR(100) NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  current_term VARCHAR(100) NOT NULL DEFAULT '1st Sem AY 2026-2027',
  scholarship_age VARCHAR(100) DEFAULT 'Year 2 (3rd Semester)',
  gwa NUMERIC(4,2) DEFAULT 1.75,
  units_enrolled INTEGER DEFAULT 18,
  status VARCHAR(50) DEFAULT 'Active Good Standing' CHECK (status IN ('Active Good Standing', 'Dean''s List Honor', 'Renewal Pending', 'Academic Warning', 'Graduated')),
  grant_amount NUMERIC(12,2) DEFAULT 10000,
  disbursement_status VARCHAR(50) DEFAULT 'Disbursed' CHECK (disbursement_status IN ('Disbursed', 'Processing', 'Scheduled', 'On-Hold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. SCHOOL AID DISTRIBUTIONS (Payout Batches)
-- ============================================================
CREATE TABLE school_aid_distributions (
  id SERIAL PRIMARY KEY,
  batch_code VARCHAR(60) UNIQUE NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  term VARCHAR(100) NOT NULL,
  beneficiary_count INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  disbursement_channel VARCHAR(100) NOT NULL DEFAULT 'Landbank ATM / Cash Card',
  payout_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Processing' CHECK (status IN ('Completed', 'Processing', 'Scheduled', 'Auditing')),
  fund_source VARCHAR(150) DEFAULT 'QCYDO General Scholarship Fund 2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. EDUCATION MONITORING & ACADEMIC AUDITS
-- ============================================================
CREATE TABLE education_monitoring_reports (
  id SERIAL PRIMARY KEY,
  audit_code VARCHAR(50) UNIQUE NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  avatar TEXT,
  barangay VARCHAR(150) NOT NULL,
  school VARCHAR(200) NOT NULL,
  program VARCHAR(255) NOT NULL,
  semester_aid_amount NUMERIC(12,2) DEFAULT 10000,
  current_term VARCHAR(100) NOT NULL,
  current_gwa NUMERIC(4,2) NOT NULL,
  units_enrolled INTEGER NOT NULL DEFAULT 18,
  units_passed INTEGER NOT NULL DEFAULT 18,
  incomplete_units INTEGER NOT NULL DEFAULT 0,
  class_attendance_rate NUMERIC(5,2) DEFAULT 98.5,
  community_service_hours INTEGER DEFAULT 30,
  required_service_hours INTEGER DEFAULT 30,
  retention_status VARCHAR(50) DEFAULT 'Retention Cleared',
  subjects JSONB DEFAULT '[]',
  registrar_verified BOOLEAN DEFAULT TRUE,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. STUDENT EVALUATIONS (Supervisor Performance)
-- ============================================================
CREATE TABLE student_evaluations (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  supervisor_name VARCHAR(150) NOT NULL,
  department VARCHAR(150) NOT NULL,
  performance_rating NUMERIC(3,1) DEFAULT 4.8,
  attendance_rating NUMERIC(3,1) DEFAULT 5.0,
  compliance_status VARCHAR(50) DEFAULT 'Exemplary',
  evaluation_period VARCHAR(100) DEFAULT 'Mid-Term AY 2026-2027',
  remarks TEXT,
  submitted_date DATE DEFAULT CURRENT_DATE
);

-- ============================================================
-- 13. PAYMENT HISTORY & DISBURSEMENTS
-- ============================================================
CREATE TABLE payment_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  paid_date DATE DEFAULT CURRENT_DATE,
  description VARCHAR(255),
  period VARCHAR(100)
);

-- ============================================================
-- 14. TREASURY BUDGETS & SYSTEM LOGS
-- ============================================================
CREATE TABLE treasury_budgets (
  id SERIAL PRIMARY KEY,
  fund_name VARCHAR(200) NOT NULL,
  fiscal_year VARCHAR(30) DEFAULT '2026',
  total_allocation NUMERIC(14,2) NOT NULL,
  disbursed_amount NUMERIC(14,2) DEFAULT 0,
  committed_amount NUMERIC(14,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'Active'
);

CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. SUPPORT TICKETS
-- ============================================================
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

-- ============================================================
-- 16. CHAT MESSAGES & ANNOUNCEMENTS
-- ============================================================
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

-- ============================================================
-- 17. PORTAL SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS portal_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 18. REAL-TIME EVENT STREAMING (PostgreSQL NOTIFY TRIGGERS)
-- ============================================================
-- 15. REAL-TIME EVENT STREAMING (PostgreSQL NOTIFY TRIGGERS)
-- ============================================================
CREATE OR REPLACE FUNCTION notify_eduscholar_events()
RETURNS trigger AS $$
DECLARE
  payload JSONB;
BEGIN
  payload = jsonb_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'record', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(NEW) END,
    'timestamp', CURRENT_TIMESTAMP
  );
  PERFORM pg_notify('eduscholar_events', payload::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_realtime ON applications;
CREATE TRIGGER trg_applications_realtime
AFTER INSERT OR UPDATE OR DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_events();

DROP TRIGGER IF EXISTS trg_registry_realtime ON student_registry;
CREATE TRIGGER trg_registry_realtime
AFTER INSERT OR UPDATE OR DELETE ON student_registry
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_events();

DROP TRIGGER IF EXISTS trg_documents_realtime ON documents;
CREATE TRIGGER trg_documents_realtime
AFTER INSERT OR UPDATE OR DELETE ON documents
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_events();

DROP TRIGGER IF EXISTS trg_notifications_realtime ON notifications;
CREATE TRIGGER trg_notifications_realtime
AFTER INSERT OR UPDATE OR DELETE ON notifications
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_events();

DROP TRIGGER IF EXISTS trg_distributions_realtime ON school_aid_distributions;
CREATE TRIGGER trg_distributions_realtime
AFTER INSERT OR UPDATE OR DELETE ON school_aid_distributions
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_events();

DROP TRIGGER IF EXISTS trg_users_realtime ON users;
CREATE TRIGGER trg_users_realtime
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_events();

COMMIT;

