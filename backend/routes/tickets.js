// backend/routes/tickets.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/auth');

// All ticket routes require authentication
router.use(authMiddleware);

router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.post('/', ticketController.createTicket);
router.patch('/:id/status', ticketController.updateStatus);
router.post('/:id/close', ticketController.closeTicket);

module.exports = router;
