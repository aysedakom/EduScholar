// backend/routes/schoolSync.js
const express = require('express');
const router = express.Router();
const schoolSyncService = require('../services/schoolSyncService');

// GET /api/schools-sync/verify/:schoolCode/:studentId - Verify student enrollment with registrar
router.get('/verify/:schoolCode/:studentId', async (req, res) => {
  try {
    const { schoolCode, studentId } = req.params;
    const result = await schoolSyncService.verifyStudentEnrollment(schoolCode, studentId);
    res.json(result);
  } catch (error) {
    console.error('[schools-sync] verify error:', error);
    res.status(500).json({ message: 'Failed to verify enrollment with partner school registrar' });
  }
});

// GET /api/schools-sync/soa/:schoolCode/:studentId - Pull real-time Statement of Account
router.get('/soa/:schoolCode/:studentId', async (req, res) => {
  try {
    const { schoolCode, studentId } = req.params;
    const result = await schoolSyncService.getStatementOfAccount(schoolCode, studentId);
    res.json(result);
  } catch (error) {
    console.error('[schools-sync] soa error:', error);
    res.status(500).json({ message: 'Failed to pull Statement of Account from school finance desk' });
  }
});

// POST /api/schools-sync/remit - Transmit scholarship grant remittance voucher to school
router.post('/remit', async (req, res) => {
  try {
    const result = await schoolSyncService.submitRemittanceVoucher(req.body);
    res.json(result);
  } catch (error) {
    console.error('[schools-sync] remit error:', error);
    res.status(500).json({ message: 'Failed to transmit remittance voucher to partner school' });
  }
});

module.exports = router;
