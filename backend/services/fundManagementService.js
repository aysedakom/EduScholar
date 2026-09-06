// backend/services/fundManagementService.js
const { pool } = require('../config/db');
const { broadcast } = require('../realtime/socketServer');

/**
 * Scholarship Fund & Revenue Treasury Service
 * 
 * Manages government fund sources, donor endowments, and Funder Drawdown Pull Requests.
 * Allows administrators to request budget tranches from the City Treasury / Sponsoring Agencies
 * with official voucher issuance and audit trail. Connected to PostgreSQL.
 */

class FundManagementService {
  /**
   * Get all fund pools with calculated remaining balances
   */
  async getFundPools() {
    const res = await pool.query('SELECT * FROM treasury_fund_pools ORDER BY created_at ASC');
    return res.rows.map((pool) => {
      const totalBudget = parseFloat(pool.total_budget) || 0;
      const disbursed = parseFloat(pool.disbursed_amount) || 0;
      const committed = parseFloat(pool.committed_amount) || 0;
      const remaining = totalBudget - (disbursed + committed);
      const utilization = totalBudget > 0 ? Math.round(((disbursed + committed) / totalBudget) * 100) : 0;

      return {
        ...pool,
        total_budget: totalBudget,
        disbursed_amount: disbursed,
        committed_amount: committed,
        remaining_balance: Math.max(0, remaining),
        utilization_rate: `${utilization}%`,
      };
    });
  }

  /**
   * Get all funder drawdown pull requests
   */
  async getDrawdownRequests() {
    const res = await pool.query('SELECT * FROM treasury_drawdown_requests ORDER BY requested_date DESC, created_at DESC');
    return res.rows.map((req) => ({
      ...req,
      requested_amount: parseFloat(req.requested_amount) || 0,
      target_programs: typeof req.target_programs === 'string' ? JSON.parse(req.target_programs) : (req.target_programs || []),
    }));
  }

