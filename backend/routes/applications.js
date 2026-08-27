// backend/routes/applications.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get current user's applications
 *     tags: [Applications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of applications }
 *   post:
 *     summary: Submit a new application
 *     tags: [Applications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Application created }
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update application status (staff/admin)
 *     tags: [Applications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Application updated }
 */
router.get('/', authMiddleware, applicationController.getMyApplications);
router.get('/:id', authMiddleware, applicationController.getApplicationById);
router.post('/', authMiddleware, applicationController.createApplication);
router.patch('/:id/status', authMiddleware, applicationController.updateStatus);
router.post('/:id/send-certificate', authMiddleware, applicationController.sendAwardCertificate);

module.exports = router;
