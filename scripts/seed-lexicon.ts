/**
 * NUR Lingo — Database Seed Script
 * Populates lexicon_entries, sentence_patterns, units, and lessons
 * from the in-memory seed data into Supabase.
 *
 * Usage: npx tsx scripts/seed-lexicon.ts
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seedLexicon() {
  console.log("📖 Seeding lexicon entries...");

  const { LEXICON } = await import("../src/lib/lexicon/dictionary");

  const rows = LEXICON.map((entry) => ({
    word:           entry.word,
    english:        entry.english,
    synonyms:       entry.synonyms,
    antonyms:       entry.antonyms ?? [],
    grammar_type:   entry.grammar_type,
    difficulty:     entry.difficulty,
    embedding_group: entry.embedding_group,
    lesson_tags:    entry.lesson_tags,
    related_forms:  entry.related_forms ?? [],
    notes:          entry.notes ?? null,
    frequency_rank: entry.frequency_rank ?? null,
  }));

  const { error, count } = await supabase
    .from("lexicon_entries")
    .upsert(rows, { onConflict: "word", ignoreDuplicates: false })
    .select("id");

  if (error) {
    console.error("❌ Lexicon seed failed:", error.message);
    process.exit(1);
  }
  console.log(`✅ Seeded ${rows.length} lexicon entries`);
}

async function seedSentencePatterns() {
  console.log("📝 Seeding sentence patterns...");

  const { SENTENCE_PATTERNS } = await import("../src/lib/lexicon/dictionary");

  const rows = SENTENCE_PATTERNS.map((p) => ({
    pattern_key:       p.id,
    english_template:  p.english_template,
    armenian_variants: p.armenian_variants,
    grammar_note:      p.grammar_note ?? null,
    difficulty:        p.difficulty,
    lesson_tags:       p.lesson_tags,
    semantic_group:    p.semantic_group,
  }));

  const { error } = await supabase
    .from("sentence_patterns")
    .upsert(rows, { onConflict: "pattern_key" });

  if (error) {
    console.error("❌ Patterns seed failed:", error.message);
    process.exit(1);
  }
  console.log(`✅ Seeded ${rows.length} sentence patterns`);
}

async function seedUnits() {
  console.log("📦 Seeding units...");

  const { UNITS } = await import("../src/lib/lessons/engine");

  const rows = UNITS.map((u, i) => ({
    unit_key:      u.id,
    title:         u.title,
    title_armenian: u.titleArmenian,
    description:   u.description,
    cefr_level:    u.cefr,
    icon_emoji:    u.iconEmoji,
    color_class:   u.colorFrom,
    sort_order:    i,
    is_published:  true,
  }));

  const { error } = await supabase
    .from("units")
    .upsert(rows, { onConflict: "unit_key" });

  if (error) {
    console.error("❌ Units seed failed:", error.message);
    process.exit(1);
  }
  console.log(`✅ Seeded ${rows.length} units`);
}

async function seedExampleSentences() {
  console.log("💬 Seeding example sentences...");

  const { LEXICON } = await import("../src/lib/lexicon/dictionary");

  for (const entry of LEXICON) {
    if (!entry.examples.length) continue;

    // Find lexicon DB id
    const { data: dbEntry } = await supabase
      .from("lexicon_entries")
      .select("id")
      .eq("word", entry.word)
      .single();

    if (!dbEntry) continue;

    const rows = entry.examples.map((ex) => ({
      lexicon_id:          dbEntry.id,
      armenian:            ex.armenian,
      english:             ex.english,
      acceptable_variants: ex.acceptable_variants ?? [],
      level:               ex.level,
    }));

    await supabase.from("example_sentences").upsert(rows);
  }
  console.log("✅ Seeded example sentences");
}

async function main() {
  console.log("\n🇦🇲  NUR Lingo Database Seed\n" + "─".repeat(40));

  await seedUnits();
  await seedLexicon();
  await seedSentencePatterns();
  await seedExampleSentences();

  console.log("\n✅  All seeds complete!\n");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
