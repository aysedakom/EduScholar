// backend/services/fundManagementService.js
/**
 * Scholarship Fund & Revenue Treasury Service
 * 
 * Manages government fund sources, donor endowments, and Funder Drawdown Pull Requests.
 * Allows administrators to request budget tranches from the City Treasury / Sponsoring Agencies
 * with official voucher issuance and audit trail.
 */

let FUND_POOLS = [
  {
    id: 'FUND-QC-SEF',
    name: 'Quezon City Special Education Fund (SEF)',
    funder_agency: 'Quezon City Local School Board & City Treasury',
    funder_type: 'LGU Special Education Tax Allocation',
    revenue_source: 'Local Real Property Tax (SEF 1% Surcharge)',
    total_budget: 50000000.00,
    disbursed_amount: 18500000.00,
    committed_amount: 12000000.00,
    fiscal_year: 'FY 2026-2027',
    status: 'Active',
    contact_person: 'Office of City Treasurer / City Council',
    tranches_released: 3,
    last_drawdown_date: '2026-07-15',
  },
  {
    id: 'FUND-QC-YOUTH',
    name: 'Quezon City Executive Youth Financial Aid Fund',
    funder_agency: 'Quezon City Youth Development Office (QCYDO)',
    funder_type: 'LGU Executive Budget Line',
    revenue_source: 'QC General Appropriations Ordinance',
    total_budget: 25000000.00,
    disbursed_amount: 8200000.00,
    committed_amount: 6500000.00,
    fiscal_year: 'FY 2026-2027',
    status: 'Active',
    contact_person: 'Executive Director, QCYDO',
    tranches_released: 2,
    last_drawdown_date: '2026-06-20',
  },
  {
    id: 'FUND-CHED-TES',
    name: 'CHED UniFAST Tertiary Education Subsidy (TES) Equity',
    funder_agency: 'Commission on Higher Education (CHED) & UniFAST Board',
    funder_type: 'National Government Co-Funding Tranche',
    revenue_source: 'Republic Act 10931 National Subsidy Pool',
    total_budget: 30000000.00,
    disbursed_amount: 12000000.00,
    committed_amount: 8000000.00,
    fiscal_year: 'FY 2026-2027',
    status: 'Active',
    contact_person: 'UniFAST Regional Operations Office',
    tranches_released: 2,
    last_drawdown_date: '2026-05-10',
  },
  {
    id: 'FUND-DOST-STEM',
    name: 'DOST-SEI STEM Excellence Co-Funding Grant Pool',
    funder_agency: 'Department of Science and Technology (DOST-SEI)',
    funder_type: 'National Science & Technology Endowment',
    revenue_source: 'DOST Science Education Institute Fund',
    total_budget: 15000000.00,
    disbursed_amount: 4500000.00,
    committed_amount: 3000000.00,
    fiscal_year: 'FY 2026-2027',
    status: 'Active',
    contact_person: 'DOST-SEI Scholarship Division',
    tranches_released: 1,
    last_drawdown_date: '2026-04-12',
  },
  {
    id: 'FUND-QC-NEED',
    name: 'Quezon City General Revenue Need-Based Aid Pool',
    funder_agency: 'Quezon City Social Services & Development Dept. (SSDD)',
    funder_type: 'LGU Indigency & Welfare Allocation',
    revenue_source: 'City Welfare & Educational Equity Fund',
    total_budget: 20000000.00,
    disbursed_amount: 7000000.00,
    committed_amount: 5000000.00,
    fiscal_year: 'FY 2026-2027',
    status: 'Active',
    contact_person: 'SSDD Educational Grants Desk',
    tranches_released: 2,
    last_drawdown_date: '2026-06-05',
  }
];

let DRAWDOWN_REQUESTS = [
  {
    id: 'DR-QC-2026-001',
    fund_id: 'FUND-QC-SEF',
    fund_name: 'Quezon City Special Education Fund (SEF)',
    funder_agency: 'Quezon City Local School Board & City Treasury',
    requested_amount: 10000000.00,
    tranche_name: 'Tranche 1: 1st Semester AY 2026-2027 Major Grants',
    target_programs: ['Tertiary Academic Scholarship', 'Economic Scholarship', 'Senior High School Aid'],
    justification: 'Disbursement allocation for 1,000 qualified tertiary and SHS scholars for 1st Semester matriculation & stipends.',
    status: 'Transferred & Credited',
    requested_by: 'Office of the City Mayor - Scholarship Administrator',
    requested_date: '2026-07-01',
    approved_date: '2026-07-15',
    voucher_number: 'QC-TREASURY-VCH-2026-8819',
    disbursed_to_vault: true,
  },
  {
    id: 'DR-QC-2026-002',
    fund_id: 'FUND-QC-YOUTH',
    fund_name: 'Quezon City Executive Youth Financial Aid Fund',
    funder_agency: 'Quezon City Youth Development Office (QCYDO)',
    requested_amount: 5000000.00,
    tranche_name: 'Tranche 2: Specialized & Youth Leadership Grants',
    target_programs: ['Youth Leaders Scholarship', 'Athletic & Arts Grant'],
    justification: 'Financial assistance for accredited youth leaders and varsity student scholars.',
    status: 'Transferred & Credited',
    requested_by: 'Quezon City Scholarship Board',
    requested_date: '2026-08-01',
    approved_date: '2026-08-10',
    voucher_number: 'QC-TREASURY-VCH-2026-9042',
    disbursed_to_vault: true,
  },
  {
    id: 'DR-QC-2026-003',
    fund_id: 'FUND-CHED-TES',
    fund_name: 'CHED UniFAST Tertiary Education Subsidy (TES) Equity',
    funder_agency: 'Commission on Higher Education (CHED) & UniFAST Board',
    requested_amount: 8000000.00,
    tranche_name: 'Tranche 1: Tertiary Need-Based Equity Subsidy',
    target_programs: ['Economic Scholarship (Need-Based Financial Assistance)'],
    justification: 'Supplementary stipend assistance for indigent college students in partner HEIs.',
    status: 'Under Funder Treasury Review',
    requested_by: 'LGU Higher Education Coordination Unit',
    requested_date: '2026-08-20',
    approved_date: null,
    voucher_number: 'CHED-DRAWDOWN-REQ-2026-019',
    disbursed_to_vault: false,
  }
];

