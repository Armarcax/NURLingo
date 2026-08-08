// scripts/generate-audio-module.js
const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../src/lib/content/database.ts');
const audioDir = path.join(__dirname, '../public/audio/hy');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// ─── Կարդալ database.ts ──────────────────────────────────────────
const content = fs.readFileSync(databasePath, 'utf8');
const vocabRegex = /v\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["'][^"']*["']\s*,\s*["'][^"']*["']\s*\)/g;
const items = [];
let match;
while ((match = vocabRegex.exec(content)) !== null) {
  items.push({ id: match[1], hy: match[2] });
}

console.log(`📊 Գտնվել է ${items.length} բառ`);

// ─── Ստուգել, թե որ ID-ների համար է պետք ֆայլ ──────────────
const needsDownload = items.filter(item => {
  const filePath = path.join(audioDir, `${item.id}.mp3`);
  if (!fs.existsSync(filePath)) return true;
  const stats = fs.statSync(filePath);
  if (stats.size < 1000) return true;
  // Ստուգել HTML-ի համար
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('<!DOCTYPE') || content.includes('<html>')) return true;
  return false;
});

console.log(`✅ Արդեն կա լավ ֆայլ: ${items.length - needsDownload.length}`);
console.log(`❌ Պետք է ներբեռնել: ${needsDownload.length}`);

if (needsDownload.length === 0) {
  console.log('🎉 Բոլոր աուդիոֆայլերն արդեն լավն են:');
  process.exit(0);
}

// ─── edge-tts մոդուլի դինամիկ import ──────────────────────────
(async () => {
  const { tts } = await import('edge-tts');
  let successCount = 0;
  let count = 0;
  for (const item of needsDownload) {
    const filePath = path.join(audioDir, `${item.id}.mp3`);
    try {
      // Ստեղծել աուդիո սթրիմ
      const audioStream = tts(item.hy, 'hy-AM-SiranushNeural', {
        rate: 0,
        pitch: 0,
        volume: 0,
      });
      // Գրել ֆայլ
      const writeStream = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        audioStream.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
      // Ստուգել չափը
      const stats = fs.statSync(filePath);
      if (stats.size > 1000) {
        console.log(`✅ ${item.id} (${item.hy}) – ներբեռնված (${stats.size} bytes)`);
        successCount++;
      } else {
        console.log(`⚠️ ${item.id} (${item.hy}) – չափը փոքր է, ջնջվում է`);
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`❌ ${item.id} – edge-tts սխալ:`, err.message);
    }
    count++;
    if (count % 10 === 0) {
      console.log(`📊 Առաջընթաց: ${count}/${needsDownload.length} (${successCount} հաջող)`);
    }
    // Դադար 200ms
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`📊 Ընդհանուր հաջող: ${successCount}/${needsDownload.length}`);
  const finalCheck = items.filter(item => {
    const filePath = path.join(audioDir, `${item.id}.mp3`);
    if (!fs.existsSync(filePath)) return true;
    const stats = fs.statSync(filePath);
    if (stats.size < 1000) return true;
    return false;
  });
  if (finalCheck.length === 0) {
    console.log(`🎉 Բոլոր ${items.length} աուդիոֆայլերը հաջողությամբ ստեղծվել են:`);
  } else {
    console.log(`⚠️ Մնացել է ${finalCheck.length} ֆայլ, որոնք չհաջողվեց ստեղծել:`);
    finalCheck.slice(0, 20).forEach(item => console.log(`  - ${item.id} (${item.hy})`));
  }
})();