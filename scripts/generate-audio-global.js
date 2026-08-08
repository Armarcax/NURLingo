// scripts/generate-audio-global.js
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const databasePath = path.join(__dirname, '../src/lib/content/database.ts');
const audioDir = path.join(__dirname, '../public/audio/hy');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const content = fs.readFileSync(databasePath, 'utf8');

// Հանել բոլոր vocabulary item-ները (id, hy)
const vocabRegex = /v\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["'][^"']*["']\s*,\s*["'][^"']*["']\s*\)/g;
const items = [];
let match;
while ((match = vocabRegex.exec(content)) !== null) {
  items.push({ id: match[1], hy: match[2] });
}

console.log(`📊 Գտնվել է ${items.length} բառ`);

// Ստուգել, թե որ ID-ների համար է պետք ֆայլ
const needsDownload = items.filter(item => {
  const filePath = path.join(audioDir, `${item.id}.mp3`);
  if (!fs.existsSync(filePath)) return true;
  const stats = fs.statSync(filePath);
  if (stats.size < 1000) return true;
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

// ─── edge-tts-ի global executable-ի անունը ──────────────────────
// Windows-ում օգտագործում ենք edge-tts.cmd, Unix-ում՝ edge-tts
const edgeCmd = process.platform === 'win32' ? 'edge-tts.cmd' : 'edge-tts';

const generateWithEdgeTTS = async (text, id) => {
  const filePath = path.join(audioDir, `${id}.mp3`);
  const safeText = text.replace(/"/g, '\\"');
  // —voice "hy-AM-SiranushNeural" (ամենալավ հայերեն ձայնը)
  const command = `"${edgeCmd}" --text "${safeText}" --voice "hy-AM-SiranushNeural" --write-media "${filePath}"`;
  try {
    await execPromise(command);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 1000) {
        console.log(`✅ ${id} (${text}) – ներբեռնված (${stats.size} bytes)`);
        return true;
      } else {
        console.log(`⚠️ ${id} (${text}) – չափը փոքր է, ջնջվում է`);
        fs.unlinkSync(filePath);
        return false;
      }
    }
    return false;
  } catch (err) {
    console.error(`❌ ${id} – edge-tts սխալ:`, err.message);
    return false;
  }
};

const downloadAll = async () => {
  console.log(`📥 Սկսում ենք ներբեռնում (${needsDownload.length} ֆայլ) global edge-tts-ով...`);
  let successCount = 0;
  let count = 0;
  for (const item of needsDownload) {
    const success = await generateWithEdgeTTS(item.hy, item.id);
    if (success) successCount++;
    count++;
    if (count % 10 === 0) {
      console.log(`📊 Առաջընթաց: ${count}/${needsDownload.length} (${successCount} հաջող)`);
    }
    // Դադար 200ms՝ ծանրաբեռնվածությունից խուսափելու համար
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`📊 Ընդհանուր հաջող ներբեռնումներ: ${successCount}/${needsDownload.length}`);

  // Վերջնական ստուգում
  const finalCheck = items.filter(item => {
    const filePath = path.join(audioDir, `${item.id}.mp3`);
    if (!fs.existsSync(filePath)) return true;
    const stats = fs.statSync(filePath);
    if (stats.size < 1000) return true;
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('<!DOCTYPE') || content.includes('<html>')) return true;
    return false;
  });

  if (finalCheck.length === 0) {
    console.log(`🎉 Բոլոր ${items.length} աուդիոֆայլերը հաջողությամբ ստեղծվել են:`);
  } else {
    console.log(`⚠️ Մնացել է ${finalCheck.length} ֆայլ, որոնք չհաջողվեց ստեղծել:`);
    console.log('📋 Փորձիր գործարկել սկրիպտը կրկին:');
    finalCheck.slice(0, 20).forEach(item => console.log(`  - ${item.id} (${item.hy})`));
    if (finalCheck.length > 20) {
      console.log(`  ... և ևս ${finalCheck.length - 20} ֆայլ`);
    }
  }
};

downloadAll().catch(console.error);