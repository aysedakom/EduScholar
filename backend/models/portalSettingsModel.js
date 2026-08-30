// backend/models/portalSettingsModel.js
const { pool } = require('../config/db');

const DEFAULT_PORTAL_SETTINGS = {
  isOpen: true,
  academicYear: 'AY 2026-2027',
  term: '1st Semester',
  openingDate: '2026-08-01',
  closingDate: '2026-09-30',
  closedMessage: 'The Quezon City Scholarship Application Portal is currently closed for new submissions. Evaluators are processing active candidate review queues.',
  nextCycleOpening: 'October 15, 2026',
};

const getPortalSettings = async () => {
  try {
    const res = await pool.query(
      `SELECT setting_value, updated_at FROM portal_settings WHERE setting_key = 'application_portal'`
    );
    if (res.rows.length === 0) {
      return DEFAULT_PORTAL_SETTINGS;
    }
    const val = typeof res.rows[0].setting_value === 'string'
      ? JSON.parse(res.rows[0].setting_value)
      : res.rows[0].setting_value;
    return { ...DEFAULT_PORTAL_SETTINGS, ...val, updatedAt: res.rows[0].updated_at };
  } catch (err) {
    console.warn('[portalSettingsModel.getPortalSettings] Error:', err.message);
    return DEFAULT_PORTAL_SETTINGS;
  }
};

const updatePortalSettings = async (newSettings = {}) => {
  try {
    const current = await getPortalSettings();
    const merged = { ...current, ...newSettings };

    const res = await pool.query(
      `INSERT INTO portal_settings (setting_key, setting_value, updated_at)
       VALUES ('application_portal', $1, NOW())
       ON CONFLICT (setting_key) DO UPDATE
       SET setting_value = $1, updated_at = NOW()
       RETURNING setting_value, updated_at`,
      [JSON.stringify(merged)]
    );

    const val = typeof res.rows[0].setting_value === 'string'
      ? JSON.parse(res.rows[0].setting_value)
      : res.rows[0].setting_value;

    return { ...DEFAULT_PORTAL_SETTINGS, ...val, updatedAt: res.rows[0].updated_at };
  } catch (err) {
    console.error('[portalSettingsModel.updatePortalSettings] Error:', err.message);
    throw err;
  }
};

module.exports = { getPortalSettings, updatePortalSettings, DEFAULT_PORTAL_SETTINGS };
