const { pool } = require('../config/db');

async function main() {
  await pool.query("DELETE FROM users WHERE email = 'ana.reyes@gmail.com'");
  await pool.query("DELETE FROM email_logs WHERE recipient_email = 'ana.reyes@gmail.com'");
  await pool.query("DELETE FROM user_otps WHERE email = 'ana.reyes@gmail.com'");
  console.log('✅ Cleaned test user Ana Reyes from database.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
