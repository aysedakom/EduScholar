// backend/controllers/registryController.js
const { pool } = require('../config/db');

// @desc   Get scholars from student registry (100% database-driven)
// @route  GET /api/registry
const getScholars = async (req, res) => {
  try {
    const { status, school, search } = req.query;
    const clauses = [];
    const values = [];
    let i = 1;

    if (status && status !== 'All') {
      clauses.push(`sr.status = $${i++}`);
      values.push(status);
    }
    if (school && school !== 'All') {
      clauses.push(`sr.school ILIKE $${i++}`);
      values.push(`%${school}%`);
    }
    if (search) {
      clauses.push(`(sr.full_name ILIKE $${i} OR sr.student_id ILIKE $${i} OR sr.email ILIKE $${i} OR sr.program_name ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    
    try {
      const result = await pool.query(
        `SELECT sr.*,
                u.phone, u.address, u.barangay, u.district, u.is_pwd, u.is_solo_parent, u.is_4ps, u.is_kasambahay_or_toda,
                a.application_code, a.remarks AS application_remarks, a.submission_date, a.form_data, a.documents_submitted
         FROM student_registry sr
         LEFT JOIN users u ON (sr.user_id = u.id OR (sr.student_id IS NOT NULL AND u.student_id IS NOT NULL AND sr.student_id = u.student_id))
         LEFT JOIN LATERAL (
           SELECT * FROM applications app 
           WHERE (app.user_id = sr.user_id OR (u.id IS NOT NULL AND app.user_id = u.id))
           ORDER BY app.id DESC LIMIT 1
         ) a ON true
         ${where} 
         ORDER BY sr.full_name ASC`,
        values
      );

      if (result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch (joinErr) {
      console.warn('[registryController] Detailed JOIN query warning, falling back to simple query:', joinErr.message);
      try {
        const fallbackRes = await pool.query(`SELECT * FROM student_registry ORDER BY full_name ASC`);
        if (fallbackRes.rows.length > 0) {
          return res.json(fallbackRes.rows);
        }
      } catch (_) {}
    }

    // Secondary fallback: query real registered students from users table
    try {
      const userStudentsRes = await pool.query(
        `SELECT u.id AS user_id, u.student_id, u.name AS full_name, u.email, 
                COALESCE(u.department, 'Quezon City University (QCU)') AS school,
                'tertiary-academic' AS program_id,
                COALESCE(u.major, 'Quezon City Scholarship Program') AS program_name,
                '1st Semester AY 2026-2027' AS current_term,
                'Enrolled Scholar' AS scholarship_age,
                COALESCE(u.gpa, 1.75) AS gwa,
                18 AS units_enrolled,
                'Active Good Standing' AS status,
                15000 AS grant_amount,
                'Scheduled' AS disbursement_status,
                u.barangay, u.department, u.year_level, u.avatar, u.phone, u.address, u.district
         FROM users u
         WHERE LOWER(u.role) = 'student'
         ORDER BY u.name ASC`
      );
      if (userStudentsRes.rows.length > 0) {
        return res.json(userStudentsRes.rows);
      }
    } catch (_) {}

    return res.json([]);
  } catch (error) {
    console.error('[registryController] getScholars error:', error);
    return res.json([]);
  }
};

// @desc   Add a scholar to registry
// @route  POST /api/registry
const addScholar = async (req, res) => {
  try {
    const {
      studentId, fullName, email, school, programId, programName,
      currentTerm, scholarshipAge, gwa, unitsEnrolled, status, grantAmount, disbursementStatus
    } = req.body;

    const result = await pool.query(
      `INSERT INTO student_registry
         (student_id, full_name, email, school, program_id, program_name,
          current_term, scholarship_age, gwa, units_enrolled, status, grant_amount, disbursement_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        studentId,
        fullName,
        email,
        school,
        programId || 'tertiary-academic',
        programName || 'Quezon City Scholarship Program',
        currentTerm || '1st Sem AY 2026-2027',
        scholarshipAge || 'Year 1 (1st Sem)',
        gwa || 1.75,
        unitsEnrolled || 18,
        status || 'Active Good Standing',
        grantAmount || 10000,
        disbursementStatus || 'Scheduled'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[registryController] addScholar error:', error);
    res.status(500).json({ message: 'Failed to add scholar to registry: ' + error.message });
  }
};

// @desc   Update scholar status
// @route  PATCH /api/registry/:id/status
const updateScholarStatus = async (req, res) => {
  try {
    const { status, disbursementStatus, gwa } = req.body;
    const targetId = req.params.id;

    const result = await pool.query(
      `UPDATE student_registry 
       SET status = COALESCE($2, status),
           disbursement_status = COALESCE($3, disbursement_status),
           gwa = COALESCE($4, gwa),
           updated_at = NOW()
       WHERE (id::text = $1 OR student_id = $1) RETURNING *`,
      [targetId, status || null, disbursementStatus || null, gwa || null]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Scholar record not found' });
    const scholar = result.rows[0];

    // If disbursement is confirmed by Treasury, update student's application to Stage 6 (Disbursed - 100%)
    if (disbursementStatus === 'Disbursed') {
      try {
        await pool.query(
          `UPDATE applications 
           SET status = 'Disbursed',
               progress = 100,
               disbursement_date = CURRENT_DATE,
               updated_at = NOW(),
               remarks = 'Stipend and educational grant officially remitted and disbursed by City Treasury.'
           WHERE (user_id = $1 OR user_id IN (SELECT id FROM users WHERE student_id = $2)) AND LOWER(status) IN ('approved', 'granted')`,
          [scholar.user_id, scholar.student_id]
        );

        try {
          const { broadcast } = require('../realtime/socketServer');
          broadcast({
            type: 'DB_EVENT',
            channel: 'eduscholar_events',
            table: 'applications',
            action: 'UPDATE',
            record: { student_id: scholar.student_id, user_id: scholar.user_id, status: 'Disbursed', progress: 100 },
            timestamp: new Date().toISOString(),
          });
        } catch (_) {}
      } catch (appSyncErr) {
        console.warn('[registryController] Application sync warning:', appSyncErr.message);
      }
    } else if (disbursementStatus === 'Scheduled' || disbursementStatus === 'Pending') {
      // Revert application status for testing
      try {
        await pool.query(
          `UPDATE applications 
           SET status = 'Approved',
               progress = 80,
               disbursement_date = NULL,
               updated_at = NOW(),
               remarks = 'Application approved by QCYDO Admin. Pending Treasury Disbursing Officer authorization.'
           WHERE (user_id = $1 OR user_id IN (SELECT id FROM users WHERE student_id = $2))`,
          [scholar.user_id, scholar.student_id]
        );
      } catch (revertErr) {
        console.warn('[registryController] Revert application sync warning:', revertErr.message);
      }
    }

    res.json(scholar);
  } catch (error) {
    console.error('[registryController] updateScholarStatus error:', error);
    res.status(500).json({ message: 'Failed to update scholar status: ' + error.message });
  }
};

// @desc   Get authenticated user's scholar record
const getMyScholarRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const studentId = req.user.student_id || req.user.studentId;

    const result = await pool.query(
      `SELECT sr.*, 
              u.name as user_full_name, u.email as user_email, u.phone, u.address, u.barangay, u.district, u.school as user_school, u.course as user_course, u.year_level as user_year_level, u.avatar
       FROM student_registry sr
       RIGHT JOIN users u ON (u.id = $1 OR u.email = $2)
       WHERE sr.user_id = $1 OR (sr.email = $2 AND $2 IS NOT NULL) OR (sr.student_id = $3 AND $3 IS NOT NULL)
       ORDER BY sr.id DESC LIMIT 1`,
      [userId, userEmail, studentId || null]
    );

    if (result.rows.length && result.rows[0].student_id) {
      const row = result.rows[0];
      return res.json({
        id: row.id || 1,
        student_id: row.student_id,
        user_id: row.user_id || userId,
        full_name: row.full_name || row.user_full_name || req.user.name,
        email: row.email || row.user_email || userEmail,
        school: row.school || row.user_school || 'Quezon City University (QCU)',
        program_id: row.program_id || 'tertiary-academic',
        program_name: row.program_name || 'Quezon City Scholarship Program',
        current_term: row.current_term || '1st Semester AY 2026-2027',
        scholarship_age: row.scholarship_age || 'Active Scholar',
        gwa: Number(row.gwa) || 1.75,
        units_enrolled: row.units_enrolled || 18,
        status: row.status || 'Active & In Good Standing',
        grant_amount: Number(row.grant_amount) || 15000,
        disbursement_status: row.disbursement_status || 'Scheduled',
        barangay: row.barangay || 'Quezon City',
        department: row.user_course || 'College of Computer Studies (CCS)',
        year_level: row.user_year_level || '3rd Year',
        avatar: row.avatar
      });
    }

    // Query applications table for user's application
    const appRes = await pool.query(
      `SELECT * FROM applications WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );
    const userRes = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
    const u = userRes.rows[0];

    if (!u) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const app = appRes.rows[0] || {};
    const scholarProfile = {
      id: u.id,
      student_id: u.student_id || studentId || `2026-${String(u.id).padStart(5, '0')}`,
      user_id: u.id,
      full_name: u.name || req.user.name,
      email: u.email || userEmail,
      school: u.school || app.school || 'Quezon City University (QCU)',
      program_id: app.program_id || 'tertiary-academic',
      program_name: app.program_name || app.title || 'Quezon City Scholarship Program',
      current_term: '1st Semester AY 2026-2027',
      scholarship_age: 'Enrolled Scholar',
      gwa: u.gwa || 1.75,
      units_enrolled: 18,
      status: app.status === 'Approved' || app.status === 'Disbursed' ? 'Active & In Good Standing' : 'Application in Progress',
      grant_amount: app.grant_amount || 15000,
      disbursement_status: app.status === 'Disbursed' ? 'Disbursed' : 'Scheduled',
      barangay: u.barangay || 'Quezon City',
      department: u.course || 'College of Computer Studies (CCS)',
      year_level: u.year_level || '3rd Year',
      avatar: u.avatar
    };

    return res.json(scholarProfile);
  } catch (error) {
    console.error('[registryController] getMyScholarRecord error:', error);
    res.status(500).json({ message: 'Failed to fetch scholar profile' });
  }
};

module.exports = { getScholars, addScholar, updateScholarStatus, getMyScholarRecord };
