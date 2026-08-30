// backend/routes/portalSettings.js
const express = require('express');
const router = express.Router();
const portalSettingsController = require('../controllers/portalSettingsController');
const authMiddleware = require('../middleware/auth');

// Public/authenticated portal intake status
router.get('/', portalSettingsController.getSettings);

// Admin-only toggle & config
router.patch('/', authMiddleware, portalSettingsController.updateSettings);

module.exports = router;
