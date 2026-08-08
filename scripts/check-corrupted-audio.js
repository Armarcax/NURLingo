// scripts/check-corrupted-audio.js
const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '../public/audio/hy');
const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));

const corrupted = [];
for (const file of files) {
  const filePath = path.join(audioDir, file);
  const stats = fs.statSync(filePath);
  
  // Ստուգել ֆայլի չափը (պետք է լինի > 1KB)
  if (stats.size < 1000) {
    corrupted.push({ file, size: stats.size, reason: 'Too small' });
    continue;
  }
  
  // Ստուգել, արդյոք ֆայլը պարունակում է HTML (Google-ի արգելափակում)
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('<!DOCTYPE') || content.includes('<html>')) {
    corrupted.push({ file, size: stats.size, reason: 'HTML instead of MP3' });
  }
}

if (corrupted.length === 0) {
  console.log('✅ Բոլոր աուդիոֆայլերը լավն են:');
} else {
  console.log(`❌ Գտնվել է ${corrupted.length} վնասված ֆայլ:`);
  corrupted.forEach(c => console.log(`  - ${c.file} (${c.size} bytes, ${c.reason})`));
}