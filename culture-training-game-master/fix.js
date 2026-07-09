const fs = require('fs');
let code = fs.readFileSync('components/TugOfWar.js', 'utf8');
code = code.replace(/\\\$\{/g, '${');
// Fix invalid template string syntax at the end of the file
code = code.replace(/\\\`\$\{(nt\.ropePosition)\}%\\\`/g, '`${$1}%`');
fs.writeFileSync('components/TugOfWar.js', code);
