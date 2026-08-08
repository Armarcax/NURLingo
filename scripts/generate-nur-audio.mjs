#!/usr/bin/env node
/**
 * NUR Lingo — Armenian Audio Generator
 *
 * Uses edge-tts Node.js module to generate MP3 audio files.
 * This module uses Microsoft Edge's online TTS service which supports Armenian!
 *
 * Usage:
 *   node scripts/generate-nur-audio.mjs [--dry-run] [--limit N] [--lang=hy|en|ru|all]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import edge-tts directly from module path
let ttsSave, getVoices;
try {
  const edgeTtsPath = path.join(__dirname, '../node_modules/edge-tts/out/index.js');
  const edgeTts = await import(`file://${edgeTtsPath}`);
  ttsSave = edgeTts.ttsSave;
  getVoices = edgeTts.getVoices;
} catch (e) {
  console.error('ERROR: edge-tts module not found:', e.message);
  process.exit(1);
}

// ─── Configuration ──────────────────────────────────────────────────────────

const CONFIG = {
  databasePath: path.join(__dirname, '../src/lib/content/database.ts'),
  audioDir: {
    hy: path.join(__dirname, '../public/audio/hy'),
    en: path.join(__dirname, '../public/audio/en'),
    ru: path.join(__dirname, '../public/audio/ru'),
  },
  manifestPath: path.join(__dirname, '../public/audio/manifest.json'),
  maxTextLength: 200,
  requestDelay: 100, // ms between requests
};

// ─── Voice Configuration ────────────────────────────────────────────────────

const VOICES = {
  hy: 'hy-AM-SiranushNeural', // Armenian female voice
  en: 'en-US-JennyNeural',    // English female voice
  ru: 'ru-RU-DariyaNeural',   // Russian female voice
};

// ─── Parse CLI Args ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : null;
const langArg = args.find(a => a.startsWith('--lang='));
const langFilter = langArg ? langArg.split('=')[1] : 'all';

// ─── Ensure directories exist ────────────────────────────────────────────────

for (const dir of Object.values(CONFIG.audioDir)) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Ensure logs directory
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ─── Text Extraction from database.ts ────────────────────────────────────────

function extractTextsFromDatabase() {
  const content = fs.readFileSync(CONFIG.databasePath, 'utf8');
  const texts = new Map();
  let nextId = 1;

  const formatId = () => String(nextId).padStart(6, '0');

  // Pattern 1: v("id", "hy", "en", "ru") - vocabulary
  const vocabRegex = /v\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
  let match;
  while ((match = vocabRegex.exec(content)) !== null) {
    texts.set(formatId(), {
      type: 'vocab',
      origId: match[1],
      hy: match[2],
      en: match[3],
      ru: match[4]
    });
    nextId++;
  }

  // Pattern 2: p("id", "hy", "en", "ru", ...) - phrases
  const phraseRegex = /p\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g;
  while ((match = phraseRegex.exec(content)) !== null) {
    texts.set(formatId(), {
      type: 'phrase',
      origId: match[1],
      hy: match[2],
      en: match[3],
      ru: match[4]
    });
    nextId++;
  }

  // Pattern 3: t("speaker", "hy", "en", "ru") - dialogue turns
  const turnRegex = /t\s*\(\s*["'](?:nurik|user)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
  while ((match = turnRegex.exec(content)) !== null) {
    texts.set(formatId(), {
      type: 'dialogue',
      hy: match[1],
      en: match[2],
      ru: match[3]
    });
    nextId++;
  }

  // Pattern 4: Trilingual objects { en: "...", hy: "...", ru: "..." }
  const trilingualRegex = /\{\s*en:\s*["']([^"']+)["']\s*,\s*hy:\s*["']([^"']+)["']\s*,\s*ru:\s*["']([^"']+)["']\s*\}/g;
  while ((match = trilingualRegex.exec(content)) !== null) {
    texts.set(formatId(), {
      type: 'trilingual',
      en: match[1],
      hy: match[2],
      ru: match[3]
    });
    nextId++;
  }

  return texts;
}

// ─── Generate TTS using edge-tts module ──────────────────────────────────────

async function generateTTS(text, lang, outputPath) {
  const voice = VOICES[lang];
  if (!voice) {
    throw new Error(`No voice configured for language: ${lang}`);
  }

  // Truncate long texts
  const truncated = text.length > CONFIG.maxTextLength
    ? text.substring(0, CONFIG.maxTextLength - 3) + '...'
    : text;

  try {
    await ttsSave(truncated, outputPath, { voice });

    // Verify
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 500) {
        return true;
      }
      fs.unlinkSync(outputPath);
    }
    return false;
  } catch (err) {
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch {}
    }
    throw err;
  }
}

// ─── Main Generation Loop ────────────────────────────────────────────────────

async function generateAllAudio(texts) {
  const manifest = {};
  const stats = { hy: 0, en: 0, ru: 0 };
  const failed = [];

  const entries = Array.from(texts.entries());
  const toProcess = limit ? entries.slice(0, limit) : entries;
  const langsToProcess = langFilter === 'all' ? ['hy', 'en', 'ru'] : [langFilter];

  console.log(`\n📊 Processing ${toProcess.length} texts for: ${langsToProcess.join(', ')}`);

  for (let i = 0; i < toProcess.length; i++) {
    const [id, data] = toProcess[i];
    manifest[id] = {};

    for (const lang of langsToProcess) {
      const text = data[lang];
      if (!text) continue;

      const outputPath = path.join(CONFIG.audioDir[lang], `${id}.mp3`);

      // Skip if valid file exists
      if (fs.existsSync(outputPath)) {
        const fileStats = fs.statSync(outputPath);
        if (fileStats.size > 500) {
          manifest[id][lang] = `/audio/${lang}/${id}.mp3`;
          stats[lang]++;
          continue;
        }
      }

      if (dryRun) {
        manifest[id][lang] = `/audio/${lang}/${id}.mp3`;
        continue;
      }

      try {
        const ok = await generateTTS(text, lang, outputPath);
        if (ok) {
          manifest[id][lang] = `/audio/${lang}/${id}.mp3`;
          stats[lang]++;
          console.log(`✅ ${id}.${lang}: ${text.substring(0, 40)}...`);
        } else {
          failed.push({ id, lang, text: text.substring(0, 50) });
          console.log(`❌ ${id}.${lang}: Empty output`);
        }
      } catch (err) {
        failed.push({ id, lang, text: text.substring(0, 50), error: err.message });
        console.log(`❌ ${id}.${lang}: ${err.message.substring(0, 50)}`);
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, CONFIG.requestDelay));
    }

    // Progress
    if ((i + 1) % 30 === 0) {
      console.log(`\n🔄 ${i + 1}/${toProcess.length} | hy:${stats.hy} en:${stats.en} ru:${stats.ru}\n`);
    }
  }

  return { manifest, stats, failed };
}

// ─── Update Manifest ─────────────────────────────────────────────────────────

function updateManifest(manifest) {
  let existing = {};
  if (fs.existsSync(CONFIG.manifestPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(CONFIG.manifestPath, 'utf8'));
    } catch {}
  }

  const merged = { ...existing, ...manifest };

  const sorted = Object.keys(merged)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .reduce((obj, key) => {
      obj[key] = merged[key];
      return obj;
    }, {});

  fs.writeFileSync(CONFIG.manifestPath, JSON.stringify(sorted, null, 2));
}

// ─── Validate Armenian Voice Available ───────────────────────────────────────

async function validateVoices() {
  console.log('🔍 Validating available voices...');
  try {
    const voices = await getVoices();
    const armenianVoices = voices.filter(v => v.ShortName?.startsWith('hy-') || v.Locale?.startsWith('hy'));

    if (armenianVoices.length > 0) {
      console.log(`   ✅ Found ${armenianVoices.length} Armenian voice(s):`);
      armenianVoices.forEach(v => console.log(`      - ${v.ShortName} (${v.Name})`));
    } else {
      console.log('   ⚠️ No Armenian voices found in list, but will try anyway...');
    }
  } catch (e) {
    console.log('   ⚠️ Could not fetch voice list:', e.message);
  }
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

async function main() {
  console.log('\n🍎 NUR Lingo — Armenian Audio Generator');
  console.log('='.repeat(50));

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE\n');
  }

  // Validate voices
  await validateVoices();
  console.log('');

  // Extract texts
  console.log('📖 Extracting texts from database.ts...');
  const texts = extractTextsFromDatabase();
  console.log(`   Found ${texts.size} unique entries\n`);

  // Generate audio
  const { manifest, stats, failed } = await generateAllAudio(texts);

  // Update manifest
  if (!dryRun) {
    updateManifest(manifest);
    console.log(`\n📝 Manifest updated (${Object.keys(manifest).length} entries)`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Armenian (hy): ${stats.hy}`);
  console.log(`English (en):  ${stats.en}`);
  console.log(`Russian (ru):  ${stats.ru}`);

  if (failed.length > 0) {
    console.log(`\n⚠️  ${failed.length} failures:`);
    failed.slice(0, 10).forEach(f => {
      console.log(`   ${f.id}.${f.lang}: ${f.text}...`);
    });

    // Write error log
    const errorLog = failed.map(f => `${f.id}.${f.lang}: ${f.text}`).join('\n');
    fs.writeFileSync(path.join(__dirname, '../logs/audio-errors.txt'), errorLog);
    console.log('\n📝 Error log: logs/audio-errors.txt');
  }

  if (dryRun) {
    console.log('\n⚠️ DRY RUN — Remove --dry-run to generate files');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
