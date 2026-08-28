// backend/db/seed.js
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  console.log('[seed] Starting database seeding...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. SEED USERS
  console.log('[seed] Seeding demo users...');
  const userResult = await pool.query(
    `INSERT INTO users (name, email, password, role, student_id, department, major, gpa, financial_aid_year, avatar, phone, address, barangay, city, status, is_email_verified)
     VALUES
     ('Maria Santos', 'student@demo.edu', $1, 'student', '2024-00192', 'College of Computer Studies', 'B.S. Computer Science', 1.45, '2026-2027', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', '+63 917 123 4567', 'Block 12 Lot 4, Commonwealth Ave', 'Barangay Batasan Hills', 'Quezon City', 'active', true),
     ('ADMIN', 'support.edu2026@gmail.com', $1, 'admin', NULL, 'Quezon City Youth Development Office (QCYDO)', 'Scholarship Administrator', NULL, '2026-2027', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80', '+63 918 234 5678', 'Quezon City Hall Complex, Diliman', 'Barangay Central', 'Quezon City', 'active', true),
     ('Elena Ramirez', 'supervisor@demo.edu', $1, 'supervisor', NULL, 'Student Affairs & Work-Study Unit', 'Work-Study Supervisor', NULL, '2026-2027', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', '+63 919 345 6789', 'Student Activity Center, QCU Main', 'Barangay San Bartolome', 'Quezon City', 'active', true),
     ('Dr. Aris Ramos', 'school@demo.edu', $1, 'school_coordinator', NULL, 'Quezon City University (QCU)', 'Dean of Student Affairs', NULL, '2026-2027', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80', '+63 920 456 7890', '673 Quirino Highway, San Bartolome', 'Barangay San Bartolome', 'Quezon City', 'active', true),
     ('Officer Del Rosario', 'treasury@demo.edu', $1, 'treasury', NULL, 'Quezon City Treasury Department', 'Senior Disbursement Officer', NULL, '2026-2027', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80', '+63 921 567 8901', 'City Treasurer Office, QC Hall', 'Barangay Central', 'Quezon City', 'active', true),
     ('Engr. Alex Mercado', 'sysadmin@demo.edu', $1, 'system_admin', NULL, 'Information Technology Development Department (ITDD)', 'System & Security Administrator', NULL, '2026-2027', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', '+63 922 678 9012', 'ITDD Building, QC Hall Complex', 'Barangay Central', 'Quezon City', 'active', true)
     RETURNING id, email, role`,
    [hashedPassword]
  );

  const studentUser = userResult.rows.find((u) => u.email === 'student@demo.edu');
  const studentUserId = studentUser ? studentUser.id : 1;

  // 2. SEED PARTNER SCHOOLS
  console.log('[seed] Seeding partner schools...');
  await pool.query(
    `INSERT INTO partner_schools (school_id, name, short_name, school_type, address, contact_person, contact_number, email, partnership_status, active_scholars, scholarship_slots, programs_offered, partnership_start, partnership_end)
     VALUES
     ('SCH-QC-001', 'Quezon City University (QCU - San Bartolome Main)', 'QCU Main', 'LGU University', '673 Quirino Highway, San Bartolome, Novaliches, Quezon City', 'Dr. Aris Ramos (Dean)', '(02) 8806-3000', 'registrar@qcu.edu.ph', 'Accredited', 1420, 2000, 'BSIT, BSCS, BSA, BSBA, BSIE, BECED', '2024-01-01', '2028-12-31'),
     ('SCH-QC-002', 'University of the Philippines Diliman (UPD)', 'UP Diliman', 'SUC', 'Diliman, Quezon City, Metro Manila', 'Prof. Carla Gomez', '(02) 8981-8500', 'scholarships@upd.edu.ph', 'Accredited', 850, 1200, 'All Priority STEM, Social Sciences, Allied Health', '2024-01-01', '2028-12-31'),
     ('SCH-QC-003', 'Ateneo de Manila University', 'Ateneo', 'Private', 'Katipunan Ave, Loyola Heights, Quezon City', 'Dir. Joaquin Reyes', '(02) 8426-6001', 'finaid@ateneo.edu', 'Partner Active', 380, 500, 'BS Management, BS Computer Science, AB Economics', '2024-06-01', '2027-06-01'),
     ('SCH-QC-004', 'Polytechnic University of the Philippines (PUP QC)', 'PUP QC', 'SUC', 'Don Fabian St., Commonwealth, Quezon City', 'Prof. Ramon Santos', '(02) 8952-7818', 'pupqc@pup.edu.ph', 'Accredited', 620, 800, 'BSIT, BSBA, BPA, BSED', '2024-01-01', '2028-12-31'),
     ('SCH-QC-005', 'Technological Institute of the Philippines (TIP QC)', 'TIP QC', 'Private', '938 Aurora Blvd, Cubao, Quezon City', 'Engr. David Tan', '(02) 8911-0964', 'info.qc@tip.edu.ph', 'Accredited', 490, 700, 'BSCE, BSEE, BSME, BSCS, BSIT', '2024-01-01', '2027-12-31'),
     ('SCH-QC-006', 'Far Eastern University Diliman (FEU Diliman)', 'FEU Diliman', 'Private', 'Sampaguita Ave, Mapayapa Village, Quezon City', 'Ms. Teresa Mendoza', '(02) 8931-6060', 'admissions@feudiliman.edu.ph', 'Partner Active', 280, 400, 'BSBA, BSIT, Senior High School Academic', '2024-01-01', '2027-12-31')`
  );

  // 3. SEED SCHOLARSHIPS (QCSP Tracks)
  console.log('[seed] Seeding QCSP scholarship programs...');
  await pool.query(
    `INSERT INTO scholarships (program_code, title, short_title, category_id, category_title, level, badge, summary, tuition_grant, stipend, total_max, amount, min_gwa_text, min_gwa_number, qualifications, deadline, status, slots, applied_count)
     VALUES
     ('shs-academic', 'Academic Scholarship (Senior High School)', 'SHS Academic', 'shs', 'Scholarship for Senior High School Students', 'Grades 11 & 12', 'SHS Level', 'Financial support for deserving junior high school completers graduating with honors.', 'PHP 20,000', 'PHP 10,000', 'PHP 30,000 / SY', 30000, '89% GWA (Rank 1-10)', 89.0, '["Must graduate with Academic Honors", "GWA >= 89%", "Bona fide QC Resident", "Enrolled in accredited SHS"]', '2026-09-30', 'Open', 1500, 480),
     ('shs-specialized', 'Specialized Track Scholarship (Senior High School)', 'SHS Specialized', 'shs', 'Scholarship for Senior High School Students', 'Grades 11 & 12', 'SHS Level', 'Assistance for students enrolled at specialized public high schools outside their district.', 'PHP 20,000', 'PHP 10,000', 'PHP 30,000 / SY', 30000, '89% GWA', 89.0, '["Enrolled at specialized public SHS", "GWA >= 89%", "QC resident"]', '2026-09-30', 'Open', 500, 140),
     ('shs-athletic', 'Athletic and Arts Scholarship (Senior High School)', 'SHS Athletic & Arts', 'shs', 'Scholarship for Senior High School Students', 'Grades 11 & 12', 'SHS Level', 'Recognizing student athletes and creative performers representing QC.', 'PHP 20,000', 'PHP 10,000', 'PHP 30,000 / SY', 30000, '85% GWA', 85.0, '["Award recipient or varsity member", "GWA >= 85%", "Trainer recommendation"]', '2026-09-30', 'Open', 400, 110),
     ('shs-youth-leaders', 'Youth Leaders Scholarship (Senior High School)', 'SHS Youth Leaders', 'shs', 'Scholarship for Senior High School Students', 'Grades 11 & 12', 'SHS Level', 'Recognizing active student leaders serving in SK, SSG, or youth organizations.', 'PHP 20,000', 'PHP 10,000', 'PHP 30,000 / SY', 30000, '85% GWA', 85.0, '["Leadership award or SK/SSG officer", "GWA >= 85%"]', '2026-09-30', 'Open', 400, 165),
     ('tertiary-excel', 'QC Excel Scholarship (Tertiary)', 'QC Excel', 'tertiary', 'Scholarship for Tertiary (College) Students', 'Undergraduate Degrees', 'Undergraduate', 'Premier merit scholarship for incoming college freshmen in QC priority degree fields.', 'PHP 110,000', 'PHP 50,000', 'PHP 160,000 / SY', 160000, '1.75 GWA (90%)', 1.75, '["Incoming freshman in priority courses", "Must pass aptitude tests", "GWA >= 1.75"]', '2026-10-15', 'Open', 600, 310),
     ('tertiary-academic', 'Academic Scholarship (Tertiary College)', 'Tertiary Academic', 'tertiary', 'Scholarship for Tertiary (College) Students', 'Undergraduate Degrees', 'Undergraduate', 'Comprehensive tuition and stipend aid for high-performing Quezon City undergraduates.', 'PHP 80,000', 'PHP 25,000', 'PHP 105,000 / SY', 105000, '1.75 GWA (Honors)', 1.75, '["Graduated with honors", "GWA >= 1.75", "Enrolled in accredited tertiary institution"]', '2026-10-15', 'Open', 2000, 920),
     ('tertiary-economic', 'Economic Scholarship (Need-Based Tertiary)', 'Tertiary Economic', 'tertiary', 'Scholarship for Tertiary (College) Students', 'Undergraduate Degrees', 'Undergraduate', 'Need-based financial grant for low-income families, PWDs, Kasambahays, and Solo Parents.', 'PHP 10,000', 'PHP 10,000', 'PHP 20,000 / SY', 20000, 'Passing GWA (3.0 / 75%)', 3.0, '["Household low income threshold", "Passing grades (GWA >= 3.0)", "QC Resident"]', '2026-10-15', 'Open', 3500, 1850),
     ('tertiary-filipino', 'Manuel L. Quezon Filipino Language & Literature Grant', 'MLQ Filipino Language', 'tertiary', 'Scholarship for Tertiary (College) Students', 'Undergraduate Degrees', 'Undergraduate', 'Promoting cultural research, Filipino language, Panitikan, and literature majors.', 'PHP 80,000', 'PHP 25,000', 'PHP 105,000 / SY', 105000, '1.75 GWA', 1.75, '["Enrolled in Filipino/Literature", "Literary portfolio", "GWA >= 1.75"]', '2026-10-15', 'Open', 200, 65),
     ('postgrad-thesis', 'Postgraduate Educational & Thesis Grant', 'Postgrad Thesis', 'postgrad', 'Scholarship for Postgraduate Students', 'Master’s / Doctorate', 'Postgrad / LGU Staff', 'Continuing education grants for Quezon City Government personnel and civil servants.', 'PHP 55,000', 'PHP 50,000', 'PHP 105,000 / SY', 105000, '2.5 GWA (Postgraduate)', 2.5, '["Employed in QC Govt for >= 1 yr", "Recommendation letter", "GWA >= 2.5"]', '2026-11-30', 'Open', 300, 85),
     ('continuing-vocational', 'Continuing Education & Vocational Grant', 'Vocational & Review Aid', 'continuing-vocational', 'Scholarship for Continuing Education & Vocational Courses', 'Short Courses & Review', 'Tech-Voc & Board Review', 'Financial assistance for TESDA courses, tech-voc modules, and board/bar exam reviews.', '— (Direct Aid)', 'PHP 10,000', 'PHP 10,000 stipend', 10000, 'Active Enrollment', 3.0, '["Enrolled in short course/review", "Accredited review academy", "QC resident"]', '2026-11-30', 'Open', 800, 240)`
  );

  // 4. SEED BURSARIES
  console.log('[seed] Seeding bursaries...');
  await pool.query(
    `INSERT INTO bursaries (title, type, amount, deadline, eligibility, funds_available, description, requirement_notes, status)
     VALUES
     ('Quezon City Emergency Educational Relief Bursary', 'Emergency Aid', 15000.00, '2026-10-31', 'Open to enrolled QC residents facing immediate economic hardship or natural calamity impact.', 450000.00, 'Non-repayable direct cash grant distributed to students facing sudden displacement or emergencies.', 'Barangay Indigency Certification & Proof of Enrollment required.', 'Ongoing'),
     ('QC Special PWD & Inclusive Access Grant', 'Institutional Hardship', 20000.00, '2026-11-15', 'Open to Persons with Disabilities (PWDs) enrolled in formal or vocational schooling.', 320000.00, 'Educational stipend to cover accessibility equipment, books, and assistive transport allowances.', 'Valid PWD Identification Card issued by QC PDAO.', 'Ongoing'),
     ('Solo-Parent Dependent Higher Education Support', 'Sectoral Support', 10000.00, '2026-10-31', 'Children or solo parents pursuing undergraduate diplomas in Metro Manila.', 280000.00, 'Supplemental semestral assistance for solo-parent households in Quezon City.', 'QC Social Services & Development Department (SSDD) Solo Parent ID.', 'Ongoing')`
  );

  // 5. SEED OPPORTUNITIES
  console.log('[seed] Seeding discovery opportunities...');
  await pool.query(
    `INSERT INTO opportunities (title, provider_name, provider_logo, provider_type, category, funding_type, eligibility_badge, deadline, external_url, description, amount, location, status)
     VALUES
     ('QC Tech Giants STEM Excellence Grant', 'Quezon City Youth Development Office', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=100&q=80', 'Government', 'Scholarship', 'STEM', 'Priority STEM Tracks', '2026-09-30', 'https://quezoncity.gov.ph', 'Flagship financial grant for students taking Computer Science, Data Science, AI, and Engineering.', 50000.00, 'Quezon City', 'open'),
     ('DOST-SEI Junior Level Science Scholarship', 'Department of Science and Technology', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=100&q=80', 'Government', 'Scholarship', 'Merit-Based', '3rd Year STEM Majors', '2026-09-15', 'https://sei.dost.gov.ph', 'National competitive science scholarship for 3rd year undergraduate engineering and science majors.', 80000.00, 'Metro Manila / National', 'open'),
     ('CHED Tulong Dunong Tertiary Subsidy', 'Commission on Higher Education (CHED)', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=100&q=80', 'Government', 'Bursary', 'Need-Based', 'Undergraduate Enrollees', '2026-10-30', 'https://ched.gov.ph', 'Direct financial subsidy supporting qualified low-income tertiary learners in state and local universities.', 15000.00, 'Quezon City / NCR', 'open')`
  );

  // 6. SEED APPLICATIONS
  console.log('[seed] Seeding active applications...');
  await pool.query(
    `INSERT INTO applications (id, application_code, user_id, type, program_id, program_name, reference_id, title, amount, status, submission_date, progress, requirements_count, completed_requirements, notes, form_data, documents_submitted)
     VALUES
     (1, 'APP-QC-1787645562754', $1, 'Scholarship', 'tertiary-economic', 'Economic Scholarship (Need-Based Financial Assistance)', 'SCH-QC-2026-02', 'Economic Scholarship (Need-Based Financial Assistance)', 20000.00, 'Under Review', '2026-08-25', 33, 5, 5, 'All 5 required documents (Citizen Match, Indigency Cert, ITR/Affidavit, 2Step Proof, COR & Grades) queued for administrative verification.', '{"studentId":"23010366","school":"Bestlink College of the Philippines (BCP)","course":"B.S. Information Technology","department":"College of Computer Studies & Information Technology (CCSIT)","gwa":1.50,"annualIncome":60000,"disbursementChannel":"GCash E-Wallet","accountNumber":"09950478816","firstName":"PIA MARIE","middleName":"TIBURCIO","lastName":"FANER","address":"Blk 11 Lot 15 Villa Alicia 1","barangay":"Barangay Central","city":"Quezon City"}', '[{"id":"residency_qc","name":"Citizen_Information_System_Matched.json","size":"System Verified","uploadedAt":"Aug 25, 2026"},{"id":"indigency_cert","name":"34b62969-aeaf-4ef1-a07f-2f5268ad26d0.jfif","size":"68.3 KB","uploadedAt":"Aug 25, 2026, 04:12 PM"},{"id":"itr_affidavit","name":"implementation_plan.md","size":"6.2 KB","uploadedAt":"Aug 25, 2026, 04:12 PM"},{"id":"sectoral_proof","name":"2Step Verification","size":"3.6 KB","uploadedAt":"Aug 25, 2026, 04:12 PM"},{"id":"tertiary_cor_grades","name":"31042836-9eab-465f-9ee7-270ddb9f5f97.jfif","size":"115.8 KB","uploadedAt":"Aug 25, 2026, 04:12 PM"}]')`,
    [studentUserId]
  );

  // 7. SEED DOCUMENTS
  console.log('[seed] Seeding document vault...');
  await pool.query(
    `INSERT INTO documents (user_id, application_id, name, category, upload_date, status, size, file_path, mime_type)
     VALUES
     ($1, 1, 'Citizen_Information_System_Matched.json', 'residency_qc', '2026-08-25', 'verified', 'System Verified', '/uploads/Citizen_Information_System_Matched.json', 'application/json'),
     ($1, 1, '34b62969-aeaf-4ef1-a07f-2f5268ad26d0.jfif', 'indigency_cert', '2026-08-25', 'verified', '68.3 KB', '/uploads/34b62969-aeaf-4ef1-a07f-2f5268ad26d0.jfif', 'image/jpeg'),
     ($1, 1, 'implementation_plan.md', 'itr_affidavit', '2026-08-25', 'verified', '6.2 KB', '/uploads/implementation_plan.md', 'text/plain'),
     ($1, 1, '2Step Verification', 'sectoral_proof', '2026-08-25', 'verified', '3.6 KB', '/uploads/2Step Verification', 'application/pdf'),
     ($1, 1, '31042836-9eab-465f-9ee7-270ddb9f5f97.jfif', 'tertiary_cor_grades', '2026-08-25', 'verified', '115.8 KB', '/uploads/31042836-9eab-465f-9ee7-270ddb9f5f97.jfif', 'image/jpeg')`,
    [studentUserId]
  );

  // 8. SEED NOTIFICATIONS
  console.log('[seed] Seeding notifications...');
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
     VALUES
     ($1, 'Application Under Secretariat Review', 'Your Economic Scholarship application (Ref: APP-QC-1787645562754) is under active administrative verification.', 'info', false, 'application_status', '/dashboard'),
     ($1, 'Documentary Attachments Encrypted & Uploaded', 'All 5 submitted files have been archived in your QC Student Document Vault.', 'success', false, 'document', '/documents')`,
    [studentUserId]
  );

  // 9. STUDENT REGISTRY & EDUCATION MONITORING (Populated dynamically upon application approval)
  console.log('[seed] Student registry and monitoring reports are dynamically populated upon application approval.');


  // 13. SEED TREASURY BUDGETS
  console.log('[seed] Seeding treasury budget allocations...');
  await pool.query(
    `INSERT INTO treasury_budgets (fund_name, fiscal_year, total_allocation, disbursed_amount, committed_amount, status)
     VALUES
     ('Quezon City Scholarship Program (QCSP) Fund', '2026', 150000000.00, 42500000.00, 78000000.00, 'Active'),
     ('QC Special Education Fund (SEF Tertiary Aid)', '2026', 85000000.00, 28000000.00, 45000000.00, 'Active'),
     ('City Council Emergency Relief & Calamity Bursary', '2026', 25000000.00, 8500000.00, 12000000.00, 'Active')`
  );

  console.log('[seed] Database seeding completed successfully! 🎉');
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
