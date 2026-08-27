// backend/mcp/eduscholarMcpServer.js
// Model Context Protocol (MCP) Server for EduScholar Quezon City Scholarship Platform

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { pool } = require('../config/db');

const server = new Server(
  {
    name: 'eduscholar-mcp-server',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Define MCP Tools
const TOOLS = [
  {
    name: 'list_active_scholars',
    description: 'Retrieve registered Quezon City scholars from the student registry database with standing and GWA details.',
    inputSchema: {
      type: 'object',
      properties: {
        school: { type: 'string', description: 'Filter by university/school (e.g. QCU, UPD, ADMU, PUP)' },
        status: { type: 'string', description: "Filter by status (e.g. \"Active Good Standing\", \"Dean's List Honor\")" },
        limit: { type: 'number', description: 'Maximum rows to return (default: 20)' },
      },
    },
  },
  {
    name: 'lookup_application',
    description: 'Look up scholarship application details, progress status, requirements verification, and reviewer notes by reference code.',
    inputSchema: {
      type: 'object',
      properties: {
        application_code: { type: 'string', description: 'Application reference code (e.g. APP-QC-1786810009242)' },
      },
      required: ['application_code'],
    },
  },
  {
    name: 'get_open_scholarships',
    description: 'List all active Quezon City Scholarship Program (QCSP) tracks, eligibility requirements, stipend rates, and slots.',
    inputSchema: {
      type: 'object',
      properties: {
        category_id: { type: 'string', description: 'Filter by category (shs, tertiary, postgrad, continuing-vocational, creative-writing)' },
      },
    },
  },
  {
    name: 'get_treasury_budget_summary',
    description: 'Get current Quezon City Educational Aid budget allocations, total funds disbursed, and remaining balances.',
    inputSchema: {
      type: 'object',
      properties: {
        fiscal_year: { type: 'string', description: 'Fiscal year (default: 2026)' },
      },
    },
  },
  {
    name: 'verify_student_eligibility',
    description: 'Evaluate whether a candidate student meets the academic (GWA) and residency criteria for a given QC scholarship track.',
    inputSchema: {
      type: 'object',
      properties: {
        program_code: { type: 'string', description: 'Program code (e.g. QCSP-TERTIARY-ACADEMIC, QCSP-SHS-ECONOMIC)' },
        gwa: { type: 'number', description: 'Candidate Grade Weighted Average (GWA)' },
        is_qc_resident: { type: 'boolean', description: 'Whether the applicant is a verified QC resident' },
      },
      required: ['program_code', 'gwa'],
    },
  },
];

// Handle ListTools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle CallTool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'list_active_scholars') {
      const limit = args?.limit || 20;
      let query = 'SELECT student_id, full_name, email, school, program_name, gwa, status, grant_amount, disbursement_status FROM student_registry WHERE 1=1';
      const params = [];

      if (args?.school) {
        params.push(`%${args.school}%`);
        query += ` AND school ILIKE $${params.length}`;
      }
      if (args?.status) {
        params.push(args.status);
        query += ` AND status = $${params.length}`;
      }
      params.push(limit);
      query += ` ORDER BY gwa ASC LIMIT $${params.length}`;

      const res = await pool.query(query, params);
      return {
        content: [{ type: 'text', text: JSON.stringify({ count: res.rowCount, scholars: res.rows }, null, 2) }],
      };
    }

    if (name === 'lookup_application') {
      const res = await pool.query(
        `SELECT a.*, u.name as applicant_name, u.email as applicant_email, u.student_id 
         FROM applications a 
         LEFT JOIN users u ON a.user_id = u.id 
         WHERE a.application_code = $1 OR a.reference_id = $1`,
        [args.application_code]
      );
      if (res.rowCount === 0) {
        return {
          content: [{ type: 'text', text: `Application "${args.application_code}" was not found in the database.` }],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(res.rows[0], null, 2) }],
      };
    }

    if (name === 'get_open_scholarships') {
      let query = 'SELECT id, program_code, title, category_id, category_title, level, stipend, total_max, amount, min_gwa_text, slots, applied_count, status FROM scholarships WHERE 1=1';
      const params = [];
      if (args?.category_id) {
        params.push(args.category_id);
        query += ` AND category_id = $${params.length}`;
      }
      query += ' ORDER BY id ASC';
      const res = await pool.query(query, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res.rows, null, 2) }],
      };
    }

    if (name === 'get_treasury_budget_summary') {
      const year = args?.fiscal_year || '2026';
      const budgets = await pool.query('SELECT * FROM treasury_budgets WHERE fiscal_year = $1', [year]);
      const distributions = await pool.query('SELECT SUM(total_amount)::numeric AS total_disbursed, COUNT(*)::int AS total_batches FROM school_aid_distributions');
      
      const summary = {
        fiscal_year: year,
        budget_pools: budgets.rows,
        distribution_totals: distributions.rows[0],
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
      };
    }

    if (name === 'verify_student_eligibility') {
      const prog = await pool.query('SELECT * FROM scholarships WHERE program_code = $1', [args.program_code]);
      if (prog.rowCount === 0) {
        return { content: [{ type: 'text', text: `Error: Unknown program code "${args.program_code}"` }] };
      }
      const program = prog.rows[0];
      const minGwa = program.min_gwa_number ? Number(program.min_gwa_number) : 2.50;
      const studentGwa = Number(args.gwa);

      // In Philippine GPA scale (1.00 is best, 5.00 is fail)
      const meetsAcademic = studentGwa <= minGwa;
      const meetsResidency = args.is_qc_resident !== false;
      const isEligible = meetsAcademic && meetsResidency;

      const evaluation = {
        program: program.title,
        program_code: program.program_code,
        minimum_required_gwa: minGwa,
        student_gwa: studentGwa,
        meets_academic_criteria: meetsAcademic,
        meets_residency_criteria: meetsResidency,
        eligible: isEligible,
        recommendation: isEligible
          ? `Candidate qualifies for ${program.title}. Proceed with documentary submission.`
          : `Candidate does not meet criteria (Required GWA: ${minGwa} or better; Candidate GWA: ${studentGwa}).`,
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(evaluation, null, 2) }],
      };
    }

    return { content: [{ type: 'text', text: `Error: Unknown tool "${name}"` }] };
  } catch (err) {
    return { content: [{ type: 'text', text: `Database Error: ${err.message}` }] };
  }
});

