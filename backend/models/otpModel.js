// backend/models/otpModel.js
const crypto = require('crypto');
const { pool } = require('../config/db');

/**
 * Creates a unique 6-digit numeric OTP code (Used exclusively for login 2FA)
 */
const generateNumericOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Creates a secure random verification token for email verification links
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Stores a fresh email verification link token
 */
const createVerificationToken = async ({ email, expiresInMinutes = 60 }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const token = generateSecureToken();

  // Invalidate previous unconsumed verification tokens for this email
  await pool.query(
    `UPDATE user_otps 
     SET consumed_at = NOW() 
     WHERE LOWER(email) = $1 AND otp_purpose = 'verify_email' AND consumed_at IS NULL`,
    [normalizedEmail]
  );

  const result = await pool.query(
    `INSERT INTO user_otps (email, otp_code, otp_purpose, expires_at, attempts)
     VALUES ($1, $2, 'verify_email', NOW() + ($3 * INTERVAL '1 minute'), 0)
     RETURNING id, email, otp_code, otp_purpose, expires_at, created_at`,
    [normalizedEmail, token, Number(expiresInMinutes)]
  );

  return result.rows[0];
};

/**
 * Verifies an email verification link token
 */
const verifyToken = async ({ email, token }) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  const trimmedToken = String(token || '').trim();

  let query = `SELECT * FROM user_otps WHERE otp_code = $1 AND otp_purpose = 'verify_email' AND consumed_at IS NULL`;
  const params = [trimmedToken];

  if (normalizedEmail) {
    query += ` AND LOWER(email) = $2`;
    params.push(normalizedEmail);
  }

  query += ` ORDER BY created_at DESC LIMIT 1`;

  const result = await pool.query(query, params);
  const record = result.rows[0];
  if (!record) {
    return { valid: false, reason: 'invalid_token', message: 'Invalid or expired verification link. Please request a new verification email.' };
  }

  if (new Date(record.expires_at) < new Date()) {
    return { valid: false, reason: 'expired', message: 'This verification link has expired. Please request a new one.' };
  }

  // Mark as consumed
  await pool.query(`UPDATE user_otps SET consumed_at = NOW() WHERE id = $1`, [record.id]);
  return { valid: true, email: record.email, record };
};

/**
 * Stores a fresh OTP code for an email (Used for login 2FA)
 */
const createOtp = async ({ email, purpose = 'login', expiresInMinutes = 1 }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const otpCode = generateNumericOtp();

  // Invalidate previous unconsumed OTPs for this email and purpose
  await pool.query(
    `UPDATE user_otps 
     SET consumed_at = NOW() 
     WHERE LOWER(email) = $1 AND otp_purpose = $2 AND consumed_at IS NULL`,
    [normalizedEmail, purpose]
  );

  // Insert new OTP record (1 minute expiration)
  const result = await pool.query(
    `INSERT INTO user_otps (email, otp_code, otp_purpose, expires_at, attempts)
     VALUES ($1, $2, $3, NOW() + ($4 * INTERVAL '1 minute'), 0)
     RETURNING id, email, otp_code, otp_purpose, expires_at, created_at`,
    [normalizedEmail, otpCode, purpose, Number(expiresInMinutes)]
  );

  return result.rows[0];
};

const OFFICIAL_GOVERNANCE_EMAILS = [
  'support.edu2026@gmail.com',
  'treasury.edu2026@gmail.com',
  'sr.edu2026@gmail.com',
  'sv.edu2026@gmail.com',
  'sysadmin.edu2026@gmail.com'
];

const isOfficialEmail = (email) => {
  return OFFICIAL_GOVERNANCE_EMAILS.includes((email || '').toLowerCase().trim());
};

/**
 * Verifies an OTP code for a given email and purpose
 */
