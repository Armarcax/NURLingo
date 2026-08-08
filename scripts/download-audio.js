// scripts/download-audio.js
const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Ֆայլի ուղիները ──────────────────────────────────────────────
const databasePath = path.join(__dirname, '../src/lib/content/database.ts');
const audioDir = path.join(__dirname, '../public/audio/hy');

// ─── Ստեղծել audio/hy պանակը, եթե չկա ────────────────────────
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// ─── Կարդալ database.ts ֆայլը ──────────────────────────────────
const content = fs.readFileSync(databasePath, 'utf8');

// ─── Regex-ով հանել բոլոր id-ները vocabulary-ից ──────────────
// Փնտրում ենք v("...") կամ v('...') կամ v(`...`) ձևերը
const idRegex = /v\s*\(\s*["']([^"']+)["']\s*,\s*["'][^"']*["']\s*,\s*["'][^"']*["']\s*,\s*["'][^"']*["']\s*\)/g;
const ids = new Set();
let match;
while ((match = idRegex.exec(content)) !== null) {
  ids.add(match[1]); // առաջին խումբը id-ն է
}

console.log(`📊 Գտնվել է ${ids.size} եզակի ID`);

// ─── Ներբեռնել յուրաքանչյուր ֆայլ ─────────────────────────────
const downloadFile = (id) => {
  return new Promise((resolve) => {
    const url = `https://www.lingohut.com/audio/hy/word_${id}.mp3`;
    const filePath = path.join(audioDir, `${id}.mp3`);

    // Եթե ֆայլն արդեն կա, բաց թողնել
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${id}.mp3 արդեն կա`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      // Եթե 404 է, ջնջել դատարկ ֆայլը և շարունակել
      if (response.statusCode === 404) {
        console.log(`⚠️ ${id}.mp3 չկա Lingohut-ում`);
        file.close();
        fs.unlinkSync(filePath);
        resolve();
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Ներբեռնվեց ${id}.mp3`);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`❌ Սխալ ${id}.mp3-ի համար:`, err.message);
      file.close();
      fs.unlinkSync(filePath);
      resolve();
    });
  });
};

// ─── Ներբեռնել բոլորը (մեկը մյուսի հետևից) ─────────────────────
const downloadAll = async () => {
  console.log(`📥 Սկսում ենք ներբեռնումը (${ids.size} ֆայլ)...`);
  let count = 0;
  for (const id of ids) {
    await downloadFile(id);
    count++;
    if (count % 20 === 0) {
      console.log(`📊 Առաջընթաց: ${count}/${ids.size}`);
    }
  }
  console.log(`🎉 Ներբեռնումն ավարտված է: Ֆայլերը պահված են ${audioDir} պանակում`);
};

downloadAll().catch(console.error);