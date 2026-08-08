/**
 * NUR Lingo — Lesson Engine v2
 * HAYQ token system replaces XP throughout.
 * HAYQ = Հայկական Ակտիվ Յուրացման Քանակ (Armenian Active Learning Quantity)
 */

import { LEXICON, SENTENCE_PATTERNS, LexiconEntry } from "../lexicon/dictionary";

export type ExerciseType =
  | "translation_en_to_hy"
  | "translation_hy_to_en"
  | "multiple_choice"
  | "fill_in_blank"
  | "word_order"
  | "matching_pairs"
  | "error_correction";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  promptArmenian?: string;
  targetAnswer: string;
  acceptableAnswers: string[];
  hint?: string;
  explanation?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  cefr: CEFRLevel;
  hayqReward: number;        // ← HAYQ instead of XP
  timeLimit?: number;
  options?: string[];
  words?: string[];
  lessonId: string;
  unitId: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  titleArmenian: string;
  description: string;
  cefr: CEFRLevel;
  difficulty: 1 | 2 | 3 | 4 | 5;
  exercises: Exercise[];
  prerequisiteLessons: string[];
  hayqTotal: number;         // ← HAYQ
  estimatedMinutes: number;
  grammarFocus: string[];
  vocabularyFocus: string[];
}

export interface Unit {
  id: string;
  title: string;
  titleArmenian: string;
  description: string;
  cefr: CEFRLevel;
  lessons: string[];
  iconEmoji: string;
  colorFrom: string;
  colorTo: string;
}

// ─── HAYQ Reward Table ───────────────────────────────────────────────────────

export const HAYQ_REWARDS = {
  PERFECT:         25,   // score >= 0.98
  EXCELLENT:       20,   // score >= 0.85
  GOOD:            15,   // score >= 0.75
  PARTIAL:          5,   // score >= 0.5
  STREAK_3:        10,
  STREAK_7:        30,
  STREAK_30:      100,
  LESSON_COMPLETE: 40,
  UNIT_COMPLETE:  200,
  FIRST_LESSON:    50,
};

export const SEED_REWARDS = {
  PERFECT_EXERCISE: 1,    // score >= 0.98
  PERFECT_LESSON:   1,    // No hearts lost
  STREAK_7:         1,
  UNIT_COMPLETE:    5,
};

// ─── HAYQ Level System ────────────────────────────────────────────────────────

export interface HAYQLevel {
  level: number;
  title: Record<string, string>;
  titleArmenian: string;
  nextLevelHAYQ: number;
  color: string;
}

export function hayqToLevel(hayq: number): HAYQLevel {
  const levels: HAYQLevel[] = [
    { level:1, title:{en:"Beginner", hy:"Սկսնակ", ru:"Новичок"},    titleArmenian:"Սկսնակ",      nextLevelHAYQ:150,  color:"#9ca3af" },
    { level:2, title:{en:"Student", hy:"Ուսանող", ru:"Ученик"},     titleArmenian:"Ուսանող",     nextLevelHAYQ:400,  color:"#60a5fa" },
    { level:3, title:{en:"Learner", hy:"Ճանաչող", ru:"Учащийся"},     titleArmenian:"Ճանաչող",     nextLevelHAYQ:800,  color:"#34d399" },
    { level:4, title:{en:"Speaker", hy:"Խոսող", ru:"Говорящий"},       titleArmenian:"Խոսող",       nextLevelHAYQ:1500, color:"#F2A800" },
    { level:5, title:{en:"Proficient", hy:"Հմուտ", ru:"Опытный"},  titleArmenian:"Հմուտ",       nextLevelHAYQ:2500, color:"#D90012" },
    { level:6, title:{en:"Fluent", hy:"Ճկուն", ru:"Беглый"},       titleArmenian:"Ճկուն",       nextLevelHAYQ:4000, color:"#a855f7" },
    { level:7, title:{en:"Master", hy:"Վարպետ", ru:"Мастер"},      titleArmenian:"Վարպետ",      nextLevelHAYQ:Infinity, color:"#F2A800" },
  ];
  for (let i = levels.length - 1; i >= 0; i--) {
    const threshold = i === 0 ? 0 : [0,150,400,800,1500,2500,4000][i];
    if (hayq >= threshold) return levels[i];
  }
  return levels[0];
}

// ─── Units ────────────────────────────────────────────────────────────────────

