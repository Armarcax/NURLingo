// fix-dictionary.js
const fs = require('fs');

const inputPath = 'src/lib/lexicon/master-dictionary.json';
const outputPath = 'src/lib/lexicon/master-dictionary.fixed.json';

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const flat = {};

for (const entry of data.entries) {
  flat[entry.id] = { hy: entry.hy, en: entry.en, ru: entry.ru };
}

fs.writeFileSync(outputPath, JSON.stringify(flat, null, 2));
console.log('✅ Done! Replace old file with fixed version.');