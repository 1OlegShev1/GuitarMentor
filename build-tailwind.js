const { execSync } = require('child_process');

console.log('Building Tailwind CSS...');
execSync('npx tailwindcss -i ./src/styles/globals.css -o ./src/styles/output.css', { stdio: 'inherit' });
console.log('Tailwind CSS build complete!'); 