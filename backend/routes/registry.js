// backend/routes/registry.js
const express = require('express');
const router = express.Router();
const registryController = require('../controllers/registryController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, registryController.getScholars);
router.post('/', authMiddleware, registryController.addScholar);
router.patch('/:id/status', authMiddleware, registryController.updateScholarStatus);

module.exports = router;
