// backend/routes/funds.js
const express = require('express');
const router = express.Router();
const fundManagementService = require('../services/fundManagementService');

// GET /api/funds - List all fund pools
router.get('/', async (req, res) => {
  try {
    const pools = await fundManagementService.getFundPools();
    res.json({ success: true, count: pools.length, data: pools });
  } catch (error) {
    console.error('[funds] get error:', error);
    res.status(500).json({ message: 'Failed to fetch fund pools' });
  }
});

// POST /api/funds - Create a new fund pool
router.post('/', async (req, res) => {
  try {
    const newPool = await fundManagementService.createFundPool(req.body);
    res.status(201).json({ success: true, data: newPool });
  } catch (error) {
    console.error('[funds] create error:', error);
    res.status(500).json({ message: 'Failed to create fund pool' });
  }
});

// GET /api/funds/drawdowns - List all funder drawdown pull requests
router.get('/drawdowns', async (req, res) => {
  try {
    const drawdowns = await fundManagementService.getDrawdownRequests();
    res.json({ success: true, count: drawdowns.length, data: drawdowns });
  } catch (error) {
    console.error('[funds] drawdowns error:', error);
    res.status(500).json({ message: 'Failed to fetch funder drawdown requests' });
  }
});

// POST /api/funds/drawdown - Submit a new formal Funder Drawdown Pull Request
router.post('/drawdown', async (req, res) => {
  try {
    const result = await fundManagementService.createDrawdownRequest(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('[funds] create drawdown error:', error);
    res.status(500).json({ message: 'Failed to submit funder drawdown request' });
  }
});

// PATCH /api/funds/drawdown/:id/status - Update status of funder pull request
router.patch('/drawdown/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const result = await fundManagementService.updateDrawdownStatus(req.params.id, status, notes);
    res.json(result);
  } catch (error) {
    console.error('[funds] update drawdown status error:', error);
    res.status(500).json({ message: error.message || 'Failed to update drawdown request status' });
  }
});

module.exports = router;
