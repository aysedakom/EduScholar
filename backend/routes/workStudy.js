// backend/routes/workStudy.js
const express = require('express');
const router = express.Router();
const workStudyController = require('../controllers/workStudyController');
const authMiddleware = require('../middleware/auth');

router.get('/jobs', workStudyController.getJobs);
router.get('/jobs/:id', workStudyController.getJobById);
router.post('/jobs', authMiddleware, workStudyController.createJob);

router.get('/logs', authMiddleware, workStudyController.getLogs);
router.post('/logs', authMiddleware, workStudyController.logHours);
router.put('/logs/:id/status', authMiddleware, workStudyController.updateLogStatus);

module.exports = router;
