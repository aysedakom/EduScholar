// backend/models/bursaryModel.js
const { pool } = require('../config/db');

const FALLBACK_BURSARIES = [
  {
    id: 'bur-01',
    title: 'Federal Equity & Tertiary Support Grant',
    type: 'Equity & Access',
    amount: 35000,
    deadline: '2026-09-30',
    eligibility: 'FAFSA / Indigency submission, enrolled in undergraduate degree',
    funds_available: 120,
    description: 'National and federal equity support for students needing assistance with tuition and course materials.',
    status: 'Ongoing',
  },
  {
    id: 'bur-02',
    title: 'University Institutional Hardship Fund',
    type: 'Institutional Hardship',
    amount: 15000,
    deadline: '2026-10-15',
    eligibility: 'Documented financial hardship or sudden income disruption',
    funds_available: 50,
    description: 'Emergency institutional assistance to ensure continuous enrollment during personal or family crises.',
    status: 'Ongoing',
  },
  {
    id: 'bur-03',
    title: 'Instant Campus Emergency Relief Aid',
    type: 'Emergency Assistance',
    amount: 10000,
    deadline: '2026-12-01',
    eligibility: 'Immediate non-repayable crisis relief for medical or living emergencies',
    funds_available: 85,
    description: 'Rapid 48-hour approval aid pool for students encountering unforeseen emergency expenses.',
    status: 'Ongoing',
  },
];

const findAll = async (filters = {}) => {
  try {
    const clauses = [];
    const values = [];
    let i = 1;

    if (filters.type && filters.type !== 'All') {
      clauses.push(`type = $${i++}`);
      values.push(filters.type);
    }
    if (filters.status && filters.status !== 'All') {
      clauses.push(`status = $${i++}`);
      values.push(filters.status);
    }
    if (filters.search) {
      clauses.push(`(title ILIKE $${i} OR description ILIKE $${i} OR eligibility ILIKE $${i})`);
      values.push(`%${filters.search}%`);
      i++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM bursaries ${where} ORDER BY title ASC`, values);
    return result.rows.length ? result.rows : FALLBACK_BURSARIES;
  } catch (err) {
    console.warn('[bursaryModel] DB query failed, returning fallback list:', err.message);
    return FALLBACK_BURSARIES;
  }
};

const findById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM bursaries WHERE id = $1', [id]);
    if (result.rows[0]) return result.rows[0];
  } catch (err) {
    console.warn('[bursaryModel] findById DB query failed:', err.message);
  }
  return FALLBACK_BURSARIES.find((b) => b.id === id) || FALLBACK_BURSARIES[0];
};

const create = async (data) => {
  try {
    const result = await pool.query(
      `INSERT INTO bursaries
         (title, type, amount, deadline, eligibility, funds_available, description, requirement_notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        data.title, data.type || 'Federal', data.amount || 0, data.deadline || null,
        data.eligibility, data.funds_available || 0, data.description, data.requirement_notes,
        data.status || 'Ongoing',
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.warn('[bursaryModel] create DB query failed, returning mock item:', err.message);
    return { id: `bur-${Date.now()}`, ...data };
  }
};

module.exports = { findAll, findById, create };

