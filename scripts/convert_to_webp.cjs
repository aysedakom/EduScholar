const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDirs = [
  path.join(__dirname, '..', 'frontend', 'public'),
  path.join(__dirname, '..', 'frontend', 'src', 'assets'),
];

async function convertDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const baseName = path.basename(file, ext);
      const webpPath = path.join(dir, `${baseName}.webp`);

      const origSize = stat.size;
      try {
        await sharp(fullPath)
          .webp({ quality: 82, effort: 4 })
          .toFile(webpPath);

        const newStat = fs.statSync(webpPath);
        const savedPercent = (((origSize - newStat.size) / origSize) * 100).toFixed(1);
        console.log(`Converted: ${file} (${(origSize / 1024).toFixed(1)} KB) -> ${baseName}.webp (${(newStat.size / 1024).toFixed(1)} KB) [Saved ${savedPercent}%]`);
      } catch (err) {
        console.error(`Error converting ${file}:`, err.message);
      }
    }
  }
}

async function main() {
  console.log('Starting image conversion to WebP...');
  for (const d of targetDirs) {
    console.log(`\nScanning: ${d}`);
    await convertDir(d);
  }
  console.log('\nAll images converted to WebP successfully!');
}

main();
