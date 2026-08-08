// scripts/generate-missing-audio.js
const fs = require('fs');
const path = require('path');
const https = require('https');

const databasePath = path.join(__dirname, '../src/lib/content/database.ts');
const audioDir = path.join(__dirname, '../public/audio/hy');

// Ստեղծել պանակը, եթե չկա
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Կարդալ database.ts
const content = fs.readFileSync(databasePath, 'utf8');

// Հանել բոլոր vocabulary item-ները (id, hy)
const vocabRegex = /v\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["'][^"']*["']\s*,\s*["'][^"']*["']\s*\)/g;
const items = [];
let match;
while ((match = vocabRegex.exec(content)) !== null) {
  items.push({ id: match[1], hy: match[2] });
}

console.log(`📊 Գտնվել է ${items.length} բառ`);

// Ստուգել, թե որ ID-ների համար է պետք ֆայլ (բացակայում է կամ վնասված է)
const needsDownload = items.filter(item => {
  const filePath = path.join(audioDir, `${item.id}.mp3`);
  
  // Եթե ֆայլը գոյություն չունի, ներբեռնել
  if (!fs.existsSync(filePath)) return true;
  
  // Եթե ֆայլը փոքր է 1KB-ից, հավանաբար վնասված է
  const stats = fs.statSync(filePath);
  if (stats.size < 1000) return true;
  
  // Եթե ֆայլը HTML է, վնասված է
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

// ─── Ներբեռնել Google Translate TTS-ից ──────────────────────────
const downloadFromGoogleTTS = (text, id) => {
  return new Promise((resolve) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hy&client=tw-ob&q=${encodeURIComponent(text)}`;
    const filePath = path.join(audioDir, `${id}.mp3`);
    
    // Եթե ֆայլն արդեն կա, բաց թողնել (վերևում արդեն ստուգել ենք, բայց կրկնության համար)
    if (fs.existsSync(filePath)) {
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    const request = https.get(url, (response) => {
      // Եթե ստատուսը 200 չէ, ապա սխալ է
      if (response.statusCode !== 200) {
        console.log(`⚠️ ${id} (${text}) – սխալ ${response.statusCode}`);
        file.close();
        fs.unlinkSync(filePath);
        resolve();
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        // Ստուգել ներբեռնված ֆայլը
        const stats = fs.statSync(filePath);
        if (stats.size < 1000) {
          console.log(`⚠️ ${id} (${text}) – չափը շատ փոքր է, ջնջվում է`);
          fs.unlinkSync(filePath);
          resolve();
          return;
        }
        console.log(`✅ ${id} (${text}) – ներբեռնված`);
        resolve();
      });
    });
    
    request.on('error', (err) => {
      console.error(`❌ ${id} – սխալ:`, err.message);
      file.close();
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      resolve();
    });
    
    // Timeout 10 վայրկյան
    request.setTimeout(10000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      console.log(`⏱️ ${id} – timeout`);
      resolve();
    });
  });
};

// ─── Ներբեռնել բոլորը (մեկը մյուսի հետևից, դանդաղ) ────────────
const downloadAll = async () => {
  console.log(`📥 Սկսում ենք ներբեռնում (${needsDownload.length} ֆայլ)...`);
  console.log('⏳ Խնդրում ենք սպասել, յուրաքանչյուր ֆայլի համար 2-3 վայրկյան...');
  
  let count = 0;
  for (const item of needsDownload) {
    await downloadFromGoogleTTS(item.hy, item.id);
    count++;
    if (count % 10 === 0) {
      console.log(`📊 Առաջընթաց: ${count}/${needsDownload.length}`);
    }
    // Դադար 300ms Google-ի արգելափակումից խուսափելու համար
    await new Promise(r => setTimeout(r, 300));
  }
  
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
    console.log(`🎉 Ներբեռնումն ավարտված է: Բոլոր ${items.length} ֆայլերը լավն են:`);
  } else {
    console.log(`⚠️ Մնացել է ${finalCheck.length} ֆայլ, որոնք չհաջողվեց ներբեռնել:`);
    console.log('📋 Փորձիր գործարկել սկրիպտը կրկին:');
    finalCheck.forEach(item => console.log(`  - ${item.id} (${item.hy})`));
  }
};

downloadAll().catch(console.error);