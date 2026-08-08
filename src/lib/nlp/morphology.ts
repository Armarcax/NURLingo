/**
 * NUR Lingo — Armenian Morphological Engine
 * Handles Armenian word forms, roots, and grammatical patterns.
 * Unicode block: U+0531–U+058F (Armenian)
 *
 * Architecture: Rule-based stemming + pattern registry + AI fallback
 * Supports Eastern Armenian (standard in Republic of Armenia)
 * Complies with RA Language Law (2011) standard orthography
 */

// ─── Language Detection & Unicode utilities ────────────────────────────────

export const ARMENIAN_UNICODE_RANGE = /[\u0531-\u058F\uFB13-\uFB17]+/g;
export const ARMENIAN_CHAR = /[\u0531-\u058F\uFB13-\uFB17]/;

/**
 * Returns true if the text contains Armenian characters.
 */
export function isArmenian(text: string): boolean {
  return ARMENIAN_CHAR.test(text);
}

/**
 * Returns true if the text consists primarily of Latin characters.
 */
export function isEnglish(text: string): boolean {
  return /^[a-zA-Z\s.,!?;:()[\]"']+$/.test(text);
}

/**
 * Detects the language of the provided text.
 */
export function detectLanguage(text: string): "en" | "hy" | "unknown" {
  if (isArmenian(text)) return "hy";
  if (isEnglish(text)) return "en";
  return "unknown";
}

// ─── Morphological Rule Types ───────────────────────────────────────────────

export interface MorphRule {
  suffix: string;
  baseSuffix?: string; // suffix to replace with
  type: "verb" | "noun" | "adjective" | "adverb";
  feature: string; // e.g. "present_continuous", "past_simple", "plural"
}

export interface LemmatizeResult {
  lemma: string;
  form: string;
  features: string[];
  confidence: number;
}

// ─── Verb Conjugation Patterns (Eastern Armenian) ──────────────────────────
// Based on standard Armenian grammar paradigms

const VERB_SUFFIX_MAP: MorphRule[] = [
  // Present continuous (Անկատար ներկա)
  { suffix: "ում եմ",    baseSuffix: "ել",  type: "verb", feature: "present_continuous_1sg" },
  { suffix: "ում ես",    baseSuffix: "ել",  type: "verb", feature: "present_continuous_2sg" },
  { suffix: "ում է",     baseSuffix: "ել",  type: "verb", feature: "present_continuous_3sg" },
  { suffix: "ում ենք",   baseSuffix: "ել",  type: "verb", feature: "present_continuous_1pl" },
  { suffix: "ում եք",    baseSuffix: "ել",  type: "verb", feature: "present_continuous_2pl" },
  { suffix: "ում են",    baseSuffix: "ել",  type: "verb", feature: "present_continuous_3pl" },
  // -ալ verbs
  { suffix: "ում եմ",    baseSuffix: "ալ",  type: "verb", feature: "present_continuous_1sg" },
  // Past simple (Անկատար անցյալ)
  { suffix: "ացի",       baseSuffix: "ալ",  type: "verb", feature: "past_simple_1sg" },
  { suffix: "ացիր",      baseSuffix: "ալ",  type: "verb", feature: "past_simple_2sg" },
  { suffix: "ացավ",      baseSuffix: "ալ",  type: "verb", feature: "past_simple_3sg" },
  { suffix: "ացինք",     baseSuffix: "ալ",  type: "verb", feature: "past_simple_1pl" },
  { suffix: "ացիք",      baseSuffix: "ալ",  type: "verb", feature: "past_simple_2pl" },
  { suffix: "ացան",      baseSuffix: "ալ",  type: "verb", feature: "past_simple_3pl" },
  // -ել verbs past
  { suffix: "եցի",       baseSuffix: "ել",  type: "verb", feature: "past_simple_1sg" },
  { suffix: "եցիր",      baseSuffix: "ել",  type: "verb", feature: "past_simple_2sg" },
  { suffix: "եց",        baseSuffix: "ել",  type: "verb", feature: "past_simple_3sg" },
  { suffix: "եցինք",     baseSuffix: "ել",  type: "verb", feature: "past_simple_1pl" },
  { suffix: "եցիք",      baseSuffix: "ել",  type: "verb", feature: "past_simple_2pl" },
  { suffix: "եցան",      baseSuffix: "ել",  type: "verb", feature: "past_simple_3pl" },
  // Future (Ապառնի)
  { suffix: "ալու եմ",   baseSuffix: "ալ",  type: "verb", feature: "future_1sg" },
  { suffix: "ելու եմ",   baseSuffix: "ել",  type: "verb", feature: "future_1sg" },
  { suffix: "ալու ես",   baseSuffix: "ալ",  type: "verb", feature: "future_2sg" },
  { suffix: "ելու ես",   baseSuffix: "ել",  type: "verb", feature: "future_2sg" },
  { suffix: "ալու է",    baseSuffix: "ալ",  type: "verb", feature: "future_3sg" },
  { suffix: "ելու է",    baseSuffix: "ել",  type: "verb", feature: "future_3sg" },
  // Subjunctive future with կ
  { suffix: "կգնամ",     baseSuffix: "գնալ", type: "verb", feature: "future_subjunctive_1sg" },
  // Imperative
  { suffix: "ացիր",      baseSuffix: "ալ",  type: "verb", feature: "imperative_2sg" },
  // Participle
  { suffix: "ած",        baseSuffix: "ալ",  type: "verb", feature: "past_participle" },
  { suffix: "ած",        baseSuffix: "ել",  type: "verb", feature: "past_participle" },
  { suffix: "ելիս",      baseSuffix: "ել",  type: "verb", feature: "present_participle" },
  { suffix: "ալիս",      baseSuffix: "ալ",  type: "verb", feature: "present_participle" },
];

// ─── Noun Case Patterns (Eastern Armenian) ──────────────────────────────────

const NOUN_SUFFIX_MAP: MorphRule[] = [
  // Genitive (Սեռական)
  { suffix: "ի",    type: "noun", feature: "genitive" },
  { suffix: "ու",   type: "noun", feature: "genitive" },
  // Dative (Տրական)
  { suffix: "ին",   type: "noun", feature: "dative" },
  { suffix: "ուն",  type: "noun", feature: "dative" },
  // Ablative (Բացառական)
  { suffix: "ից",   type: "noun", feature: "ablative" },
  { suffix: "ուց",  type: "noun", feature: "ablative" },
  // Instrumental (Գործիական)
  { suffix: "ով",   type: "noun", feature: "instrumental" },
  { suffix: "ուն",  type: "noun", feature: "instrumental" },
  // Locative (Ներգոյական)
  { suffix: "ում",  type: "noun", feature: "locative" },
  // Plural
  { suffix: "ներ",  type: "noun", feature: "plural_nominative" },
  { suffix: "եր",   type: "noun", feature: "plural_nominative" },
];

// ─── Known irregular verb forms ─────────────────────────────────────────────

interface IrregularForm {
  form: string;
  lemma: string;
  features: string[];
}

const IRREGULAR_FORMS: IrregularForm[] = [
  // գնալ (to go)
  { form: "գնում եմ",     lemma: "գնալ", features: ["present_continuous", "1sg"] },
  { form: "գնում ես",     lemma: "գնալ", features: ["present_continuous", "2sg"] },
  { form: "գնում է",      lemma: "գնալ", features: ["present_continuous", "3sg"] },
  { form: "գնում ենք",    lemma: "գնալ", features: ["present_continuous", "1pl"] },
  { form: "գնացի",        lemma: "գնալ", features: ["past_simple", "1sg"] },
  { form: "գնացիր",       lemma: "գնալ", features: ["past_simple", "2sg"] },
  { form: "գնաց",         lemma: "գնալ", features: ["past_simple", "3sg"] },
  { form: "գնացինք",      lemma: "գնալ", features: ["past_simple", "1pl"] },
  { form: "գնալու եմ",    lemma: "գնալ", features: ["future", "1sg"] },
  { form: "կգնամ",        lemma: "գնալ", features: ["future_subjunctive", "1sg"] },
  { form: "կգնաս",        lemma: "գնալ", features: ["future_subjunctive", "2sg"] },
  { form: "կգնա",         lemma: "գնալ", features: ["future_subjunctive", "3sg"] },
  // լինել (to be)
  { form: "եմ",           lemma: "լինել", features: ["present", "1sg", "copula"] },
  { form: "ես",           lemma: "լինել", features: ["present", "2sg", "copula"] },
  { form: "է",            lemma: "լինել", features: ["present", "3sg", "copula"] },
  { form: "ենք",          lemma: "լինել", features: ["present", "1pl", "copula"] },
  { form: "եք",           lemma: "լինել", features: ["present", "2pl", "copula"] },
  { form: "են",           lemma: "լինել", features: ["present", "3pl", "copula"] },
  { form: "էի",           lemma: "լինել", features: ["past_imperfect", "1sg", "copula"] },
  { form: "էր",           lemma: "լինել", features: ["past_imperfect", "3sg", "copula"] },
  { form: "եղա",          lemma: "լինել", features: ["past_simple", "1sg"] },
  { form: "եղավ",         lemma: "լինել", features: ["past_simple", "3sg"] },
  // ունենալ (to have)
  { form: "ունեմ",        lemma: "ունենալ", features: ["present", "1sg"] },
  { form: "ունես",        lemma: "ունենալ", features: ["present", "2sg"] },
  { form: "ունի",         lemma: "ունենալ", features: ["present", "3sg"] },
  { form: "ունենք",       lemma: "ունենալ", features: ["present", "1pl"] },
  // ուտել (to eat)
  { form: "ուտում եմ",    lemma: "ուտել", features: ["present_continuous", "1sg"] },
  { form: "կերա",         lemma: "ուտել", features: ["past_simple", "1sg"] },
  // խոսել (to speak)
  { form: "խոսում եմ",    lemma: "խոսել", features: ["present_continuous", "1sg"] },
  { form: "խոսեցի",       lemma: "խոսել", features: ["past_simple", "1sg"] },
  // սիրել (to love)
  { form: "սիրում եմ",    lemma: "սիրել", features: ["present_continuous", "1sg"] },
  { form: "սիրեցի",       lemma: "սիրել", features: ["past_simple", "1sg"] },
  // կարդալ (to read)
  { form: "կարդում եմ",   lemma: "կարդալ", features: ["present_continuous", "1sg"] },
  { form: "կարդացի",      lemma: "կարդալ", features: ["past_simple", "1sg"] },
  // գրել (to write)
  { form: "գրում եմ",     lemma: "գրել", features: ["present_continuous", "1sg"] },
  { form: "գրեցի",        lemma: "գրել", features: ["past_simple", "1sg"] },
];

// Build lookup map for O(1) access
const IRREGULAR_MAP = new Map<string, IrregularForm>(
  IRREGULAR_FORMS.map((f) => [f.form, f])
);

// ─── Stemmer ────────────────────────────────────────────────────────────────

/**
 * Apply suffix stripping to get a candidate stem.
 * Returns the stem + matched rule if found.
 */
export function stripVerbSuffix(
  word: string
): { stem: string; rule: MorphRule } | null {
  // Sort by suffix length descending to match longest first
  const sorted = [...VERB_SUFFIX_MAP].sort(
    (a, b) => b.suffix.length - a.suffix.length
  );
  for (const rule of sorted) {
    if (word.endsWith(rule.suffix)) {
      const stem = word.slice(0, word.length - rule.suffix.length);
      return { stem, rule };
    }
  }
  return null;
}

/**
 * Attempt to lemmatize an Armenian word/phrase.
 * Returns canonical infinitive form + morphological features.
 */
export function lemmatize(wordOrPhrase: string): LemmatizeResult {
  const normalized = wordOrPhrase.trim().toLowerCase();

  // 1. Check irregular forms first (highest priority)
  const irregular = IRREGULAR_MAP.get(normalized);
  if (irregular) {
    return {
      lemma: irregular.lemma,
      form: normalized,
      features: irregular.features,
      confidence: 1.0,
    };
  }

  // 2. Try verb suffix stripping
  const verbResult = stripVerbSuffix(normalized);
  if (verbResult) {
    const lemma = verbResult.stem + (verbResult.rule.baseSuffix || "");
    return {
      lemma,
      form: normalized,
      features: [verbResult.rule.feature],
      confidence: 0.8,
    };
  }

  // 3. Try noun case stripping
  for (const rule of NOUN_SUFFIX_MAP) {
    if (normalized.endsWith(rule.suffix) && normalized.length > rule.suffix.length + 1) {
      const stem = normalized.slice(0, normalized.length - rule.suffix.length);
      return {
        lemma: stem,
        form: normalized,
        features: [rule.feature],
        confidence: 0.7,
      };
    }
  }

  // 4. Return as-is with low confidence
  return {
    lemma: normalized,
    form: normalized,
    features: ["unknown"],
    confidence: 0.3,
  };
}

/**
 * Lemmatize all tokens in a sentence and return unique lemma set.
 */
export function lemmatizeSentence(sentence: string): Set<string> {
  const tokens = tokenizeText(sentence);
  const lemmas = new Set<string>();
  for (const token of tokens) {
    const result = lemmatize(token);
    lemmas.add(result.lemma);
  }
  return lemmas;
}

// ─── Tokenization & Normalization ──────────────────────────────────────────

const ARMENIAN_PUNCTUATION = /[։՝՞՛«»]/g;

/**
 * Generic tokenizer that handles Armenian and English properly.
 */
export function tokenizeText(text: string): string[] {
  return text
    .replace(ARMENIAN_PUNCTUATION, " ")
    .replace(/[.,!?;:()[\]"']/g, " ")
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && (isArmenian(t) || /^[a-zA-Z]+$/.test(t)));
}

/**
 * Generic normalizer that handles both Armenian and English.
 */
export function normalizeText(text: string): string {
  return text
    .replace(ARMENIAN_PUNCTUATION, "")
    .replace(/[.,!?;:()[\]"']/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * @deprecated Use tokenizeText instead.
 */
export function tokenizeArmenian(text: string): string[] {
  return tokenizeText(text);
}

/**
 * @deprecated Use normalizeText instead.
 */
export function normalizeArmenian(text: string): string {
  return normalizeText(text);
}

// ─── Sentence Structure Analysis ────────────────────────────────────────────

export type WordOrder = "SOV" | "SVO" | "OSV" | "OVS" | "VSO" | "VOS" | "unknown";

/**
 * extracts semantic tokens regardless of word order.
 */
export function extractSemanticTokens(sentence: string): {
  tokens: string[];
  lemmas: string[];
  normalized: string;
} {
  const normalized = normalizeText(sentence);
  const tokens = tokenizeText(normalized);
  const lemmas = tokens.map((t) => lemmatize(t).lemma);
  return { tokens, lemmas, normalized };
}

/**
 * Check if two sentences are morphologically equivalent
 * (same lemmas, possibly different word order or inflection).
 */
export function areMorphologicallyEquivalent(
  sentence1: string,
  sentence2: string
): { equivalent: boolean; overlap: number; details: string } {
  const { lemmas: lemmas1 } = extractSemanticTokens(sentence1);
  const { lemmas: lemmas2 } = extractSemanticTokens(sentence2);

  const set1 = new Set(lemmas1.filter((l) => l.length > 1));
  const set2 = new Set(lemmas2.filter((l) => l.length > 1));

  const intersection = Array.from(set1).filter((l) => set2.has(l));
  const union = new Set(Array.from(set1).concat(Array.from(set2)));

  const jaccardSimilarity = union.size > 0 ? intersection.length / union.size : 0;

  return {
    equivalent: jaccardSimilarity >= 0.7,
    overlap: jaccardSimilarity,
    details: `Shared lemmas: [${intersection.join(", ")}] | Jaccard: ${jaccardSimilarity.toFixed(3)}`,
  };
}
