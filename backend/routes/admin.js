// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { resetDatabase } = require('../db/reset');
const authMiddleware = require('../middleware/auth');

// POST /api/admin/reset-db - Reset and re-seed all tables in database
router.post('/reset-db', async (req, res) => {
  try {
    await resetDatabase();
    res.json({
      success: true,
      message: 'Database has been successfully reset and re-seeded with authentic Quezon City scholarship records! 🎉'
    });
  } catch (error) {
    console.error('[admin] reset-db error:', error);
    res.status(500).json({ success: false, message: 'Database reset failed: ' + error.message });
  }
});

// GET /api/admin/users - List all users in PostgreSQL database
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const checkCount = await pool.query('SELECT COUNT(*)::int as count FROM users');
    if (checkCount.rows[0].count < 7) {
      const defaultPassHash = await bcrypt.hash('January10', 10);
      const officialAccounts = [
        { name: 'ADMIN', email: 'support.edu2026@gmail.com', role: 'admin', dept: 'Quezon City Youth Development Office (QCYDO)' },
        { name: 'City Treasury Disbursing Officer', email: 'treasury.edu2026@gmail.com', role: 'treasury', dept: 'Quezon City Hall Treasury Office' },
        { name: 'John Steaven Balansag', email: 'sr.edu2026@gmail.com', role: 'school_coordinator', dept: 'Quezon City University & Partner Schools' },
        { name: 'Scholarship Program Supervisor', email: 'sv.edu2026@gmail.com', role: 'supervisor', dept: 'Quezon City Youth Development Office (QCYDO)' },
        { name: 'System Administrator', email: 'sysadmin.edu2026@gmail.com', role: 'system_admin', dept: 'Quezon City IT & System Services' },
        { name: 'Juan Dela Cruz (Student Scholar)', email: 'student.edu2026@gmail.com', role: 'student', dept: 'Quezon City University' },
        { name: 'Demo Student Account', email: 'student@gmail.com', role: 'student', dept: 'Quezon City University' },
      ];
      for (const u of officialAccounts) {
        await pool.query(`
          INSERT INTO users (name, email, password, role, department, status, is_email_verified)
          VALUES ($1, $2, $3, $4, $5, 'active', true)
          ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, is_email_verified = true, status = 'active'
        `, [u.name, u.email.toLowerCase().trim(), defaultPassHash, u.role, u.dept]);
      }
    }

    const result = await pool.query(
      'SELECT id, name, email, role, department, major, gpa, status, student_id, is_email_verified, created_at FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[admin] users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// POST /api/admin/users/sync-passwords - Synchronize all designated role passwords to January10
router.post('/users/sync-passwords', authMiddleware, async (req, res) => {
  try {
    const defaultPassHash = await bcrypt.hash('January10', 10);
    const officialAccounts = [
      { name: 'ADMIN', email: 'support.edu2026@gmail.com', role: 'admin', dept: 'Quezon City Youth Development Office (QCYDO)' },
      { name: 'City Treasury Disbursing Officer', email: 'treasury.edu2026@gmail.com', role: 'treasury', dept: 'Quezon City Hall Treasury Office' },
      { name: 'John Steaven Balansag', email: 'sr.edu2026@gmail.com', role: 'school_coordinator', dept: 'Quezon City University & Partner Schools' },
      { name: 'Scholarship Program Supervisor', email: 'sv.edu2026@gmail.com', role: 'supervisor', dept: 'Quezon City Youth Development Office (QCYDO)' },
      { name: 'System Administrator', email: 'sysadmin.edu2026@gmail.com', role: 'system_admin', dept: 'Quezon City IT & System Services' },
      { name: 'Juan Dela Cruz (Student Scholar)', email: 'student.edu2026@gmail.com', role: 'student', dept: 'Quezon City University' },
      { name: 'Demo Student Account', email: 'student@gmail.com', role: 'student', dept: 'Quezon City University' },
    ];

    for (const u of officialAccounts) {
      await pool.query(`
        INSERT INTO users (name, email, password, role, department, status, is_email_verified)
        VALUES ($1, $2, $3, $4, $5, 'active', true)
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password = $3, role = $4, is_email_verified = true, status = 'active'
      `, [u.name, u.email.toLowerCase().trim(), defaultPassHash, u.role, u.dept]);
    }

    res.json({
      success: true,
      message: 'All system role accounts (Admin, Treasury, Coordinator, Supervisor, SysAdmin, Student) have been synchronized with password "January10" and active status.',
    });
  } catch (error) {
    console.error('[admin] sync-passwords error:', error);
    res.status(500).json({ message: 'Failed to synchronize role passwords: ' + error.message });
  }
});

// PUT /api/admin/users/:id/password - Reset or set custom password for any user
router.put('/users/:id/password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const targetId = req.params.id;
    const passwordToSet = newPassword || 'January10';
    const hashedPassword = await bcrypt.hash(passwordToSet, 10);

    const result = await pool.query(
      `UPDATE users 
       SET password = $1, is_email_verified = true, status = 'active', updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, name, email, role, status`,
      [hashedPassword, targetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User account not found' });
    }

    res.json({
      success: true,
      message: `Password for ${result.rows[0].email} successfully updated to "${passwordToSet}".`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('[admin] update user password error:', error);
    res.status(500).json({ message: 'Failed to update user password: ' + error.message });
  }
});

// GET /api/admin/stats - System and table row statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*)::int as count FROM users');
    const appCount = await pool.query('SELECT COUNT(*)::int as count FROM applications');
    const schCount = await pool.query('SELECT COUNT(*)::int as count FROM scholarships');
    const partnerCount = await pool.query('SELECT COUNT(*)::int as count FROM partner_schools');
    const distCount = await pool.query('SELECT COUNT(*)::int as count FROM school_aid_distributions');
    const regCount = await pool.query('SELECT COUNT(*)::int as count FROM student_registry');

    res.json({
      users: userCount.rows[0].count,
      applications: appCount.rows[0].count,
      scholarships: schCount.rows[0].count,
      partners: partnerCount.rows[0].count,
      distributions: distCount.rows[0].count,
      scholars: regCount.rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[admin] stats error:', error);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/audit-logs - List audit logs with user info
router.get('/audit-logs', authMiddleware, async (req, res) => {
  try {
    const { entityType, actorId, limit = 100, offset = 0 } = req.query;
    const auditLogModel = require('../models/auditLogModel');
    const logs = await auditLogModel.getAllAuditLogs({
      entityType: entityType ? String(entityType) : undefined,
      actorId: actorId ? String(actorId) : undefined,
      limit: Number(limit) || 100,
      offset: Number(offset) || 0,
    });
    res.json({ success: true, logs });
  } catch (error) {
    console.error('[admin] audit-logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs: ' + error.message });
  }
});

// POST /api/admin/users - Create new system user account with audit logging
router.post('/users', authMiddleware, async (req, res) => {
  try {
    const { name, email, role, department, password } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required.' });
    }

    const defaultPass = password || 'January10';
    const hashedPassword = await bcrypt.hash(defaultPass, 10);
    const normalizedEmail = email.toLowerCase().trim();

    const insertRes = await pool.query(
      `INSERT INTO users (name, email, password, role, department, status, is_email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'active', true, NOW(), NOW())
       RETURNING id, name, email, role, department, status, created_at`,
      [name, normalizedEmail, hashedPassword, role.toLowerCase().replace(' ', '_'), department || 'Quezon City Youth Development Office']
    );

    const newUser = insertRes.rows[0];

    // Audit log
    const auditLogModel = require('../models/auditLogModel');
    await auditLogModel.recordAuditLog({
      actorId: req.user?.email || 'admin',
      actorRole: req.user?.role || 'admin',
      action: 'USER_CREATED',
      newState: 'Active',
      entityType: 'user',
      entityId: String(newUser.id),
      rationale: `Created new ${newUser.role} user account for ${newUser.name} (${newUser.email})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('[admin] create user error:', error);
    res.status(500).json({ message: 'Failed to create user: ' + error.message });
  }
});

// PUT /api/admin/users/:id/status - Toggle lock/active status with audit log
router.put('/users/:id/status', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.id;
    const { status, rationale } = req.body;

    const userCheck = await pool.query('SELECT id, name, email, role, status FROM users WHERE id = $1', [targetId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const previousStatus = userCheck.rows[0].status;
    const newStatus = status || (previousStatus === 'locked' ? 'active' : 'locked');

    const updateRes = await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, status',
      [newStatus, targetId]
    );

    // Audit log
    const auditLogModel = require('../models/auditLogModel');
    await auditLogModel.recordAuditLog({
      actorId: req.user?.email || 'admin',
      actorRole: req.user?.role || 'admin',
      action: newStatus === 'locked' ? 'USER_LOCKED' : 'USER_UNLOCKED',
      previousState: previousStatus,
      newState: newStatus,
      entityType: 'user',
      entityId: String(targetId),
      rationale: rationale || `Admin changed account status from ${previousStatus} to ${newStatus} for ${userCheck.rows[0].email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, user: updateRes.rows[0] });
  } catch (error) {
    console.error('[admin] update status error:', error);
    res.status(500).json({ message: 'Failed to update user status: ' + error.message });
  }
});

// DELETE /api/admin/users/:id - Delete user with audit log
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.id;
    const userCheck = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [targetId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [targetId]);

    // Audit log
    const auditLogModel = require('../models/auditLogModel');
    await auditLogModel.recordAuditLog({
      actorId: req.user?.email || 'admin',
      actorRole: req.user?.role || 'admin',
      action: 'USER_DELETED',
      previousState: 'Active',
      newState: 'Deleted',
      entityType: 'user',
      entityId: String(targetId),
      rationale: `Permanently removed user account ${userCheck.rows[0].name} (${userCheck.rows[0].email})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: `User account ${targetId} deleted successfully.` });
  } catch (error) {
    console.error('[admin] delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user: ' + error.message });
  }
});

module.exports = router;

