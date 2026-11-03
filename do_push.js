const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Adding files...');
  const out1 = execSync('git add .', { encoding: 'utf-8', cwd: __dirname });
  console.log('Committing...');
  let out2 = '';
  try {
    out2 = execSync('git commit -m "fix: remove invalid page export STORE_CATEGORIES for Next.js build"', { encoding: 'utf-8', cwd: __dirname });
  } catch (e) {
    out2 = e.stdout || e.message;
  }
  console.log('Pushing...');
  const out3 = execSync('git push origin main', { encoding: 'utf-8', cwd: __dirname });
  fs.writeFileSync(__dirname + '/push_result.txt', 'SUCCESS:\n' + out1 + '\n' + out2 + '\n' + out3);
  console.log('DONE SUCCESS');
} catch (err) {
  fs.writeFileSync(__dirname + '/push_result.txt', 'ERROR:\n' + err.message + '\n' + (err.stdout || '') + '\n' + (err.stderr || ''));
  console.error('DONE ERROR:', err.message);
}