// Handle ListResources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'eduscholar://metrics/overview',
        name: 'System Overview & Live Metric Summary',
        mimeType: 'application/json',
      },
      {
        uri: 'eduscholar://programs/catalog',
        name: 'Official QCSP Scholarship Track Catalog',
        mimeType: 'application/json',
      },
    ],
  };
});

// Handle ReadResource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri === 'eduscholar://metrics/overview') {
    const users = await pool.query('SELECT COUNT(*)::int as count FROM users');
    const apps = await pool.query('SELECT COUNT(*)::int as count FROM applications');
    const scholars = await pool.query('SELECT COUNT(*)::int as count FROM student_registry');
    const partners = await pool.query('SELECT COUNT(*)::int as count FROM partner_schools');
    const distributions = await pool.query('SELECT COALESCE(SUM(total_amount), 0)::numeric as total FROM school_aid_distributions');

    const metrics = {
      totalUsers: users.rows[0].count,
      totalApplications: apps.rows[0].count,
      activeScholars: scholars.rows[0].count,
      partnerSchools: partners.rows[0].count,
      totalDisbursedFunds: distributions.rows[0].total,
      timestamp: new Date().toISOString(),
    };
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(metrics, null, 2) }],
    };
  }

  if (uri === 'eduscholar://programs/catalog') {
    const programs = await pool.query('SELECT * FROM scholarships ORDER BY id ASC');
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(programs.rows, null, 2) }],
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});

// Start transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('EduScholar MCP Server running on stdio');
}

run().catch((err) => {
  console.error('MCP Server Fatal Error:', err);
  process.exit(1);
});
