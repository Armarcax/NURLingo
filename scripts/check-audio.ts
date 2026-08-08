// scripts/check-audio.ts
import fs from "fs";
import path from "path";
import { CONTENT_LESSONS, type VocabItem } from "../src/lib/content/database";

const AUDIO_ROOT = path.join(__dirname, "../public/audio");
const LANGUAGES = ["hy", "en", "ru"];

interface Report {
  total: number;
  missing: Record<string, string[]>;
  ok: Record<string, number>;
}

function checkAudio(): Report {
  const report: Report = {
    total: 0,
    missing: { hy: [], en: [], ru: [] },
    ok: { hy: 0, en: 0, ru: 0 },
  };

  // Collect all vocabulary items
  const vocabItems: VocabItem[] = [];
  for (const lesson of CONTENT_LESSONS) {
    if (lesson.vocabulary) {
      for (const item of lesson.vocabulary) {
        vocabItems.push(item);
      }
    }
  }

  report.total = vocabItems.length;

  for (const item of vocabItems) {
    // Use audioId if present, otherwise fallback to item.id
    const audioId = item.audioId || item.id;
    const paddedId = audioId.padStart(6, "0");

    for (const lang of LANGUAGES) {
      const filePath = path.join(AUDIO_ROOT, lang, `${paddedId}.mp3`);
      if (fs.existsSync(filePath)) {
        report.ok[lang] = (report.ok[lang] || 0) + 1;
      } else {
        report.missing[lang].push(`${lang}/${paddedId}.mp3`);
      }
    }
  }

  return report;
}

function main() {
  console.log("🔍 Checking audio files...");
  const report = checkAudio();

  console.log(`\n📊 Total vocabulary items: ${report.total}`);
  console.log("\n✅ OK:");
  for (const lang of LANGUAGES) {
    console.log(`  ${lang}: ${report.ok[lang]}`);
  }

  console.log("\n❌ Missing:");
  let hasMissing = false;
  for (const lang of LANGUAGES) {
    if (report.missing[lang].length > 0) {
      hasMissing = true;
      console.log(`  ${lang}: ${report.missing[lang].length} missing`);
      for (const file of report.missing[lang].slice(0, 5)) {
        console.log(`    - ${file}`);
      }
      if (report.missing[lang].length > 5) {
        console.log(`    ... and ${report.missing[lang].length - 5} more`);
      }
    }
  }

  if (!hasMissing) {
    console.log("  ✅ All audio files present!");
  }

  // Save report to file
  const reportPath = path.join(__dirname, "../audio-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Report saved: ${reportPath}`);

  // Exit with 0 (never fail the build)
  process.exit(0);
}

main();