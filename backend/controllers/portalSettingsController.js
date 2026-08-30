// backend/controllers/portalSettingsController.js
const portalSettingsModel = require('../models/portalSettingsModel');
const { broadcast } = require('../realtime/socketServer');

// @desc   Get current application portal settings (open/closed, dates, notice)
// @route  GET /api/portal-settings
// @access Public / Authenticated
const getSettings = async (req, res) => {
  try {
    const settings = await portalSettingsModel.getPortalSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('[portalSettingsController] getSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve portal settings' });
  }
};

// @desc   Update application portal settings (toggle open/closed, cycle dates)
// @route  PATCH /api/portal-settings
// @access Admin / Staff only
const updateSettings = async (req, res) => {
  try {
    if (req.user?.role === 'student') {
      return res.status(403).json({ success: false, message: 'Only administrators can modify portal intake settings.' });
    }

    const updated = await portalSettingsModel.updatePortalSettings(req.body);

    // Broadcast real-time portal status event to all connected clients
    try {
      broadcast({
        type: 'PORTAL_STATUS_CHANGED',
        isOpen: updated.isOpen,
        data: updated,
        updatedBy: req.user?.name || 'Administrator',
        timestamp: new Date().toISOString(),
      });
    } catch (wsErr) {
      // ws optional
    }

    res.json({
      success: true,
      message: `Application Portal intake is now ${updated.isOpen ? 'OPEN (Accepting Applications)' : 'CLOSED (Submissions Locked)'}`,
      data: updated,
    });
  } catch (error) {
    console.error('[portalSettingsController] updateSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update portal settings: ' + error.message });
  }
};

module.exports = { getSettings, updateSettings };
