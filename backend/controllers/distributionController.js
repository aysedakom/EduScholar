// backend/controllers/distributionController.js
const { pool } = require('../config/db');

// @desc   Get all school aid distribution batches
// @route  GET /api/distributions
const getDistributions = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const clauses = [];
    const values = [];
    let i = 1;

    if (status && status !== 'All') {
      clauses.push(`status = $${i++}`);
      values.push(status);
    }
    if (category && category !== 'All') {
      clauses.push(`category = $${i++}`);
      values.push(category);
    }
    if (search) {
      clauses.push(`(batch_code ILIKE $${i} OR program_name ILIKE $${i} OR fund_source ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM school_aid_distributions ${where} ORDER BY payout_date DESC, id DESC`,
      values
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[distributionController] getDistributions error:', error);
    res.status(500).json({ message: 'Failed to fetch distribution batches' });
  }
};

// @desc   Create a new school aid distribution batch
// @route  POST /api/distributions
const createDistribution = async (req, res) => {
  try {
    const {
      batchCode, programName, category, term, beneficiaryCount,
      totalAmount, disbursementChannel, payoutDate, status, fundSource
    } = req.body;

    const result = await pool.query(
      `INSERT INTO school_aid_distributions
         (batch_code, program_name, category, term, beneficiary_count, total_amount,
          disbursement_channel, payout_date, status, fund_source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        batchCode || `BATCH-${Date.now()}`,
        programName,
        category || 'Tertiary Level',
        term || '1st Sem AY 2026-2027',
        beneficiaryCount || 0,
        totalAmount || 0,
        disbursementChannel || 'Landbank ATM / Cash Card',
        payoutDate || new Date().toISOString().split('T')[0],
        status || 'Processing',
        fundSource || 'QCYDO General Scholarship Fund 2026'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[distributionController] createDistribution error:', error);
    res.status(500).json({ message: 'Failed to create distribution batch: ' + error.message });
  }
};

// @desc   Update distribution batch status
// @route  PATCH /api/distributions/:id/status
const updateDistributionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE school_aid_distributions SET status = $2 WHERE id = $1 RETURNING *`,
      [req.params.id, status]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Distribution batch not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[distributionController] updateDistributionStatus error:', error);
    res.status(500).json({ message: 'Failed to update distribution status' });
  }
};

module.exports = { getDistributions, createDistribution, updateDistributionStatus };
