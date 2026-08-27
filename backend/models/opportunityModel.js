// backend/models/opportunityModel.js
const { pool } = require('../config/db');

const FALLBACK_OPPORTUNITIES = [
  {
    id: 'opp-01',
    title: 'Quezon City Tertiary Education Subsidy (QCTES)',
    provider_name: 'Quezon City LGU & QCYDO',
    provider_logo: null,
    provider_type: 'Government',
    category: 'Scholarship',
    funding_type: 'Need-Based',
    eligibility_badge: 'QC Resident, Enrolled College Student',
    deadline: '2026-09-30',
    external_url: 'https://quezoncity.gov.ph',
    description: 'City-wide financial aid providing educational grants, book stipends, and connectivity subsidies.',
    amount: 25000,
    location: 'Quezon City',
    status: 'open',
  },
  {
    id: 'opp-02',
    title: 'QC Tech Giants STEM Excellence Grant',
    provider_name: 'QC Science & Tech Innovation Council',
    provider_logo: null,
    provider_type: 'Foundation',
    category: 'Grant',
    funding_type: 'Merit-Based',
    eligibility_badge: 'GWA 1.75 or better, STEM Field Major',
    deadline: '2026-09-25',
    external_url: 'https://qctechgiants.org',
    description: 'Merit award for promising tech innovators, developers, and engineers studying in QC universities.',
    amount: 50000,
    location: 'Quezon City / Remote',
    status: 'open',
  },
  {
    id: 'opp-03',
    title: 'University Library Student Assistantship',
    provider_name: 'Quezon City University Library',
    provider_logo: null,
    provider_type: 'University',
    category: 'Work-Study',
    funding_type: 'Work-Study',
    eligibility_badge: 'Active QCU Student, 15 hrs/week shift',
    deadline: '2026-09-10',
    external_url: null,
    description: 'Campus employment assisting library desk management, cataloging, and student research services.',
    amount: 18500,
    location: 'QCU Main Campus',
    status: 'open',
  },
];

const findAll = async (filters = {}) => {
  try {
    const clauses = [];
    const values = [];
    let i = 1;

    if (filters.providerType && filters.providerType !== 'All') {
      clauses.push(`provider_type = $${i++}`);
      values.push(filters.providerType);
    }
    if (filters.status && filters.status !== 'All') {
      clauses.push(`status = $${i++}`);
      values.push(filters.status);
    }
    if (filters.category && filters.category !== 'All') {
      clauses.push(`category = $${i++}`);
      values.push(filters.category);
    }
    if (filters.search) {
      clauses.push(`(title ILIKE $${i} OR provider_name ILIKE $${i} OR description ILIKE $${i})`);
      values.push(`%${filters.search}%`);
      i++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM opportunities ${where} ORDER BY deadline ASC`, values);
    return result.rows.length ? result.rows : FALLBACK_OPPORTUNITIES;
  } catch (err) {
    console.warn('[opportunityModel] DB query failed, returning fallback list:', err.message);
    return FALLBACK_OPPORTUNITIES;
  }
};

const findById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM opportunities WHERE id = $1', [id]);
    if (result.rows[0]) return result.rows[0];
  } catch (err) {
    console.warn('[opportunityModel] findById DB query failed:', err.message);
  }
  return FALLBACK_OPPORTUNITIES.find((o) => o.id === id) || FALLBACK_OPPORTUNITIES[0];
};

const create = async (data) => {
  try {
    const result = await pool.query(
      `INSERT INTO opportunities
         (title, provider_name, provider_logo, provider_type, category, funding_type,
          eligibility_badge, deadline, external_url, description, amount, location, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        data.title, data.provider_name, data.provider_logo, data.provider_type, data.category,
        data.funding_type, data.eligibility_badge, data.deadline || null, data.external_url || null,
        data.description, data.amount || null, data.location, data.status || 'open',
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.warn('[opportunityModel] create DB query failed, returning mock item:', err.message);
    return { id: `opp-${Date.now()}`, ...data };
  }
};

module.exports = { findAll, findById, create };


