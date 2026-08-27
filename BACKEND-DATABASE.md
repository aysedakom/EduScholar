# CAMPUS AID HUB - BACKEND & DATABASE SCRIPT
# After completing Phases 1 and 2 (Frontend), run this script
# to build the backend and connect to PostgreSQL 16.

# ============================================================
# 1. PREREQUISITES (Already Done)
# ============================================================

# ✅ Frontend (Phases 1 and 2) is complete
# ✅ PostgreSQL 16 is running (Eprovider)
# ✅ Node.js is installed
# ✅ Docker is available (if using containerization)

# ============================================================
# 2. PROJECT STRUCTURE (BACKEND)
# ============================================================

# Create this folder structure in your project root:

/backend
  /src
    /config
      database.ts
      auth.ts
      email.ts
    /models
      User.ts
      Student.ts
      PartnerSchool.ts
      ScholarshipProgram.ts
      ScholarshipApplication.ts
      Disbursement.ts
      WorkStudyJob.ts
      WorkStudyApplication.ts
      Document.ts
      Notification.ts
      AuditLog.ts
    /controllers
      auth.controller.ts
      student.controller.ts
      scholarship.controller.ts
      workstudy.controller.ts
      school.controller.ts
      disbursement.controller.ts
      report.controller.ts
      admin.controller.ts
    /services
      auth.service.ts
      database.service.ts
      email.service.ts
      notification.service.ts
      websocket.service.ts
    /routes
      auth.routes.ts
      student.routes.ts
      scholarship.routes.ts
      workstudy.routes.ts
      school.routes.ts
      disbursement.routes.ts
      report.routes.ts
      admin.routes.ts
    /middleware
      auth.middleware.ts
      role.middleware.ts
      validation.middleware.ts
    /utils
      helpers.ts
      validators.ts
      formatters.ts
    /types
      index.ts
    /websocket
      server.ts
  /prisma (if using Prisma)
    schema.prisma
  package.json
  tsconfig.json
  .env
  Dockerfile

# ============================================================
# 3. DEPENDENCIES (package.json)
# ============================================================

# Backend Dependencies:
# - express (web framework)
# - cors (cross-origin resource sharing)
# - helmet (security headers)
# - dotenv (environment variables)
# - pg (PostgreSQL driver)
# - prisma (ORM - optional)
# - jsonwebtoken (JWT handling)
# - bcryptjs (password hashing)
# - nodemailer (email sending)
# - socket.io (WebSockets)
# - winston (logging)
# - joi (validation)
# - swagger-jsdoc (API documentation)

# Dev Dependencies:
# - typescript
# - @types/node
# - @types/express
# - @types/cors
# - @types/bcryptjs
# - @types/jsonwebtoken
# - nodemon
# - ts-node

# Run:
# cd backend
# npm init -y
# npm install express cors helmet dotenv pg prisma @prisma/client jsonwebtoken bcryptjs nodemailer socket.io winston joi swagger-jsdoc
# npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken nodemon ts-node

# ============================================================
# 4. ENVIRONMENT VARIABLES (.env)
# ============================================================

# Create a .env file in the /backend folder:

# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL 16 via Eprovider)
DATABASE_URL="postgresql://username:password@localhost:5432/campus_aid_hub?schema=public"

# Authentication (Eprovider Auth)
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
OTP_SECRET="your-otp-secret"
MFA_ENABLED=true

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Real-Time (WebSockets)
WEBSOCKET_PORT=5001

# API Base URL
API_BASE_URL="http://localhost:5000/api"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# ============================================================
# 5. DATABASE SCHEMA (PostgreSQL 16)
# ============================================================

# Run these SQL statements in your PostgreSQL database:

-- ============================================================
-- Database: campus_aid_hub
-- ============================================================

CREATE DATABASE campus_aid_hub;

\c campus_aid_hub;

-- ============================================================
-- TABLES
-- ============================================================

