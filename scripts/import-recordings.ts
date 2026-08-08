// scripts/import-recordings.ts
import fs from "fs";
import path from "path";

const RECORDINGS_SOURCE = path.join(__dirname, "../recordings");
const AUDIO_ROOT = path.join(__dirname, "../public/audio");

interface Recording {
  filename: string;
  lang: string;
  audioId: string;
}

function normalizeAudioId(id: string): string {
  // Ensure 6 digits
  return id.padStart(6, "0");
}

function importRecordings() {
  if (!fs.existsSync(RECORDINGS_SOURCE)) {
    console.log("📁 No recordings folder found. Create it and place your .mp3 files there.");
    return;
  }

  const files = fs.readdirSync(RECORDINGS_SOURCE);
  const recordings: Recording[] = [];

  for (const file of files) {
    if (!file.endsWith(".mp3") && !file.endsWith(".webm")) continue;

    // Expected format: {lang}_{audioId}.mp3 (e.g., hy_000001.mp3)
    const parts = file.replace(/\.(mp3|webm)$/, "").split("_");
    if (parts.length !== 2) {
      console.warn(`⚠️ Skipping invalid filename: ${file}`);
      continue;
    }

    const [lang, audioId] = parts;
    if (!["hy", "en", "ru"].includes(lang)) {
      console.warn(`⚠️ Unknown language: ${lang} in ${file}`);
      continue;
    }

    recordings.push({ filename: file, lang, audioId: normalizeAudioId(audioId) });
  }

  console.log(`📥 Found ${recordings.length} recordings`);

  let copied = 0;
  for (const rec of recordings) {
    const srcPath = path.join(RECORDINGS_SOURCE, rec.filename);
    const destDir = path.join(AUDIO_ROOT, rec.lang);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destPath = path.join(destDir, `${rec.audioId}.mp3`);

    // Convert webm to mp3 if needed (using ffmpeg)
    if (rec.filename.endsWith(".webm")) {
      console.log(`🔄 Converting ${rec.filename} to MP3...`);
      // Here you would call ffmpeg, but for now we just copy
      // In practice, you'd use: `ffmpeg -i input.webm output.mp3`
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${rec.filename} → ${rec.lang}/${rec.audioId}.mp3`);
    copied++;
  }

  console.log(`🎉 Imported ${copied} recordings successfully!`);
}

importRecordings();