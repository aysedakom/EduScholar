// backend/routes/partners.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/partners - Retrieve list of accredited partner schools with real dynamic active scholar counts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ps.*,
        COALESCE(sr.real_active, 0)::int AS active_scholars
      FROM partner_schools ps
      LEFT JOIN (
        SELECT school, COUNT(*)::int AS real_active 
        FROM student_registry 
        WHERE status ILIKE '%Active%' OR status ILIKE '%Good Standing%'
        GROUP BY school
      ) sr ON ps.name ILIKE '%' || sr.school || '%' OR sr.school ILIKE '%' || ps.name || '%' OR sr.school ILIKE '%' || ps.short_name || '%'
      ORDER BY ps.name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('[partners] fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch partner schools' });
  }
});

// GET /api/partners/:id - Get specific partner school detail
router.get('/:id', async (req, res) => {
  try {
    const isNum = !isNaN(Number(req.params.id));
    const query = isNum
      ? 'SELECT * FROM partner_schools WHERE id = $1 OR school_id = $2'
      : 'SELECT * FROM partner_schools WHERE school_id = $1';
    const params = isNum ? [Number(req.params.id), String(req.params.id)] : [String(req.params.id)];

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Partner school not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[partners] get error:', error);
    res.status(500).json({ message: 'Failed to fetch partner school' });
  }
});

module.exports = router;
