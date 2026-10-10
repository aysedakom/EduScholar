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
 * Fetch all audit logs across all users and activities with optional filters
 */
async function getAllAuditLogs({ entityType, actorId, limit = 100, offset = 0 } = {}) {
  await ensureAuditLogTable();
  try {
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (entityType) {
      conditions.push(`entity_type = $${paramIdx++}`);
      params.push(entityType);
    }

    if (actorId) {
      conditions.push(`(actor_id = $${paramIdx} OR entity_id = $${paramIdx})`);
      paramIdx++;
      params.push(String(actorId));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit);
    params.push(offset);

    const query = `
      SELECT 
        a.*,
        u.name as actor_name,
        u.email as actor_email
      FROM audit_logs a
      LEFT JOIN users u ON u.email = a.actor_id OR CAST(u.id AS TEXT) = a.actor_id
      ${whereClause}
      ORDER BY a.timestamp DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('[AuditLogModel] Failed to fetch all audit logs:', error.message);
    return [];
  }
}

module.exports = {
  recordAuditLog,
  getAuditLogsByEntity,
  getAllAuditLogs,
  ensureAuditLogTable,
};
