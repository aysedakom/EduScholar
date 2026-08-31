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
  console.log('[seed] Seeding accredited partner schools master catalog (24 institutions)...');
  const partnerSchoolsSeed = [
    ['SCH-QC-001', 'Bestlink College of the Philippines (BCP)', 'BCP Novaliches', 'Private', '1071 Quirino Highway, Brgy. Kaligayahan, Novaliches, Quezon City', 'Engr. Charlie I. Cariño (Registrar / Dean)', '(02) 8417-4355', 'registrar@bcp.edu.ph', 'Accredited', 0, 2500, 'BSIT, BSCS, BSCpE, BSBA, BSHM, BSED, BEED, BSCRIM', '2024-01-01', '2028-12-31'],
    ['SCH-QC-002', 'Quezon City University (QCU - San Bartolome Main)', 'QCU Main', 'LGU University', '673 Quirino Highway, San Bartolome, Novaliches, Quezon City', 'Dr. Aris Ramos (University Registrar)', '(02) 8806-3000', 'registrar@qcu.edu.ph', 'Accredited', 0, 3000, 'BSIT, BSCS, BSA, BSBA, BSIE, BECED', '2024-01-01', '2028-12-31'],
    ['SCH-QC-003', 'Quezon City University (QCU - Batasan Campus)', 'QCU Batasan', 'LGU University', 'Batasan Hills, District 2, Quezon City', 'Prof. Melinda De Jesus (Campus Coordinator)', '(02) 8951-4022', 'batasan.registrar@qcu.edu.ph', 'Accredited', 0, 1500, 'BSIT, BSBA, BSA, BSED', '2024-01-01', '2028-12-31'],
    ['SCH-QC-004', 'Quezon City University (QCU - San Francisco Campus)', 'QCU San Francisco', 'LGU University', 'San Francisco del Monte, District 1, Quezon City', 'Prof. Danilo Reyes (Campus Coordinator)', '(02) 8372-8812', 'sanfrancisco.registrar@qcu.edu.ph', 'Accredited', 0, 1200, 'BSIT, BSBA, BSIE', '2024-01-01', '2028-12-31'],
    ['SCH-QC-005', 'University of the Philippines Diliman (UPD)', 'UP Diliman', 'SUC', 'Diliman, Quezon City, Metro Manila', 'Prof. Carla Gomez (Office of Scholarships)', '(02) 8981-8500', 'scholarships@upd.edu.ph', 'Accredited', 0, 1500, 'All Priority STEM, Social Sciences, Allied Health, Engineering', '2024-01-01', '2028-12-31'],
    ['SCH-QC-006', 'Polytechnic University of the Philippines (PUP QC)', 'PUP QC', 'SUC', 'Don Fabian St., Commonwealth, Quezon City', 'Prof. Ramon Santos (Branch Director)', '(02) 8952-7818', 'pupqc@pup.edu.ph', 'Accredited', 0, 1000, 'BSIT, BSBA, BPA, BSED, BS Accountancy', '2024-01-01', '2028-12-31'],
    ['SCH-QC-007', 'Our Lady of Fatima University (OLFU QC)', 'OLFU QC', 'Private', 'Regalado Ave., Fairview, Quezon City', 'Dr. Ma. Cristina Santos (Dean / Student Affairs)', '(02) 8935-2960', 'admissions.qc@fatima.edu.ph', 'Accredited', 0, 1200, 'BS Nursing, BS Pharmacy, BS Medical Tech, BS Physical Therapy, BSIT, BSBA', '2024-01-01', '2028-12-31'],
    ['SCH-QC-008', 'National University (NU Fairview / QC)', 'NU Fairview', 'Private', 'SM City Fairview Complex, Quirino Highway, Quezon City', 'Dir. Rafael Alcantara (Academic Registrar)', '(02) 8401-7700', 'admissions@nu-fairview.edu.ph', 'Accredited', 0, 800, 'BS Architecture, BS Civil Engg, BS Computer Science, BSIT, BS Tourism', '2024-01-01', '2028-12-31'],
    ['SCH-QC-009', 'Technological Institute of the Philippines (TIP QC)', 'TIP QC', 'Private', '938 Aurora Blvd., Cubao, Quezon City', 'Engr. David Tan (Student Financial Assistance)', '(02) 8911-0964', 'info.qc@tip.edu.ph', 'Accredited', 0, 1000, 'BS Computer Engg, BSEE, BSME, BSCE, BSCS, BSIT', '2024-01-01', '2028-12-31'],
    ['SCH-QC-010', 'Far Eastern University Diliman (FEU Diliman)', 'FEU Diliman', 'Private', 'Sampaguita Ave., Mapayapa Village, Quezon City', 'Ms. Teresa Mendoza (Admissions Officer)', '(02) 8931-6060', 'admissions@feudiliman.edu.ph', 'Accredited', 0, 600, 'BS Accountancy, BSBA, BSIT, Senior High School Academic Track', '2024-01-01', '2028-12-31'],
    ['SCH-QC-011', 'FEU - Nicanor Reyes Medical Foundation (FEU-NRMF)', 'FEU-NRMF', 'Private', 'Regalado Ave., West Fairview, Quezon City', 'Dr. Enrique Villanueva (Dean of Medical Services)', '(02) 8983-8000', 'admissions@feunrmf.edu.ph', 'Accredited', 0, 500, 'BS Medical Technology, BS Physical Therapy, BS Radiologic Tech, BS Nursing', '2024-01-01', '2028-12-31'],
    ['SCH-QC-012', 'Trinity University of Asia (TUA)', 'TUA', 'Private', 'Cathedral Heights, 275 E. Rodriguez Sr. Ave., Quezon City', 'Dr. Cynthia Bautista (Registrar & Admissions)', '(02) 8702-2882', 'admissions@tua.edu.ph', 'Accredited', 0, 700, 'BS Nursing, BS Medical Tech, BS Psychology, BSBA, BSED, BSIT', '2024-01-01', '2028-12-31'],
    ['SCH-QC-013', 'Ateneo de Manila University (ADMU)', 'Ateneo', 'Private', 'Katipunan Ave., Loyola Heights, Quezon City', 'Dir. Joaquin Reyes (Office of Admission and Aid)', '(02) 8426-6001', 'finaid@ateneo.edu', 'Partner Active', 0, 500, 'BS Management, BS Computer Science, BS Applied Math, AB Economics', '2024-06-01', '2028-06-01'],
    ['SCH-QC-014', 'New Era University (NEU)', 'NEU', 'Private', 'No. 9 Central Ave., New Era, Diliman, Quezon City', 'Prof. Ernesto Cruz (University Registrar)', '(02) 8981-4221', 'info@neu.edu.ph', 'Accredited', 0, 900, 'BS Civil Engg, BSEE, BS Accountancy, BS Nursing, BSIT, BS Medical Tech', '2024-01-01', '2028-12-31'],
    ['SCH-QC-015', 'Miriam College (MC)', 'Miriam College', 'Private', 'Katipunan Ave., Loyola Heights, Quezon City', 'Ms. Victoria Salazar (Financial Assistance Desk)', '(02) 8930-1393', 'scholarships@mc.edu.ph', 'Partner Active', 0, 400, 'BS Child Development, BS International Studies, BS Communication', '2024-01-01', '2028-12-31'],
    ['SCH-QC-016', 'UST - Angelicum College', 'UST Angelicum', 'Private', '112 Sen. Mariano J. Cuenco St., Santa Mesa Heights, Quezon City', 'Rev. Fr. Arthur Dingel (Director)', '(02) 8732-2000', 'admissions@ustangelicum.edu.ph', 'Accredited', 0, 500, 'BSIT, BSBA, AB Communication, Senior High School Academic Track', '2024-01-01', '2028-12-31'],
    ['SCH-QC-017', 'St. Paul University Quezon City (SPUQC)', 'SPUQC', 'Private', 'Aurora Blvd. cor. Gilmore Ave., New Manila, Quezon City', 'Sr. Bernadette Racadio (Office of Admissions)', '(02) 8726-7986', 'spuqc_admissions@spuqc.edu.ph', 'Accredited', 0, 450, 'BS Nursing, BS Psychology, BSBA, BSED, BS Tourism', '2024-01-01', '2028-12-31'],
    ['SCH-QC-018', 'World Citi Colleges (WCC QC)', 'World Citi Colleges', 'Private', '960 Aurora Blvd., Anonas, Quezon City', 'Prof. Allan Soriano (Registrar)', '(02) 8913-8380', 'info@worldciticolleges.edu.ph', 'Accredited', 0, 600, 'BS Nursing, BS Medical Tech, BS Aeronautical Engg, BS Aviation', '2024-01-01', '2028-12-31'],
    ['SCH-QC-019', 'STI College (Novaliches / Cubao / Fairview)', 'STI College QC', 'Private', 'Quirino Highway, Novaliches, Quezon City', 'Mr. Dennis Garcia (Campus Administrator)', '(02) 8936-2244', 'novaliches@sti.edu', 'Accredited', 0, 800, 'BSIT, BSCS, BS Information Systems, BS Tourism, BS Hospitality', '2024-01-01', '2028-12-31'],
    ['SCH-QC-020', 'AMA Computer University (AMA QC)', 'AMA University', 'Private', 'Maximina St., Villa Arca Subd., Project 8, Quezon City', 'Engr. Manuel Santos (Registrar)', '(02) 8737-5555', 'customer_service@ama.edu.ph', 'Accredited', 0, 650, 'BS Computer Science, BSIT, BS Computer Engg, BS Cybersecurity', '2024-01-01', '2028-12-31'],
    ['SCH-QC-021', 'Metro Manila College (MMC Novaliches)', 'MMC Novaliches', 'Private', 'U-Site, Brgy. Kaligayahan, Novaliches, Quezon City', 'Dr. Aurora Miranda (Academic Vice President)', '(02) 8936-7080', 'info@metromanilacollege.edu.ph', 'Accredited', 0, 800, 'BS Criminology, BEED, BSED, BSBA, BSIT, BSHM', '2024-01-01', '2028-12-31'],
    ['SCH-QC-022', 'Access Computer College Novaliches', 'Access College', 'Private', 'Quirino Highway cor. Zabarte Rd., Novaliches, Quezon City', 'Ms. Lorena Bautista (Branch Registrar)', '(02) 8930-0588', 'admissions@access.edu.ph', 'Accredited', 0, 500, 'BSIT, BSBA, BS Hotel and Restaurant Management, Associate in Computer Tech', '2024-01-01', '2028-12-31'],
    ['SCH-QC-023', 'Capitol Medical Center Colleges (CMCC)', 'CMCC', 'Private', 'Quezon Ave. cor. Scout Magbanua St., Quezon City', 'Dr. Maria Elena Ocampo (Dean of Health Sciences)', '(02) 8372-8888', 'colleges@capitolmedical.org', 'Accredited', 0, 400, 'BS Nursing, BS Medical Tech, BS Radiologic Tech', '2024-01-01', '2028-12-31'],
    ['SCH-QC-024', 'Eulogio Amang Rodriguez Institute of Science and Technology (EARIST QC)', 'EARIST QC', 'SUC', 'Bagtican St., Brgy. Sto. Cristo, Bago Bantay, Quezon City', 'Prof. Gilberto Ramos (Campus Director)', '(02) 8928-1120', 'earistqc@earist.edu.ph', 'Accredited', 0, 700, 'BS Industrial Tech, BS Electrical Tech, BS Electronics Tech, BS Mechanical Tech, BSED', '2024-01-01', '2028-12-31']
  ];

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
