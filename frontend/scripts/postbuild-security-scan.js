import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.log('⚠️ dist directory not found. Skipping post-build security scan.');
  process.exit(0);
}

let mapFilesRemoved = 0;
let leaksFound = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.map')) {
        console.warn(`🚨 DELETING LEAKED MAP FILE: ${fullPath}`);
        fs.unlinkSync(fullPath);
        mapFilesRemoved++;
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.html')) {
        const content = fs.readFileSync(fullPath, 'utf8');

        const secretPatterns = [
          { name: 'Private Key Block', regex: /-----BEGIN PRIVATE KEY-----/i },
          { name: 'Generic Secret Token', regex: /(secret_key|private_key|app_secret|db_password)\s*=\s*['"][^'"]+['"]/i },
          { name: 'Brevo API Key', regex: /xkeysib-[a-f0-9]{64}/i },
        ];

        for (const pattern of secretPatterns) {
          if (pattern.regex.test(content)) {
            console.error(`❌ CRITICAL SECURITY LEAK DETECTED in ${entry.name}: ${pattern.name}`);
            leaksFound++;
          }
        }
      }
    }
  }
}

console.log('🔍 Executing Post-Build Production Security Scan...');
scanDir(distDir);

if (mapFilesRemoved > 0) {
  console.log(`✅ Removed ${mapFilesRemoved} leaked .map file(s) from dist.`);
} else {
  console.log('✅ Zero .map files found in output bundle.');
}

if (leaksFound > 0) {
  console.error(`❌ Security scan failed with ${leaksFound} leaked secret(s). Build aborted.`);
  process.exit(1);
} else {
  console.log('✅ Post-build security scan passed cleanly.');
}