  /**
   * Create a new formal Funder Drawdown Pull Request
   */
  async createDrawdownRequest({ fund_id, requested_amount, tranche_name, target_programs, justification, requested_by }) {
    // Fetch target fund pool
    let fund;
    if (fund_id) {
      const fundRes = await pool.query('SELECT * FROM treasury_fund_pools WHERE id = $1', [fund_id]);
      fund = fundRes.rows[0];
    }
    if (!fund) {
      const defaultFundRes = await pool.query('SELECT * FROM treasury_fund_pools ORDER BY created_at ASC LIMIT 1');
      fund = defaultFundRes.rows[0];
    }

    const amount = parseFloat(requested_amount) || 1000000.00;

    // Count existing requests to build sequential ID
    const countRes = await pool.query('SELECT COUNT(*) FROM treasury_drawdown_requests');
    const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
    const reqId = `DR-QC-2026-${String(nextSeq).padStart(3, '0')}`;
    const voucherNumber = `QC-TREASURY-REQ-${Date.now().toString().slice(-6)}`;
    const reqDate = new Date().toISOString().split('T')[0];
    const programsArr = Array.isArray(target_programs) && target_programs.length > 0 
      ? target_programs 
      : ['Economic Scholarship (Need-Based)', 'Tertiary Academic'];

    const insertRes = await pool.query(
      `INSERT INTO treasury_drawdown_requests
       (id, fund_id, fund_name, funder_agency, requested_amount, tranche_name, target_programs, justification, status, requested_by, requested_date, voucher_number, disbursed_to_vault)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, 'Pending Accountant Pre-Audit', $9, $10, $11, FALSE)
       RETURNING *`,
      [
        reqId,
        fund.id,
        fund.name,
        fund.funder_agency,
        amount,
        tranche_name || `Disbursement Tranche (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`,
        JSON.stringify(programsArr),
        justification || 'Official scholarship grant tranche requested for qualified student scholars.',
        requested_by || 'Quezon City Scholarship Board Administrator',
        reqDate,
        voucherNumber,
      ]
    );

    const newRequest = {
      ...insertRes.rows[0],
      requested_amount: amount,
      target_programs: programsArr,
    };

    // Update committed amount in the fund pool
    await pool.query(
      `UPDATE treasury_fund_pools 
       SET committed_amount = committed_amount + $1, updated_at = NOW() 
       WHERE id = $2`,
      [amount, fund.id]
    );

    // Dispatch real-time in-app notification to City Treasury and System Admins
    try {
      const treasuryUsers = await pool.query("SELECT id FROM users WHERE role IN ('treasury', 'system_admin')");
      for (const tUser of treasuryUsers.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
           VALUES ($1, $2, $3, 'warning', FALSE, 'fund_grant_request', '/treasury/budget')`,
          [
            tUser.id,
            `🏛️ Grant Fund Request: ₱${amount.toLocaleString()} (${fund.name})`,
            `Administrator requested a budget drawdown of ₱${amount.toLocaleString()} for "${newRequest.tranche_name}". Please review and authorize grant release in Treasury Portal.`,
          ]
        );
      }

      broadcast({
        type: 'FUND_GRANT_REQUESTED',
        data: newRequest,
        timestamp: new Date().toISOString(),
      });
    } catch (notifErr) {
      console.warn('[fundManagementService] Treasury notification note:', notifErr.message);
    }

    return {
      success: true,
      message: `Funder Drawdown Request ${reqId} for ₱${amount.toLocaleString()} successfully submitted to ${fund.funder_agency}!`,
      data: newRequest,
    };
  }

  /**
   * Update status of Funder Drawdown Request (Approve / Credit to Vault)
   */
  async updateDrawdownStatus(id, newStatus, approvalNotes = '') {
    const reqRes = await pool.query('SELECT * FROM treasury_drawdown_requests WHERE id = $1', [id]);
    const req = reqRes.rows[0];
    if (!req) {
      throw new Error('Drawdown request not found');
    }

    const reqAmount = parseFloat(req.requested_amount) || 0;
    const isApproved = newStatus === 'Transferred & Credited' || newStatus === 'Approved';
    const approvedDate = isApproved ? new Date().toISOString().split('T')[0] : req.approved_date;
    const disbursedToVault = isApproved ? true : req.disbursed_to_vault;

    const updateReqRes = await pool.query(
      `UPDATE treasury_drawdown_requests
       SET status = $1, approved_date = $2, disbursed_to_vault = $3, approval_notes = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [newStatus, approvedDate, disbursedToVault, approvalNotes || req.approval_notes, id]
    );

    const updatedReq = {
      ...updateReqRes.rows[0],
      requested_amount: reqAmount,
      target_programs: typeof updateReqRes.rows[0].target_programs === 'string'
        ? JSON.parse(updateReqRes.rows[0].target_programs)
        : (updateReqRes.rows[0].target_programs || []),
    };

    if (isApproved) {
      // Move from committed to disbursed in fund pool
      await pool.query(
        `UPDATE treasury_fund_pools 
         SET committed_amount = GREATEST(0, committed_amount - $1),
             disbursed_amount = disbursed_amount + $1,
             tranches_released = tranches_released + 1,
             last_drawdown_date = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [reqAmount, approvedDate, req.fund_id]
      );

      // Dispatch notification to Admins that funds have been credited
      try {
        const adminUsers = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'system_admin')");
        for (const aUser of adminUsers.rows) {
          await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
             VALUES ($1, $2, $3, 'success', FALSE, 'fund_credited', '/admin/funds')`,
            [
              aUser.id,
              `✅ Funds Credited: ₱${reqAmount.toLocaleString()}`,
              `City Treasury approved and credited ${req.tranche_name} (₱${reqAmount.toLocaleString()}) to active vault.`,
            ]
          );
        }

        broadcast({
          type: 'FUND_CREDITED',
          data: updatedReq,
          timestamp: new Date().toISOString(),
        });
      } catch (notifErr) {
        console.warn('[fundManagementService] Admin notification note:', notifErr.message);
      }
    }

    return {
      success: true,
      message: `Drawdown Request ${id} status updated to "${newStatus}"`,
      data: updatedReq,
    };
  }

  /**
   * Create a new Fund Pool
   */
  async createFundPool(poolData) {
    const id = `FUND-CUSTOM-${Date.now().toString().slice(-4)}`;
    const totalBudget = parseFloat(poolData.total_budget) || 5000000.00;

    const res = await pool.query(
      `INSERT INTO treasury_fund_pools 
       (id, name, funder_agency, funder_type, revenue_source, total_budget, disbursed_amount, committed_amount, fiscal_year, status, contact_person, tranches_released, last_drawdown_date)
       VALUES ($1, $2, $3, $4, $5, $6, 0.00, 0.00, $7, 'Active', $8, 0, NULL)
       RETURNING *`,
      [
        id,
        poolData.name,
        poolData.funder_agency || 'Quezon City Local Government Unit',
        poolData.funder_type || 'LGU Educational Appropriation',
        poolData.revenue_source || 'City Special Education Allocation',
        totalBudget,
        poolData.fiscal_year || 'FY 2026-2027',
        poolData.contact_person || 'City Budget Office',
      ]
    );

    const poolRow = res.rows[0];
    return {
      ...poolRow,
      total_budget: totalBudget,
      disbursed_amount: 0,
      committed_amount: 0,
      remaining_balance: totalBudget,
      utilization_rate: '0%',
    };
  }
}

module.exports = new FundManagementService();
