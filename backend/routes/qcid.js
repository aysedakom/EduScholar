// backend/routes/qcid.js
const express = require('express');
const router = express.Router();
const qcIdService = require('../services/qcIdService');

// GET /api/qcid/directory - Search or list registered QC citizens
router.get('/directory', async (req, res) => {
  try {
    const { query } = req.query;
    const results = await qcIdService.searchResidents(query);
    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('[qcid] directory error:', error);
    res.status(500).json({ message: 'Failed to search citizen directory' });
  }
});

// GET /api/qcid/lookup/:idNumber - Lookup citizen details by ID
router.get('/lookup/:idNumber', async (req, res) => {
  try {
    const resident = await qcIdService.lookupById(req.params.idNumber);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Citizen record not found in QC registry' });
    }
    res.json({ success: true, data: resident });
  } catch (error) {
    console.error('[qcid] lookup error:', error);
    res.status(500).json({ message: 'Failed to lookup citizen record' });
  }
});

// POST /api/qcid/verify - Verify applicant residency, voter status, and scholarship eligibility
router.post('/verify', async (req, res) => {
  try {
    const result = await qcIdService.verifyApplicant(req.body);
    res.json(result);
  } catch (error) {
    console.error('[qcid] verify error:', error);
    res.status(500).json({ message: 'Failed to verify applicant residency' });
  }
});

module.exports = router;