export const UNITS: Unit[] = [
  {
    id: "unit_greetings",
    title: "Greetings & Basics",
    titleArmenian: "Ողջույններ և Հիմունքներ",
    description: "Ծանոթացիր, ողջունիր և ներկայացիր",
    cefr: "A1",
    lessons: ["lesson_1", "lesson_1b"],
    iconEmoji: "👋",
    colorFrom: "#D90012",
    colorTo: "#8b0000",
  },
  {
    id: "unit_home",
    title: "Home & Movement",
    titleArmenian: "Տուն և Շարժում",
    description: "Նկարագրիր տունդ, խոսիր գնալ-գալու մասին",
    cefr: "A1",
    lessons: ["lesson_2", "lesson_2b"],
    iconEmoji: "🏠",
    colorFrom: "#0033A0",
    colorTo: "#001a6b",
  },
  {
    id: "unit_food",
    title: "Food & Drink",
    titleArmenian: "Ուտելիք և Ըմպելիք",
    description: "Հայկական խոհանոց, ուտել-խմելու բառապաշար",
    cefr: "A1",
    lessons: ["lesson_3", "lesson_3b"],
    iconEmoji: "🍽️",
    colorFrom: "#F2A800",
    colorTo: "#b07800",
  },
  {
    id: "unit_family",
    title: "Family",
    titleArmenian: "Ընտանիք",
    description: "Ընտանիքի անդամներ, հարաբերություններ",
    cefr: "A1",
    lessons: ["lesson_4", "lesson_4b"],
    iconEmoji: "👨‍👩‍👧",
    colorFrom: "#D90012",
    colorTo: "#0033A0",
  },
  {
    id: "unit_education",
    title: "Education",
    titleArmenian: "Կրթություն",
    description: "Դպրոց, գիրք, ուսուցիչ, ուսանող",
    cefr: "A2",
    lessons: ["lesson_5", "lesson_5b"],
    iconEmoji: "📚",
    colorFrom: "#0033A0",
    colorTo: "#F2A800",
  },
];

// ─── Exercise generators ──────────────────────────────────────────────────────

export function generateTranslationExercise(
  patternId: string, lessonId: string, unitId: string
): Exercise | null {
  const pattern = SENTENCE_PATTERNS.find(p => p.id === patternId);
  if (!pattern) return null;
  return {
    id: `ex_${patternId}_tr`,
    type: "translation_en_to_hy",
    prompt: `Translate to Armenian: "${pattern.english_template}"`,
    promptArmenian: `Թարգմանիր հայերեն՝ "${pattern.english_template}"`,
    targetAnswer: pattern.armenian_variants[0],
    acceptableAnswers: pattern.armenian_variants,
    hint: pattern.grammar_note,
    explanation: pattern.grammar_note
      ? `📝 ${pattern.grammar_note}` : undefined,
    difficulty: pattern.difficulty as 1|2|3|4|5,
    cefr: diffToCEFR(pattern.difficulty),
    hayqReward: pattern.difficulty * 6,
    lessonId, unitId,
  };
}

export function generateMCExercise(
  entry: LexiconEntry, lessonId: string, unitId: string,
  distractors: LexiconEntry[]
): Exercise {
  const correct = entry.english[0];
  const wrong = distractors.filter(d => d.id !== entry.id).map(d => d.english[0]).slice(0,3);
  const options = shuffle([correct, ...wrong]);
  return {
    id: `ex_${entry.id}_mc`,
    type: "multiple_choice",
    prompt: `What does "${entry.word}" mean?`,
    promptArmenian: `Ի՞նչ է նշանակում "${entry.word}"-ը`,
    targetAnswer: correct,
    acceptableAnswers: entry.english,
    options,
    difficulty: entry.difficulty,
    cefr: diffToCEFR(entry.difficulty),
    hayqReward: entry.difficulty * 3,
    lessonId, unitId,
  };
}