class FundManagementService {
  /**
   * Get all fund pools with calculated remaining balances
   */
  async getFundPools() {
    return FUND_POOLS.map((pool) => {
      const remaining = pool.total_budget - (pool.disbursed_amount + pool.committed_amount);
      const utilization = Math.round(((pool.disbursed_amount + pool.committed_amount) / pool.total_budget) * 100);
      return {
        ...pool,
        remaining_balance: Math.max(0, remaining),
        utilization_rate: `${utilization}%`,
      };
    });
  }

  /**
   * Get all funder drawdown pull requests
   */
  async getDrawdownRequests() {
    return DRAWDOWN_REQUESTS;
  }

  /**
   * Create a new formal Funder Drawdown Pull Request
   */
  async createDrawdownRequest({ fund_id, requested_amount, tranche_name, target_programs, justification, requested_by }) {
    const fund = FUND_POOLS.find((f) => f.id === fund_id) || FUND_POOLS[0];
    const amount = parseFloat(requested_amount) || 1000000.00;
    const reqId = `DR-QC-2026-${String(DRAWDOWN_REQUESTS.length + 1).padStart(3, '0')}`;
    const voucherNumber = `QC-TREASURY-REQ-${Date.now().toString().slice(-6)}`;

    const newRequest = {
      id: reqId,
      fund_id: fund.id,
      fund_name: fund.name,
      funder_agency: fund.funder_agency,
      requested_amount: amount,
      tranche_name: tranche_name || `Disbursement Tranche (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`,
      target_programs: Array.isArray(target_programs) && target_programs.length > 0 ? target_programs : ['Economic Scholarship (Need-Based)', 'Tertiary Academic'],
      justification: justification || 'Official scholarship grant tranche requested for qualified student scholars.',
      status: 'Submitted to Funder Treasury',
      requested_by: requested_by || 'Quezon City Scholarship Board Administrator',
      requested_date: new Date().toISOString().split('T')[0],
      approved_date: null,
      voucher_number: voucherNumber,
      disbursed_to_vault: false,
    };

    DRAWDOWN_REQUESTS = [newRequest, ...DRAWDOWN_REQUESTS];

    // Update committed amount in the fund pool
    fund.committed_amount = (fund.committed_amount || 0) + amount;

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
    const req = DRAWDOWN_REQUESTS.find((r) => r.id === id);
    if (!req) {
      throw new Error('Drawdown request not found');
    }

    req.status = newStatus;
    if (newStatus === 'Transferred & Credited' || newStatus === 'Approved') {
      req.approved_date = new Date().toISOString().split('T')[0];
      req.disbursed_to_vault = true;

      // Move from committed to disbursed in fund pool
      const fund = FUND_POOLS.find((f) => f.id === req.fund_id);
      if (fund) {
        fund.committed_amount = Math.max(0, (fund.committed_amount || 0) - req.requested_amount);
        fund.disbursed_amount = (fund.disbursed_amount || 0) + req.requested_amount;
        fund.tranches_released = (fund.tranches_released || 0) + 1;
        fund.last_drawdown_date = req.approved_date;
      }
    }

    return {
      success: true,
      message: `Drawdown Request ${id} status updated to "${newStatus}"`,
      data: req,
    };
  }

  /**
   * Create a new Fund Pool
   */
  async createFundPool(poolData) {
    const id = `FUND-CUSTOM-${Date.now().toString().slice(-4)}`;
    const newPool = {
      id,
      name: poolData.name,
      funder_agency: poolData.funder_agency || 'Quezon City Local Government Unit',
      funder_type: poolData.funder_type || 'LGU Educational Appropriation',
      revenue_source: poolData.revenue_source || 'City Special Education Allocation',
      total_budget: parseFloat(poolData.total_budget) || 5000000.00,
      disbursed_amount: 0.00,
      committed_amount: 0.00,
      fiscal_year: poolData.fiscal_year || 'FY 2026-2027',
      status: 'Active',
      contact_person: poolData.contact_person || 'City Budget Office',
      tranches_released: 0,
      last_drawdown_date: null,
    };

    FUND_POOLS = [newPool, ...FUND_POOLS];
    return newPool;
  }
}

module.exports = new FundManagementService();
