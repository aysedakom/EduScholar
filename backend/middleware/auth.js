// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'eduscholar_secure_jwt_production_secret_2026';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    // Standard secure JWT verification
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.name && decoded.id) {
      try {
        const uRes = await pool.query('SELECT name FROM users WHERE id = $1', [decoded.id]);
        if (uRes.rows[0]) {
          decoded.name = uRes.rows[0].name;
        }
      } catch (_) {}
    }
    req.user = decoded;
    return next();
  } catch (error) {
    console.warn('[authMiddleware] Token validation warning:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;