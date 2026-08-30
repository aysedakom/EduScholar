// backend/controllers/ticketController.js
const ticketModel = require('../models/ticketModel');
const { broadcast } = require('../realtime/socketServer');

// @desc   Get tickets (student gets their own, admin/staff gets all)
// @route  GET /api/tickets
// @access Authenticated
const getTickets = async (req, res) => {
  try {
    const isStudent = req.user?.role === 'student';
    const tickets = isStudent
      ? await ticketModel.findByUser(req.user.id)
      : await ticketModel.findAll(req.query);

    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('[ticketController] getTickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve support tickets' });
  }
};

// @desc   Get single ticket by ID or ticket code
// @route  GET /api/tickets/:id
// @access Authenticated
const getTicketById = async (req, res) => {
  try {
    const ticket = await ticketModel.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (req.user?.role === 'student' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('[ticketController] getTicketById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve ticket' });
  }
};

// @desc   Create a new support ticket (applicant to admin)
// @route  POST /api/tickets
// @access Authenticated
const createTicket = async (req, res) => {
  try {
    const ticket = await ticketModel.create(req.body, req.user);

    // Broadcast real-time ticket creation event
    try {
      broadcast({
        type: 'NEW_SUPPORT_TICKET',
        data: ticket,
        timestamp: new Date().toISOString(),
      });
    } catch (wsErr) {
      // ws optional
    }

    res.status(201).json({
      success: true,
      message: `Support Ticket #${ticket.ticket_code} created successfully! Our team has been notified.`,
      data: ticket,
    });
  } catch (error) {
    console.error('[ticketController] createTicket error:', error);
    res.status(500).json({ success: false, message: 'Failed to create support ticket: ' + error.message });
  }
};

// @desc   Update ticket status / close ticket (admin action)
// @route  PATCH /api/tickets/:id/status
// @access Admin / Staff only
const updateStatus = async (req, res) => {
  try {
    if (req.user?.role === 'student') {
      return res.status(403).json({ success: false, message: 'Only staff can update ticket status.' });
    }

    const { status, adminNotes, resolutionRemarks } = req.body;
    const ticket = await ticketModel.updateStatus(req.params.id, {
      status: status || 'Closed',
      adminNotes,
      resolutionRemarks,
      adminUser: req.user,
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Broadcast real-time ticket update
    try {
      broadcast({
        type: 'TICKET_STATUS_UPDATED',
        data: ticket,
        updatedBy: req.user?.name,
        timestamp: new Date().toISOString(),
      });
    } catch (wsErr) {
      // ws optional
    }

    res.json({
      success: true,
      message: `Ticket #${ticket.ticket_code} marked as ${ticket.status}.`,
      data: ticket,
    });
  } catch (error) {
    console.error('[ticketController] updateStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket: ' + error.message });
  }
};

// @desc   Direct action to close ticket
// @route  POST /api/tickets/:id/close
// @access Admin / Staff only
const closeTicket = async (req, res) => {
  try {
    if (req.user?.role === 'student') {
      return res.status(403).json({ success: false, message: 'Only staff can close tickets.' });
    }

    const { resolutionRemarks, adminNotes } = req.body;
    const ticket = await ticketModel.updateStatus(req.params.id, {
      status: 'Closed',
      adminNotes,
      resolutionRemarks: resolutionRemarks || 'Inquiry addressed and marked as closed by administrator.',
      adminUser: req.user,
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Broadcast real-time ticket closure
    try {
      broadcast({
        type: 'TICKET_STATUS_UPDATED',
        data: ticket,
        updatedBy: req.user?.name,
        timestamp: new Date().toISOString(),
      });
    } catch (wsErr) {
      // ws optional
    }

    res.json({
      success: true,
      message: `Support Ticket #${ticket.ticket_code} has been successfully CLOSED!`,
      data: ticket,
    });
  } catch (error) {
    console.error('[ticketController] closeTicket error:', error);
    res.status(500).json({ success: false, message: 'Failed to close ticket: ' + error.message });
  }
};

module.exports = { getTickets, getTicketById, createTicket, updateStatus, closeTicket };
