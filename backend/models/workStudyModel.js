// backend/models/workStudyModel.js
const { pool } = require('../config/db');

const FALLBACK_JOBS = [
  {
    id: 1,
    job_code: 'WS-QC-001',
    title: 'QCU Library Technical Assistant',
    department: 'University Library',
    location: 'QCU San Bartolome Campus',
    hourly_rate: 120.00,
    max_hours_per_week: 20,
    slots_available: 5,
    slots_filled: 2,
    supervisor_name: 'Ms. Maria Teresa Santos',
    supervisor_email: 'library.supervisor@qcu.edu.ph',
    description: 'Assisting librarians with digital cataloging, shelf organization, and student inquiry desk service.',
    requirements: ['Enrolled Student', 'Good Standing (GWA 2.25 or better)', 'Computer Literate'],
    status: 'Open',
  },
  {
    id: 2,
    job_code: 'WS-QC-002',
    title: 'IT Computer Lab Technical Aide',
    department: 'College of Computer Studies',
    location: 'QCU IT Building Floor 3',
    hourly_rate: 135.00,
    max_hours_per_week: 15,
    slots_available: 4,
    slots_filled: 1,
    supervisor_name: 'Prof. Engr. Mark Anthony Reyes',
    supervisor_email: 'itlab.supervisor@qcu.edu.ph',
    description: 'Maintaining PC hardware setup, network cable checks, software installations, and lab assistant duties during programming classes.',
    requirements: ['BSIT / BSCS Student', 'Passing Grades', 'Basic Hardware & Linux Knowledge'],
    status: 'Open',
  },
  {
    id: 3,
    job_code: 'WS-QC-003',
    title: 'Student Registrar Records Assistant',
    department: 'Office of the University Registrar',
    location: 'Admin Building Room 102',
    hourly_rate: 115.00,
    max_hours_per_week: 20,
    slots_available: 6,
    slots_filled: 3,
    supervisor_name: 'Dr. Aris Ramos (Registrar)',
    supervisor_email: 'registrar.supervisor@qcu.edu.ph',
    description: 'Sorting student transcript requests, scanning enrollment forms, data entry, and student queuing management.',
    requirements: ['Enrolled Student', 'Attention to Detail', 'Data Privacy Agreement Signee'],
    status: 'Open',
  },
  {
    id: 4,
    job_code: 'WS-QC-004',
    title: 'QCYDO Youth Program Student Facilitator',
    department: 'Quezon City Youth Development Office',
    location: 'QC Hall Annex Bldg',
    hourly_rate: 140.00,
    max_hours_per_week: 15,
    slots_available: 8,
    slots_filled: 4,
    supervisor_name: 'Mr. John Steaven Balansag',
    supervisor_email: 'qcydo.supervisor@qc.gov.ph',
    description: 'Coordinating community outreach programs, registration desk management for city scholar orientation events, and social media posting.',
    requirements: ['Active QC Resident', 'Strong Communication Skills', 'Leadership Experience'],
    status: 'Open',
  },
];

const getJobs = async (filters = {}) => {
  try {
    const clauses = [];
    const values = [];
    let i = 1;

    if (filters.department && filters.department !== 'All') {
      clauses.push(`department = $${i++}`);
      values.push(filters.department);
    }
    if (filters.status && filters.status !== 'All') {
      clauses.push(`status = $${i++}`);
      values.push(filters.status);
    }
    if (filters.search) {
      clauses.push(`(title ILIKE $${i} OR description ILIKE $${i} OR department ILIKE $${i})`);
      values.push(`%${filters.search}%`);
      i++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM work_study_jobs ${where} ORDER BY id ASC`, values);
    return result.rows.length ? result.rows : FALLBACK_JOBS;
  } catch (err) {
    console.warn('[workStudyModel] getJobs query failed, returning fallbacks:', err.message);
    return FALLBACK_JOBS;
  }
};

const getJobById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM work_study_jobs WHERE id = $1 OR job_code = $1::text', [id]);
    if (result.rows[0]) return result.rows[0];
  } catch (err) {
    console.warn('[workStudyModel] getJobById query failed:', err.message);
  }
  return FALLBACK_JOBS.find((j) => String(j.id) === String(id) || j.job_code === id) || FALLBACK_JOBS[0];
};

const createJob = async (jobData) => {
  try {
    const jobCode = jobData.job_code || `WS-QC-${Date.now().toString().slice(-4)}`;
    const result = await pool.query(
      `INSERT INTO work_study_jobs 
       (job_code, title, department, location, hourly_rate, max_hours_per_week, slots_available, slots_filled, supervisor_name, supervisor_email, description, requirements, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        jobCode,
        jobData.title,
        jobData.department,
        jobData.location || 'Quezon City Campus',
        jobData.hourly_rate || 120.00,
        jobData.max_hours_per_week || 20,
        jobData.slots_available || 5,
        jobData.slots_filled || 0,
        jobData.supervisor_name || 'Department Supervisor',
        jobData.supervisor_email || 'supervisor@qcu.edu.ph',
        jobData.description,
        JSON.stringify(jobData.requirements || []),
        jobData.status || 'Open',
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.error('[workStudyModel] createJob failed:', err.message);
    throw err;
  }
};

const logHours = async (logData) => {
  try {
    const logCode = `LOG-WS-${Date.now().toString().slice(-6)}`;
    const result = await pool.query(
      `INSERT INTO work_study_logs
       (log_code, application_id, user_id, job_id, work_date, clock_in, clock_out, hours_logged, tasks_completed, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        logCode,
        logData.application_id || null,
        logData.user_id,
        logData.job_id,
        logData.work_date || new Date().toISOString().split('T')[0],
        logData.clock_in,
        logData.clock_out,
        logData.hours_logged,
        logData.tasks_completed,
        logData.status || 'Pending Approval',
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.error('[workStudyModel] logHours failed:', err.message);
    throw err;
  }
};

const getLogs = async (filters = {}) => {
  try {
    const clauses = [];
    const values = [];
    let i = 1;

    if (filters.user_id) {
      clauses.push(`l.user_id = $${i++}`);
      values.push(filters.user_id);
    }
    if (filters.job_id) {
      clauses.push(`l.job_id = $${i++}`);
      values.push(filters.job_id);
    }
    if (filters.status && filters.status !== 'All') {
      clauses.push(`l.status = $${i++}`);
      values.push(filters.status);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT l.*, u.name as student_name, u.email as student_email, u.student_id,
              j.title as job_title, j.department as job_department, j.hourly_rate
       FROM work_study_logs l
       LEFT JOIN users u ON l.user_id = u.id
       LEFT JOIN work_study_jobs j ON l.job_id = j.id
       ${where}
       ORDER BY l.work_date DESC, l.id DESC`,
      values
    );
    return result.rows;
  } catch (err) {
    console.error('[workStudyModel] getLogs failed:', err.message);
    return [];
  }
};

const updateLogStatus = async (id, status, supervisorRemarks, approvedBy) => {
  try {
    const approvedAt = status === 'Approved' ? new Date() : null;
    const result = await pool.query(
      `UPDATE work_study_logs
       SET status = $2,
           supervisor_remarks = COALESCE($3, supervisor_remarks),
           approved_by = $4,
           approved_at = $5
       WHERE id = $1
       RETURNING *`,
      [id, status, supervisorRemarks || null, approvedBy || null, approvedAt]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('[workStudyModel] updateLogStatus failed:', err.message);
    throw err;
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  logHours,
  getLogs,
  updateLogStatus,
};
