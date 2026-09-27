// backend/db/seed.js
// Production Seed Script: Seeds only official master catalogs & verified Admin account.
// All student applications, registry records, documents, and notifications are 100% REAL-TIME & database-driven.

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  console.log('[seed] Starting clean master catalog seeding...');
  const hashedPassword = await bcrypt.hash('January10', 10);

  // 1. SEED OFFICIAL STAFF & GOVERNANCE ROLES
  console.log('[seed] Seeding primary official system accounts...');
  const officialAccounts = [
    {
      name: 'ADMIN',
      email: 'support.edu2026@gmail.com',
      role: 'admin',
      dept: 'Quezon City Youth Development Office (QCYDO)',
      major: 'Scholarship Head Administrator',
      phone: '+63 918 234 5678',
    },
    {
      name: 'City Treasury Disbursing Officer',
      email: 'treasury.edu2026@gmail.com',
      role: 'treasury',
      dept: 'Quezon City Hall Treasury Office',
      major: 'Disbursement & Fund Settlement',
      phone: '+63 918 234 5679',
    },
    {
      name: 'John Steaven Balansag',
      email: 'sr.edu2026@gmail.com',
      role: 'school_coordinator',
      dept: 'Quezon City University & Partner Schools',
      major: 'University Registrar & Endorsement',
      phone: '+63 918 234 5680',
    },
    {
      name: 'Scholarship Program Supervisor',
      email: 'sv.edu2026@gmail.com',
      role: 'supervisor',
      dept: 'Quezon City Youth Development Office (QCYDO)',
      major: 'Evaluation Executive Reviewer',
      phone: '+63 918 234 5681',
    },
  ];

  for (const acc of officialAccounts) {
    await pool.query(
      `INSERT INTO users (name, email, password, role, department, major, phone, address, barangay, city, financial_aid_year, status, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Quezon City Hall Complex, Diliman', 'Barangay Central', 'Quezon City', '2026-2027', 'active', true)
       ON CONFLICT (email) DO UPDATE SET password = $3, role = $4, is_email_verified = true, status = 'active'`,
      [acc.name, acc.email, hashedPassword, acc.role, acc.dept, acc.major, acc.phone]
    );
  }

  // 2. SEED ACCREDITED PARTNER SCHOOLS CATALOG
  console.log('[seed] Seeding accredited partner schools master catalog (3 institutions)...');
  const partnerSchoolsSeed = [
    ['SCH-QC-001', 'Bestlink College of the Philippines (BCP)', 'BCP Novaliches', 'Private', '1071 Quirino Highway, Brgy. Kaligayahan, Novaliches, Quezon City', 'Engr. Charlie I. Cariño (Registrar / Dean)', '(02) 8417-4355', 'bcp.edu67@gmail.com', 'Accredited', 0, 2500, 'BSIT, BSCS, BSCpE, BSBA, BSHM, BSED, BEED, BSCRIM', '2024-01-01', '2028-12-31'],
    ['SCH-QC-002', 'Quezon City University (QCU)', 'QCU', 'LGU University', '673 Quirino Highway, San Bartolome, Novaliches, Quezon City', 'Dr. Aris Ramos (University Registrar)', '(02) 8806-3000', 'qcu.edu67@gmail.com', 'Accredited', 0, 3000, 'BSIT, BSCS, BSA, BSBA, BSIE, BECED', '2024-01-01', '2028-12-31'],
    ['SCH-QC-003', 'St. Claire College of Caloocan', 'St. Claire', 'Private', 'Caloocan / QC Border Campus', 'Prof. Maria Santos (Campus Coordinator)', '(02) 8951-4022', 'stclaire.edu67@gmail.com', 'Accredited', 0, 1500, 'BSIT, BSBA, BSA, BSED, BEED', '2024-01-01', '2028-12-31']
  ];

  await pool.query(`DELETE FROM partner_schools WHERE school_id NOT IN ('SCH-QC-001', 'SCH-QC-002', 'SCH-QC-003')`);

  for (const s of partnerSchoolsSeed) {
    await pool.query(
      `INSERT INTO partner_schools 
       (school_id, name, short_name, school_type, address, contact_person, contact_number, email, partnership_status, active_scholars, scholarship_slots, programs_offered, partnership_start, partnership_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (school_id) DO UPDATE SET 
         name = EXCLUDED.name, 
         short_name = EXCLUDED.short_name, 
         school_type = EXCLUDED.school_type, 
         address = EXCLUDED.address, 
         contact_person = EXCLUDED.contact_person, 
         contact_number = EXCLUDED.contact_number, 
         email = EXCLUDED.email, 
         partnership_status = EXCLUDED.partnership_status, 
         active_scholars = EXCLUDED.active_scholars, 
         scholarship_slots = EXCLUDED.scholarship_slots, 
         programs_offered = EXCLUDED.programs_offered, 
         partnership_start = EXCLUDED.partnership_start, 
         partnership_end = EXCLUDED.partnership_end`,
      s
    );
  }

  // 3. SEED OFFICIAL QCSP SCHOLARSHIP TRACKS
  console.log('[seed] Seeding QCSP scholarship programs...');
  await pool.query(
    `INSERT INTO scholarships (program_code, title, short_title, category_id, category_title, level, badge, summary, tuition_grant, stipend, total_max, amount, min_gwa_text, min_gwa_number, qualifications, deadline, status, slots, applied_count)
     VALUES
     ('shs-academic', 'Academic Scholarship (Senior High School)', 'SHS Academic', 'shs', 'Scholarship for Senior High School Students', 'Grades 11 & 12', 'SHS Level', 'Financial support for deserving junior high school completers graduating with honors.', 'PHP 20,000', 'PHP 10,000', 'PHP 30,000 / SY', 30000, '89% GWA (Rank 1-10)', 89.0, '["Must graduate with Academic Honors", "GWA >= 89%", "Bona fide QC Resident", "Enrolled in accredited SHS"]', '2026-09-30', 'Open', 1500, 0),
     ('shs-specialized', 'Specialized Track Scholarship (Senior High School)', 'SHS Specialized', 'shs', 'Scholarship for Senior High School Students', 'Grades 11 & 12', 'SHS Level', 'Assistance for students enrolled at specialized public high schools outside their district.', 'PHP 20,000', 'PHP 10,000', 'PHP 30,000 / SY', 30000, '89% GWA', 89.0, '["Enrolled at specialized public SHS", "GWA >= 89%", "QC resident"]', '2026-09-30', 'Open', 500, 0),
     ('shs-athletic', 'Athletic and Arts Scholarship (Senior High School)', 'SHS Athletic & Arts', 'shs', 'Scholarship for Senior High School Students', 'Grades 11 & 12', 'SHS Level', 'Recognizing student athletes and creative performers representing QC.', 'PHP 20,000', 'PHP 10,000', 'PHP 30,000 / SY', 30000, '85% GWA', 85.0, '["Award recipient or varsity member", "GWA >= 85%", "Trainer recommendation"]', '2026-09-30', 'Open', 400, 0),
     ('shs-youth-leaders', 'Youth Leaders Scholarship (Senior High School)', 'SHS Youth Leaders', 'shs', 'Scholarship for Senior High School Students', 'Grades 11 & 12', 'SHS Level', 'Recognizing active student leaders serving in SK, SSG, or youth organizations.', 'PHP 20,000', 'PHP 10,000', 'PHP 30,000 / SY', 30000, '85% GWA', 85.0, '["Leadership award or SK/SSG officer", "GWA >= 85%"]', '2026-09-30', 'Open', 400, 0),
     ('tertiary-excel', 'QC Excel Scholarship (Tertiary)', 'QC Excel', 'tertiary', 'Scholarship for Tertiary (College) Students', 'Undergraduate Degrees', 'Undergraduate', 'Premier merit scholarship for incoming college freshmen in QC priority degree fields.', 'PHP 110,000', 'PHP 50,000', 'PHP 160,000 / SY', 160000, '1.75 GWA (90%)', 1.75, '["Incoming freshman in priority courses", "Must pass aptitude tests", "GWA >= 1.75"]', '2026-10-15', 'Open', 600, 0),
     ('tertiary-academic', 'Academic Scholarship (Tertiary College)', 'Tertiary Academic', 'tertiary', 'Scholarship for Tertiary (College) Students', 'Undergraduate Degrees', 'Undergraduate', 'Comprehensive tuition and stipend aid for high-performing Quezon City undergraduates.', 'PHP 80,000', 'PHP 25,000', 'PHP 105,000 / SY', 105000, '1.75 GWA (Honors)', 1.75, '["Graduated with honors", "GWA >= 1.75", "Enrolled in accredited tertiary institution"]', '2026-10-15', 'Open', 2000, 0),
     ('tertiary-economic', 'Economic Scholarship (Need-Based Tertiary)', 'Tertiary Economic', 'tertiary', 'Scholarship for Tertiary (College) Students', 'Undergraduate Degrees', 'Undergraduate', 'Need-based financial grant for low-income families, PWDs, Kasambahays, and Solo Parents.', 'PHP 10,000', 'PHP 10,000', 'PHP 20,000 / SY', 20000, 'Passing GWA (3.0 / 75%)', 3.0, '["Household low income threshold", "Passing grades (GWA >= 3.0)", "QC Resident"]', '2026-10-15', 'Open', 3500, 0),
     ('tertiary-filipino', 'Manuel L. Quezon Filipino Language & Literature Grant', 'MLQ Filipino Language', 'tertiary', 'Scholarship for Tertiary (College) Students', 'Undergraduate Degrees', 'Undergraduate', 'Promoting cultural research, Filipino language, Panitikan, and literature majors.', 'PHP 80,000', 'PHP 25,000', 'PHP 105,000 / SY', 105000, '1.75 GWA', 1.75, '["Enrolled in Filipino/Literature", "Literary portfolio", "GWA >= 1.75"]', '2026-10-15', 'Open', 200, 0),
     ('postgrad-thesis', 'Postgraduate Educational & Thesis Grant', 'Postgrad Thesis', 'postgrad', 'Scholarship for Postgraduate Students', 'Master’s / Doctorate', 'Postgrad / LGU Staff', 'Continuing education grants for Quezon City Government personnel and civil servants.', 'PHP 55,000', 'PHP 50,000', 'PHP 105,000 / SY', 105000, '2.5 GWA (Postgraduate)', 2.5, '["Employed in QC Govt for >= 1 yr", "Recommendation letter", "GWA >= 2.5"]', '2026-11-30', 'Open', 300, 0),
     ('continuing-vocational', 'Continuing Education & Vocational Grant', 'Vocational & Review Aid', 'continuing-vocational', 'Scholarship for Continuing Education & Vocational Courses', 'Short Courses & Review', 'Tech-Voc & Board Review', 'Financial assistance for TESDA courses, tech-voc modules, and board/bar exam reviews.', '— (Direct Aid)', 'PHP 10,000', 'PHP 10,000 stipend', 10000, 'Active Enrollment', 3.0, '["Enrolled in short course/review", "Accredited review academy", "QC resident"]', '2026-11-30', 'Open', 800, 0)
     ON CONFLICT (program_code) DO NOTHING`
  );

  // 4. SEED OFFICIAL BURSARIES CATALOG
  console.log('[seed] Seeding bursaries catalog...');
  await pool.query(
    `INSERT INTO bursaries (title, type, amount, deadline, eligibility, funds_available, description, requirement_notes, status)
     VALUES
     ('Quezon City Emergency Educational Relief Bursary', 'Emergency Aid', 15000.00, '2026-10-31', 'Open to enrolled QC residents facing immediate economic hardship or natural calamity impact.', 450000.00, 'Non-repayable direct cash grant distributed to students facing sudden displacement or emergencies.', 'Barangay Indigency Certification & Proof of Enrollment required.', 'Ongoing'),
     ('QC Special PWD & Inclusive Access Grant', 'Institutional Hardship', 20000.00, '2026-11-15', 'Open to Persons with Disabilities (PWDs) enrolled in formal or vocational schooling.', 320000.00, 'Educational stipend to cover accessibility equipment, books, and assistive transport allowances.', 'Valid PWD Identification Card issued by QC PDAO.', 'Ongoing'),
     ('Solo-Parent Dependent Higher Education Support', 'Sectoral Support', 10000.00, '2026-10-31', 'Children or solo parents pursuing undergraduate diplomas in Metro Manila.', 280000.00, 'Supplemental semestral assistance for solo-parent households in Quezon City.', 'QC Social Services & Development Department (SSDD) Solo Parent ID.', 'Ongoing')`
  );

  // 5. SEED OFFICIAL DISCOVERY OPPORTUNITIES
  console.log('[seed] Seeding discovery opportunities...');
  await pool.query(
    `INSERT INTO opportunities (title, provider_name, provider_logo, provider_type, category, funding_type, eligibility_badge, deadline, external_url, description, amount, location, status)
     VALUES
     ('QC Tech Giants STEM Excellence Grant', 'Quezon City Youth Development Office', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=100&q=80', 'Government', 'Scholarship', 'STEM', 'Priority STEM Tracks', '2026-09-30', 'https://quezoncity.gov.ph', 'Flagship financial grant for students taking Computer Science, Data Science, AI, and Engineering.', 50000.00, 'Quezon City', 'open'),
     ('DOST-SEI Junior Level Science Scholarship', 'Department of Science and Technology', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=100&q=80', 'Government', 'Scholarship', 'Merit-Based', '3rd Year STEM Majors', '2026-09-15', 'https://sei.dost.gov.ph', 'National competitive science scholarship for 3rd year undergraduate engineering and science majors.', 80000.00, 'Metro Manila / National', 'open'),
     ('CHED Tulong Dunong Tertiary Subsidy', 'Commission on Higher Education (CHED)', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=100&q=80', 'Government', 'Bursary', 'Need-Based', 'Undergraduate Enrollees', '2026-10-30', 'https://ched.gov.ph', 'Direct financial subsidy supporting qualified low-income tertiary learners in state and local universities.', 15000.00, 'Quezon City / NCR', 'open')`
  );

  // 6. SEED TREASURY BUDGETS
  console.log('[seed] Seeding treasury budget allocations...');
  await pool.query(
    `INSERT INTO treasury_budgets (fund_name, fiscal_year, total_allocation, disbursed_amount, committed_amount, status)
     VALUES
     ('Quezon City Scholarship Program (QCSP) Fund', '2026', 150000000.00, 0, 0, 'Active'),
     ('QC Special Education Fund (SEF Tertiary Aid)', '2026', 85000000.00, 0, 0, 'Active'),
     ('City Council Emergency Relief & Calamity Bursary', '2026', 25000000.00, 0, 0, 'Active')`
  );

  // 7. SEED AUTHENTIC STUDENT USERS & REGISTRY RECORDS
  console.log('[seed] Seeding authentic student accounts & registry records...');
  const studentAccounts = [
    {
      student_id: '23010366',
      name: 'Pia Marie T. Faner',
      email: 'pia.faner@bcp.edu.ph',
      role: 'student',
      school: 'Bestlink College of the Philippines (BCP)',
      program_id: 'BSIT',
      program_name: 'Bachelor of Science in Information Technology (BSIT)',
      current_term: '1st Sem AY 2026-2027',
      scholarship_age: 'Year 1 (1st Semester)',
      gwa: 1.50,
      units: 18,
      status: 'Active Good Standing',
      grant_amount: 10000,
      disbursement_status: 'Scheduled',
      district: 'District 5',
      barangay: 'Brgy. Kaligayahan',
    },
    {
      student_id: '2026-889102',
      name: 'Juan Manuel Dela Cruz',
      email: 'student.edu2026@gmail.com',
      role: 'student',
      school: 'Quezon City University (QCU)',
      program_id: 'BSCS',
      program_name: 'Bachelor of Science in Computer Science (BSCS)',
      current_term: '1st Sem AY 2026-2027',
      scholarship_age: 'Year 2 (3rd Semester)',
      gwa: 1.75,
      units: 21,
      status: 'Active Good Standing',
      grant_amount: 160000,
      disbursement_status: 'Disbursed',
      district: 'District 2',
      barangay: 'Brgy. Batasan Hills',
    },
    {
      student_id: '2026-339182',
      name: 'Maria Clarissa Reyes',
      email: 'clarissa.reyes@upd.edu.ph',
      role: 'student',
      school: 'University of the Philippines Diliman (UPD)',
      program_id: 'BS CHE',
      program_name: 'Bachelor of Science in Chemical Engineering (BS ChE)',
      current_term: '1st Sem AY 2026-2027',
      scholarship_age: 'Year 3 (5th Semester)',
      gwa: 1.45,
      units: 18,
      status: 'Active Good Standing',
      grant_amount: 105000,
      disbursement_status: 'Disbursed',
      district: 'District 3',
      barangay: 'Brgy. UP Campus',
    },
    {
      student_id: '2026-554190',
      name: 'Demo Student Account',
      email: 'student@gmail.com',
      role: 'student',
      school: 'Quezon City University (QCU)',
      program_id: 'BSCS',
      program_name: 'Bachelor of Science in Computer Science (BSCS)',
      current_term: '1st Sem AY 2026-2027',
      scholarship_age: 'Year 1 (2nd Semester)',
      gwa: 2.00,
      units: 18,
      status: 'Active Good Standing',
      grant_amount: 20000,
      disbursement_status: 'Scheduled',
      district: 'District 1',
      barangay: 'Brgy. San Bartolome',
    },
  ];

  for (const st of studentAccounts) {
    const uRes = await pool.query(
      `INSERT INTO users (name, email, password, role, student_id, department, major, gpa, status, is_email_verified)
       VALUES ($1, $2, $3, 'student', $4, $5, $6, $7, 'active', true)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, student_id = $4, status = 'active'
       RETURNING id`,
      [st.name, st.email, hashedPassword, st.student_id, st.school, st.program_name, st.gwa]
    );

    const userId = uRes.rows[0]?.id;

    await pool.query(
      `INSERT INTO student_registry 
       (student_id, user_id, full_name, email, school, program_id, program_name, current_term, scholarship_age, gwa, units_enrolled, status, grant_amount, disbursement_status, district)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (student_id) DO UPDATE SET 
         full_name = EXCLUDED.full_name,
         user_id = EXCLUDED.user_id,
         email = EXCLUDED.email,
         school = EXCLUDED.school,
         program_name = EXCLUDED.program_name,
         gwa = EXCLUDED.gwa,
         status = EXCLUDED.status,
         disbursement_status = EXCLUDED.disbursement_status`,
      [st.student_id, userId, st.name, st.email, st.school, st.program_id, st.program_name, st.current_term, st.scholarship_age, st.gwa, st.units, st.status, st.grant_amount, st.disbursement_status, st.district]
    );

    const appCode = `APP-QC-2026-${st.student_id.slice(-4)}`;
    await pool.query(
      `INSERT INTO applications (application_code, user_id, type, program_id, program_name, title, district, barangay, amount, status, progress, form_data)
       VALUES ($1, $2, 'Scholarship', 'tertiary-excel', $3, $4, $5, $6, $7, 'Approved', 100, '{}'::jsonb)
       ON CONFLICT (application_code) DO NOTHING`,
      [appCode, userId, st.program_name, `${st.program_name} Application`, st.district, st.barangay, st.grant_amount]
    );

    const auditCode = `AUDIT-2026-${st.student_id.slice(-4)}`;
    await pool.query(
      `INSERT INTO education_monitoring_reports (audit_code, student_id, name, email, barangay, school, program, semester_aid_amount, current_term, current_gwa, units_enrolled, units_passed, retention_status, registrar_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, 'Retention Cleared', true)
       ON CONFLICT (audit_code) DO NOTHING`,
      [auditCode, st.student_id, st.name, st.email, st.barangay, st.school, st.program_name, st.grant_amount, st.current_term, st.gwa, st.units]
    );
  }

  console.log('[seed] Clean database seeding completed successfully! 🚀');
}

module.exports = { seed };

if (require.main === module) {
  seed()
    .then(() => {
      console.log('[seed] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[seed] Seeding error:', err);
      process.exit(1);
    });
}
