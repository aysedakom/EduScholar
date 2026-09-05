// backend/controllers/registryController.js
const { pool } = require('../config/db');

// @desc   Get scholars from student registry
// @route  GET /api/registry
const getScholars = async (req, res) => {
  try {
    const { status, school, search } = req.query;
    const clauses = [];
    const values = [];
    let i = 1;

    if (status && status !== 'All') {
      clauses.push(`status = $${i++}`);
      values.push(status);
    }
    if (school && school !== 'All') {
      clauses.push(`school ILIKE $${i++}`);
      values.push(`%${school}%`);
    }
    if (search) {
      clauses.push(`(full_name ILIKE $${i} OR student_id ILIKE $${i} OR email ILIKE $${i} OR program_name ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM student_registry ${where} ORDER BY full_name ASC`,
      values
    );
    res.json(result.rows);
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
      } catch (appSyncErr) {
        console.warn('[registryController] Application sync warning:', appSyncErr.message);
      }
    }

    res.json(scholar);
  } catch (error) {
    console.error('[registryController] updateScholarStatus error:', error);
    res.status(500).json({ message: 'Failed to update scholar' });
  }
};

module.exports = { getScholars, addScholar, updateScholarStatus };
