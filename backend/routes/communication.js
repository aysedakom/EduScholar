// backend/routes/communication.js
const express = require('express');
const router = express.Router();
const communicationService = require('../services/communicationService');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/communication/announcements
// @desc    Get all active announcements
// @access  Public / Authenticated
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await communicationService.getAnnouncements(req.query);
    res.json({ success: true, data: announcements });
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
});

// @route   POST /api/communication/announcements
// @desc    Create and broadcast bulk announcement
// @access  Staff / Admin only
router.post('/announcements', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role === 'student') {
      return res.status(403).json({ success: false, message: 'Only staff and administrators can broadcast announcements.' });
    }
    const announcement = await communicationService.createAnnouncement(req.body, req.user);
    res.status(201).json({
      success: true,
      message: `Bulk Announcement ${announcement.announcement_code} successfully broadcasted!`,
      data: announcement,
    });
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
});

// @route   GET /api/communication/conversations
// @desc    Get chat conversation threads for the current user
// @access  Authenticated
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const threads = await communicationService.getConversations(req.user);
    res.json({ success: true, data: threads });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

// @route   GET /api/communication/messages/:conversationId
// @desc    Get message history for a conversation
// @access  Authenticated
router.get('/messages/:conversationId', authMiddleware, async (req, res) => {
  try {
    const messages = await communicationService.getMessages(req.params.conversationId, req.user);
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// @route   POST /api/communication/messages
// @desc    Send a new message in a conversation thread
// @access  Authenticated
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const message = await communicationService.sendMessage(req.body, req.user);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

module.exports = router;
