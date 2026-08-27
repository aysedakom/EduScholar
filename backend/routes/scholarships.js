// backend/routes/scholarships.js
const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/scholarships:
 *   get:
 *     summary: Get all scholarships
 *     tags: [Scholarships]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: status
 *         in: query
 *         schema: { type: string }
 *       - name: category
 *         in: query
 *         schema: { type: string }
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of scholarships }
 */
router.get('/', scholarshipController.getScholarships);
router.get('/:id', scholarshipController.getScholarship);
router.post('/', authMiddleware, scholarshipController.createScholarship);

module.exports = router;
