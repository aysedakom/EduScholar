// backend/routes/liveChat.js
const express = require('express');
const router = express.Router();
const liveChatModel = require('../models/liveChatModel');
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/live-chat/start
 * @desc    Start a live chat session (Public guest or logged-in student)
 * @access  Public
 */
router.post('/start', async (req, res) => {
  try {
    const { name, complete_name, guest_name, email, guest_email, category, initial_message, message } = req.body;
    
    const finalName = complete_name || name || guest_name;
    const finalMessage = initial_message || message;

    if (!finalName || !finalName.trim()) {
      return res.status(400).json({ success: false, message: 'Complete Name is required to start live chat.' });
    }

    if (!category) {
      return res.status(400).json({ success: false, message: 'Please select a Concern Category.' });
    }

    if (!finalMessage || !finalMessage.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your message or concern.' });
    }

    const session = await liveChatModel.createSession({
      guest_name: finalName.trim(),
      guest_email: email || guest_email || null,
      category,
      initial_message: finalMessage.trim(),
      user_id: req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      message: 'Live chat session initialized successfully.',
      data: session,
    });
  } catch (err) {
    console.error('Error starting live chat session:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to start live chat session' });
  }
});

/**
 * @route   GET /api/live-chat/sessions
 * @desc    List live chat sessions for Admin Dashboard
 * @access  Staff / Admin only
 */
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access restricted to staff and administrators.' });
    }

    const result = await liveChatModel.getSessions(req.query);
    res.json({
      success: true,
      data: result.sessions,
      stats: result.stats,
    });
  } catch (err) {
    console.error('Error fetching live chat sessions:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch live chat sessions' });
  }
});

/**
 * @route   GET /api/live-chat/sessions/:id
 * @desc    Get session details, queue position, and message history
 * @access  Public / Authenticated
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    // Check auto-close inactivity before returning session details
    await liveChatModel.autoCloseInactiveSessions();

    const session = await liveChatModel.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Live chat session not found.' });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    console.error('Error fetching session details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch session details' });
  }
});

/**
 * @route   POST /api/live-chat/sessions/:id/messages
 * @desc    Send a message in a live chat session
 * @access  Public / Authenticated
 */
router.post('/sessions/:id/messages', async (req, res) => {
  try {
    const { message, sender_name, sender_type } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const finalSenderType = sender_type || (req.user?.role === 'admin' ? 'admin' : req.user ? 'student' : 'guest');
    const finalSenderName = sender_name || req.user?.name || 'User';

    const msg = await liveChatModel.sendMessage(parseInt(req.params.id, 10), {
      sender_type: finalSenderType,
      sender_id: req.user?.id || null,
      sender_name: finalSenderName,
      message: message.trim(),
    });

    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    console.error('Error sending message in live chat:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to send message' });
  }
});

/**
 * @route   PUT /api/live-chat/sessions/:id/accept
 * @desc    Admin action: Accept a Waiting Chat
 * @access  Staff / Admin only
 */
router.put('/sessions/:id/accept', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role === 'student') {
      return res.status(403).json({ success: false, message: 'Only staff and admins can accept chats.' });
    }

    const session = await liveChatModel.acceptSession(parseInt(req.params.id, 10), req.user);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.json({ success: true, message: `Chat #${session.session_code} accepted successfully!`, data: session });
  } catch (err) {
    console.error('Error accepting chat session:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to accept chat' });
  }
});

/**
 * @route   PUT /api/live-chat/sessions/:id/status
 * @desc    Admin action: Update status (Mark as Resolved, End Chat, Archive)
 * @access  Staff / Admin only
 */
router.put('/sessions/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role === 'student') {
      return res.status(403).json({ success: false, message: 'Only staff and admins can modify chat status.' });
    }

    const { status, remarks } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const session = await liveChatModel.updateSessionStatus(parseInt(req.params.id, 10), status, req.user, remarks);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.json({
      success: true,
      message: `Chat #${session.session_code} updated to status "${status}" (Archived for administrative reference).`,
      data: session,
    });
  } catch (err) {
    console.error('Error updating chat status:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update chat status' });
  }
});

/**
 * @route   POST /api/live-chat/check-inactivity
 * @desc    Trigger auto-close check for 1-2 min inactivity
 * @access  Public / Periodic
 */
router.post('/check-inactivity', async (req, res) => {
  try {
    const expiredCount = await liveChatModel.autoCloseInactiveSessions();
    res.json({ success: true, expiredCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to check inactivity' });
  }
});

module.exports = router;
