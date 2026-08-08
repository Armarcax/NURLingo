// scripts/check-all-audio.js
const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../src/lib/content/database.ts');
const audioDir = path.join(__dirname, '../public/audio/hy');

const content = fs.readFileSync(databasePath, 'utf8');

// Գտնել ALL vocabulary ID-ները (ներառյալ expand-ից ստեղծվածները)
// Փնտրում ենք v("...") կամ v('...') կամ v(`...`) ձևերը
const idRegex = /v\s*\(\s*["']([^"']+)["']/g;
const ids = new Set();
let match;
while ((match = idRegex.exec(content)) !== null) {
  ids.add(match[1]);
}

console.log(`📊 Ընդհանուր vocabulary ID-ներ: ${ids.size}`);

const missing = [];
const existing = [];
for (const id of ids) {
  const filePath = path.join(audioDir, `${id}.mp3`);
  if (fs.existsSync(filePath)) {
    existing.push(id);
  } else {
    missing.push(id);
  }
}

console.log(`✅ Առկա MP3: ${existing.length}`);
console.log(`❌ Բացակայող MP3: ${missing.length}`);

// Ցույց տալ առաջին 20 բացակայողը
if (missing.length > 0) {
  console.log('\n📋 Բացակայող ID-ների օրինակներ (առաջին 20):');
  missing.slice(0, 20).forEach(id => console.log(`  - ${id}`));
  
  // Պահպանել ամբողջական ցուցակը ֆայլում
  const outputPath = path.join(__dirname, '../missing-audio-ids.txt');
  fs.writeFileSync(outputPath, missing.join('\n'));
  console.log(`\n📁 Ամբողջական ցուցակը պահված է: ${outputPath}`);
} else {
  console.log('🎉 Բոլոր ID-ներն ունեն MP3 ֆայլեր:');
}