const fs = require('fs');
const path = require('path');

const srcLogo = path.join(__dirname, 'src', 'data', 'logo.png');
const publicDir = path.join(__dirname, 'public');
const destLogo = path.join(publicDir, 'logo.png');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (fs.existsSync(srcLogo)) {
  fs.copyFileSync(srcLogo, destLogo);
  const stats = fs.statSync(destLogo);
  console.log(`Successfully copied logo to ${destLogo} (${stats.size} bytes)`);
} else {
  console.error(`Source logo not found at ${srcLogo}`);
}