export function generateWordOrderExercise(
  patternId: string, lessonId: string, unitId: string
): Exercise | null {
  const pattern = SENTENCE_PATTERNS.find(p => p.id === patternId);
  if (!pattern) return null;
  const canonical = pattern.armenian_variants[0];
  const words = shuffle(canonical.split(" "));
  return {
    id: `ex_${patternId}_wo`,
    type: "word_order",
    prompt: `Arrange: "${pattern.english_template}"`,
    promptArmenian: `Դասավորիր բառերը՝ "${pattern.english_template}"`,
    targetAnswer: canonical,
    acceptableAnswers: pattern.armenian_variants,
    words,
    explanation: pattern.grammar_note,
    difficulty: pattern.difficulty as 1|2|3|4|5,
    cefr: diffToCEFR(pattern.difficulty),
    hayqReward: pattern.difficulty * 4,
    lessonId, unitId,
  };
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const LESSONS: Lesson[] = [
  {
    id: "lesson_1", unitId: "unit_greetings",
    title: "Hello Armenia", titleArmenian: "Բարև Հայաստան",
    description: "Առաջին բառերը՝ ողջույններ և ծանոթություն",
    cefr: "A1", difficulty: 1, prerequisiteLessons: [],
    hayqTotal: 90, estimatedMinutes: 8,
    grammarFocus: ["«լինել» բայի ներկա ժամանակը", "անձնական դերանուններ"],
    vocabularyFocus: ["բարև", "լավ", "ես", "դու"],
    exercises: [
      generateMCExercise(
        LEXICON.find(e => e.word === "բարև")
          ?? LEXICON.find(e => e.id === "greet_001")!,
        "lesson_1","unit_greetings",
        LEXICON.filter(e => e.grammar_type === "adjective").slice(0,3)
      ),
      generateMCExercise(
        LEXICON.find(e => e.word === "լավ")
          ?? LEXICON.find(e => e.id === "adj_003")!,
        "lesson_1","unit_greetings",
        LEXICON.filter(e => e.grammar_type === "adjective").slice(1,4)
      ),
      generateTranslationExercise("sp_009","lesson_1","unit_greetings"),
      generateTranslationExercise("sp_010","lesson_1","unit_greetings"),
    ].filter(Boolean) as Exercise[],
  },
  {
    id: "lesson_2", unitId: "unit_home",
    title: "Going Home", titleArmenian: "Տուն գնալ",
    description: "Խոսիր տան և շարժման մասին",
    cefr: "A1", difficulty: 1, prerequisiteLessons: ["lesson_1"],
    hayqTotal: 110, estimatedMinutes: 10,
    grammarFocus: ["ներկա շարունակական", "ազատ բառապաշար"],
    vocabularyFocus: ["տուն", "գնալ", "ապրել", "Երևան"],
    exercises: [
      generateTranslationExercise("sp_001","lesson_2","unit_home"),
      generateTranslationExercise("sp_005","lesson_2","unit_home"),
      generateWordOrderExercise("sp_001","lesson_2","unit_home"),
      generateWordOrderExercise("sp_005","lesson_2","unit_home"),
    ].filter(Boolean) as Exercise[],
  },
  {
    id: "lesson_3", unitId: "unit_food",
    title: "Eating & Drinking", titleArmenian: "Ուտել ու Խմել",
    description: "Ուտելիքի բառապաշար և զրույցներ սեղանի շուրջ",
    cefr: "A1", difficulty: 1, prerequisiteLessons: ["lesson_1"],
    hayqTotal: 100, estimatedMinutes: 9,
    grammarFocus: ["ուղիղ խնդիր", "բայի խոնարհում"],
    vocabularyFocus: ["ուտել", "խմել", "հաց", "ջուր"],
    exercises: [
      generateTranslationExercise("sp_002","lesson_3","unit_food"),
      generateWordOrderExercise("sp_002","lesson_3","unit_food"),
      generateMCExercise(
        LEXICON.find(e => e.id === "food_002")!,
        "lesson_3","unit_food",
        LEXICON.filter(e => e.embedding_group === "food_drink").slice(1,4)
      ),
    ].filter(Boolean) as Exercise[],
  },
  {
    id: "lesson_4", unitId: "unit_family",
    title: "My Family", titleArmenian: "Իմ ընտանիքը",
    description: "Ընտանիքի անդամներ և ստացական հոլով",
    cefr: "A1", difficulty: 1, prerequisiteLessons: ["lesson_2"],
    hayqTotal: 120, estimatedMinutes: 11,
    grammarFocus: ["ստացական հոդեր", "մասնագիտություններ"],
    vocabularyFocus: ["մայրս", "հայրս", "բժշկուհի", "ուսուցիչ"],
    exercises: [
      generateTranslationExercise("sp_006","lesson_4","unit_family"),
      generateTranslationExercise("sp_007","lesson_4","unit_family"),
      generateTranslationExercise("sp_004","lesson_4","unit_family"),
      generateWordOrderExercise("sp_006","lesson_4","unit_family"),
      generateMCExercise(
        LEXICON.find(e => e.id === "prof_002")!,
        "lesson_4","unit_family",
        LEXICON.filter(e => e.embedding_group === "work_profession"
          || e.embedding_group === "education_learning").slice(0,3)
      ),
    ].filter(Boolean) as Exercise[],
  },
  {
    id: "lesson_5", unitId: "unit_education",
    title: "School & Books", titleArmenian: "Դպրոց ու Գիրք",
    description: "Կրթական բառապաշար",
    cefr: "A2", difficulty: 2, prerequisiteLessons: ["lesson_4"],
    hayqTotal: 130, estimatedMinutes: 12,
    grammarFocus: ["ներկա շարունակական (կարդալ/գրել)", "ներգոյական հոլով"],
    vocabularyFocus: ["դպրոց", "գիրք", "կարդալ", "գրել"],
    exercises: [
      generateTranslationExercise("sp_008","lesson_5","unit_education"),
      generateWordOrderExercise("sp_008","lesson_5","unit_education"),
      generateMCExercise(
        LEXICON.find(e => e.id === "edu_002")!,
        "lesson_5","unit_education",
        LEXICON.filter(e => e.embedding_group === "education_learning").slice(0,3)
      ),
    ].filter(Boolean) as Exercise[],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function diffToCEFR(d: number): CEFRLevel {
  return (["A1","A1","A2","B1","B2","C1"] as CEFRLevel[])[Math.min(d,5)] ?? "A1";
}
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const getLessonById  = (id: string) => LESSONS.find(l => l.id === id);
export const getUnitById    = (id: string) => UNITS.find(u => u.id === id);
export const getLessonsForUnit = (uid: string) => LESSONS.filter(l => l.unitId === uid);
export const scoreToGrade = (s: number) =>
  s >= 0.98 ? "perfect" : s >= 0.85 ? "excellent" : s >= 0.75 ? "good" : s >= 0.5 ? "partial" : "incorrect";

