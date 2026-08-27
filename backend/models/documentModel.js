// backend/models/documentModel.js
const { pool } = require('../config/db');

const findByUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM documents WHERE user_id = $1 ORDER BY upload_date DESC',
    [userId]
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
  return result.rows[0];
};

const create = async (data) => {
  const result = await pool.query(
    `INSERT INTO documents (user_id, name, category, upload_date, status, size, file_path, expiry_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      data.user_id, data.name, data.category, data.upload_date || new Date().toISOString().split('T')[0],
      data.status || 'pending', data.size || '1.2 MB', data.file_path || null, data.expiry_date || null,
    ]
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};

module.exports = { findByUser, findById, create, remove };
