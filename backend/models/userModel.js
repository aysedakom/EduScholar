// backend/models/userModel.js
const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const result = await pool.query(
    `SELECT u.*, a.application_code, a.reference_id, a.id as application_id
     FROM users u
     LEFT JOIN (
       SELECT DISTINCT ON (user_id) user_id, id, application_code, reference_id
       FROM applications
       ORDER BY user_id, id DESC
     ) a ON a.user_id = u.id
     WHERE LOWER(u.email) = LOWER($1)`,
    [email.trim()]
  );
  return result.rows[0];
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.student_id, u.department, u.major, u.gpa, u.financial_aid_year,
            u.avatar, u.phone, u.address, u.barangay, u.city, u.province, u.zip_code,
            u.is_pwd, u.is_solo_parent, u.is_indigenous, u.is_4ps, u.is_kasambahay_or_toda, u.is_email_verified, u.status, u.created_at,
            a.application_code, a.reference_id, a.id as application_id
     FROM users u
     LEFT JOIN (
       SELECT DISTINCT ON (user_id) user_id, id, application_code, reference_id
       FROM applications
       ORDER BY user_id, id DESC
     ) a ON a.user_id = u.id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0];
};

const create = async ({ name, email, hashedPassword, role = 'student' }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role, is_email_verified, status)
     VALUES ($1, $2, $3, $4, FALSE, 'pending')
     RETURNING id, name, email, role, is_email_verified, status, created_at`,
    [name, email.toLowerCase().trim(), hashedPassword, role]
  );
  return result.rows[0];
};

const verifyEmail = async (email) => {
  const result = await pool.query(
    `UPDATE users 
     SET is_email_verified = TRUE, status = 'active', updated_at = NOW() 
     WHERE LOWER(email) = LOWER($1) 
     RETURNING id, name, email, role, is_email_verified, status`,
    [email.trim()]
  );
  return result.rows[0];
};

const updateProfile = async (id, fields) => {
  const clauses = [];
  const values = [];
  let i = 1;
  const allowed = [
    'name', 'student_id', 'department', 'major', 'gpa', 'financial_aid_year',
    'avatar', 'phone', 'address', 'barangay', 'city', 'province', 'zip_code',
    'is_pwd', 'is_solo_parent', 'is_indigenous', 'is_4ps', 'is_kasambahay_or_toda', 'status'
  ];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      clauses.push(`${key} = $${i++}`);
      values.push(fields[key]);
    }
  }
  if (!clauses.length) return findById(id);
  values.push(id);
  await pool.query(`UPDATE users SET ${clauses.join(', ')}, updated_at = NOW() WHERE id = $${i}`, values);
  return findById(id);
};

const updatePassword = async (email, hashedPassword) => {
  const result = await pool.query(
    `UPDATE users 
     SET password = $1, updated_at = NOW() 
     WHERE LOWER(email) = LOWER($2) 
     RETURNING id, name, email, role, status`,
    [hashedPassword, email.toLowerCase().trim()]
  );
  return result.rows[0];
};

module.exports = { findByEmail, findById, create, verifyEmail, updateProfile, updatePassword };
