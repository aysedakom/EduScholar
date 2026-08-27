// backend/routes/opportunities.js
const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/opportunities:
 *   get:
 *     summary: Get all discoverable opportunities
 *     tags: [Opportunities]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: providerType
 *         in: query
 *         schema: { type: string }
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
 *       200: { description: List of opportunities }
 *   post:
 *     summary: Create an opportunity
 *     tags: [Opportunities]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Opportunity created }
 */
router.get('/', opportunityController.getOpportunities);
router.get('/:id', opportunityController.getOpportunity);
router.post('/', authMiddleware, opportunityController.createOpportunity);

module.exports = router;
