const { pool } = require('../config/db');

const schools = [
  ['SCH-QC-001', 'Bestlink College of the Philippines (BCP)', 'BCP Novaliches', 'Private', '1071 Quirino Highway, Brgy. Kaligayahan, Novaliches, Quezon City', 'Engr. Charlie I. Cariño (Registrar / Dean)', '(02) 8417-4355', 'registrar@bcp.edu.ph', 'Accredited', 480, 2500, 'BSIT, BSCS, BSCpE, BSBA, BSHM, BSED, BEED, BSCRIM', '2024-01-01', '2028-12-31'],
  ['SCH-QC-002', 'Quezon City University (QCU - San Bartolome Main)', 'QCU Main', 'LGU University', '673 Quirino Highway, San Bartolome, Novaliches, Quezon City', 'Dr. Aris Ramos (University Registrar)', '(02) 8806-3000', 'registrar@qcu.edu.ph', 'Accredited', 620, 3000, 'BSIT, BSCS, BSA, BSBA, BSIE, BECED', '2024-01-01', '2028-12-31'],
  ['SCH-QC-003', 'Quezon City University (QCU - Batasan Campus)', 'QCU Batasan', 'LGU University', 'Batasan Hills, District 2, Quezon City', 'Prof. Melinda De Jesus (Campus Coordinator)', '(02) 8951-4022', 'batasan.registrar@qcu.edu.ph', 'Accredited', 310, 1500, 'BSIT, BSBA, BSA, BSED', '2024-01-01', '2028-12-31'],
  ['SCH-QC-004', 'Quezon City University (QCU - San Francisco Campus)', 'QCU San Francisco', 'LGU University', 'San Francisco del Monte, District 1, Quezon City', 'Prof. Danilo Reyes (Campus Coordinator)', '(02) 8372-8812', 'sanfrancisco.registrar@qcu.edu.ph', 'Accredited', 240, 1200, 'BSIT, BSBA, BSIE', '2024-01-01', '2028-12-31'],
  ['SCH-QC-005', 'University of the Philippines Diliman (UPD)', 'UP Diliman', 'SUC', 'Diliman, Quezon City, Metro Manila', 'Prof. Carla Gomez (Office of Scholarships)', '(02) 8981-8500', 'scholarships@upd.edu.ph', 'Accredited', 350, 1500, 'All Priority STEM, Social Sciences, Allied Health, Engineering', '2024-01-01', '2028-12-31'],
  ['SCH-QC-006', 'Polytechnic University of the Philippines (PUP QC)', 'PUP QC', 'SUC', 'Don Fabian St., Commonwealth, Quezon City', 'Prof. Ramon Santos (Branch Director)', '(02) 8952-7818', 'pupqc@pup.edu.ph', 'Accredited', 290, 1000, 'BSIT, BSBA, BPA, BSED, BS Accountancy', '2024-01-01', '2028-12-31'],
  ['SCH-QC-007', 'Our Lady of Fatima University (OLFU QC)', 'OLFU QC', 'Private', 'Regalado Ave., Fairview, Quezon City', 'Dr. Ma. Cristina Santos (Dean / Student Affairs)', '(02) 8935-2960', 'admissions.qc@fatima.edu.ph', 'Accredited', 210, 1200, 'BS Nursing, BS Pharmacy, BS Medical Tech, BS Physical Therapy, BSIT, BSBA', '2024-01-01', '2028-12-31'],
  ['SCH-QC-008', 'National University (NU Fairview / QC)', 'NU Fairview', 'Private', 'SM City Fairview Complex, Quirino Highway, Quezon City', 'Dir. Rafael Alcantara (Academic Registrar)', '(02) 8401-7700', 'admissions@nu-fairview.edu.ph', 'Accredited', 180, 800, 'BS Architecture, BS Civil Engg, BS Computer Science, BSIT, BS Tourism', '2024-01-01', '2028-12-31'],
  ['SCH-QC-009', 'Technological Institute of the Philippines (TIP QC)', 'TIP QC', 'Private', '938 Aurora Blvd., Cubao, Quezon City', 'Engr. David Tan (Student Financial Assistance)', '(02) 8911-0964', 'info.qc@tip.edu.ph', 'Accredited', 220, 1000, 'BS Computer Engg, BSEE, BSME, BSCE, BSCS, BSIT', '2024-01-01', '2028-12-31'],
  ['SCH-QC-010', 'Far Eastern University Diliman (FEU Diliman)', 'FEU Diliman', 'Private', 'Sampaguita Ave., Mapayapa Village, Quezon City', 'Ms. Teresa Mendoza (Admissions Officer)', '(02) 8931-6060', 'admissions@feudiliman.edu.ph', 'Accredited', 140, 600, 'BS Accountancy, BSBA, BSIT, Senior High School Academic Track', '2024-01-01', '2028-12-31'],
  ['SCH-QC-011', 'FEU - Nicanor Reyes Medical Foundation (FEU-NRMF)', 'FEU-NRMF', 'Private', 'Regalado Ave., West Fairview, Quezon City', 'Dr. Enrique Villanueva (Dean of Medical Services)', '(02) 8983-8000', 'admissions@feunrmf.edu.ph', 'Accredited', 160, 500, 'BS Medical Technology, BS Physical Therapy, BS Radiologic Tech, BS Nursing', '2024-01-01', '2028-12-31'],
  ['SCH-QC-012', 'Trinity University of Asia (TUA)', 'TUA', 'Private', 'Cathedral Heights, 275 E. Rodriguez Sr. Ave., Quezon City', 'Dr. Cynthia Bautista (Registrar & Admissions)', '(02) 8702-2882', 'admissions@tua.edu.ph', 'Accredited', 175, 700, 'BS Nursing, BS Medical Tech, BS Psychology, BSBA, BSED, BSIT', '2024-01-01', '2028-12-31'],
  ['SCH-QC-013', 'Ateneo de Manila University (ADMU)', 'Ateneo', 'Private', 'Katipunan Ave., Loyola Heights, Quezon City', 'Dir. Joaquin Reyes (Office of Admission and Aid)', '(02) 8426-6001', 'finaid@ateneo.edu', 'Partner Active', 120, 500, 'BS Management, BS Computer Science, BS Applied Math, AB Economics', '2024-06-01', '2028-06-01'],
  ['SCH-QC-014', 'New Era University (NEU)', 'NEU', 'Private', 'No. 9 Central Ave., New Era, Diliman, Quezon City', 'Prof. Ernesto Cruz (University Registrar)', '(02) 8981-4221', 'info@neu.edu.ph', 'Accredited', 190, 900, 'BS Civil Engg, BSEE, BS Accountancy, BS Nursing, BSIT, BS Medical Tech', '2024-01-01', '2028-12-31'],
  ['SCH-QC-015', 'Miriam College (MC)', 'Miriam College', 'Private', 'Katipunan Ave., Loyola Heights, Quezon City', 'Ms. Victoria Salazar (Financial Assistance Desk)', '(02) 8930-1393', 'scholarships@mc.edu.ph', 'Partner Active', 95, 400, 'BS Child Development, BS International Studies, BS Communication', '2024-01-01', '2028-12-31'],
  ['SCH-QC-016', 'UST - Angelicum College', 'UST Angelicum', 'Private', '112 Sen. Mariano J. Cuenco St., Santa Mesa Heights, Quezon City', 'Rev. Fr. Arthur Dingel (Director)', '(02) 8732-2000', 'admissions@ustangelicum.edu.ph', 'Accredited', 110, 500, 'BSIT, BSBA, AB Communication, Senior High School Academic Track', '2024-01-01', '2028-12-31'],
  ['SCH-QC-017', 'St. Paul University Quezon City (SPUQC)', 'SPUQC', 'Private', 'Aurora Blvd. cor. Gilmore Ave., New Manila, Quezon City', 'Sr. Bernadette Racadio (Office of Admissions)', '(02) 8726-7986', 'spuqc_admissions@spuqc.edu.ph', 'Accredited', 85, 450, 'BS Nursing, BS Psychology, BSBA, BSED, BS Tourism', '2024-01-01', '2028-12-31'],
  ['SCH-QC-018', 'World Citi Colleges (WCC QC)', 'World Citi Colleges', 'Private', '960 Aurora Blvd., Anonas, Quezon City', 'Prof. Allan Soriano (Registrar)', '(02) 8913-8380', 'info@worldciticolleges.edu.ph', 'Accredited', 130, 600, 'BS Nursing, BS Medical Tech, BS Aeronautical Engg, BS Aviation', '2024-01-01', '2028-12-31'],
  ['SCH-QC-019', 'STI College (Novaliches / Cubao / Fairview)', 'STI College QC', 'Private', 'Quirino Highway, Novaliches, Quezon City', 'Mr. Dennis Garcia (Campus Administrator)', '(02) 8936-2244', 'novaliches@sti.edu', 'Accredited', 260, 800, 'BSIT, BSCS, BS Information Systems, BS Tourism, BS Hospitality', '2024-01-01', '2028-12-31'],
  ['SCH-QC-020', 'AMA Computer University (AMA QC)', 'AMA University', 'Private', 'Maximina St., Villa Arca Subd., Project 8, Quezon City', 'Engr. Manuel Santos (Registrar)', '(02) 8737-5555', 'customer_service@ama.edu.ph', 'Accredited', 145, 650, 'BS Computer Science, BSIT, BS Computer Engg, BS Cybersecurity', '2024-01-01', '2028-12-31'],
  ['SCH-QC-021', 'Metro Manila College (MMC Novaliches)', 'MMC Novaliches', 'Private', 'U-Site, Brgy. Kaligayahan, Novaliches, Quezon City', 'Dr. Aurora Miranda (Academic Vice President)', '(02) 8936-7080', 'info@metromanilacollege.edu.ph', 'Accredited', 170, 800, 'BS Criminology, BEED, BSED, BSBA, BSIT, BSHM', '2024-01-01', '2028-12-31'],
  ['SCH-QC-022', 'Access Computer College Novaliches', 'Access College', 'Private', 'Quirino Highway cor. Zabarte Rd., Novaliches, Quezon City', 'Ms. Lorena Bautista (Branch Registrar)', '(02) 8930-0588', 'admissions@access.edu.ph', 'Accredited', 115, 500, 'BSIT, BSBA, BS Hotel and Restaurant Management, Associate in Computer Tech', '2024-01-01', '2028-12-31'],
  ['SCH-QC-023', 'Capitol Medical Center Colleges (CMCC)', 'CMCC', 'Private', 'Quezon Ave. cor. Scout Magbanua St., Quezon City', 'Dr. Maria Elena Ocampo (Dean of Health Sciences)', '(02) 8372-8888', 'colleges@capitolmedical.org', 'Accredited', 90, 400, 'BS Nursing, BS Medical Tech, BS Radiologic Tech', '2024-01-01', '2028-12-31'],
  ['SCH-QC-024', 'Eulogio Amang Rodriguez Institute of Science and Technology (EARIST QC)', 'EARIST QC', 'SUC', 'Bagtican St., Brgy. Sto. Cristo, Bago Bantay, Quezon City', 'Prof. Gilberto Ramos (Campus Director)', '(02) 8928-1120', 'earistqc@earist.edu.ph', 'Accredited', 185, 700, 'BS Industrial Tech, BS Electrical Tech, BS Electronics Tech, BS Mechanical Tech, BSED', '2024-01-01', '2028-12-31']
];

async function seed() {
  await pool.query('DELETE FROM partner_schools');
  for (const s of schools) {
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
  console.log(`Successfully seeded ${schools.length} accredited partner institutions into partner_schools database table!`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
