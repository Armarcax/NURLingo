#!/usr/bin/env node
/**
 * NUR Lingo — Armenian Audio Generator
 *
 * Generates MP3 audio files for all Armenian text content using Google Translate TTS.
 * Google Translate TTS supports Armenian (hy) and is free to use.
 *
 * Usage:
 *   node scripts/generate-armenian-audio.js [--dry-run] [--limit N]
 *
 * Options:
 *   --dry-run    Extract texts but don't generate audio
 *   --limit N    Only process first N texts
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ─── Configuration ──────────────────────────────────────────────────────────

const CONFIG = {
  databasePath: path.join(__dirname, '../src/lib/content/database.ts'),
  audioDir: {
    hy: path.join(__dirname, '../public/audio/hy'),
    en: path.join(__dirname, '../public/audio/en'),
    ru: path.join(__dirname, '../public/audio/ru'),
  },
  manifestPath: path.join(__dirname, '../public/audio/manifest.json'),
  maxTextLength: 200,        // Google TTS has limits
  requestDelay: 300,        // ms between requests to avoid rate limiting
  retries: 3,
  retryDelay: 1000,
};

// ─── Parse CLI Args ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1] || args[args.indexOf('--limit') + 1]) : null;

// ─── Ensure directories exist ────────────────────────────────────────────────

Object.values(CONFIG.audioDir).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ─── Text Extraction from database.ts ────────────────────────────────────────

function extractTextsFromDatabase() {
  const content = fs.readFileSync(CONFIG.databasePath, 'utf8');
  const texts = new Map(); // id -> { hy, en, ru }
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

  // Pattern 4: World titles & descriptions (from WORLDS array)
  const worldRegex = /title:\s*\{\s*en:\s*["']([^"']+)["']\s*,\s*hy:\s*["']([^"']+)["']\s*,\s*ru:\s*["']([^"']+)["']\s*\}/g;
  while ((match = worldRegex.exec(content)) !== null) {
    const id = formatId();
    texts.set(id, {
      type: 'world_title',
      en: match[1],
      hy: match[2],
      ru: match[3]
    });
    nextId++;
  }

  const descRegex = /description:\s*\{\s*en:\s*["']([^"']+)["']\s*,\s*hy:\s*["']([^"']+)["']\s*,\s*ru:\s*["']([^"']+)["']\s*\}/g;
  while ((match = descRegex.exec(content)) !== null) {
    const id = formatId();
    texts.set(id, {
      type: 'world_desc',
      en: match[1],
      hy: match[2],
      ru: match[3]
    });
    nextId++;
  }

  // Pattern 5: Lesson titles & concepts
  const lessonTitleRegex = /title:\s*\{\s*(?:["'][^"']*["']\s*,\s*)?en:\s*["']([^"']+)["']\s*,\s*hy:\s*["']([^"']+)["']\s*,\s*ru:\s*["']([^"']+)["']\s*\}/g;
  while ((match = lessonTitleRegex.exec(content)) !== null) {
    const id = formatId();
    texts.set(id, {
      type: 'lesson_title',
      en: match[1],
      hy: match[2],
      ru: match[3]
    });
    nextId++;
  }

  return texts;
}

// ─── Google Translate TTS ────────────────────────────────────────────────────

function generateTTSUrl(text, lang) {
  // Google Translate TTS endpoint
  // lang: 'hy' for Armenian, 'en' for English, 'ru' for Russian
  const encoded = encodeURIComponent(text);
  const client = 'tw-ob';

  // Use Google's TTS API endpoint
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=${client}`;
}

async function downloadTTS(text, lang, outputPath) {
  const url = generateTTSUrl(text, lang);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);

    const request = (url.startsWith('https') ? https : http).get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://translate.google.com/',
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        file.close();
        fs.unlinkSync(outputPath);
        return downloadTTS(text, lang, outputPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outputPath);
        return reject(new Error(`HTTP ${response.statusCode}`));
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(outputPath);
        if (stats.size > 500) {
          resolve(true);
        } else {
          fs.unlinkSync(outputPath);
          reject(new Error('File too small'));
        }
      });
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      reject(err);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// ─── Alternative: gTTS (Python wrapper) or responsivevoice ────────────────────

// Fallback: Use a simpler HTTP approach with a known working endpoint
async function downloadTTSFallback(text, lang, outputPath) {
  // Try responsivevoice or alternative endpoints
  // For now, use a direct approach with gTTS-like behavior

  const encoded = encodeURIComponent(text);

  // Alternative endpoint that works for Armenian
  const urls = [
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`,
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=gt`,
  ];

  for (const url of urls) {
    try {
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);

        https.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'audio/mpeg',
            'Referer': 'https://translate.google.com/',
          }
        }, (res) => {
          if (res.statusCode === 200) {
            res.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          } else {
            file.close();
            fs.unlinkSync(outputPath);
            reject(new Error(`Status ${res.statusCode}`));
          }
        }).on('error', reject);
      });

      const stats = fs.statSync(outputPath);
      if (stats.size > 500) return true;
    } catch (e) {
      // Try next URL
    }
  }

  return false;
}

// ─── Main Generation Function ─────────────────────────────────────────────────

async function generateWithRetry(text, lang, outputPath, retries = CONFIG.retries) {
  for (let i = 0; i < retries; i++) {
    try {
      await downloadTTS(text, lang, outputPath);
      return true;
    } catch (err) {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, CONFIG.retryDelay * (i + 1)));
      }
    }
  }

  // Try fallback
  try {
    return await downloadTTSFallback(text, lang, outputPath);
  } catch (e) {
    return false;
  }
}

// ─── Generate All Audio ──────────────────────────────────────────────────────

async function generateAllAudio(texts) {
  const manifest = {};
  let success = { hy: 0, en: 0, ru: 0 };
  let failed = [];

  const entries = Array.from(texts.entries());
  const toProcess = limit ? entries.slice(0, limit) : entries;

  console.log(`\n📊 Found ${entries.length} unique texts, processing ${toProcess.length}`);

  for (const [id, data] of toProcess) {
    const langs = ['hy', 'en', 'ru'];
    manifest[id] = {};

    for (const lang of langs) {
      const text = data[lang];
      if (!text || text.length === 0) continue;

      const outputPath = path.join(CONFIG.audioDir[lang], `${id}.mp3`);

      // Skip if file exists and is valid
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 500) {
          manifest[id][lang] = `/audio/${lang}/${id}.mp3`;
          success[lang]++;
          continue;
        }
      }

      if (dryRun) {
        manifest[id][lang] = `/audio/${lang}/${id}.mp3`;
        continue;
      }

      // Truncate long texts
      const truncated = text.length > CONFIG.maxTextLength
        ? text.substring(0, CONFIG.maxTextLength) + '...'
        : text;

      const ok = await generateWithRetry(truncated, lang, outputPath);

      if (ok) {
        manifest[id][lang] = `/audio/${lang}/${id}.mp3`;
        success[lang]++;
        console.log(`  ✅ ${id}.${lang}: ${text.substring(0, 30)}...`);
      } else {
        failed.push({ id, lang, text: text.substring(0, 50) });
        console.log(`  ❌ ${id}.${lang}: FAILED`);
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, CONFIG.requestDelay));
    }

    // Progress indicator
    const processed = toProcess.indexOf([id, data]) + 1;
    if (processed % 20 === 0) {
      console.log(`\n🔄 Progress: ${processed}/${toProcess.length}`);
      console.log(`   hy: ${success.hy}, en: ${success.en}, ru: ${success.ru}`);
    }
  }

  return { manifest, success, failed };
}

// ─── Update Manifest ─────────────────────────────────────────────────────────

function updateManifest(manifest) {
  // Load existing manifest if present
  let existing = {};
  if (fs.existsSync(CONFIG.manifestPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(CONFIG.manifestPath, 'utf8'));
    } catch (e) {
      existing = {};
    }
  }

  // Merge new entries
  const merged = { ...existing, ...manifest };

  // Sort keys numerically
  const sorted = Object.keys(merged).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return numA - numB;
  }).reduce((obj, key) => {
    obj[key] = merged[key];
    return obj;
  }, {});

  fs.writeFileSync(CONFIG.manifestPath, JSON.stringify(sorted, null, 2));
  console.log(`\n📝 Updated ${CONFIG.manifestPath} (${Object.keys(sorted).length} entries)`);
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

async function main() {
  console.log('🍎 NUR Lingo - Armenian Audio Generator');
  console.log('='.repeat(50));

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No audio will be generated\n');
  }

  // Extract texts
  console.log('\n📖 Extracting texts from database.ts...');
  const texts = extractTextsFromDatabase();
  console.log(`   Found ${texts.size} unique trilingual entries`);

  // Generate audio
  const { manifest, success, failed } = await generateAllAudio(texts);

  // Update manifest
  if (!dryRun) {
    updateManifest(manifest);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Armenian (hy): ${success.hy} generated`);
  console.log(`English (en):  ${success.en} generated`);
  console.log(`Russian (ru):  ${success.ru} generated`);

  if (failed.length > 0) {
    console.log(`\n⚠️  ${failed.length} failures:`);
    failed.slice(0, 10).forEach(f => {
      console.log(`   ${f.id}.${f.lang}: ${f.text}...`);
    });
    if (failed.length > 10) {
      console.log(`   ... and ${failed.length - 10} more`);
    }

    // Write error log
    const errorLog = failed.map(f => `${f.id}.${f.lang}: ${f.text}`).join('\n');
    fs.writeFileSync(path.join(__dirname, '../logs/audio-errors.txt'), errorLog);
    console.log(`\n📝 Error log written to logs/audio-errors.txt`);
  }

  if (dryRun) {
    console.log('\n⚠️  This was a dry run. Remove --dry-run to generate audio files.');
  }
}

main().catch(console.error);
