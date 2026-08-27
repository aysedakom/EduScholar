// backend/routes/documents.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get current user's documents
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of documents }
 *   post:
 *     summary: Upload a document (metadata)
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Document created }
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Document deleted }
 */
router.get('/', authMiddleware, documentController.getMyDocuments);
router.post('/', authMiddleware, documentController.createDocument);
router.delete('/:id', authMiddleware, documentController.deleteDocument);

module.exports = router;
