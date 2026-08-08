#!/usr/bin/env node
/**
 * NUR Lingo — Armenian Audio Generator (Edge TTS via npx)
 *
 * Uses edge-tts which supports Armenian via Microsoft Azure TTS.
 * This is a Node.js solution that works in environments with npx.
 *
 * Usage:
 *   node scripts/generate-armenian-tts.js [--dry-run] [--limit N]
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { promisify } = require('util');

const exec = promisify(require('child_process').exec);

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
  batchDelay: 100, // ms between batched edge-tts calls
  batchSize: 10,   // process in batches
};

// ─── Voice Configuration for edge-tts ────────────────────────────────────────

const VOICES = {
  hy: 'hy-AM-SiranushNeural', // Armenian female voice
  en: 'en-US-JennyNeural',    // English female voice
  ru: 'ru-RU-DariyaNeural',   // Russian female voice
};

// ─── Parse CLI Args ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArgIndex = args.indexOf('--limit');
const limit = limitArgIndex !== -1 ? parseInt(args[limitArgIndex + 1]) : null;
const langArg = args.find(a => a.startsWith('--lang='));
const langFilter = langArg ? langArg.split('=')[1] : 'all';

// ─── Ensure directories exist ────────────────────────────────────────────────

Object.values(CONFIG.audioDir).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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

  function formatId() {
    return String(nextId).padStart(6, '0');
  }

  // Pattern 1: v("id", "hy", "en", "ru") - vocabulary items
  const vocabRegex = /v\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
  let match;
  while ((match = vocabRegex.exec(content)) !== null) {
    const id = formatId();
    texts.set(id, {
      type: 'vocab',
      origId: match[1],
      hy: match[2],
      en: match[3],
      ru: match[4]
    });
    nextId++;
  }

  // Pattern 2: p("id", "hy", "en", "ru", ...) - phrase items
  const phraseRegex = /p\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g;
  while ((match = phraseRegex.exec(content)) !== null) {
    const id = formatId();
    texts.set(id, {
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
    const id = formatId();
    texts.set(id, {
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
    const id = formatId();
    texts.set(id, {
      type: 'trilingual',
      en: match[1],
      hy: match[2],
      ru: match[3]
    });
    nextId++;
  }

  return texts;
}

// ─── Generate TTS using edge-tts ─────────────────────────────────────────────

async function generateWithEdgeTTS(text, lang, outputPath) {
  const voice = VOICES[lang];
  if (!voice) {
    throw new Error(`No voice for language ${lang}`);
  }

  // Truncate if needed
  const truncated = text.length > CONFIG.maxTextLength
    ? text.substring(0, CONFIG.maxTextLength - 3) + '...'
    : text;

  // Escape quotes
  const safeText = truncated.replace(/"/g, '\\"').replace(/'/g, "\\'");

  try {
    // Use npx to run edge-tts
    const cmd = `npx edge-tts --text "${safeText}" --voice "${voice}" --write-media "${outputPath}"`;

    await exec(cmd, {
      timeout: 30000,
      cwd: path.join(__dirname, '..'),
    });

    // Verify file
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 500) {
        return true;
      }
      fs.unlinkSync(outputPath);
    }
    return false;
  } catch (err) {
    // Clean up on failure
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch {}
    }
    throw err;
  }
}

// ─── Generate Batch (more efficient) ──────────────────────────────────────────

async function generateBatch(items, lang) {
  // Group texts and generate using batch approach
  const results = new Map();

  for (const [id, text] of items) {
    const outputPath = path.join(CONFIG.audioDir[lang], `${id}.mp3`);

    // Skip existing
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 500) {
        results.set(id, true);
        continue;
      }
    }

    try {
      const ok = await generateWithEdgeTTS(text, lang, outputPath);
      results.set(id, ok);
    } catch (err) {
      results.set(id, false);
    }

    // Small delay between individual generations
    await new Promise(r => setTimeout(r, CONFIG.batchDelay));
  }

  return results;
}

// ─── Main Generation Loop ────────────────────────────────────────────────────

async function generateAllAudio(texts) {
  const manifest = {};
  let stats = { hy: 0, en: 0, ru: 0 };
  let failed = [];

  const entries = Array.from(texts.entries());
  const toProcess = limit ? entries.slice(0, limit) : entries;
  const langsToProcess = langFilter === 'all' ? ['hy', 'en', 'ru'] : [langFilter];

  console.log(`\n📊 Processing ${toProcess.length} texts for languages: ${langsToProcess.join(', ')}`);

  for (let i = 0; i < toProcess.length; i++) {
    const [id, data] = toProcess[i];
    manifest[id] = {};

    for (const lang of langsToProcess) {
      const text = data[lang];
      if (!text) continue;

      const outputPath = path.join(CONFIG.audioDir[lang], `${id}.mp3`);

      // Skip if exists and valid
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 500) {
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
        const ok = await generateWithEdgeTTS(text, lang, outputPath);
        if (ok) {
          manifest[id][lang] = `/audio/${lang}/${id}.mp3`;
          stats[lang]++;
          console.log(`  ✅ ${id}.${lang}: ${text.substring(0, 35)}...`);
        } else {
          failed.push({ id, lang, text: text.substring(0, 50) });
          console.log(`  ❌ ${id}.${lang}: Empty output`);
        }
      } catch (err) {
        failed.push({ id, lang, text: text.substring(0, 50), error: err.message });
        console.log(`  ❌ ${id}.${lang}: ${err.message.substring(0, 50)}`);
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, CONFIG.batchDelay));
    }

    // Progress
    if ((i + 1) % 20 === 0) {
      console.log(`\n🔄 Progress: ${i + 1}/${toProcess.length}`);
      console.log(`   hy: ${stats.hy}, en: ${stats.en}, ru: ${stats.ru}\n`);
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

// ─── Main Entry Point ────────────────────────────────────────────────────────

async function main() {
  console.log('\n🍎 NUR Lingo - Armenian Audio Generator (edge-tts)');
  console.log('='.repeat(50));

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No audio will be generated\n');
  }

  // Check edge-tts availability
  try {
    console.log('🔍 Checking edge-tts availability...');
    await exec('npx edge-tts --version', { timeout: 10000 });
    console.log('   edge-tts is available\n');
  } catch (e) {
    console.log('   edge-tts will be installed on first use\n');
  }

  // Extract texts
  console.log('📖 Extracting texts from database.ts...');
  const texts = extractTextsFromDatabase();
  console.log(`   Found ${texts.size} unique entries\n`);

  // Generate audio
  const { manifest, stats, failed } = await generateAllAudio(texts);

  // Update manifest
  if (!dryRun) {
    updateManifest(manifest);
    console.log(`\n📝 Updated manifest (${Object.keys(manifest).length} entries)`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Armenian (hy): ${stats.hy} generated`);
  console.log(`English (en):  ${stats.en} generated`);
  console.log(`Russian (ru):  ${stats.ru} generated`);

  if (failed.length > 0) {
    console.log(`\n⚠️  ${failed.length} failures:`);
    failed.slice(0, 10).forEach(f => {
      console.log(`   ${f.id}.${f.lang}: ${f.text}...`);
    });
    if (failed.length > 10) {
      console.log(`   ... and ${failed.length - 10} more`);
    }

    // Write error log
    const errorLog = failed.map(f => `${f.id}.${f.lang}: ${f.text} (${f.error || 'unknown'})`).join('\n');
    fs.writeFileSync(path.join(__dirname, '../logs/audio-errors.txt'), errorLog);
  }

  if (dryRun) {
    console.log('\n⚠️  This was a dry run. Remove --dry-run to generate audio files.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
