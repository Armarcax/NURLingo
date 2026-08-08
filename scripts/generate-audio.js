// scripts/generate-audio.js
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

// ─── Գտնել edge-tts-ի executable-ը ──────────────────────────────
function findEdgeTTS() {
  // 1. Փնտրել node_modules/.bin-ում
  const localPaths = [
    path.join(__dirname, '../node_modules/.bin/edge-tts.cmd'),
    path.join(__dirname, '../node_modules/.bin/edge-tts'),
  ];
  for (const p of localPaths) {
    if (fs.existsSync(p)) {
      console.log(`🔍 edge-tts գտնվել է (local): ${p}`);
      return p;
    }
  }

  // 2. Փնտրել global-ում
  const globalPaths = [
    path.join(process.env.USERPROFILE || '', 'AppData/Roaming/npm/edge-tts.cmd'),
    path.join(process.env.HOME || '', '.local/bin/edge-tts'),
    'edge-tts',
  ];
  for (const p of globalPaths) {
    if (fs.existsSync(p) || p === 'edge-tts') {
      console.log(`🔍 edge-tts գտնվել է (global): ${p}`);
      return p;
    }
  }

  // 3. Fallback՝ npx
  console.log('🔍 edge-tts չի գտնվել, օգտագործում ենք npx...');
  return 'npx edge-tts';
}

const edgeCmd = findEdgeTTS();

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

// ─── Ներբեռնել ──────────────────────────────────────────────────
const generateWithEdgeTTS = async (text, id) => {
  const filePath = path.join(audioDir, `${id}.mp3`);
  const safeText = text.replace(/"/g, '\\"');
  // Եթե edgeCmd-ը npx-ով է, ապա ավելացնում ենք --no-install
  const cmd = edgeCmd.includes('npx') 
    ? `${edgeCmd} --text "${safeText}" --voice "hy-AM-SiranushNeural" --write-media "${filePath}"`
    : `"${edgeCmd}" --text "${safeText}" --voice "hy-AM-SiranushNeural" --write-media "${filePath}"`;
  try {
    await execPromise(cmd);
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
  console.log(`📥 Սկսում ենք ներբեռնում (${needsDownload.length} ֆայլ)...`);
  let successCount = 0;
  let count = 0;
  for (const item of needsDownload) {
    const success = await generateWithEdgeTTS(item.hy, item.id);
    if (success) successCount++;
    count++;
    if (count % 10 === 0) {
      console.log(`📊 Առաջընթաց: ${count}/${needsDownload.length} (${successCount} հաջող)`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`📊 Ընդհանուր հաջող: ${successCount}/${needsDownload.length}`);

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
    console.log(`⚠️ Մնացել է ${finalCheck.length} ֆայլ:`);
    finalCheck.slice(0, 20).forEach(item => console.log(`  - ${item.id} (${item.hy})`));
  }
};

downloadAll().catch(console.error);