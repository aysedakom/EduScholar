// backend/models/disbursementModel.js
const { pool } = require('../config/db');

/**
 * Ensures disbursements table exists for Model A tracking
 */
async function ensureDisbursementTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS disbursements (
        id SERIAL PRIMARY KEY,
        disbursement_id VARCHAR(100) UNIQUE NOT NULL,
        student_id VARCHAR(100) NOT NULL,
        application_id VARCHAR(100) NOT NULL,
        amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'PHP',
        initiated_by VARCHAR(100) NOT NULL,
        approved_by VARCHAR(100),
        status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ELIGIBLE', 'SCHEDULED', 'PROCESSING', 'RELEASED', 'RECONCILED', 'ON_HOLD', 'CANCELLED')),
        bank_reference VARCHAR(100),
        notes TEXT,
        initiated_at TIMESTAMPTZ DEFAULT NOW(),
        approved_at TIMESTAMPTZ,
        released_at TIMESTAMPTZ
      );
    `);
  } catch (err) {
    console.warn('[DisbursementModel] Table check warning:', err.message);
  }
}

/**
 * Initiate disbursement record (Stage 6)
 */
async function createDisbursement({ disbursementId, studentId, applicationId, amount, initiatedBy, notes }) {
  await ensureDisbursementTable();
  const res = await pool.query(
    `INSERT INTO disbursements (disbursement_id, student_id, application_id, amount, initiated_by, status, notes, initiated_at)
     VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, NOW())
     RETURNING *`,
    [disbursementId, studentId, applicationId, amount, initiatedBy, notes]
  );
  return res.rows[0];
}

/**
 * Approve disbursement with mandatory Segregation of Duties enforcement
 */
async function approveDisbursement({ disbursementId, approvedBy, notes }) {
  await ensureDisbursementTable();
  const check = await pool.query(`SELECT * FROM disbursements WHERE disbursement_id = $1`, [disbursementId]);
  if (check.rows.length === 0) {
    throw new Error(`Disbursement ${disbursementId} not found`);
  }

  const record = check.rows[0];
  if (record.initiated_by === approvedBy) {
    throw new Error('Segregation of duties violation: Initiator cannot approve own disbursement');
  }

  const res = await pool.query(
    `UPDATE disbursements 
     SET approved_by = $1, status = 'SCHEDULED', notes = COALESCE($2, notes), approved_at = NOW()
     WHERE disbursement_id = $3
     RETURNING *`,
    [approvedBy, notes, disbursementId]
  );
  return res.rows[0];
}

module.exports = {
  createDisbursement,
  approveDisbursement,
  ensureDisbursementTable,
};
