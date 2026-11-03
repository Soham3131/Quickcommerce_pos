const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tscPath = path.join(__dirname, 'node_modules', 'typescript', 'bin', 'tsc');

try {
  const output = execSync(`node "${tscPath}" --noEmit`, { encoding: 'utf8', cwd: __dirname });
  fs.writeFileSync(path.join(__dirname, 'all_errors.txt'), 'NO_ERRORS\n' + output);
} catch (err) {
  const out = (err.stdout || '') + '\n' + (err.stderr || '') + '\n' + (err.message || '');
  fs.writeFileSync(path.join(__dirname, 'all_errors.txt'), out);
}
