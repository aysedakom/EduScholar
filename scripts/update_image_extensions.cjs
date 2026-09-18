const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

const replacements = [
  { from: /logo-system\.png/g, to: 'logo-system.webp' },
  { from: /lgu_qc_seal\.png/g, to: 'lgu_qc_seal.webp' },
  { from: /pop-up\.jpg/g, to: 'pop-up.webp' },
  { from: /Lightmode\.jpg/g, to: 'Lightmode.webp' },
  { from: /Darkmode\.jpg/g, to: 'Darkmode.webp' },
  { from: /gabi\.png/g, to: 'gabi.webp' },
  { from: /umaga\.png/g, to: 'umaga.webp' },
  { from: /ScholarHat\.png/g, to: 'ScholarHat.webp' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (/\.(tsx|ts|jsx|js|css|html)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated image references in: ${path.relative(srcDir, fullPath)}`);
      }
    }
  }
}

processDir(srcDir);
console.log('All image references updated to .webp!');
