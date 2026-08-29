// backend/models/scholarshipModel.js
const { pool } = require('../config/db');

const findAll = async (filters = {}) => {
  try {
    const clauses = [];
    const values = [];
    let i = 1;

    if (filters.status && filters.status !== 'All') {
      clauses.push(`status = $${i++}`);
      values.push(filters.status);
    }
    if (filters.category && filters.category !== 'All') {
      clauses.push(`(category_id = $${i} OR category_title ILIKE $${i})`);
      values.push(filters.category);
      i++;
    }
    if (filters.search) {
      clauses.push(`(title ILIKE $${i} OR summary ILIKE $${i} OR short_title ILIKE $${i})`);
      values.push(`%${filters.search}%`);
      i++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM scholarships ${where} ORDER BY id ASC`, values);
    return result.rows;
  } catch (err) {
    console.error('[scholarshipModel] DB query failed:', err.message);
    return [];
  }
};

const findById = async (idOrCode) => {
  try {
    const isNum = !isNaN(Number(idOrCode));
    const query = isNum
      ? 'SELECT * FROM scholarships WHERE id = $1 OR program_code = $2'
      : 'SELECT * FROM scholarships WHERE program_code = $1';
    const params = isNum ? [Number(idOrCode), String(idOrCode)] : [String(idOrCode)];
    
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  } catch (err) {
    console.error('[scholarshipModel] findById DB query failed:', err.message);
    return null;
  }
};

const updateStatus = async (idOrCode, status) => {
  try {
    const isNum = !isNaN(Number(idOrCode));
    const query = isNum
      ? 'UPDATE scholarships SET status = $1 WHERE id = $2 OR program_code = $3 RETURNING *'
      : 'UPDATE scholarships SET status = $1 WHERE program_code = $2 RETURNING *';
    const params = isNum ? [status, Number(idOrCode), String(idOrCode)] : [status, String(idOrCode)];
    
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  } catch (err) {
    console.error('[scholarshipModel] updateStatus DB query failed:', err.message);
    throw err;
  }
};

const create = async (data) => {
  try {
    const result = await pool.query(
      `INSERT INTO scholarships
         (program_code, title, short_title, category_id, category_title, level, badge, summary,
          tuition_grant, stipend, total_max, amount, min_gwa_text, min_gwa_number,
          qualifications, required_documents, deadline, status, slots, applied_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING *`,
      [
        data.program_code || `prog-${Date.now()}`,
        data.title,
        data.short_title || data.title,
        data.category_id || 'tertiary',
        data.category_title || 'Scholarship for Tertiary Students',
        data.level || 'Undergraduate',
        data.badge || 'QC Grant',
        data.summary || '',
        data.tuition_grant || '—',
        data.stipend || '—',
        data.total_max || '—',
        data.amount || 0,
        data.min_gwa_text || '—',
        data.min_gwa_number || null,
        JSON.stringify(data.qualifications || []),
        JSON.stringify(data.required_documents || []),
        data.deadline || null,
        data.status || 'Open',
        data.slots || 500,
        data.applied_count || 0,
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.error('[scholarshipModel] create DB query failed:', err.message);
    throw err;
  }
};

module.exports = { findAll, findById, updateStatus, create };
