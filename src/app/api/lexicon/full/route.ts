import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const databasePath = path.join(process.cwd(), "src/lib/content/database.ts");
    const content = fs.readFileSync(databasePath, "utf8");
    const texts: Array<{
      id: string;
      hy: string;
      en: string;
      ru: string;
      type: string;
    }> = [];
    let nextId = 1;

    const formatId = () => String(nextId).padStart(6, "0");

    // Pattern 1: v("id", "hy", "en", "ru") - vocabulary
    const vocabRegex = /v\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
    let match;
    while ((match = vocabRegex.exec(content)) !== null) {
      texts.push({
        id: formatId(),
        type: "vocab",
        hy: match[2],
        en: match[3],
        ru: match[4],
      });
      nextId++;
    }

    // Pattern 2: p("id", "hy", "en", "ru", ...) - phrases
    const phraseRegex = /p\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g;
    while ((match = phraseRegex.exec(content)) !== null) {
      texts.push({
        id: formatId(),
        type: "phrase",
        hy: match[2],
        en: match[3],
        ru: match[4],
      });
      nextId++;
    }

    // Pattern 3: t("speaker", "hy", "en", "ru") - dialogue turns
    const turnRegex = /t\s*\(\s*["'](?:nurik|user)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
    while ((match = turnRegex.exec(content)) !== null) {
      texts.push({
        id: formatId(),
        type: "dialogue",
        hy: match[1],
        en: match[2],
        ru: match[3],
      });
      nextId++;
    }

    return NextResponse.json({
      total: texts.length,
      texts,
    });
  } catch (error) {
    console.error("Error reading database:", error);
    return NextResponse.json(
      { error: "Failed to read content database" },
      { status: 500 }
    );
  }
}
