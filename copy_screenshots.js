const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\soham\\.gemini\\antigravity-ide\\brain\\3a502ec3-8b38-49b9-99c5-c0b4a2bb7bf4';
const destDir = 'C:\\Users\\soham\\Desktop\\avanimart\\screenshots\\phase-4-1';

const filesToCopy = [
  { src: 'desktop_homepage_top_1793630325432.png', dest: 'desktop_homepage_top.png' },
  { src: 'desktop_homepage_lower_1793630211273.png', dest: 'desktop_merchandising_sections.png' },
  { src: 'desktop_homepage_trust_features_1793630291443.png', dest: 'desktop_trust_features.png' },
  { src: 'mobile_homepage_1793631003395.png', dest: 'mobile_homepage.png' },
  { src: 'checkout_with_applied_coupon_1793630945617.png', dest: 'checkout_totals_with_coupon.png' },
  { src: 'cart_with_applied_coupon_1793630817525.png', dest: 'cart_with_applied_coupon.png' }
];

for (const item of filesToCopy) {
  const sourcePath = path.join(srcDir, item.src);
  const destPath = path.join(destDir, item.dest);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied: ${item.src} -> ${item.dest}`);
  } else {
    console.warn(`Source not found: ${sourcePath}`);
  }
}
console.log('Done copying screenshots.');
