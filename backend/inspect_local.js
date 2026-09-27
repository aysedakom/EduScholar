const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function inspectLocalPostgres() {
  console.log('=== INSPECTING LOCAL POSTGRESQL ("eduscholar") ===');
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'January10',
    database: 'eduscholar'
  });

  try {
    const tablesRes = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    const tableNames = tablesRes.rows.map(r => r.table_name);
    console.log('Tables in local eduscholar:', tableNames);

    for (const tbl of tableNames) {
      const countRes = await pool.query(`SELECT COUNT(*)::int as count FROM "${tbl}"`);
      const cnt = countRes.rows[0].count;
      console.log(`\n--- Table: ${tbl} (${cnt} rows) ---`);
      if (cnt > 0) {
        const rowsRes = await pool.query(`SELECT * FROM "${tbl}" LIMIT 10`);
        console.log(rowsRes.rows);
      }
    }
  } catch (err) {
    console.error('Local PG Error:', err.message);
  }

  // Also check DBeaver workspace directory for connection files or scripts
  console.log('\n=== CHECKING DBEAVER WORKSPACE FILES ===');
  const dbeaverDir = path.join(process.env.APPDATA || 'C:\\Users\\piama\\AppData\\Roaming', 'DBeaverData', 'workspace6');
  if (fs.existsSync(dbeaverDir)) {
    console.log('Found DBeaver directory:', dbeaverDir);
    function walkDir(dir) {
      try {
        const files = fs.readdirSync(dir);
        for (const f of files) {
          const fp = path.join(dir, f);
          const stat = fs.statSync(fp);
          if (stat.isDirectory()) {
            walkDir(fp);
          } else if (f.endsWith('.sql') || f.endsWith('.json') || f.endsWith('.xml') || f.endsWith('.csv')) {
            console.log('DBeaver file:', fp, `(${stat.size} bytes)`);
          }
        }
      } catch (_) {}
    }
    walkDir(dbeaverDir);
  } else {
    console.log('DBeaverData dir not found at standard path:', dbeaverDir);
  }

  process.exit(0);
}

inspectLocalPostgres();