-- Users table (authentication and authorization)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'admin', 'supervisor', 'school_coordinator', 'treasury', 'system_admin')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    email_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    trusted_devices JSONB DEFAULT '[]',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table (extends users)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    school_id UUID,
    course VARCHAR(100),
    year_level VARCHAR(20) CHECK (year_level IN ('1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate')),
    gwa DECIMAL(3,2),
    income_bracket VARCHAR(50) CHECK (income_bracket IN ('Low', 'Middle', 'High')),
    barangay VARCHAR(100),
    contact_number VARCHAR(20),
    profile_picture VARCHAR(255),
    is_pwd BOOLEAN DEFAULT FALSE,
    is_solo_parent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner Schools
CREATE TABLE partner_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id VARCHAR(20) UNIQUE NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    school_type VARCHAR(50) CHECK (school_type IN ('Private', 'Public', 'SUC', 'LUC')),
    address TEXT NOT NULL,
    contact_person VARCHAR(100),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    partnership_status VARCHAR(20) DEFAULT 'Pending' CHECK (partnership_status IN ('Active', 'Inactive', 'Pending', 'Expired')),
    partnership_start DATE,
    partnership_end DATE,
    programs_offered TEXT,
    scholarship_slots INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scholarship Programs
CREATE TABLE scholarship_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_code VARCHAR(20) UNIQUE NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('Academic', 'Economic', 'Arts', 'Sports', 'Leadership', 'Special')),
    eligibility_criteria TEXT NOT NULL,
    grant_amount DECIMAL(10,2) NOT NULL,
    grant_type VARCHAR(50) CHECK (grant_type IN ('Tuition Fee', 'Stipend', 'Full Grant', 'Partial Grant')),
    application_start DATE NOT NULL,
    application_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Upcoming' CHECK (status IN ('Active', 'Inactive', 'Upcoming', 'Closed')),
    total_slots INT,
    filled_slots INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scholarship Applications
