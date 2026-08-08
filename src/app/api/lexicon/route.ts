/**
 * NUR Lingo — /api/lexicon
 * GET: Look up Armenian or English words, get morphology, synonyms, patterns
 * POST: Add a new entry (admin)
 */
import { NextRequest, NextResponse } from "next/server";
import {
  lookupArmenian,
  lookupEnglish,
  lookupByCategory,
  lookupSentencePattern,
  getAllValidArmenianForms,
  LEXICON,
  SENTENCE_PATTERNS,
  type SemanticCategory,
} from "@/lib/lexicon/dictionary";
import { lemmatize, tokenizeArmenian } from "@/lib/nlp/morphology";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const word    = searchParams.get("word");        // Armenian word
  const english = searchParams.get("english");     // English word
  const pattern = searchParams.get("pattern");     // Sentence pattern lookup
  const forms   = searchParams.get("forms");       // Get valid forms for English sentence
  const lemma   = searchParams.get("lemma");       // Lemmatize Armenian word
  const tokens  = searchParams.get("tokens");      // Tokenize Armenian text
  const cat     = searchParams.get("category");    // By semantic category
  const type    = searchParams.get("type");        // type=patterns
  const page    = parseInt(searchParams.get("page") ?? "1", 10);
  const limit   = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

  // ── Patterns (type=patterns) ───────────────────────────────────────────
  if (type === "patterns") {
    return NextResponse.json({
      total: SENTENCE_PATTERNS.length,
      patterns: SENTENCE_PATTERNS,
    });
  }

  // ── Lemmatize ──────────────────────────────────────────────────────────
  if (lemma) {
    const result = lemmatize(lemma);
    return NextResponse.json({ input: lemma, ...result });
  }

  // ── Tokenize ───────────────────────────────────────────────────────────
  if (tokens) {
    const tok = tokenizeArmenian(tokens);
    const lemmatized = tok.map((t) => ({ token: t, ...lemmatize(t) }));
    return NextResponse.json({ input: tokens, tokens: lemmatized, count: tok.length });
  }

  // ── Sentence valid forms ───────────────────────────────────────────────
  if (forms) {
    const validForms = getAllValidArmenianForms(forms);
    return NextResponse.json({
      english: forms,
      validArmenianForms: validForms,
      count: validForms.length,
    });
  }

  // ── Sentence pattern ───────────────────────────────────────────────────
  if (pattern) {
    const p = lookupSentencePattern(pattern);
    if (!p) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
    }
    return NextResponse.json(p);
  }

  // ── Armenian word lookup ───────────────────────────────────────────────
  if (word) {
    const entry = lookupArmenian(word);
    if (!entry) {
      // Try lemmatizing first
      const lem = lemmatize(word);
      if (lem.lemma !== word) {
        const baseEntry = lookupArmenian(lem.lemma);
        if (baseEntry) {
          return NextResponse.json({
            ...baseEntry,
            queryWord: word,
            morphology: lem,
            note: "Found via lemmatization",
          });
        }
      }
      return NextResponse.json(
        { error: `Word not found: ${word}`, lemma: lem },
        { status: 404 }
      );
    }
    return NextResponse.json(entry);
  }

  // ── English word lookup ────────────────────────────────────────────────
  if (english) {
    const entries = lookupEnglish(english);
    if (!entries.length) {
      return NextResponse.json({ error: `No entries for: ${english}` }, { status: 404 });
    }
    return NextResponse.json({ results: entries, count: entries.length });
  }

  // ── By semantic category ───────────────────────────────────────────────
  if (cat) {
    const entries = lookupByCategory(cat as SemanticCategory);
    return NextResponse.json({ category: cat, results: entries, count: entries.length });
  }

  // ── Full lexicon (paginated) ───────────────────────────────────────────
  const offset = (page - 1) * limit;
  const slice  = LEXICON.slice(offset, offset + limit);
  return NextResponse.json({
    total: LEXICON.length,
    page,
    limit,
    totalPages: Math.ceil(LEXICON.length / limit),
    results: slice,
  });
}
