// backend/routes/bursaries.js
const express = require('express');
const router = express.Router();
const bursaryController = require('../controllers/bursaryController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/bursaries:
 *   get:
 *     summary: Get all bursaries
 *     tags: [Bursaries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: type
 *         in: query
 *         schema: { type: string }
 *       - name: status
 *         in: query
 *         schema: { type: string }
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of bursaries }
 */
router.get('/', bursaryController.getBursaries);
router.get('/:id', bursaryController.getBursary);
router.post('/', authMiddleware, bursaryController.createBursary);

module.exports = router;