CREATE TABLE scholarship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_code VARCHAR(20) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES scholarship_programs(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected', 'Paid')),
    documents_submitted JSONB DEFAULT '[]',
    eligibility_check JSONB,
    remarks TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disbursements
CREATE TABLE disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disbursement_code VARCHAR(20) UNIQUE NOT NULL,
    application_id UUID NOT NULL REFERENCES scholarship_applications(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('GCash', 'Bank Transfer', 'Check', 'Cash')),
    payment_details JSONB,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
    scheduled_date DATE,
    processed_date DATE,
    transaction_reference VARCHAR(100),
    remarks TEXT,
    processed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work-Study Jobs
CREATE TABLE workstudy_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_code VARCHAR(20) UNIQUE NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) CHECK (job_type IN ('Work-Study', 'OJT')),
    qualifications TEXT,
    slots_available INT DEFAULT 0,
    schedule TEXT,
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    deadline_date DATE,
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work-Study Applications
CREATE TABLE workstudy_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_code VARCHAR(20) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES workstudy_jobs(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected')),
    interest_statement TEXT,
    documents_submitted JSONB DEFAULT '[]',
    remarks TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_code VARCHAR(20) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(50) CHECK (document_type IN ('Report Card', 'Certificate', 'ID', 'Tax Return', 'Contract', 'Other')),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Application', 'Disbursement', 'WorkStudy', 'Attendance', 'Deadline', 'Announcement', 'System')),
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES (For Performance)
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_partner_schools_school_id ON partner_schools(school_id);
CREATE INDEX idx_partner_schools_status ON partner_schools(partnership_status);
CREATE INDEX idx_scholarship_applications_student_id ON scholarship_applications(student_id);
CREATE INDEX idx_scholarship_applications_program_id ON scholarship_applications(program_id);
CREATE INDEX idx_scholarship_applications_status ON scholarship_applications(status);
CREATE INDEX idx_disbursements_application_id ON disbursements(application_id);
CREATE INDEX idx_disbursements_status ON disbursements(status);
CREATE INDEX idx_workstudy_jobs_status ON workstudy_jobs(status);
CREATE INDEX idx_workstudy_applications_student_id ON workstudy_applications(student_id);
CREATE INDEX idx_workstudy_applications_job_id ON workstudy_applications(job_id);
CREATE INDEX idx_workstudy_applications_status ON workstudy_applications(status);
CREATE INDEX idx_documents_student_id ON documents(student_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- TRIGGERS (For Real-Time Notifications)
-- ============================================================

-- Function to send notification on status change
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM pg_notify(
            'status_change',
            json_build_object(
                'table', TG_TABLE_NAME,
                'id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'updated_at', NOW()
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to scholarship_applications
CREATE TRIGGER scholarship_applications_status_change
AFTER UPDATE ON scholarship_applications
FOR EACH ROW
EXECUTE FUNCTION notify_status_change();

-- Apply trigger to workstudy_applications
CREATE TRIGGER workstudy_applications_status_change
AFTER UPDATE ON workstudy_applications
FOR EACH ROW
EXECUTE FUNCTION notify_status_change();

-- Apply trigger to disbursements
CREATE TRIGGER disbursements_status_change
AFTER UPDATE ON disbursements
FOR EACH ROW
EXECUTE FUNCTION notify_status_change();

-- ============================================================
-- SEED DATA (Optional - For Testing)
-- ============================================================

-- Insert sample partner schools
INSERT INTO partner_schools (school_id, school_name, school_type, address, contact_person, contact_number, email, partnership_status, partnership_start, partnership_end, programs_offered, scholarship_slots)
VALUES 
('SCH-001', 'Bestlink College of the Philippines', 'Private', 'Novaliches, Quezon City', 'Juan Dela Cruz', '0912-345-6789', 'admissions@bestlink.edu.ph', 'Active', '2026-01-01', '2028-12-31', 'BSIT, BSCS, BSA', 100),
('SCH-002', 'Quezon City University', 'LUC', 'Quezon City', 'Maria Santos', '0917-123-4567', 'registrar@qcu.edu.ph', 'Active', '2025-06-01', '2027-05-31', 'BSIT, BSBA, BSCE', 150);

-- Insert sample scholarship programs
INSERT INTO scholarship_programs (program_code, program_name, description, category, eligibility_criteria, grant_amount, grant_type, application_start, application_end, status, total_slots)
VALUES 
('SCH-001', 'QC Excel Scholarship', 'For top-performing students in priority courses', 'Academic', 'GWA >= 1.5, QC Resident', 110000.00, 'Full Grant', '2026-06-01', '2026-07-31', 'Active', 50),
('SCH-002', 'QC Economic Scholarship', 'For students from low-income households', 'Economic', 'Income <= 250,000/yr, QC Resident', 40000.00, 'Tuition Fee', '2026-06-01', '2026-07-31', 'Active', 100);

-- Insert sample work-study jobs
INSERT INTO workstudy_jobs (job_code, job_title, description, department, job_type, qualifications, slots_available, schedule, contact_person, contact_email, deadline_date, status)
VALUES 
('WS-001', 'Library Assistant', 'Assist in library operations and student inquiries', 'Quezon City Public Library', 'Work-Study', 'Must be enrolled, Good communication skills', 5, '8:00 AM - 5:00 PM', 'Maria Santos', 'library@qc.gov.ph', '2026-08-31', 'Open'),
('WS-002', 'IT Intern', 'Provide IT support and assist with systems maintenance', 'City IT Department', 'OJT', 'BSIT or BSCS student, Knowledge of basic networking', 3, '8:00 AM - 5:00 PM', 'John Reyes', 'it@qc.gov.ph', '2026-09-15', 'Open');

# ============================================================
# 6. BACKEND CODE (Node.js + Express + TypeScript)
# ============================================================

# Generate these files in the /backend/src folder:

# ============================================================
# 6.1. CONFIGURATION
# ============================================================

# /backend/src/config/database.ts
"""
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const connectDB = async () => {
    try {
        await pool.connect();
        console.log('✅ Connected to PostgreSQL 16');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
"""

# ============================================================
# 6.2. MODELS
# ============================================================

# /backend/src/models/User.ts
"""
export interface User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: 'student' | 'admin' | 'supervisor' | 'school_coordinator' | 'treasury' | 'system_admin';
    status: 'active' | 'inactive' | 'pending';
    email_verified: boolean;
    mfa_enabled: boolean;
    mfa_secret?: string;
    trusted_devices?: any[];
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}
"""

# /backend/src/models/ScholarshipApplication.ts
"""
export interface ScholarshipApplication {
    id: string;
    application_code: string;
    student_id: string;
    program_id: string;
    status: 'Submitted' | 'Under Review' | 'Interview Scheduled' | 'Approved' | 'Rejected' | 'Paid';
    documents_submitted: any[];
    eligibility_check?: any;
    remarks?: string;
    reviewed_by?: string;
    reviewed_at?: Date;
    created_at: Date;
    updated_at: Date;
}
"""

# /backend/src/models/WorkStudyApplication.ts
"""
export interface WorkStudyApplication {
    id: string;
    application_code: string;
    student_id: string;
    job_id: string;
    status: 'Submitted' | 'Under Review' | 'Interview Scheduled' | 'Approved' | 'Rejected';
    interest_statement?: string;
    documents_submitted: any[];
    remarks?: string;
    reviewed_by?: string;
    reviewed_at?: Date;
    created_at: Date;
    updated_at: Date;
}
"""

# (Continue with all other model files similarly)

# ============================================================
# 6.3. AUTHENTICATION SERVICE
# ============================================================

# /backend/src/services/auth.service.ts
"""
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';

export class AuthService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
    private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

    static generateToken(userId: string, email: string, role: string): string {
        return jwt.sign(
            { userId, email, role },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );
    }

    static async verifyToken(token: string): Promise<any> {
        try {
            return jwt.verify(token, this.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    static async getUserByEmail(email: string): Promise<any> {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }

    static async getUserById(id: string): Promise<any> {
        const result = await pool.query('SELECT id, email, first_name, last_name, role, status FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
}
"""

# ============================================================
# 6.4. AUTH CONTROLLER
# ============================================================

# /backend/src/controllers/auth.controller.ts
"""
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, first_name, last_name, role } = req.body;

        // Check if user exists
        const existingUser = await AuthService.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const password_hash = await AuthService.hashPassword(password);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING id, email, first_name, last_name, role`,
            [email, password_hash, first_name, last_name, role || 'student']
        );

        const user = result.rows[0];

        // Generate token
        const token = AuthService.generateToken(user.id, user.email, user.role);

        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await AuthService.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await AuthService.comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Account is not active' });
        }

        // Update last login
        await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

        const token = AuthService.generateToken(user.id, user.email, user.role);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const user = await AuthService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
"""

# ============================================================
# 6.5. SCHOLARSHIP CONTROLLER
# ============================================================

# /backend/src/controllers/scholarship.controller.ts
"""
import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getPrograms = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT * FROM scholarship_programs 
             WHERE status = 'Active' OR status = 'Upcoming'
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get programs error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProgramById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM scholarship_programs WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Program not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get program error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const applyForScholarship = async (req: Request, res: Response) => {
    try {
        const { program_id, documents, consent } = req.body;
        const studentId = (req as any).user.userId;

        if (!consent) {
            return res.status(400).json({ message: 'Consent is required' });
        }

        // Check if student already applied
        const existing = await pool.query(
            'SELECT * FROM scholarship_applications WHERE student_id = $1 AND program_id = $2',
            [studentId, program_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'You have already applied for this scholarship' });
        }

        // Get student record
        const studentResult = await pool.query(
            'SELECT * FROM students WHERE user_id = $1',
            [studentId]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // Generate application code
        const codeResult = await pool.query(
            "SELECT 'APP-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(application_code, 5) AS INTEGER)), 0) + 1, 3, '0') AS code FROM scholarship_applications"
        );
        const application_code = codeResult.rows[0].code;

        // Insert application
        const result = await pool.query(
            `INSERT INTO scholarship_applications 
             (application_code, student_id, program_id, documents_submitted, status)
             VALUES ($1, $2, $3, $4, 'Submitted')
             RETURNING *`,
            [application_code, studentId, program_id, JSON.stringify(documents || [])]
        );

        res.status(201).json({
            message: 'Application submitted successfully',
            application: result.rows[0]
        });
    } catch (error) {
        console.error('Apply scholarship error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyApplications = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user.userId;

        const result = await pool.query(
            `SELECT a.*, p.program_name, p.grant_amount, p.category
             FROM scholarship_applications a
             JOIN scholarship_programs p ON a.program_id = p.id
             WHERE a.student_id = $1
             ORDER BY a.created_at DESC`,
            [studentId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getApplicationStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const studentId = (req as any).user.userId;

        const result = await pool.query(
            `SELECT a.*, p.program_name, p.grant_amount
             FROM scholarship_applications a
             JOIN scholarship_programs p ON a.program_id = p.id
             WHERE a.id = $1 AND a.student_id = $2`,
            [id, studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get application status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
"""

# ============================================================
# 6.6. WORK-STUDY CONTROLLER
# ============================================================

# /backend/src/controllers/workstudy.controller.ts
"""
import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getJobs = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT * FROM workstudy_jobs 
             WHERE status = 'Open'
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getJobById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM workstudy_jobs WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const applyForWorkStudy = async (req: Request, res: Response) => {
    try {
        const { job_id, interest_statement } = req.body;
        const studentId = (req as any).user.userId;

        // Check if student already applied
        const existing = await pool.query(
            'SELECT * FROM workstudy_applications WHERE student_id = $1 AND job_id = $2',
            [studentId, job_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Check if job is still open
        const jobResult = await pool.query(
            'SELECT * FROM workstudy_jobs WHERE id = $1 AND status = \'Open\'',
            [job_id]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({ message: 'Job not available' });
        }

        // Generate application code
        const codeResult = await pool.query(
            "SELECT 'WSA-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(application_code, 5) AS INTEGER)), 0) + 1, 3, '0') AS code FROM workstudy_applications"
        );
        const application_code = codeResult.rows[0].code;

        // Insert application
        const result = await pool.query(
            `INSERT INTO workstudy_applications 
             (application_code, student_id, job_id, interest_statement, status)
             VALUES ($1, $2, $3, $4, 'Submitted')
             RETURNING *`,
            [application_code, studentId, job_id, interest_statement || '']
        );

        res.status(201).json({
            message: 'Application submitted successfully',
            application: result.rows[0]
        });
    } catch (error) {
        console.error('Apply work-study error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyWorkStudyApplications = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user.userId;

        const result = await pool.query(
            `SELECT a.*, j.job_title, j.department, j.job_type
             FROM workstudy_applications a
             JOIN workstudy_jobs j ON a.job_id = j.id
             WHERE a.student_id = $1
             ORDER BY a.created_at DESC`,
            [studentId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get work-study applications error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
"""

# ============================================================
# 6.7. AUTH MIDDLEWARE
# ============================================================

# /backend/src/middleware/auth.middleware.ts
"""
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = await AuthService.verifyToken(token);
        
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};
"""

# ============================================================
# 6.8. ROUTES
# ============================================================

# /backend/src/routes/auth.routes.ts
"""
import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;
"""

# /backend/src/routes/scholarship.routes.ts
"""
import { Router } from 'express';
import { 
    getPrograms, 
    getProgramById, 
    applyForScholarship, 
    getMyApplications,
    getApplicationStatus
} from '../controllers/scholarship.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/programs', getPrograms);
router.get('/programs/:id', getProgramById);
router.post('/apply', authenticate, applyForScholarship);
router.get('/my-applications', authenticate, getMyApplications);
router.get('/my-applications/:id', authenticate, getApplicationStatus);

export default router;
"""

# /backend/src/routes/workstudy.routes.ts
"""
import { Router } from 'express';
import { 
    getJobs, 
    getJobById, 
    applyForWorkStudy, 
    getMyWorkStudyApplications
} from '../controllers/workstudy.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobById);
router.post('/apply', authenticate, applyForWorkStudy);
router.get('/my-applications', authenticate, getMyWorkStudyApplications);

export default router;
"""

# /backend/src/routes/index.ts
"""
import { Router } from 'express';
import authRoutes from './auth.routes';
import scholarshipRoutes from './scholarship.routes';
import workstudyRoutes from './workstudy.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/scholarship', scholarshipRoutes);
router.use('/workstudy', workstudyRoutes);

router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
"""

# ============================================================
# 6.9. MAIN SERVER
# ============================================================

# /backend/src/index.ts
"""
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
});

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
"""

# ============================================================
# 6.10. WEBSOCKET SERVER (Real-Time)
# ============================================================

# /backend/src/websocket/server.ts
"""
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { pool } from '../config/database';

let io: SocketServer;

export const initWebSocket = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 New WebSocket connection:', socket.id);

        socket.on('subscribe', async (userId: string) => {
            socket.join(`user_${userId}`);
            console.log(`📡 User ${userId} subscribed`);
        });

        socket.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected:', socket.id);
        });
    });

    // PostgreSQL LISTEN/NOTIFY
    const client = await pool.connect();
    await client.query('LISTEN status_change');
    
    client.on('notification', (msg) => {
        try {
            const payload = JSON.parse(msg.payload);
            io.emit('status_change', payload);
            console.log('📨 Real-time notification sent:', payload);
        } catch (error) {
            console.error('⚠️ Error processing notification:', error);
        }
    });

    return io;
};

export const getIO = () => io;
"""

# ============================================================
# 7. FRONTEND INTEGRATION (Axios)
# ============================================================

# /frontend/src/services/api.ts
"""
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================================
// API Service Functions
// ============================================================

// AUTH
export const auth = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
};

// SCHOLARSHIP
export const scholarship = {
    getPrograms: () => api.get('/scholarship/programs'),
    getProgram: (id: string) => api.get(`/scholarship/programs/${id}`),
    apply: (data: any) => api.post('/scholarship/apply', data),
    getMyApplications: () => api.get('/scholarship/my-applications'),
    getApplicationStatus: (id: string) => api.get(`/scholarship/my-applications/${id}`),
};

// WORK-STUDY
export const workstudy = {
    getJobs: () => api.get('/workstudy/jobs'),
    getJob: (id: string) => api.get(`/workstudy/jobs/${id}`),
    apply: (data: any) => api.post('/workstudy/apply', data),
    getMyApplications: () => api.get('/workstudy/my-applications'),
};
"""

# ============================================================
# 8. DOCKER SETUP (Optional)
# ============================================================

# /docker-compose.yml
"""
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: campus_aid_hub_db
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: campus_aid_hub
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - campus_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: campus_aid_hub_backend
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://admin:admin123@postgres:5432/campus_aid_hub
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - campus_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: campus_aid_hub_frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:5000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - campus_network

networks:
  campus_network:
    driver: bridge

volumes:
  postgres_data:
"""

# /backend/Dockerfile
"""
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx tsc

EXPOSE 5000

CMD ["node", "dist/index.js"]
"""

# /frontend/Dockerfile
"""
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
"""

# ============================================================
# 9. RUN THE SYSTEM
# ============================================================

# Option 1: Run with Docker
# docker-compose up -d

# Option 2: Run without Docker
# 1. Start PostgreSQL 16
# 2. cd backend && npm run dev
# 3. cd frontend && npm run dev

# ============================================================
# END OF SCRIPT
# ============================================================