const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\soham\\.gemini\\antigravity-ide\\brain\\3a502ec3-8b38-49b9-99c5-c0b4a2bb7bf4';
const destDir = 'C:\\Users\\soham\\Desktop\\avanimart\\screenshots\\phase-4-2';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = [
  { src: 'storefront_home_1793644711884.png', dest: '01_storefront_categories.png' },
  { src: 'admin_dashboard_1793645086435.png', dest: '02_admin_dashboard.png' },
  { src: 'orders_dispatch_1793645115851.png', dest: '03_orders_dispatch.png' },
  { src: 'product_catalog_1793645151650.png', dest: '04_product_catalog.png' },
  { src: 'add_product_modal_1793645192903.png', dest: '05_add_product_modal.png' },
  { src: 'inventory_valuation_1793645254329.png', dest: '06_inventory_valuation.png' },
  { src: 'low_stock_alerts_1793645278111.png', dest: '07_low_stock_alerts.png' },
  { src: 'storefront_gst_1793645303038.png', dest: '08_currency_and_gst_settings.png' },
  { src: 'pos_empty_cart_1793645354353.png', dest: '09_pos_empty_cart.png' },
  { src: 'pos_billing_active_1793645464301.png', dest: '10_pos_billing_steppers.png' },
  { src: 'invoice_a4_preview_1793645497735.png', dest: '11_invoice_a4_preview.png' },
  { src: 'invoice_thermal_preview_1793645536456.png', dest: '12_invoice_thermal_preview.png' }
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
console.log('All Phase 4.2 screenshots copied successfully.');
