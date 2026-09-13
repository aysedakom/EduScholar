// backend/models/auditLogModel.js
const { pool } = require('../config/db');

/**
 * Creates audit_logs table if it does not exist
 */
async function ensureAuditLogTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor_id VARCHAR(100),
        actor_role VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        previous_state VARCHAR(100),
        new_state VARCHAR(100),
        entity_type VARCHAR(100) DEFAULT 'application',
        entity_id VARCHAR(100),
        rationale TEXT,
        ip_address VARCHAR(50),
        user_agent TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, timestamp);
    `);
  } catch (err) {
    console.warn('[AuditLogModel] Table check warning:', err.message);
  }
}

/**
 * Record an immutable audit log entry
 */
async function recordAuditLog({
  actorId = 'system',
  actorRole = 'system',
  action,
  previousState = null,
  newState = null,
  entityType = 'application',
  entityId = null,
  rationale = null,
  ipAddress = null,
  userAgent = null,
}) {
  await ensureAuditLogTable();
  try {
    const result = await pool.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, previous_state, new_state, entity_type, entity_id, rationale, ip_address, user_agent, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [actorId, actorRole, action, previousState, newState, entityType, entityId, rationale, ipAddress, userAgent]
    );
    return result.rows[0];
  } catch (error) {
    console.error('[AuditLogModel] Failed to record audit log:', error.message);
    return null;
  }
}

/**
 * Fetch audit logs for a specific entity
 */
async function getAuditLogsByEntity(entityType, entityId) {
  await ensureAuditLogTable();
  try {
    const result = await pool.query(
      `SELECT * FROM audit_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY timestamp DESC`,
      [entityType, entityId]
    );
    return result.rows;
  } catch (error) {
    console.error('[AuditLogModel] Failed to fetch audit logs:', error.message);
    return [];
  }
}

module.exports = {
  recordAuditLog,
  getAuditLogsByEntity,
  ensureAuditLogTable,
};
