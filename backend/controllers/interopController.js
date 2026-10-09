// backend/controllers/interopController.js
const interopService = require('../services/interopService');

// @desc   Get QC Government Subsystems Interoperability Catalog
// @route  GET /api/interop/catalog
const getCatalog = async (req, res) => {
  try {
    const catalog = await interopService.getIntegrationCatalog();
    res.json(catalog);
  } catch (err) {
    console.error('[interopController] getCatalog error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve interop catalog' });
  }
};

// @desc   Get recent interoperability transaction logs
// @route  GET /api/interop/logs
const getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 25;
    const logs = await interopService.getRecentInteropLogs(limit);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    console.error('[interopController] getLogs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch interop logs' });
  }
};

// @desc   Verify resident with Subsystem 1 (Citizen Information & Engagement)
// @route  GET /api/interop/citizen/:qcitizenId or POST /api/interop/citizen/verify
const verifyCitizenRecord = async (req, res) => {
  try {
    const qcitizenId = req.params.qcitizenId || req.body.qcitizenId;
    if (!qcitizenId) {
      return res.status(400).json({ success: false, message: 'qcitizenId is required' });
    }
    const result = await interopService.verifyCitizen(qcitizenId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('[interopController] verifyCitizenRecord error:', err);
    res.status(500).json({ success: false, message: 'Citizen verification failed' });
  }
};

// @desc   Cross-check with Subsystem 3 (Social Services Management - AICS / PWD / Solo Parent)
// @route  POST /api/interop/social-welfare/check
const checkSocialWelfare = async (req, res) => {
  try {
    const { qcitizenId, studentName, requestedAidType } = req.body;
    if (!qcitizenId) {
      return res.status(400).json({ success: false, message: 'qcitizenId is required' });
    }
    const result = await interopService.verifySocialWelfareStatus({ qcitizenId, studentName, requestedAidType });
    res.json(result);
  } catch (err) {
    console.error('[interopController] checkSocialWelfare error:', err);
    res.status(500).json({ success: false, message: 'Social welfare verification failed' });
  }
};

// @desc   Reconcile Payout with Subsystem 8 (Revenue Collection & Treasury Services)
// @route  POST /api/interop/treasury/reconcile
const reconcileTreasury = async (req, res) => {
  try {
    const { batchId, settlementHash, bankReference, approvedByOfficer } = req.body;
    if (!batchId || !settlementHash || !bankReference) {
      return res.status(400).json({
        success: false,
        message: 'batchId, settlementHash, and bankReference are required for Treasury settlement'
      });
    }
    const result = await interopService.reconcileTreasuryPayout({
      batchId,
      settlementHash,
      bankReference,
      approvedByOfficer: approvedByOfficer || req.user?.name || 'City Treasurer Office'
    });
    res.json(result);
  } catch (err) {
    console.error('[interopController] reconcileTreasury error:', err);
    res.status(500).json({ success: false, message: 'Treasury payout reconciliation failed' });
  }
};

// @desc   Ingest Calamity / Emergency Alert from Subsystem 6 (DRRM)
// @route  POST /api/interop/drrm/calamity-alert
const ingestDrrmAlert = async (req, res) => {
  try {
    const { disasterType, affectedBarangays, alertLevel, notes } = req.body;
    if (!disasterType || !Array.isArray(affectedBarangays) || affectedBarangays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'disasterType and affectedBarangays (array) are required'
      });
    }
    const result = await interopService.receiveDrrmAlert({
      disasterType,
      affectedBarangays,
      alertLevel: alertLevel || 'Signal 2 / Severe',
      notes
    });
    res.json(result);
  } catch (err) {
    console.error('[interopController] ingestDrrmAlert error:', err);
    res.status(500).json({ success: false, message: 'DRRM ingestion failed' });
  }
};

// @desc   Generic Inter-System Webhook Handler
// @route  POST /api/interop/webhook
const receiveWebhook = async (req, res) => {
  try {
    const { sourceSystem, eventType, data } = req.body;
    const response = {
      received: true,
      acknowledged_by: 'EduScholar Interoperability Gateway (Subsystem 5)',
      timestamp: new Date().toISOString()
    };
    await interopService.logInteropEvent(sourceSystem || 'External QC Department', eventType || 'GENERIC_EVENT', data, response);
    res.status(202).json({ success: true, ...response });
  } catch (err) {
    console.error('[interopController] receiveWebhook error:', err);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

// @desc   Simulate Live Inter-System Integration Handshake
// @route  POST /api/interop/simulate
const simulateIntegration = async (req, res) => {
  try {
    const { systemCode } = req.body;
    let result = null;

    switch (systemCode) {
      case 'SYS-01':
        result = await interopService.verifyCitizen('QC-2024-884920');
        break;
      case 'SYS-03':
        result = await interopService.verifySocialWelfareStatus({
          qcitizenId: 'QC-2024-884920',
          studentName: 'Pia Marie T. Faner',
          requestedAidType: 'Emergency Calamity Bursary'
        });
        break;
      case 'SYS-08':
        result = await interopService.reconcileTreasuryPayout({
          batchId: 'BATCH-2026-Q3-01',
          settlementHash: '0x8fbc72d9e030a112fc7e98a12048f02c',
          bankReference: 'LB-DISB-994821',
          approvedByOfficer: 'City Treasury Disbursing Officer'
        });
        break;
      case 'SYS-06':
        result = await interopService.receiveDrrmAlert({
          disasterType: 'Flash Flood / Typhoon Warning',
          affectedBarangays: ['San Bartolome', 'Bagbag', 'Batasan Hills'],
          alertLevel: 'Orange Rainfall Advisory'
        });
        break;
      default:
        result = {
          success: true,
          subsystem: systemCode || 'SYS-02',
          message: 'Simulation heartbeat ping successful. Service ready for payload exchange.',
          timestamp: new Date().toISOString()
        };
        await interopService.logInteropEvent(systemCode || 'SIMULATION', 'HEARTBEAT_PING', req.body, result);
    }

    res.json({ success: true, simulated_result: result });
  } catch (err) {
    console.error('[interopController] simulateIntegration error:', err);
    res.status(500).json({ success: false, message: 'Simulation error' });
  }
};

module.exports = {
  getCatalog,
  getLogs,
  verifyCitizenRecord,
  checkSocialWelfare,
  reconcileTreasury,
  ingestDrrmAlert,
  receiveWebhook,
  simulateIntegration
};
