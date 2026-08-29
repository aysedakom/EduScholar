// backend/db/seed.js
// Production Seed Script: Seeds only official master catalogs & verified Admin account.
// All student applications, registry records, documents, and notifications are 100% REAL-TIME & database-driven.

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  console.log('[seed] Starting clean master catalog seeding...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. SEED VERIFIED ADMIN USER ONLY
  console.log('[seed] Seeding primary verified Administrator...');
  await pool.query(
    `INSERT INTO users (name, email, password, role, student_id, department, major, gpa, financial_aid_year, avatar, phone, address, barangay, city, status, is_email_verified)
     VALUES
     ('ADMIN', 'support.edu2026@gmail.com', $1, 'admin', NULL, 'Quezon City Youth Development Office (QCYDO)', 'Scholarship Administrator', NULL, '2026-2027', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80', '+63 918 234 5678', 'Quezon City Hall Complex, Diliman', 'Barangay Central', 'Quezon City', 'active', true)
     ON CONFLICT (email) DO UPDATE SET password = $1, role = 'admin', is_email_verified = true, status = 'active'`,
    [hashedPassword]
  );

  // 2. SEED ACCREDITED PARTNER SCHOOLS CATALOG
  console.log('[seed] Seeding accredited partner schools master catalog...');
  await pool.query(
    `INSERT INTO partner_schools (school_id, name, short_name, school_type, address, contact_person, contact_number, email, partnership_status, active_scholars, scholarship_slots, programs_offered, partnership_start, partnership_end)
     VALUES
     ('SCH-QC-001', 'Quezon City University (QCU - San Bartolome Main)', 'QCU Main', 'LGU University', '673 Quirino Highway, San Bartolome, Novaliches, Quezon City', 'Dr. Aris Ramos (Dean)', '(02) 8806-3000', 'registrar@qcu.edu.ph', 'Accredited', 0, 2000, 'BSIT, BSCS, BSA, BSBA, BSIE, BECED', '2024-01-01', '2028-12-31'),
     ('SCH-QC-002', 'University of the Philippines Diliman (UPD)', 'UP Diliman', 'SUC', 'Diliman, Quezon City, Metro Manila', 'Prof. Carla Gomez', '(02) 8981-8500', 'scholarships@upd.edu.ph', 'Accredited', 0, 1200, 'All Priority STEM, Social Sciences, Allied Health', '2024-01-01', '2028-12-31'),
     ('SCH-QC-003', 'Ateneo de Manila University', 'Ateneo', 'Private', 'Katipunan Ave, Loyola Heights, Quezon City', 'Dir. Joaquin Reyes', '(02) 8426-6001', 'finaid@ateneo.edu', 'Partner Active', 0, 500, 'BS Management, BS Computer Science, AB Economics', '2024-06-01', '2027-06-01'),
     ('SCH-QC-004', 'Polytechnic University of the Philippines (PUP QC)', 'PUP QC', 'SUC', 'Don Fabian St., Commonwealth, Quezon City', 'Prof. Ramon Santos', '(02) 8952-7818', 'pupqc@pup.edu.ph', 'Accredited', 0, 800, 'BSIT, BSBA, BPA, BSED', '2024-01-01', '2028-12-31'),
     ('SCH-QC-005', 'Technological Institute of the Philippines (TIP QC)', 'TIP QC', 'Private', '938 Aurora Blvd, Cubao, Quezon City', 'Engr. David Tan', '(02) 8911-0964', 'info.qc@tip.edu.ph', 'Accredited', 0, 700, 'BSCE, BSEE, BSME, BSCS, BSIT', '2024-01-01', '2027-12-31'),
     ('SCH-QC-006', 'Far Eastern University Diliman (FEU Diliman)', 'FEU Diliman', 'Private', 'Sampaguita Ave, Mapayapa Village, Quezon City', 'Ms. Teresa Mendoza', '(02) 8931-6060', 'admissions@feudiliman.edu.ph', 'Partner Active', 0, 400, 'BSBA, BSIT, Senior High School Academic', '2024-01-01', '2027-12-31')
     ON CONFLICT (school_id) DO NOTHING`
  );

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
