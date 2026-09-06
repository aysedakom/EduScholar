// backend/controllers/registryController.js
const { pool } = require('../config/db');

// @desc   Get scholars from student registry
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
      return res.json(result.rows);
    } catch (joinErr) {
      console.warn('[registryController] Detailed JOIN query warning, falling back to simple query:', joinErr.message);
      // Fallback simple query
      const fallbackClauses = [];
      const fallbackValues = [];
      let fi = 1;
      if (status && status !== 'All') {
        fallbackClauses.push(`status = $${fi++}`);
        fallbackValues.push(status);
      }
      if (school && school !== 'All') {
        fallbackClauses.push(`school ILIKE $${fi++}`);
        fallbackValues.push(`%${school}%`);
      }
      if (search) {
        fallbackClauses.push(`(full_name ILIKE $${fi} OR student_id ILIKE $${fi} OR email ILIKE $${fi} OR program_name ILIKE $${fi})`);
        fallbackValues.push(`%${search}%`);
        fi++;
      }
      const fallbackWhere = fallbackClauses.length ? `WHERE ${fallbackClauses.join(' AND ')}` : '';
      const fallbackRes = await pool.query(
        `SELECT * FROM student_registry ${fallbackWhere} ORDER BY full_name ASC`,
        fallbackValues
      );
      return res.json(fallbackRes.rows);
    }
  } catch (error) {
    console.error('[registryController] getScholars error:', error);
    res.status(500).json({ message: 'Failed to fetch student registry' });
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
    const result = await pool.query(
      `UPDATE student_registry 
       SET status = COALESCE($2, status),
           disbursement_status = COALESCE($3, disbursement_status),
           gwa = COALESCE($4, gwa),
           updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id, status || null, disbursementStatus || null, gwa || null]
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
           WHERE (user_id = $1 OR student_id = $2) AND LOWER(status) IN ('approved', 'granted')`,
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
           WHERE (user_id = $1 OR student_id = $2)`,
          [scholar.user_id, scholar.student_id]
        );
      } catch (revertErr) {
        console.warn('[registryController] Revert application sync warning:', revertErr.message);
      }
    }

    res.json(scholar);
  } catch (error) {
    console.error('[registryController] updateScholarStatus error:', error);
    res.status(500).json({ message: 'Failed to update scholar' });
  }
};

module.exports = { getScholars, addScholar, updateScholarStatus };
