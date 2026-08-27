// backend/routes/calendar.js
const express = require('express');
const router = express.Router();
const calendarService = require('../services/calendarService');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/calendar/events
// @desc    Get all system milestones and custom calendar notices
// @access  Public / Authenticated
router.get('/events', async (req, res) => {
  try {
    const events = await calendarService.getAllCalendarEvents(req.query);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch calendar events' });
  }
});

// @route   POST /api/calendar/events
// @desc    Create a custom calendar notice / milestone
// @access  Staff / Admin only
router.post('/events', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role === 'student') {
      return res.status(403).json({ success: false, message: 'Only administrators can create calendar notices.' });
    }
    const createdEvent = await calendarService.createCalendarEvent(req.body, req.user);
    res.status(201).json({
      success: true,
      message: `Calendar notice "${createdEvent.title}" scheduled for ${createdEvent.date}!`,
      data: createdEvent,
    });
  } catch (err) {
    console.error('Error creating calendar event:', err);
    res.status(500).json({ success: false, message: 'Failed to create calendar event' });
  }
});

// @route   DELETE /api/calendar/events/:id
// @desc    Delete a custom calendar notice
// @access  Staff / Admin only
router.delete('/events/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role === 'student') {
      return res.status(403).json({ success: false, message: 'Only administrators can delete calendar notices.' });
    }
    const result = await calendarService.deleteCalendarEvent(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Error deleting calendar event:', err);
    res.status(500).json({ success: false, message: 'Failed to delete calendar event' });
  }
});

module.exports = router;
