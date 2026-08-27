// backend/controllers/notificationController.js
const notificationModel = require('../models/notificationModel');

// @desc   Get current user's notifications
// @route  GET /api/notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel.findByUser(req.user.id);
    const unread = await notificationModel.unreadCount(req.user.id);
    res.json({ notifications, unreadCount: unread });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Mark a notification as read
// @route  PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    const notification = await notificationModel.markRead(req.params.id, req.user.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Mark all notifications as read
// @route  PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    const count = await notificationModel.markAllRead(req.user.id);
    res.json({ message: 'All notifications marked read', updated: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyNotifications, markRead, markAllRead };
