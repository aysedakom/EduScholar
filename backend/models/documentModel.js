// backend/models/documentModel.js
const { pool } = require('../config/db');

const findAll = async (filters = {}) => {
  try {
    const clauses = [];
    const values = [];
    let i = 1;

    if (filters.userId) {
      clauses.push(`d.user_id = $${i++}`);
      values.push(filters.userId);
    }
    if (filters.applicationId) {
      clauses.push(`d.application_id = $${i++}`);
      values.push(filters.applicationId);
    }
    if (filters.category) {
      clauses.push(`d.category = $${i++}`);
      values.push(filters.category);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT d.*, u.name as user_name, u.email as user_email, u.student_id
       FROM documents d
       LEFT JOIN users u ON d.user_id = u.id
       ${where}
       ORDER BY d.upload_date DESC, d.id DESC`,
      values
    );
    return result.rows;
  } catch (err) {
    console.error('[documentModel] findAll query error:', err.message);
    return [];
  }
};

const findByUser = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE user_id = $1 ORDER BY upload_date DESC, id DESC',
      [userId]
    );
    return result.rows;
  } catch (err) {
    console.error('[documentModel] findByUser error:', err.message);
    return [];
  }
};

const findByApplication = async (applicationId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE application_id = $1 ORDER BY upload_date DESC, id DESC',
      [applicationId]
    );
    return result.rows;
  } catch (err) {
    console.error('[documentModel] findByApplication error:', err.message);
    return [];
  }
};

const findById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    return result.rows[0];
  } catch (err) {
    console.error('[documentModel] findById error:', err.message);
    return null;
  }
};

const create = async (data) => {
  try {
    const result = await pool.query(
      `INSERT INTO documents (user_id, application_id, name, category, upload_date, status, size, file_path, file_data, mime_type, expiry_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        data.user_id,
        data.application_id || null,
        data.name || 'Attachment.pdf',
        data.category || 'general',
        data.upload_date || new Date().toISOString().split('T')[0],
        data.status || 'verified',
        data.size || '1.2 MB',
        data.file_path || null,
        data.file_data || null,
        data.mime_type || 'application/pdf',
        data.expiry_date || null,
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.error('[documentModel] create error:', err.message);
    throw err;
  }
};

const remove = async (id) => {
  try {
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  } catch (err) {
    console.error('[documentModel] remove error:', err.message);
    return null;
  }
};

module.exports = { findAll, findByUser, findByApplication, findById, create, remove };
