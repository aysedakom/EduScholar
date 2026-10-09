// backend/routes/interop.js
const express = require('express');
const router = express.Router();
const interopController = require('../controllers/interopController');

// 1. Catalog & Health of All 10 QC Government Subsystems
router.get('/catalog', interopController.getCatalog);

// 2. Audit Trail of Interoperability Transactions
router.get('/logs', interopController.getLogs);

// 3. Subsystem 1: Citizen Information & Engagement
router.get('/citizen/:qcitizenId', interopController.verifyCitizenRecord);
router.post('/citizen/verify', interopController.verifyCitizenRecord);

// 4. Subsystem 3: Social Services Management (AICS / PWD / Solo Parent)
router.post('/social-welfare/check', interopController.checkSocialWelfare);

// 5. Subsystem 8: Revenue Collection & Treasury Services
router.post('/treasury/reconcile', interopController.reconcileTreasury);

// 6. Subsystem 6: Disaster Risk Reduction & Emergency Response (DRRM)
router.post('/drrm/calamity-alert', interopController.ingestDrrmAlert);

// 7. General Webhook Ingestion from Other Subsystems
router.post('/webhook', interopController.receiveWebhook);

// 8. Live Demonstration Simulator
router.post('/simulate', interopController.simulateIntegration);

module.exports = router;
