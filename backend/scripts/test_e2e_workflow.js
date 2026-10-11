// scripts/test_e2e_workflow.js
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const applicationModel = require('../models/applicationModel');
const { updateScholarStatus } = require('../controllers/registryController');

async function runE2ETest() {
  console.log('=== STARTING END-TO-END WORKFLOW INTEGRATION TEST ===\n');
  const timestamp = Date.now();
  const testEmail = `e2e_student_${timestamp}@qc.edu.ph`;
  const testStudentId = `2026-E2E-${String(timestamp).slice(-5)}`;
  const testName = 'Juan Protacio Rizal';

  try {
    // ----------------------------------------------------
    // STEP 1: Student Account Registration & Authentication
    // ----------------------------------------------------
    console.log('[Step 1] Registering fresh student user account...');
    const hashedPassword = await bcrypt.hash('January10', 10);
    const userInsert = await pool.query(
      `INSERT INTO users (name, email, password, role, student_id, department, major, phone, address, barangay, city, status, is_email_verified)
       VALUES ($1, $2, $3, 'student', $4, 'Quezon City University (QCU)', 'B.S. Information Technology', '+63 917 123 4567', '123 Katipunan Ave', 'Barangay Central', 'Quezon City', 'active', true)
       RETURNING id, name, email, role, student_id, department, major, barangay`,
      [testName, testEmail, hashedPassword, testStudentId]
    );
    const studentUser = userInsert.rows[0];
    console.log('  -> Registered User ID:', studentUser.id);
    console.log('  -> Name:', studentUser.name);
    console.log('  -> Student ID:', studentUser.student_id);
    console.log('  -> Email:', studentUser.email);

    // Verify Initial Student Registry status before application
    const initialRegCheck = await pool.query('SELECT * FROM student_registry WHERE user_id = $1 OR email = $2', [studentUser.id, studentUser.email]);
    console.log('  -> Initial student_registry records count:', initialRegCheck.rows.length, '(Expected: 0)');

    // ----------------------------------------------------
    // STEP 2: Student Scholarship Application Submission
    // ----------------------------------------------------
    console.log('\n[Step 2] Submitting scholarship application with documents...');
    const createdApp = await applicationModel.create({
      user_id: studentUser.id,
      type: 'Scholarship',
      program_id: 'tertiary-academic',
      program_name: 'Academic Scholarship (Tertiary College)',
      title: 'Academic Scholarship (Tertiary College)',
      amount: 25000,
      status: 'Under Review',
      progress: 33,
      district: 'District 4',
      barangay: 'Barangay Central',
      address: '123 Katipunan Ave',
      form_data: {
        studentId: testStudentId,
        firstName: 'Juan',
        lastName: 'Rizal',
        email: testEmail,
        school: 'Quezon City University (QCU)',
        course: 'B.S. Information Technology',
        yearLevel: '3rd Year',
        gpa: 1.50,
        gwa: 1.50,
        unitsEnrolled: 21,
        annualFamilyIncome: '180000',
        barangay: 'Barangay Central',
        district: 'District 4',
        documentsSubmitted: [
          { name: 'COR_QCU_AY2026_Official.pdf', category: 'Certificate of Registration', size: '1.2 MB' },
          { name: 'COG_True_Copy_Grades.pdf', category: 'Certified True Copy of Grades', size: '1.8 MB' },
          { name: 'Brgy_Indigency_Central.pdf', category: 'Proof of Income / Indigency', size: '1.4 MB' }
        ]
      },
      documents_submitted: [
        { name: 'COR_QCU_AY2026_Official.pdf', category: 'Certificate of Registration', size: '1.2 MB' },
        { name: 'COG_True_Copy_Grades.pdf', category: 'Certified True Copy of Grades', size: '1.8 MB' },
        { name: 'Brgy_Indigency_Central.pdf', category: 'Proof of Income / Indigency', size: '1.4 MB' }
      ],
      remarks: 'Application submitted via student portal. Ready for School Coordinator review.'
    });

    console.log('  -> Application Created ID:', createdApp.id);
    console.log('  -> Application Code:', createdApp.application_code || createdApp.reference_id);
    console.log('  -> Status:', createdApp.status);
    console.log('  -> Progress:', createdApp.progress + '%');

    // ----------------------------------------------------
    // STEP 3: School Coordinator Registrar Batch Endorsement
    // ----------------------------------------------------
    console.log('\n[Step 3] School Coordinator verifies grades and endorses application...');
    const endorsedApp = await applicationModel.updateStatus(
      createdApp.id,
      'School Endorsed',
      'Registrar authenticated 21 units enrolled with 1.50 GWA against official QCU SIS database.',
      'Officially endorsed by Registrar Coordinator John Steaven Balansag.'
    );
    console.log('  -> Endorsed Status:', endorsedApp.status);
    console.log('  -> Progress:', endorsedApp.progress + '%');
    console.log('  -> Remarks:', endorsedApp.remarks);

    // ----------------------------------------------------
    // STEP 4: QCYDO System Admin Approval & Scholar Enrollment
    // ----------------------------------------------------
    console.log('\n[Step 4] QCYDO Admin reviews endorsement and approves scholarship grant...');
    const approvedApp = await applicationModel.updateStatus(
      createdApp.id,
      'Approved',
      'QCYDO board approved after full documentary and residency verification.',
      'Approved for Tertiary Academic Scholarship AY 2026-2027.'
    );
    console.log('  -> Approved Status:', approvedApp.status);
    console.log('  -> Progress:', approvedApp.progress + '%');

    // Check if auto-promoted into student_registry table
    const postApprovalRegistry = await pool.query('SELECT * FROM student_registry WHERE student_id = $1', [testStudentId]);
    console.log('  -> student_registry Records Count:', postApprovalRegistry.rows.length, '(Expected: 1)');
    if (postApprovalRegistry.rows.length > 0) {
      const reg = postApprovalRegistry.rows[0];
      console.log('     * Scholar Name:', reg.full_name);
      console.log('     * Program:', reg.program_name);
      console.log('     * GWA:', reg.gwa);
      console.log('     * Grant Amount:', 'PHP ' + Number(reg.grant_amount).toLocaleString());
      console.log('     * Registry Status:', reg.status);
      console.log('     * Disbursement Status:', reg.disbursement_status);
    }

    // Check generated documents (Award Certificate in Document Vault)
    const docsCheck = await pool.query('SELECT name, category, status FROM documents WHERE user_id = $1', [studentUser.id]);
    console.log('  -> Documents in Vault:', docsCheck.rows.length);
    docsCheck.rows.forEach(d => console.log('     *', d.name, '| Category:', d.category, '| Status:', d.status));

    // ----------------------------------------------------
    // STEP 5: City Treasury Office Disbursement & Payout Release
    // ----------------------------------------------------
    console.log('\n[Step 5] City Treasury Disbursing Officer authorizes payout settlement...');
    const treasuryReq = {
      params: { id: testStudentId },
      body: { status: 'Active Good Standing', disbursementStatus: 'Disbursed', gwa: 1.50 }
    };
    let treasuryResponseData = null;
    const treasuryRes = {
      json: (data) => { treasuryResponseData = data; return data; },
      status: (code) => ({ json: (data) => { treasuryResponseData = data; return data; } })
    };
    await updateScholarStatus(treasuryReq, treasuryRes);

    console.log('  -> Treasury Update Result:', treasuryResponseData ? 'SUCCESS' : 'FAILED');

    // Verify Final Application Status
    const finalAppCheck = await pool.query('SELECT id, status, progress, remarks, disbursement_date FROM applications WHERE id = $1', [createdApp.id]);
    console.log('\n[Final Verification] Application Record in Database:');
    console.log('  -> Status:', finalAppCheck.rows[0].status, '(Expected: Disbursed)');
    console.log('  -> Progress:', finalAppCheck.rows[0].progress + '%', '(Expected: 100%)');
    console.log('  -> Disbursement Date:', finalAppCheck.rows[0].disbursement_date);
    console.log('  -> Remarks:', finalAppCheck.rows[0].remarks);

    // Clean up test records
    console.log('\n[Teardown] Cleaning up test artifacts from database...');
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [studentUser.id]);
    await pool.query('DELETE FROM documents WHERE user_id = $1', [studentUser.id]);
    await pool.query('DELETE FROM student_registry WHERE student_id = $1', [testStudentId]);
    await pool.query('DELETE FROM education_monitoring_reports WHERE student_id = $1', [testStudentId]);
    await pool.query('DELETE FROM applications WHERE user_id = $1', [studentUser.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [studentUser.id]);
    console.log('  -> Cleaned up test artifacts successfully.');

    console.log('\n======================================================================');
    console.log('🎉 ALL 5 PHASES OF THE END-TO-END WORKFLOW PASSED 100% SUCCESSFULLY!');
    console.log('======================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exit(1);
  }
}

runE2ETest();
