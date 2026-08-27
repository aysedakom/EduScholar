// backend/models/notificationModel.js
const { pool } = require('../config/db');

const findByUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

const unreadCount = async (userId) => {
  const result = await pool.query(
    'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false',
    [userId]
  );
  return result.rows[0].count;
};

const create = async (data) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, is_read, category)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [data.user_id, data.title, data.message, data.type || 'info', data.is_read || false, data.category || null]
  );
  return result.rows[0];
};

const markRead = async (id, userId) => {
  const result = await pool.query(
    'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId]
  );
  return result.rows[0];
};

const markAllRead = async (userId) => {
  const result = await pool.query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false RETURNING id',
    [userId]
  );
  return result.rowCount;
};

module.exports = { findByUser, unreadCount, create, markRead, markAllRead };
