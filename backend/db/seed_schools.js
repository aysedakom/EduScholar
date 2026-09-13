const { pool } = require('../config/db');

const schools = [
  ['SCH-QC-001', 'Bestlink College of the Philippines (BCP)', 'BCP', 'Private', '1071 Quirino Highway, Brgy. Kaligayahan, Novaliches, Quezon City', 'Engr. Charlie I. Cariño (Registrar / Coordinator)', '(02) 8417-4355', 'bcp.edu67@gmail.com', 'Accredited', 480, 2500, 'BSIT, BSCS, BSCpE, BSBA, BSHM, BSED, BEED, BSCRIM', '2024-01-01', '2028-12-31'],
  ['SCH-QC-002', 'Quezon City University (QCU)', 'QCU', 'LGU University', '673 Quirino Highway, San Bartolome, Novaliches, Quezon City', 'Dr. Aris Ramos (University Registrar / Coordinator)', '(02) 8806-3000', 'qcu.edu67@gmail.com', 'Accredited', 620, 3000, 'BSIT, BSCS, BSA, BSBA, BSIE, BECED', '2024-01-01', '2028-12-31'],
  ['SCH-QC-003', 'St. Claire College of Caloocan', 'St. Claire', 'Private', 'Caloocan / QC Border Campus', 'Prof. Maria Santos (Coordinator)', '(02) 8951-4022', 'stclaire.edu67@gmail.com', 'Accredited', 310, 1500, 'BSIT, BSBA, BSA, BSED, BEED', '2024-01-01', '2028-12-31'],
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