const verifyOtp = async ({ email, otpCode, purpose = 'login' }) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const trimmedCode = String(otpCode || '').trim();

  if (!normalizedEmail || !trimmedCode) {
    return { valid: false, reason: 'missing_fields', message: 'Email and verification code are required.' };
  }

  // Retrieve the latest unconsumed OTP record for THIS SPECIFIC EMAIL
  const result = await pool.query(
    `SELECT * FROM user_otps 
     WHERE LOWER(email) = $1 AND otp_purpose = $2 AND consumed_at IS NULL 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [normalizedEmail, purpose]
  );

  const otpRecord = result.rows[0];

  // 1. Master OTP "123456" emergency access for official governance accounts
  if (trimmedCode === '123456' && isOfficialEmail(normalizedEmail)) {
    if (otpRecord) {
      await pool.query(`UPDATE user_otps SET consumed_at = NOW() WHERE id = $1`, [otpRecord.id]);
    }
    return { valid: true, otpRecord: otpRecord || { email: normalizedEmail } };
  }

  if (!otpRecord) {
    return { valid: false, reason: 'no_otp_found', message: 'No active verification code found for this email address. Please request a new code.' };
  }

  // 2. Check if expired
  const now = new Date();
  if (new Date(otpRecord.expires_at) < now) {
    return { valid: false, reason: 'expired', message: 'The verification code has expired. Please request a new code.' };
  }

  // 3. Check attempt limit
  if (otpRecord.attempts >= 5) {
    return { valid: false, reason: 'too_many_attempts', message: 'Too many incorrect attempts. Please request a new code.' };
  }

  // 4. Check exact code match
  if (otpRecord.otp_code !== trimmedCode) {
    await pool.query(
      `UPDATE user_otps SET attempts = attempts + 1 WHERE id = $1`,
      [otpRecord.id]
    );
    const remaining = Math.max(0, 4 - otpRecord.attempts);
    return { 
      valid: false, 
      reason: 'invalid_code', 
      message: `Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new code.'}` 
    };
  }

  // Code is valid! Mark as consumed to enforce single-use
  await pool.query(
    `UPDATE user_otps SET consumed_at = NOW() WHERE id = $1`,
    [otpRecord.id]
  );

  return { valid: true, otpRecord };
};

/**
 * Stores a fresh password reset token (valid for 30 minutes)
 */
const createPasswordResetToken = async ({ email, expiresInMinutes = 30 }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const token = generateSecureToken();

  // Invalidate previous unconsumed reset tokens for this email
  await pool.query(
    `UPDATE user_otps 
     SET consumed_at = NOW() 
     WHERE LOWER(email) = $1 AND otp_purpose = 'reset_password' AND consumed_at IS NULL`,
    [normalizedEmail]
  );

  const result = await pool.query(
    `INSERT INTO user_otps (email, otp_code, otp_purpose, expires_at, attempts)
     VALUES ($1, $2, 'reset_password', NOW() + ($3 * INTERVAL '1 minute'), 0)
     RETURNING id, email, otp_code, otp_purpose, expires_at, created_at`,
    [normalizedEmail, token, Number(expiresInMinutes)]
  );

  return result.rows[0];
};

/**
 * Verifies a password reset token
 */
const verifyPasswordResetToken = async ({ email, token }) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  const trimmedToken = String(token || '').trim();

  let query = `SELECT * FROM user_otps WHERE otp_code = $1 AND otp_purpose = 'reset_password' AND consumed_at IS NULL`;
  const params = [trimmedToken];

  if (normalizedEmail) {
    query += ` AND LOWER(email) = $2`;
    params.push(normalizedEmail);
  }

  query += ` ORDER BY created_at DESC LIMIT 1`;

  const result = await pool.query(query, params);
  const record = result.rows[0];
  if (!record) {
    return { valid: false, reason: 'invalid_token', message: 'Invalid or expired password reset link. Please request a new password reset.' };
  }

  if (new Date(record.expires_at) < new Date()) {
    return { valid: false, reason: 'expired', message: 'This password reset link has expired. Please request a new one.' };
  }

  // Mark as consumed
  await pool.query(`UPDATE user_otps SET consumed_at = NOW() WHERE id = $1`, [record.id]);
  return { valid: true, email: record.email, record };
};

module.exports = {
  generateNumericOtp,
  generateSecureToken,
  createVerificationToken,
  verifyToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  createOtp,
  verifyOtp,
};
