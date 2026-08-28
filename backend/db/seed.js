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
  console.log('[seed] Seeding active applications across partner universities...');
  await pool.query(
    `INSERT INTO applications (id, application_code, user_id, type, program_id, program_name, reference_id, title, amount, status, submission_date, progress, requirements_count, completed_requirements, notes, form_data, documents_submitted)
     VALUES
     (1, 'APP-QC-1787645562754', $1, 'Scholarship', 'tertiary-economic', 'Economic Scholarship (Need-Based Financial Assistance)', 'SCH-QC-2026-02', 'Economic Scholarship (Need-Based Financial Assistance)', 20000.00, 'Under Review', '2026-08-25', 33, 5, 5, 'All 5 required documents (Citizen Match, Indigency Cert, ITR/Affidavit, 2Step Proof, COR & Grades) queued for administrative verification.', '{"studentId":"23010366","school":"Bestlink College of the Philippines (BCP)","course":"B.S. Information Technology","department":"College of Computer Studies & Information Technology (CCSIT)","gwa":1.50,"annualIncome":60000,"disbursementChannel":"GCash E-Wallet","accountNumber":"09950478816","firstName":"PIA MARIE","middleName":"TIBURCIO","lastName":"FANER","address":"Blk 11 Lot 15 Villa Alicia 1","barangay":"Barangay Central","city":"Quezon City"}', '[{"id":"residency_qc","name":"Citizen_Information_System_Matched.json","size":"System Verified","uploadedAt":"Aug 25, 2026"},{"id":"indigency_cert","name":"34b62969-aeaf-4ef1-a07f-2f5268ad26d0.jfif","size":"68.3 KB","uploadedAt":"Aug 25, 2026, 04:12 PM"},{"id":"itr_affidavit","name":"implementation_plan.md","size":"6.2 KB","uploadedAt":"Aug 25, 2026, 04:12 PM"},{"id":"sectoral_proof","name":"2Step Verification","size":"3.6 KB","uploadedAt":"Aug 25, 2026, 04:12 PM"},{"id":"tertiary_cor_grades","name":"31042836-9eab-465f-9ee7-270ddb9f5f97.jfif","size":"115.8 KB","uploadedAt":"Aug 25, 2026, 04:12 PM"}]'),
     (2, 'APP-QC-2026-884920', $1, 'Scholarship', 'tertiary-academic', 'Tertiary Academic Merit Scholarship', 'SCH-QC-2026-01', 'Tertiary Academic Merit Scholarship', 25000.00, 'Under Review', '2026-08-26', 33, 4, 4, 'Dean''s list standing verified by QCU Registrar.', '{"studentId":"2024-QC-884920","school":"Quezon City University (QCU Main)","course":"B.S. Information Technology","yearLevel":"3rd Year","gwa":1.25,"unitsEnrolled":21,"unitsPassed":21,"annualIncome":120000,"firstName":"Alexandra","lastName":"Chen","city":"Quezon City"}', '[{"id":"cor","name":"COR_FirstSem_2026_AlexandraChen.pdf","size":"1.8 MB","uploadedAt":"Aug 26, 2026"},{"id":"tor","name":"TOR_COG_CertifiedCopy_AlexandraChen.pdf","size":"2.1 MB","uploadedAt":"Aug 26, 2026"}]'),
     (3, 'APP-QC-2026-492810', $1, 'Scholarship', 'tertiary-academic', 'Tertiary Academic Merit Scholarship', 'SCH-QC-2026-03', 'Tertiary Academic Merit Scholarship', 25000.00, 'Under Review', '2026-08-26', 33, 4, 4, 'PUP Engineering applicant awaiting GWA retention check.', '{"studentId":"2023-QC-492810","school":"Polytechnic University of the Philippines (PUP QC)","course":"B.S. Electronics Engineering","yearLevel":"2nd Year","gwa":2.85,"unitsEnrolled":18,"unitsPassed":15,"annualIncome":95000,"firstName":"Julian","lastName":"Alvarez","city":"Quezon City"}', '[{"id":"cor","name":"COR_2026_PUP_JulianAlvarez.pdf","size":"1.4 MB","uploadedAt":"Aug 26, 2026"},{"id":"tor","name":"COG_SemestralGrades_JulianAlvarez.pdf","size":"1.9 MB","uploadedAt":"Aug 26, 2026"}]'),
     (4, 'APP-QC-2026-992014', $1, 'Scholarship', 'tertiary-economic', 'Tertiary Economic Scholarship', 'SCH-QC-2026-04', 'Tertiary Economic Scholarship', 20000.00, 'Under Review', '2026-08-27', 33, 4, 4, 'QCU Senior Accountancy student with approved graduating underload.', '{"studentId":"2024-QC-992014","school":"Quezon City University (QCU San Bartolome)","course":"B.S. Accountancy","yearLevel":"4th Year","gwa":1.65,"unitsEnrolled":12,"unitsPassed":12,"annualIncome":75000,"firstName":"Maria Leonila","lastName":"Santos","city":"Quezon City"}', '[{"id":"cor","name":"COR_AY2026_QCU_MariaSantos.pdf","size":"1.2 MB","uploadedAt":"Aug 27, 2026"},{"id":"tor","name":"OfficialTranscript_Certified_Santos.pdf","size":"2.4 MB","uploadedAt":"Aug 27, 2026"}]'),
     (5, 'APP-QC-2026-110293', $1, 'Scholarship', 'tertiary-academic', 'Tertiary Academic Merit Scholarship', 'SCH-QC-2026-05', 'Tertiary Academic Merit Scholarship', 25000.00, 'Under Review', '2026-08-27', 33, 4, 4, 'UP Diliman Computer Science candidate with top academic performance.', '{"studentId":"2023-QC-110293","school":"University of the Philippines Diliman","course":"B.S. Computer Science","yearLevel":"3rd Year","gwa":1.40,"unitsEnrolled":18,"unitsPassed":18,"annualIncome":140000,"firstName":"Roberto","lastName":"Garcia","city":"Quezon City"}', '[{"id":"cor","name":"UPD_Form5_COR_2026_RobertoGarcia.pdf","size":"2.0 MB","uploadedAt":"Aug 27, 2026"},{"id":"tor","name":"UPD_TranscriptOfRecords_RobertoGarcia.pdf","size":"2.7 MB","uploadedAt":"Aug 27, 2026"}]'),
     (6, 'APP-QC-2026-339102', $1, 'Scholarship', 'tertiary-academic', 'Tertiary Academic Merit Scholarship', 'SCH-QC-2026-06', 'Tertiary Academic Merit Scholarship', 25000.00, 'Under Review', '2026-08-28', 33, 4, 4, 'TIP QC Civil Engineering freshman standing verified.', '{"studentId":"2025-QC-339102","school":"Technological Institute of the Philippines (TIP QC)","course":"B.S. Civil Engineering","yearLevel":"1st Year","gwa":1.75,"unitsEnrolled":21,"unitsPassed":21,"annualIncome":110000,"firstName":"Kyla Patricia","lastName":"Ramos","city":"Quezon City"}', '[{"id":"cor","name":"TIP_RegistrationAssessment_KylaRamos.pdf","size":"1.5 MB","uploadedAt":"Aug 28, 2026"},{"id":"tor","name":"TIP_GradeReportSlip_Term1.pdf","size":"1.6 MB","uploadedAt":"Aug 28, 2026"}]'),
     (7, 'APP-QC-2026-771924', $1, 'Scholarship', 'tertiary-economic', 'Tertiary Economic Scholarship', 'SCH-QC-2026-07', 'Tertiary Economic Scholarship', 20000.00, 'Under Review', '2026-08-28', 33, 4, 4, 'FEU Business Administration active grant applicant.', '{"studentId":"2024-QC-771924","school":"Far Eastern University Diliman","course":"B.S. Business Administration","yearLevel":"2nd Year","gwa":2.10,"unitsEnrolled":18,"unitsPassed":18,"annualIncome":80000,"firstName":"Mark Angelo","lastName":"David","city":"Quezon City"}', '[{"id":"cor","name":"FEU_AssessmentForm_MarkDavid.pdf","size":"1.3 MB","uploadedAt":"Aug 28, 2026"},{"id":"tor","name":"FEU_OfficialGradeSlip_2026.pdf","size":"1.8 MB","uploadedAt":"Aug 28, 2026"}]')`,
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
     ($1, 1, '31042836-9eab-465f-9ee7-270ddb9f5f97.jfif', 'tertiary_cor_grades', '2026-08-25', 'verified', '115.8 KB', '/uploads/31042836-9eab-465f-9ee7-270ddb9f5f97.jfif', 'image/jpeg'),
     ($1, 2, 'COR_FirstSem_2026_AlexandraChen.pdf', 'academic', '2026-08-26', 'verified', '1.8 MB', '/uploads/COR_FirstSem_2026_AlexandraChen.pdf', 'application/pdf'),
     ($1, 2, 'TOR_COG_CertifiedCopy_AlexandraChen.pdf', 'academic', '2026-08-26', 'verified', '2.1 MB', '/uploads/TOR_COG_CertifiedCopy_AlexandraChen.pdf', 'application/pdf'),
     ($1, 3, 'COR_2026_PUP_JulianAlvarez.pdf', 'academic', '2026-08-26', 'verified', '1.4 MB', '/uploads/COR_2026_PUP_JulianAlvarez.pdf', 'application/pdf'),
     ($1, 3, 'COG_SemestralGrades_JulianAlvarez.pdf', 'academic', '2026-08-26', 'verified', '1.9 MB', '/uploads/COG_SemestralGrades_JulianAlvarez.pdf', 'application/pdf'),
     ($1, 4, 'COR_AY2026_QCU_MariaSantos.pdf', 'academic', '2026-08-27', 'verified', '1.2 MB', '/uploads/COR_AY2026_QCU_MariaSantos.pdf', 'application/pdf'),
     ($1, 4, 'OfficialTranscript_Certified_Santos.pdf', 'academic', '2026-08-27', 'verified', '2.4 MB', '/uploads/OfficialTranscript_Certified_Santos.pdf', 'application/pdf'),
     ($1, 5, 'UPD_Form5_COR_2026_RobertoGarcia.pdf', 'academic', '2026-08-27', 'verified', '2.0 MB', '/uploads/UPD_Form5_COR_2026_RobertoGarcia.pdf', 'application/pdf'),
     ($1, 5, 'UPD_TranscriptOfRecords_RobertoGarcia.pdf', 'academic', '2026-08-27', 'verified', '2.7 MB', '/uploads/UPD_TranscriptOfRecords_RobertoGarcia.pdf', 'application/pdf'),
     ($1, 6, 'TIP_RegistrationAssessment_KylaRamos.pdf', 'academic', '2026-08-28', 'verified', '1.5 MB', '/uploads/TIP_RegistrationAssessment_KylaRamos.pdf', 'application/pdf'),
     ($1, 6, 'TIP_GradeReportSlip_Term1.pdf', 'academic', '2026-08-28', 'verified', '1.6 MB', '/uploads/TIP_GradeReportSlip_Term1.pdf', 'application/pdf'),
     ($1, 7, 'FEU_AssessmentForm_MarkDavid.pdf', 'academic', '2026-08-28', 'verified', '1.3 MB', '/uploads/FEU_AssessmentForm_MarkDavid.pdf', 'application/pdf'),
     ($1, 7, 'FEU_OfficialGradeSlip_2026.pdf', 'academic', '2026-08-28', 'verified', '1.8 MB', '/uploads/FEU_OfficialGradeSlip_2026.pdf', 'application/pdf')`,
    [studentUserId]
  );

  // 8. SEED NOTIFICATIONS
  console.log('[seed] Seeding notifications...');
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
     VALUES
     ($1, 'Application Under QCYDO Admin Review', 'Your Economic Scholarship application (Ref: APP-QC-1787645562754) is under active administrative verification.', 'info', false, 'application_status', '/dashboard'),
     ($1, 'Documentary Attachments Encrypted & Uploaded', 'All submitted files have been archived in your QC Student Document Vault.', 'success', false, 'document', '/documents')`,
    [studentUserId]
  );

  // 9. SEED STUDENT REGISTRY
  console.log('[seed] Seeding student registry roster...');
  await pool.query(
    `INSERT INTO student_registry (student_id, user_id, full_name, email, school, program_id, program_name, current_term, scholarship_age, gwa, units_enrolled, status, grant_amount, disbursement_status)
     VALUES
     ('2024-QC-884920', $1, 'Alexandra Chen', 'alexandra.chen@qcu.edu.ph', 'Quezon City University (QCU Main)', 'tertiary-academic', 'Tertiary Academic Merit Scholarship', '1st Sem AY 2026-2027', 'Year 3 (5th Sem)', 1.25, 21, 'Dean''s List Honor', 25000.00, 'Scheduled'),
     ('2023-QC-492810', $1, 'Julian Alvarez', 'julian.alvarez@pup.edu.ph', 'Polytechnic University of the Philippines (PUP QC)', 'tertiary-academic', 'Tertiary Academic Merit Scholarship', '1st Sem AY 2026-2027', 'Year 2 (3rd Sem)', 2.85, 18, 'Academic Warning', 25000.00, 'On-Hold'),
     ('2024-QC-992014', $1, 'Maria Leonila Santos', 'maria.santos@qcu.edu.ph', 'Quezon City University (QCU San Bartolome)', 'tertiary-economic', 'Tertiary Economic Scholarship', '1st Sem AY 2026-2027', 'Year 4 (7th Sem)', 1.65, 12, 'Active Good Standing', 20000.00, 'Scheduled'),
     ('2023-QC-110293', $1, 'Roberto Garcia', 'roberto.garcia@upd.edu.ph', 'University of the Philippines Diliman', 'tertiary-academic', 'Tertiary Academic Merit Scholarship', '1st Sem AY 2026-2027', 'Year 3 (5th Sem)', 1.40, 18, 'Dean''s List Honor', 25000.00, 'Scheduled'),
     ('2025-QC-339102', $1, 'Kyla Patricia Ramos', 'kyla.ramos@tip.edu.ph', 'Technological Institute of the Philippines (TIP QC)', 'tertiary-academic', 'Tertiary Academic Merit Scholarship', '1st Sem AY 2026-2027', 'Year 1 (1st Sem)', 1.75, 21, 'Active Good Standing', 25000.00, 'Scheduled'),
     ('2024-QC-771924', $1, 'Mark Angelo David', 'mark.david@feu.edu.ph', 'Far Eastern University Diliman', 'tertiary-economic', 'Tertiary Economic Scholarship', '1st Sem AY 2026-2027', 'Year 2 (3rd Sem)', 2.10, 18, 'Active Good Standing', 20000.00, 'Scheduled'),
     ('23010366', $1, 'Pia Marie T. Faner', 'student@demo.edu', 'Bestlink College of the Philippines (BCP)', 'tertiary-economic', 'Economic Scholarship (Need-Based Financial Assistance)', '1st Sem AY 2026-2027', 'Year 1 (1st Sem)', 1.50, 18, 'Active Good Standing', 20000.00, 'Scheduled')
     ON CONFLICT (student_id) DO NOTHING`,
    [studentUserId]
  );


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
