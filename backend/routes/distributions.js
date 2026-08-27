// backend/routes/distributions.js
const express = require('express');
const router = express.Router();
const distributionController = require('../controllers/distributionController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, distributionController.getDistributions);
router.post('/', authMiddleware, distributionController.createDistribution);
router.patch('/:id/status', authMiddleware, distributionController.updateDistributionStatus);

module.exports = router;
