// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { resetDatabase } = require('../db/reset');
const authMiddleware = require('../middleware/auth');

// POST /api/admin/reset-db - Reset and re-seed all tables in database
router.post('/reset-db', async (req, res) => {
  try {
    await resetDatabase();
    res.json({
      success: true,
      message: 'Database has been successfully reset and re-seeded with authentic Quezon City scholarship records! 🎉'
    });
  } catch (error) {
    console.error('[admin] reset-db error:', error);
    res.status(500).json({ success: false, message: 'Database reset failed: ' + error.message });
  }
});

// GET /api/admin/users - List all users in PostgreSQL database
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, department, major, gpa, status, student_id, created_at FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[admin] users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// GET /api/admin/stats - System and table row statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*)::int as count FROM users');
    const appCount = await pool.query('SELECT COUNT(*)::int as count FROM applications');
    const schCount = await pool.query('SELECT COUNT(*)::int as count FROM scholarships');
    const partnerCount = await pool.query('SELECT COUNT(*)::int as count FROM partner_schools');
    const distCount = await pool.query('SELECT COUNT(*)::int as count FROM school_aid_distributions');
    const regCount = await pool.query('SELECT COUNT(*)::int as count FROM student_registry');

    res.json({
      users: userCount.rows[0].count,
      applications: appCount.rows[0].count,
      scholarships: schCount.rows[0].count,
      partners: partnerCount.rows[0].count,
      distributions: distCount.rows[0].count,
      scholars: regCount.rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[admin] stats error:', error);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

module.exports = router;
