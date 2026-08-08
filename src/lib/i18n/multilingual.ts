/**
 * NUR Lingo — Multilingual Content v2
 * Supports 6 learning directions between Armenian (HY), English (EN), and Russian (RU).
 */

export type LangCode = "en" | "hy" | "ru";
export type LangPair = "en-hy" | "hy-en" | "ru-hy" | "hy-ru" | "en-ru" | "ru-en";

export interface MultiExercise {
  id: string;
  type: "multiple_choice" | "translate" | "word_order" | "match_pairs" | "listening";
  prompt: Record<LangCode, string>;
  targetAnswer: string;
  acceptableAnswers?: string[];
  options?: string[];
  words?: string[];
  pairs?: Array<[string, string]>;      // for match_pairs
  ttsText?: string;                     // for listening
  ttsLang?: LangCode;                   // for listening
  hint?: Record<LangCode, string>;
  hayqReward?: number;
}

export interface MultiLesson {
  id: string;
  unitId: string;
  cefr?: string;
  difficulty?: number;
  title: Record<LangCode, string>;
  description: Record<LangCode, string>;
  estimatedMinutes: number;
  hayqTotal: number;
  exercises: MultiExercise[];
}

export interface MultiUnit {
  id: string;
  title: Record<LangCode, string>;
  description: Record<LangCode, string>;
  iconEmoji: string;
  colorFrom: string;
  colorTo: string;
  lessons: string[];
}

export const MULTI_UNITS: MultiUnit[] = [
  {
    id: "u1",
    title: { en: "Greetings & Basics", hy: "Ողջույններ և Հիմունքներ", ru: "Приветствия и Основы" },
    description: { en: "First words and common phrases", hy: "Առաջին բառերը և տարածված արտահայտությունները", ru: "Первые слова и основные фразы" },
    iconEmoji: "👋", colorFrom: "#D90012", colorTo: "#8b0000",
    lessons: ["l1", "l2", "l3", "l4", "l5"]
  },
  {
    id: "u2",
    title: { en: "I am / You are", hy: "Ես եմ / Դու ես", ru: "Я / Ты" },
    description: { en: "Pronouns and 'to be' verb", hy: "Դերանուններ և «լինել» բայը", ru: "Местоимения и глагол 'быть'" },
    iconEmoji: "👤", colorFrom: "#0033A0", colorTo: "#001a6b",
    lessons: ["l6", "l7", "l8", "l9", "l10"]
  },
  {
    id: "u3",
    title: { en: "Food & Drink", hy: "Սնունդ և ըմպելիք", ru: "Еда и напитки" },
    description: { en: "Essential food vocabulary", hy: "Հիմնական սննդի բառապաշար", ru: "Основные слова о еде" },
    iconEmoji: "🍽️", colorFrom: "#FFA500", colorTo: "#b07800",
    lessons: ["hyen_l3", "ruhy_l4", "hyru_l3", "enru_l3", "ruen_l4"]
  }
];

// ─── HY→EN (Armenian speaker learns English) ────────────────────────────────

const HY_EN_LESSONS: MultiLesson[] = [{
    id: "hyen_l1", unitId: "u1",
    title: { hy: "Ողջույն", en: "Greetings", ru: "Приветствие" },
    description: { hy: "Ինչպե՞ս ողջունել անգլերեն", en: "How to greet in English", ru: "Как здороваться по-английски" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "hyen_e1", type: "multiple_choice",
        prompt: { hy: "«Բարև»-ի անգլերեն թարգմանությունը", en: "English for «Բարև»", ru: "«Բարև» по-английски" },
        targetAnswer: "Hello", options: ["Hello", "Goodbye", "Please", "Sorry"] },
      { id: "hyen_e2", type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես»", en: "Translate to English", ru: "Переведи на английский" },
        targetAnswer: "How are you?", acceptableAnswers: ["How are you?", "How are you", "How r u"] },
      { id: "hyen_e3", type: "word_order",
        prompt: { hy: "Դասավորել անգլերեն բառերը", en: "Arrange English words", ru: "Составь английские слова" },
        targetAnswer: "I am fine thank you", words: ["I", "am", "fine", "thank", "you"] },
      { id: "hyen_e4", type: "multiple_choice",
        prompt: { hy: "«Շնորհակալություն»-ը անգլերեն", en: "«Thanks» in English", ru: "«Спасибо» по-английски" },
        targetAnswer: "Thank you", options: ["Thank you", "Sorry", "Excuse me", "Please"] },
    ]
  },
  {
    id: "hyen_l2", unitId: "u2",
    title: { hy: "Ես ուսանող եմ", en: "I am a student", ru: "Я студент" },
    description: { hy: "Անձնական դերանուններ", en: "Personal pronouns", ru: "Личные местоимения" },
    estimatedMinutes: 6, hayqTotal: 60,
    exercises: [
      { id: "hyen_e5", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Ես ուսանող եմ»", en: "Translate", ru: "Переведи" },
        targetAnswer: "I am a student", acceptableAnswers: ["I am a student", "I'm a student"] },
      { id: "hyen_e6", type: "multiple_choice",
        prompt: { hy: "«Ես»-ի անգլերեն թարգմանությունը", en: "«I» in English", ru: "«Я» по-английски" },
        targetAnswer: "I", options: ["I", "He", "She", "We"] },
      { id: "hyen_e7", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Մայրս բժշկուհի է»", en: "Translate", ru: "Переведи" },
        targetAnswer: "My mother is a doctor", acceptableAnswers: ["My mother is a doctor", "My mom is a doctor"] },
      { id: "hyen_e8", type: "word_order",
        prompt: { hy: "Դասավորել՝ «Ես հայ եմ»", en: "Arrange", ru: "Составь" },
        targetAnswer: "I am Armenian", words: ["I", "am", "Armenian"] },
    ]
  },
  {
    id: "hyen_l3", unitId: "u3", cefr: "A1", difficulty: 1,
    title: { hy: "Սնունդ եւ խմիչք", en: "Food & Drink", ru: "Еда и напитки" },
    description: { hy: "Ինչպե՞ս խոսել ուտելիքի մասին", en: "Talking about food", ru: "О еде" },
    estimatedMinutes: 8, hayqTotal: 90,
    exercises: [
      { id: "e1", type: "multiple_choice",
        prompt: { hy: "«Հաց»-ի անգլերեն անունը", en: "English for «Հաց» (bread)", ru: "«Хлеб» по-английски" },
        targetAnswer: "Bread", acceptableAnswers: ["Bread"],
        options: ["Bread", "Water", "Milk", "Meat"], hayqReward: 8 },
      { id: "e2", type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ես հաց եմ ուտում»", en: "Translate", ru: "Переведи" },
        targetAnswer: "I am eating bread",
        acceptableAnswers: ["I am eating bread", "I'm eating bread", "I eat bread"],
        hayqReward: 12 },
      { id: "e3", type: "multiple_choice",
        prompt: { hy: "«Ջուր»-ի անգլերեն անունը", en: "English for «Ջուր» (water)", ru: "«Вода» по-английски" },
        targetAnswer: "Water", acceptableAnswers: ["Water"],
        options: ["Water", "Juice", "Tea", "Coffee"], hayqReward: 8 },
      { id: "e4", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Ես սուրճ եմ խմում»", en: "Translate", ru: "Переведи" },
        targetAnswer: "I am drinking coffee",
        acceptableAnswers: ["I am drinking coffee", "I'm drinking coffee", "I drink coffee"],
        hayqReward: 12 },
    ]
  },
  {
    id: "hyen_l4", unitId: "u1", cefr: "A1", difficulty: 1,
    title: { hy: "Ընտանիք", en: "My Family", ru: "Моя семья" },
    description: { hy: "Իմ հարազատները", en: "My relatives", ru: "Мои родственники" },
    estimatedMinutes: 9, hayqTotal: 100,
    exercises: [
      { id: "e1", type: "multiple_choice",
        prompt: { hy: "«Մայր»-ի անգլերեն թարգմանությունը", en: "English for «Մայր»", ru: "«Мама» по-английски" },
        targetAnswer: "Mother", acceptableAnswers: ["Mother", "Mom", "Mum"],
        options: ["Mother", "Father", "Sister", "Brother"], hayqReward: 8 },
      { id: "e2", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Մայրս բժշկուհի է»", en: "Translate", ru: "Переведи" },
        targetAnswer: "My mother is a doctor",
        acceptableAnswers: ["My mother is a doctor", "My mom is a doctor", "My mum is a doctor"],
        hayqReward: 15 },
      { id: "e3", type: "multiple_choice",
        prompt: { hy: "«Եղբայր»-ի անգլերեն անունը", en: "English for brother", ru: "«Брат» по-английски" },
        targetAnswer: "Brother", acceptableAnswers: ["Brother"],
        options: ["Brother", "Sister", "Father", "Mother"], hayqReward: 8 },
      { id: "e4", type: "word_order",
        prompt: { hy: "Դասավորել անգլերեն բառերը՝ «Ես սիրում եմ իմ ընտանիքը»", en: "Arrange: I love my family", ru: "Составь" },
        targetAnswer: "I love my family",
        acceptableAnswers: ["I love my family", "I love my family."],
        words: ["I", "love", "my", "family"], hayqReward: 12 },
    ]
  },
  {
    id: "hyen_l5", unitId: "u1", cefr: "A1", difficulty: 1,
    title: { hy: "Թվեր", en: "Numbers 1-10", ru: "Числа 1-10" },
    description: { hy: "Հաշվել մինչև 10", en: "Counting to 10", ru: "Счет до 10" },
    estimatedMinutes: 7, hayqTotal: 80,
    exercises: [
      { id: "e1", type: "multiple_choice",
        prompt: { hy: "«Մեկ»-ի անգլերեն անունը", en: "English for «one»", ru: "«Один» по-английски" },
        targetAnswer: "One", acceptableAnswers: ["One", "1"],
        options: ["One", "Two", "Three", "Four"], hayqReward: 6 },
      { id: "e2", type: "multiple_choice",
        prompt: { hy: "«Հինգ»-ի անգլերեն անունը", en: "English for «five»", ru: "«Пять» по-английски" },
        targetAnswer: "Five", acceptableAnswers: ["Five", "5"],
        options: ["Four", "Five", "Six", "Seven"], hayqReward: 6 },
      { id: "e3", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Ես տասը տարեկան եմ»", en: "Translate: I am ten years old", ru: "Переведи" },
        targetAnswer: "I am ten years old",
        acceptableAnswers: ["I am ten years old", "I'm ten years old", "I am 10 years old"],
        hayqReward: 12 },
      { id: "e4", type: "word_order",
        prompt: { hy: "Դասավորել՝ «Ես երրորդն եմ»", en: "Arrange: I am the third", ru: "Составь" },
        targetAnswer: "I am number three",
        acceptableAnswers: ["I am number three", "I am third"],
        words: ["I", "am", "number", "three"], hayqReward: 10 },
    ]
  },
  {
    id: "hyen_dlg_1",
    unitId: "u1",
    title: { hy: "Ծանոթություն", en: "Introduction", ru: "Знакомство" },
    description: { hy: "Զրույց Ծանոթություն թեմայով", en: "Dialogue about Introduction", ru: "Диалог на тему Знакомство" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_1_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_1_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_1_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_2",
    unitId: "u1",
    title: { hy: "Ընտանիք", en: "Family", ru: "Семья" },
    description: { hy: "Զրույց Ընտանիք թեմայով", en: "Dialogue about Family", ru: "Диалог на тему Семья" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_2_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_2_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_2_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_3",
    unitId: "u1",
    title: { hy: "Տուն", en: "Home", ru: "Дом" },
    description: { hy: "Զրույց Տուն թեմայով", en: "Dialogue about Home", ru: "Диалог на тему Дом" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_3_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_3_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_3_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_4",
    unitId: "u1",
    title: { hy: "Սնունդ", en: "Food", ru: "Еда" },
    description: { hy: "Զրույց Սնունդ թեմայով", en: "Dialogue about Food", ru: "Диалог на тему Еда" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_4_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_4_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_4_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_5",
    unitId: "u1",
    title: { hy: "Խմիչք", en: "Drinks", ru: "Напитки" },
    description: { hy: "Զրույց Խմիչք թեմայով", en: "Dialogue about Drinks", ru: "Диалог на тему Напитки" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_5_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_5_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_5_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_6",
    unitId: "u1",
    title: { hy: "Գնումներ", en: "Shopping", ru: "Покупки" },
    description: { hy: "Զրույց Գնումներ թեմայով", en: "Dialogue about Shopping", ru: "Диалог на тему Покупки" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_6_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_6_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_6_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_7",
    unitId: "u1",
    title: { hy: "Ճամփորդություն", en: "Travel", ru: "Путешествие" },
    description: { hy: "Զրույց Ճամփորդություն թեմայով", en: "Dialogue about Travel", ru: "Диалог на тему Путешествие" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_7_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_7_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_7_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_8",
    unitId: "u1",
    title: { hy: "Ժամանակ", en: "Time", ru: "Время" },
    description: { hy: "Զրույց Ժամանակ թեմայով", en: "Dialogue about Time", ru: "Диалог на тему Время" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_8_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_8_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_8_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_9",
    unitId: "u1",
    title: { hy: "Եղանակ", en: "Weather", ru: "Погода" },
    description: { hy: "Զրույց Եղանակ թեմայով", en: "Dialogue about Weather", ru: "Диалог на тему Погода" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_9_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_9_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_9_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_10",
    unitId: "u1",
    title: { hy: "Աշխատանք", en: "Work", ru: "Работа" },
    description: { hy: "Զրույց Աշխատանք թեմայով", en: "Dialogue about Work", ru: "Диалог на тему Работа" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_10_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_10_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_10_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_11",
    unitId: "u1",
    title: { hy: "Հոբբի", en: "Hobby", ru: "Хобби" },
    description: { hy: "Զրույց Հոբբի թեմայով", en: "Dialogue about Hobby", ru: "Диалог на тему Хобби" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_11_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_11_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_11_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_12",
    unitId: "u1",
    title: { hy: "Բժիշկ", en: "Doctor", ru: "Врач" },
    description: { hy: "Զրույց Բժիշկ թեմայով", en: "Dialogue about Doctor", ru: "Диалог на тему Врач" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_12_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_12_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_12_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_13",
    unitId: "u1",
    title: { hy: "Հյուրանոց", en: "Hotel", ru: "Отель" },
    description: { hy: "Զրույց Հյուրանոց թեմայով", en: "Dialogue about Hotel", ru: "Диалог на тему Отель" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_13_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_13_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_13_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_14",
    unitId: "u1",
    title: { hy: "Ռեստորան", en: "Restaurant", ru: "Ресторан" },
    description: { hy: "Զրույց Ռեստորան թեմայով", en: "Dialogue about Restaurant", ru: "Диалог на тему Ресторан" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_14_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_14_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_14_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_15",
    unitId: "u1",
    title: { hy: "Ֆիլմ", en: "Movie", ru: "Фильм" },
    description: { hy: "Զրույց Ֆիլմ թեմայով", en: "Dialogue about Movie", ru: "Диалог на тему Фильм" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_15_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_15_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_15_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_16",
    unitId: "u1",
    title: { hy: "Երաժշտություն", en: "Music", ru: "Музыка" },
    description: { hy: "Զրույց Երաժշտություն թեմայով", en: "Dialogue about Music", ru: "Диалог на тему Музыка" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_16_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_16_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_16_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_17",
    unitId: "u1",
    title: { hy: "Սպորտ", en: "Sport", ru: "Спорт" },
    description: { hy: "Զրույց Սպորտ թեմայով", en: "Dialogue about Sport", ru: "Диалог на тему Спорт" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_17_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_17_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_17_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_18",
    unitId: "u1",
    title: { hy: "Տեխնոլոգիա", en: "Technology", ru: "Технологии" },
    description: { hy: "Զրույց Տեխնոլոգիա թեմայով", en: "Dialogue about Technology", ru: "Диалог на тему Технологии" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_18_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_18_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_18_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_19",
    unitId: "u1",
    title: { hy: "Կրթություն", en: "Education", ru: "Образование" },
    description: { hy: "Զրույց Կրթություն թեմայով", en: "Dialogue about Education", ru: "Диалог на тему Образование" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_19_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_19_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_19_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  },
  {
    id: "hyen_dlg_20",
    unitId: "u1",
    title: { hy: "Բնություն", en: "Nature", ru: "Природа" },
    description: { hy: "Զրույց Բնություն թեմայով", en: "Dialogue about Nature", ru: "Диалог на тему Природа" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "hyen_dlg_20_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_20_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "hyen_dlg_20_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  }];

// ─── RU→HY (Russian speaker learns Armenian) ────────────────────────────────

const RU_HY_LESSONS: MultiLesson[] = [
  {
    id: "ruhy_l1", unitId: "u1",
    title: { ru: "Приветствие", hy: "Ողջույն", en: "Greetings" },
    description: { ru: "Первые фразы на армянском", hy: "Առաջին արտահայտությունները հայերենով", en: "First phrases in Armenian" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "ruhy_e1", type: "multiple_choice",
        prompt: { ru: "«Привет» по-армянски — это:", hy: "«Привет»-ը հայերենում", en: "Hello in Armenian" },
        targetAnswer: "Բարև", options: ["Բարև", "Շնորհակալություն", "Ոչ", "Այո"] },
      { id: "ruhy_e2", type: "translate",
        prompt: { ru: "Переведи на армянский: «Как дела?»", hy: "Թարգմանել հայերեն", en: "Translate to Armenian" },
        targetAnswer: "Ինչպե՞ս ես", acceptableAnswers: ["Ինչպե՞ս ես", "Ինչպե՞ս ես դու", "Ո՞նց ես"],
        hint: { ru: "По-армянски: Ինչպե՞ս ես", hy: "Հայերեն՝ Ինչպե՞ս ես", en: "Armenian: Ինչպե՞ս ես" } },
      { id: "ruhy_e3", type: "translate",
        prompt: { ru: "Переведи: «Я иду домой»", hy: "Թարգմանել", en: "Translate" },
        targetAnswer: "Ես գնում եմ տուն", acceptableAnswers: ["Ես գնում եմ տուն", "Ես տուն եմ գնում", "Տուն եմ գնում"],
        hint: { ru: "В армянском свободный порядок слов!", hy: "Հայերենում ազատ բառակարգ է!", en: "Free word order!" } },
      { id: "ruhy_e4", type: "multiple_choice",
        prompt: { ru: "«Спасибо» по-армянски:", hy: "«Շնորհակալություն»-ը ռուսերենում", en: "Thanks in Armenian" },
        targetAnswer: "Շնորհակալություն", options: ["Շնորհակալություն", "Բարև", "Ոչ", "Այո"] },
    ]
  },
  {
    id: "ruhy_l2", unitId: "u2",
    title: { ru: "Семья", hy: "Ընտանիք", en: "Family" },
    description: { ru: "Члены семьи", hy: "Ընտանիքի անդամները", en: "Family members" },
    estimatedMinutes: 6, hayqTotal: 60,
    exercises: [
      { id: "ruhy_e5", type: "multiple_choice",
        prompt: { ru: "«Мама» по-армянски:", hy: "«Մամա»-ն հայերենում", en: "Mom in Armenian" },
        targetAnswer: "Մայրիկ", options: ["Մայրիկ", "Հայրիկ", "Քույր", "Եղբայր"] },
      { id: "ruhy_e6", type: "translate",
        prompt: { ru: "Переведи: «Моя мама врач»", hy: "Թարգմանել", en: "Translate" },
        targetAnswer: "Մայրս բժշկուհի է", acceptableAnswers: ["Մայրս բժշկուհի է", "Մայրս բժիշկ է", "Իմ մայրը բժշկուհի է"] },
      { id: "ruhy_e7", type: "multiple_choice",
        prompt: { ru: "«Брат» по-армянски:", hy: "«Եղբայր»-ը ռուսերենում", en: "Brother in Armenian" },
        targetAnswer: "Եղբայր", options: ["Եղբայր", "Քույր", "Մայր", "Հայր"] },
      { id: "ruhy_e8", type: "word_order",
        prompt: { ru: "Составь армянскую фразу: «Я люблю Армению»", hy: "Դասավորել", en: "Arrange" },
        targetAnswer: "Ես սիրում եմ Հայաստանը", words: ["Ես", "սիրում", "եմ", "Հայաստանը"] },
    ]
  },
  {
    id: "ruhy_l3", unitId: "u2", cefr: "A1", difficulty: 1,
    title: { ru: "Дом и движение", hy: "Տուն եւ շարժում", en: "Home & Movement" },
    description: { ru: "Где я живу", hy: "Որտեղ եմ ես ապրում", en: "Where I live" },
    estimatedMinutes: 8, hayqTotal: 90,
    exercises: [
      { id: "e1", type: "multiple_choice",
        prompt: { ru: "«Дом» по-армянски — это:", hy: "«Տուն»-ը ռուսերենով", en: "Home in Armenian" },
        targetAnswer: "Տուն", acceptableAnswers: ["Տուն", "Բնակարան"],
        options: ["Տուն", "Սենյակ", "Դպրոց", "Քաղաք"], hayqReward: 8 },
      { id: "e2", type: "translate",
        prompt: { ru: "Переведи на армянский: «Я иду домой»", hy: "Թարգմանել հայերեն", en: "Translate" },
        targetAnswer: "Ես գնում եմ տուն",
        acceptableAnswers: ["Ես գնում եմ տուն", "Ես տուն եմ գնում", "Տուն եմ գնում"],
        hint: { ru: "Свободный порядок слов!", hy: "Ազատ բառակարգ!", en: "Free word order!" },
        hayqReward: 15 },
      { id: "e3", type: "multiple_choice",
        prompt: { ru: "«Ереван» по-армянски:", hy: "«Երևան»-ը ռուսերենով", en: "Yerevan in Armenian" },
        targetAnswer: "Երևան", acceptableAnswers: ["Երևան", "Yerevan"],
        options: ["Երևան", "Հայաստան", "Քաղաք", "Տուն"], hayqReward: 8 },
      { id: "e4", type: "word_order",
        prompt: { ru: "Составь: «Я живу в Ереване»", hy: "Դասավորել", en: "Arrange" },
        targetAnswer: "Ես ապրում եմ Երևանում",
        acceptableAnswers: ["Ես ապրում եմ Երևանում", "Երևանում եմ ապրում"],
        words: ["Ես", "ապրում", "եմ", "Երևանում"], hayqReward: 12 },
    ]
  },
  {
    id: "ruhy_l4", unitId: "u2", cefr: "A1", difficulty: 1,
    title: { ru: "Еда и напитки", hy: "Սնունդ եւ խմիչք", en: "Food & Drink" },
    description: { ru: "Продукты", hy: "Մթերքներ", en: "Products" },
    estimatedMinutes: 8, hayqTotal: 90,
    exercises: [
      { id: "e1", type: "multiple_choice",
        prompt: { ru: "«Хлеб» по-армянски:", hy: "«Հաց»-ը ռուսերենով", en: "Bread in Armenian" },
        targetAnswer: "Հաց", acceptableAnswers: ["Հաց"],
        options: ["Հաց", "Ջուր", "Կաթ", "Միս"], hayqReward: 8 },
      { id: "e2", type: "translate",
        prompt: { ru: "Переведи: «Я ем хлеб»", hy: "Թարգմանել հայերեն", en: "Translate" },
        targetAnswer: "Ես հաց եմ ուտում",
        acceptableAnswers: ["Ես հաց եմ ուտում", "Ես ուտում եմ հաց", "Հաց եմ ուտում"],
        hayqReward: 15 },
      { id: "e3", type: "multiple_choice",
        prompt: { ru: "«Кофе» по-армянски:", hy: "«Սուրճ»-ը ռուսերենով", en: "Coffee in Armenian" },
        targetAnswer: "Սուրճ", acceptableAnswers: ["Սուրճ"],
        options: ["Սուրճ", "Թեյ", "Ջուր", "Կաթ"], hayqReward: 8 },
      { id: "e4", type: "translate",
        prompt: { ru: "Переведи: «Мацун — армянское блюдо»", hy: "Թարգմանել հայերեն", en: "Translate" },
        targetAnswer: "Մածունը հայկական կերակուր է",
        acceptableAnswers: ["Մածունը հայկական կերակուր է", "Մածունը հայկական է"],
        hayqReward: 12 },
    ]
  },
  {
    id: "ruhy_l5", unitId: "u2", cefr: "A1", difficulty: 1,
    title: { ru: "Числа 1-5", hy: "Թվեր 1-5", en: "Numbers 1-5" },
    description: { ru: "Счет до 10", hy: "Հաշվել մինչև 10", en: "Counting to 10" },
    estimatedMinutes: 7, hayqTotal: 80,
    exercises: [
      { id: "e1", type: "multiple_choice",
        prompt: { ru: "«Один» по-армянски:", hy: "«Մեկ»-ը ռուսերենով", en: "One in Armenian" },
        targetAnswer: "Մեկ", acceptableAnswers: ["Մեկ"],
        options: ["Մեկ", "Երկու", "Երեք", "Չորս"], hayqReward: 6 },
      { id: "e2", type: "multiple_choice",
        prompt: { ru: "«Пять» по-армянски:", hy: "«Հինգ»-ը ռուսերենով", en: "Five in Armenian" },
        targetAnswer: "Հինգ", acceptableAnswers: ["Հինգ"],
        options: ["Չորս", "Հինգ", "Վեց", "Յոթ"], hayqReward: 6 },
      { id: "e3", type: "translate",
        prompt: { ru: "Переведи: «Мне десять лет»", hy: "Թարգմանել հայերեն", en: "Translate" },
        targetAnswer: "Ես տասը տարեկան եմ",
        acceptableAnswers: ["Ես տասը տարեկան եմ", "Իմ տասը տարին է"],
        hayqReward: 12 },
      { id: "e4", type: "word_order",
        prompt: { ru: "Составь: «У меня есть три книги»", hy: "Դասավորել", en: "Arrange" },
        targetAnswer: "Իմ մոտ երեք գիրք կա",
        acceptableAnswers: ["Իմ մոտ երեք գիրք կա", "Երեք գիրք ունեմ"],
        words: ["Իմ", "մոտ", "երեք", "գիրք", "կա"], hayqReward: 10 },
    ]
  }
];

// ─── EN→HY (English speaker learns Armenian) ────────────────────────────────

const EN_HY_LESSONS: MultiLesson[] = [
  {
    id: "enhy_l1", unitId: "u1",
    title: { en: "Greetings", hy: "Ողջույն", ru: "Приветствие" },
    description: { en: "First Armenian words", hy: "Առաջին հայերեն բառերը", ru: "Первые армянские слова" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "enhy_e1", type: "multiple_choice",
        prompt: { en: "Armenian for «Hello»", hy: "«Hello»-ն հայերենում", ru: "«Hello» по-армянски" },
        targetAnswer: "Բարև", options: ["Բարև", "Շնորհակալություն", "Ոչ", "Այո"] },
      { id: "enhy_e2", type: "translate",
        prompt: { en: "Translate to Armenian: «How are you?»", hy: "Թարգմանել հայերեն", ru: "Переведи на армянский" },
        targetAnswer: "Ինչպե՞ս ես", acceptableAnswers: ["Ինչպե՞ս ես", "Ո՞նց ես", "Ինչպե՞ս եք"] },
      { id: "enhy_e3", type: "word_order",
        prompt: { en: "Arrange Armenian words: «I am fine»", hy: "Դասավորել բառերը", ru: "Составь фразу" },
        targetAnswer: "Ես լավ եմ", words: ["Ես", "լավ", "եմ"] },
      { id: "enhy_e4", type: "multiple_choice",
        prompt: { en: "«Thank you» in Armenian", hy: "«Շնորհակալություն»-ը անգլերենում", ru: "«Спасибо» по-армянски" },
        targetAnswer: "Շնորհակալություն", options: ["Շնորհակալություն", "Բարև", "Այո", "Ոչ"] },
    ]
  },
  { id: "enhy_l2", unitId: "u1", title: { en: "Home", hy: "Տուն", ru: "Дом" }, description: { en: "Basic home words", hy: "Տան հիմնական բառերը", ru: "Слова о доме" }, estimatedMinutes: 5, hayqTotal: 50, exercises: [] },
  { id: "enhy_l3", unitId: "u1", title: { en: "Food", hy: "Ուտելիք", ru: "Еда" }, description: { en: "Eating and drinking", hy: "Ուտել և խմել", ru: "Еда и напитки" }, estimatedMinutes: 6, hayqTotal: 60, exercises: [] },
  { id: "enhy_l4", unitId: "u2", title: { en: "I am", hy: "Ես եմ", ru: "Я" }, description: { en: "Self introduction", hy: "Ինքնաներկայացում", ru: "Представление себя" }, estimatedMinutes: 5, hayqTotal: 50, exercises: [] },
  { id: "enhy_l5", unitId: "u2", title: { en: "Profession", hy: "Մասնագիտություն", ru: "Профессия" }, description: { en: "Work words", hy: "Աշխատանքային բառեր", ru: "Слова о работе" }, estimatedMinutes: 5, hayqTotal: 50, exercises: [] }
];

// ─── HY→RU (Armenian speaker learns Russian) ────────────────────────────────

const HY_RU_LESSONS: MultiLesson[] = [
  {
    id: "hyru_l1", unitId: "u1",
    title: { hy: "Ողջույն", en: "Greetings", ru: "Приветствие" },
    description: { hy: "Ինչպե՞ս ողջունել ռուսերեն", en: "How to greet in Russian", ru: "Как здороваться по-русски" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "hyru_e1", type: "multiple_choice",
        prompt: { hy: "«Բարև»-ի ռուսերեն թարգմանությունը", ru: "«Привет» по-русски", en: "Russian for hello" },
        targetAnswer: "Привет", options: ["Привет", "Пожалуйста", "Спасибо", "Извините"] },
      { id: "hyru_e2", type: "translate",
        prompt: { hy: "Թարգմանել ռուսերեն՝ «Ինչպե՞ս ես»", ru: "Переведи", en: "Translate" },
        targetAnswer: "Как дела?", acceptableAnswers: ["Как дела?", "Как дела", "Как ты?"] },
      { id: "hyru_e3", type: "multiple_choice",
        prompt: { hy: "«Շնորհակալություն»-ը ռուսերեն", ru: "«Спасибо» по-армянски?", en: "Thanks in Russian" },
        targetAnswer: "Спасибо", options: ["Спасибо", "Извините", "Пожалуйста", "Здравствуйте"] },
      { id: "hyru_e4", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Ես ուսանող եմ»", ru: "Переведи: Я студент", en: "Translate" },
        targetAnswer: "Я студент", acceptableAnswers: ["Я студент", "Я студентка"] },
    ]
  },
  {
    id: "hyru_l2", unitId: "u2",
    title: { hy: "Ես եմ", en: "I am", ru: "Я" },
    description: { hy: "Անձնական դերանուններ", en: "Personal pronouns", ru: "Личные местоимения" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "hyru_e5", type: "multiple_choice",
        prompt: { hy: "«Ես»-ի ռուսերեն թարգմանությունը", ru: "«Я» по-армянски?", en: "«I» in Russian" },
        targetAnswer: "Я", options: ["Я", "Он", "Она", "Мы"] },
      { id: "hyru_e6", type: "translate",
        prompt: { hy: "Թարգմանել ռուսերեն՝ «Մայրս բժշկուհի է»", ru: "Переведи", en: "Translate" },
        targetAnswer: "Моя мама врач", acceptableAnswers: ["Моя мама врач", "Моя мама — врач", "Моя мать врач"] },
      { id: "hyru_e7", type: "word_order",
        prompt: { hy: "Դասավորել ռուսերեն բառերը", ru: "Составь слова", en: "Arrange words" },
        targetAnswer: "Я живу в Ереване", words: ["Я", "живу", "в", "Ереване"] },
      { id: "hyru_e8", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Ես Հայաստանից եմ»", ru: "Переведи: Я из Армении", en: "Translate" },
        targetAnswer: "Я из Армении", acceptableAnswers: ["Я из Армении", "Я армянин", "Я армянка"] },
    ]
  },
  {
    id: "hyru_l3", unitId: "u1",
    title: { hy: "Ուտելիք", en: "Food", ru: "Еда" },
    description: { hy: "Ուտելիքի բառապաշար", en: "Food vocabulary", ru: "Словарь еды" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "hyru_e9", type: "multiple_choice",
        prompt: { hy: "«Հաց»-ի ռուսերեն անունը", ru: "«Хлеб» по-армянски", en: "Bread in Russian" },
        targetAnswer: "Хлеб", options: ["Хлеб", "Вода", "Молоко", "Мясо"] },
      { id: "hyru_e10", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Ես հաց եմ ուտում»", ru: "Переведи", en: "Translate" },
        targetAnswer: "Я ем хлеб", acceptableAnswers: ["Я ем хлеб", "Я кушаю хлеб"] },
      { id: "hyru_e11", type: "multiple_choice",
        prompt: { hy: "«Սուրճ»-ի ռուսերեն անունը", ru: "«Кофе» по-армянски", en: "Coffee in Russian" },
        targetAnswer: "Кофе", options: ["Кофе", "Чай", "Вода", "Сок"] },
      { id: "hyru_e12", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Մածունը համով է»", ru: "Переведи: Мацун вкусный", en: "Translate" },
        targetAnswer: "Мацун вкусный", acceptableAnswers: ["Мацун вкусный", "Мацун очень вкусный", "Мацун — это вкусно"] },
    ]
  },
  { id: "hyru_l4", unitId: "u1", title: { hy: "Տուն", en: "Home", ru: "Дом" }, description: { hy: "Տան բառեր", en: "Home words", ru: "Слова о доме" }, estimatedMinutes: 5, hayqTotal: 50, exercises: [] },
  { id: "hyru_l5", unitId: "u2", title: { hy: "Ժամանակ", en: "Time", ru: "Время" }, description: { hy: "Օրվա ժամերը", en: "Times of day", ru: "Время суток" }, estimatedMinutes: 4, hayqTotal: 40, exercises: [] }
];

// ─── EN→RU (English speaker learns Russian) ────────────────────────────────

const EN_RU_LESSONS: MultiLesson[] = [
  {
    id: "enru_l1", unitId: "u1",
    title: { en: "Greetings", hy: "Ողջույն", ru: "Приветствие" },
    description: { en: "How to greet in Russian", hy: "Ինչպե՞ս ողջունել ռուսերեն", ru: "Как здороваться по-русски" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "enru_e1", type: "multiple_choice",
        prompt: { en: "«Hello» in Russian:", ru: "«Hello» по-русски:", hy: "«Hello»-ն ռուսերենում" },
        targetAnswer: "Привет", options: ["Привет", "Спасибо", "Пожалуйста", "Извините"] },
      { id: "enru_e2", type: "translate",
        prompt: { en: "Translate to Russian: «How are you?»", ru: "Переведи", hy: "Թարգմանել" },
        targetAnswer: "Как дела?", acceptableAnswers: ["Как дела?", "Как дела", "Как ты?"] },
      { id: "enru_e3", type: "word_order",
        prompt: { en: "Arrange Russian words: «I am a student»", ru: "Составь слова", hy: "Դասավորել" },
        targetAnswer: "Я студент", words: ["Я", "студент"] },
      { id: "enru_e4", type: "multiple_choice",
        prompt: { en: "«Thank you» in Russian:", ru: "«Спасибо» по-английски?", hy: "«Շնորհակալություն»-ը ռուսերեն" },
        targetAnswer: "Спасибо", options: ["Спасибо", "Извините", "Пожалуйста", "Здравствуйте"] },
    ]
  },
  {
    id: "enru_l2", unitId: "u1", cefr: "A1", difficulty: 1,
    title: { en: "I am...", ru: "Я есть...", hy: "Ես եմ..." },
    description: { en: "Self introduction in Russian", hy: "Ինքնաներկայացում ռուսերենով", ru: "Представление себя" },
    estimatedMinutes: 8, hayqTotal: 90,
    exercises: [
      { id: "e1", type: "translate",
        prompt: { en: "Translate to Russian: «I am Armenian»", ru: "Переведи на русский", hy: "Թարգմանել" },
        targetAnswer: "Я армянин",
        acceptableAnswers: ["Я армянин", "Я армянка", "Я из Армении"],
        hayqReward: 12 },
      { id: "e2", type: "multiple_choice",
        prompt: { en: "«House» in Russian:", ru: "«Дом» по-английски?", hy: "Ռուսերեն" },
        targetAnswer: "Дом", acceptableAnswers: ["Дом"],
        options: ["Дом", "Школа", "Машина", "Работа"], hayqReward: 8 },
      { id: "e3", type: "translate",
        prompt: { en: "Translate: «My mother is a doctor»", ru: "Переведи", hy: "Թարգմանել" },
        targetAnswer: "Моя мама врач",
        acceptableAnswers: ["Моя мама врач", "Моя мама — врач", "Моя мать врач"],
        hayqReward: 15 },
      { id: "e4", type: "word_order",
        prompt: { en: "Arrange Russian: «I live in Yerevan»", ru: "Составь", hy: "Դասավորել" },
        targetAnswer: "Я живу в Ереване",
        acceptableAnswers: ["Я живу в Ереване"],
        words: ["Я", "живу", "в", "Ереване"], hayqReward: 12 },
    ]
  },
  {
    id: "enru_l3", unitId: "u1", cefr: "A1", difficulty: 1,
    title: { en: "Food & Drink", ru: "Еда и напитки", hy: "Սնունդ" },
    description: { en: "Food words in Russian", hy: "Ուտելիքի բառեր ռուսերենով", ru: "Слова о еде" },
    estimatedMinutes: 8, hayqTotal: 90,
    exercises: [
      { id: "e1", type: "multiple_choice",
        prompt: { en: "«Bread» in Russian:", ru: "«Хлеб» по-английски?", hy: "Ռուսերեն" },
        targetAnswer: "Хлеб", acceptableAnswers: ["Хлеб"],
        options: ["Хлеб", "Вода", "Молоко", "Мясо"], hayqReward: 8 },
      { id: "e2", type: "translate",
        prompt: { en: "Translate: «I am drinking coffee»", ru: "Переведи", hy: "Թարգմանել" },
        targetAnswer: "Я пью кофе",
        acceptableAnswers: ["Я пью кофе", "Пью кофе"],
        hayqReward: 12 },
      { id: "e3", type: "multiple_choice",
        prompt: { en: "«Water» in Russian:", ru: "«Вода» по-английски?", hy: "Ռուսերեն" },
        targetAnswer: "Вода", acceptableAnswers: ["Вода"],
        options: ["Вода", "Сок", "Чай", "Кофе"], hayqReward: 8 },
      { id: "e4", type: "translate",
        prompt: { en: "Translate: «I want water»", ru: "Переведи", hy: "Թարգմանել" },
        targetAnswer: "Я хочу воды",
        acceptableAnswers: ["Я хочу воды", "Я хочу воду", "Мне нужна вода"],
        hayqReward: 12 },
    ]
  },
  {
    id: "enru_l4", unitId: "u1", cefr: "A1", difficulty: 1,
    title: { en: "Family", ru: "Семья", hy: "Ընտանիք" },
    description: { en: "Relatives", hy: "Հարազատներ", ru: "Родственники" },
    estimatedMinutes: 9, hayqTotal: 95,
    exercises: [
      { id: "e1", type: "multiple_choice",
        prompt: { en: "«Mother» in Russian:", ru: "«Мама» по-английски?", hy: "Ռուսերեն" },
        targetAnswer: "Мама", acceptableAnswers: ["Мама", "Мать"],
        options: ["Мама", "Папа", "Сестра", "Брат"], hayqReward: 8 },
      { id: "e2", type: "translate",
        prompt: { en: "Translate: «My father is a teacher»", ru: "Переведи", hy: "Թարգմանել" },
        targetAnswer: "Мой папа учитель",
        acceptableAnswers: ["Мой папа учитель", "Мой отец учитель", "Мой папа — учитель"],
        hayqReward: 15 },
      { id: "e3", type: "multiple_choice",
        prompt: { en: "«I have a sister» in Russian:", ru: "«У меня есть сестра» по-английски?", hy: "Ռուսերեն" },
        targetAnswer: "У меня есть сестра",
        acceptableAnswers: ["У меня есть сестра"],
        options: ["У меня есть сестра", "У меня есть брат", "Моя сестра дома", "Я люблю сестру"],
        hayqReward: 10 },
      { id: "e4", type: "word_order",
        prompt: { en: "Arrange Russian: «We are a friendly family»", ru: "Составь", hy: "Դասավորել" },
        targetAnswer: "Мы дружная семья",
        acceptableAnswers: ["Мы дружная семья", "Наша семья дружная"],
        words: ["Мы", "дружная", "семья"], hayqReward: 12 },
    ]
  },
  {
    id: "enru_l5", unitId: "u1", cefr: "A1", difficulty: 1,
    title: { en: "Numbers 1-10", ru: "Числа 1-10", hy: "Թվեր" },
    description: { en: "Places", hy: "Վայրեր", ru: "Места" },
    estimatedMinutes: 7, hayqTotal: 80,
    exercises: [
      { id: "e1", type: "multiple_choice",
        prompt: { en: "«One» in Russian:", ru: "«Один» по-английски?", hy: "Ռուսերեն" },
        targetAnswer: "Один", acceptableAnswers: ["Один", "1"],
        options: ["Один", "Два", "Три", "Четыре"], hayqReward: 6 },
      { id: "e2", type: "multiple_choice",
        prompt: { en: "«Five» in Russian:", ru: "«Пять» по-английски?", hy: "Ռուսերեն" },
        targetAnswer: "Пять", acceptableAnswers: ["Пять", "5"],
        options: ["Четыре", "Пять", "Шесть", "Семь"], hayqReward: 6 },
      { id: "e3", type: "translate",
        prompt: { en: "Translate: «I am ten years old»", ru: "Переведи", hy: "Թարգմանել" },
        targetAnswer: "Мне десять лет",
        acceptableAnswers: ["Мне десять лет", "Мне 10 лет", "Мне десять"],
        hayqReward: 12 },
      { id: "e4", type: "word_order",
        prompt: { en: "Arrange: «I have three books»", ru: "Составь", hy: "Դասավորել" },
        targetAnswer: "У меня три книги",
        acceptableAnswers: ["У меня три книги", "У меня есть три книги"],
        words: ["У", "меня", "три", "книги"], hayqReward: 10 },
    ]
  }
];

// ─── RU→EN (Russian speaker learns English) ────────────────────────────────

const RU_EN_LESSONS: MultiLesson[] = [
  {
    id: "ruen_l1", unitId: "u1",
    title: { ru: "Приветствие", hy: "Ողջույն", en: "Greetings" },
    description: { ru: "Английские приветствия", hy: "Անգլերեն ողջույններ", en: "English greetings" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "ruen_e1", type: "multiple_choice",
        prompt: { ru: "«Привет» по-английски:", en: "«Hello» in English:", hy: "«Բարև»-ը անգլերեն" },
        targetAnswer: "Hello", options: ["Hello", "Goodbye", "Sorry", "Please"] },
      { id: "ruen_e2", type: "translate",
        prompt: { ru: "Переведи на английский: «Как дела?»", en: "Translate to English", hy: "Թարգմանել" },
        targetAnswer: "How are you?", acceptableAnswers: ["How are you?", "How are you", "How r u"] },
      { id: "ruen_e3", type: "word_order",
        prompt: { ru: "Составь английскую фразу: «Я студент»", en: "Arrange English words", hy: "Դասավորել" },
        targetAnswer: "I am a student", words: ["I", "am", "a", "student"] },
      { id: "ruen_e4", type: "multiple_choice",
        prompt: { ru: "«Пожалуйста» по-английски:", en: "«Please» in English:", hy: "Անգլերեն" },
        targetAnswer: "Please", options: ["Please", "Thank you", "Sorry", "Hello"] },
    ]
  },
  {
    id: "ruen_l2", unitId: "u2",
    title: { ru: "Дом", hy: "Տուն", en: "Home" },
    description: { ru: "Где я живу", hy: "Որտեղ եմ ես ապրում", en: "Where I live" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "ruen_e5", type: "translate",
        prompt: { ru: "Переведи: «Я иду домой»", en: "Translate to English", hy: "Թարգմանել" },
        targetAnswer: "I am going home", acceptableAnswers: ["I am going home", "I'm going home", "I go home"] },
      { id: "ruen_e6", type: "multiple_choice",
        prompt: { ru: "«Дом» по-английски:", en: "«Home» in English:", hy: "«Տուն»-ը անգլերեն" },
        targetAnswer: "Home", options: ["Home", "School", "Car", "Work"] },
      { id: "ruen_e7", type: "translate",
        prompt: { ru: "Переведи: «Я живу в Ереване»", en: "Translate", hy: "Թարգմանել" },
        targetAnswer: "I live in Yerevan", acceptableAnswers: ["I live in Yerevan", "I'm living in Yerevan"] },
      { id: "ruen_e8", type: "word_order",
        prompt: { ru: "Составь: «Я люблю Армению»", en: "Arrange", hy: "Դասավորել" },
        targetAnswer: "I love Armenia", words: ["I", "love", "Armenia"] },
    ]
  },
  {
    id: "ruen_l3", unitId: "u2",
    title: { ru: "Семья", hy: "Ընտանիք", en: "Family" },
    description: { ru: "Мои родственники", hy: "Իմ հարազատները", en: "My relatives" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "ruen_e9", type: "multiple_choice",
        prompt: { ru: "«Мама» по-английски:", en: "«Mother» in English:", hy: "«Մայր»-ը անգլերեն" },
        targetAnswer: "Mother", options: ["Mother", "Father", "Sister", "Brother"] },
      { id: "ruen_e10", type: "translate",
        prompt: { ru: "Переведи: «Моя мама врач»", en: "Translate to English", hy: "Թարգմանել" },
        targetAnswer: "My mother is a doctor", acceptableAnswers: ["My mother is a doctor", "My mom is a doctor", "My mum is a doctor"] },
      { id: "ruen_e11", type: "multiple_choice",
        prompt: { ru: "«Брат» по-английски:", en: "«Brother» in English:", hy: "«Եղբայր»-ը անգլերեն" },
        targetAnswer: "Brother", options: ["Brother", "Sister", "Mother", "Father"] },
      { id: "ruen_e12", type: "translate",
        prompt: { ru: "Переведи: «У меня есть сестра»", en: "Translate", hy: "Թարգմանել" },
        targetAnswer: "I have a sister", acceptableAnswers: ["I have a sister", "I've got a sister"] },
    ]
  },
  { id: "ruen_l4", unitId: "u1", title: { ru: "Еда", hy: "Ուտելիք", en: "Food" }, description: { ru: "Продукты", hy: "Մթերքներ", en: "Products" }, estimatedMinutes: 6, hayqTotal: 60, exercises: [] },
  { id: "ruen_l5", unitId: "u2", title: { ru: "Спорт", hy: "Սպորտ", en: "Sport" }, description: { ru: "Игры", hy: "Խաղեր", en: "Games" }, estimatedMinutes: 5, hayqTotal: 50, exercises: [] }
];

import { generateCurriculumForPair } from '../content/generator';

export function getLessonsForPair(pair: LangPair): { units: MultiUnit[]; lessons: MultiLesson[] } {
  // 1. Generated lessons from content/database.ts (worlds + dynamic exercises)
  const generated = generateCurriculumForPair(pair);
  
  // 2. Legacy manually written lessons (if any)
  const map: Record<string, MultiLesson[]> = {
    "hy-en": HY_EN_LESSONS,
    "ru-hy": RU_HY_LESSONS,
    "en-hy": EN_HY_LESSONS,
    "hy-ru": HY_RU_LESSONS,
    "en-ru": EN_RU_LESSONS,
    "ru-en": RU_EN_LESSONS,
  };
  const legacyLessons = map[pair] || [];

  // Merge: generated first, then legacy (avoid duplicates by id)
  const seen = new Set(generated.lessons.map(l => l.id));
  const lessons = [...generated.lessons, ...legacyLessons.filter(l => !seen.has(l.id))];

  // Units: use generated units (which come from WORLDS) + fallback MULTI_UNITS
  const unitMap = new Map<string, MultiUnit>();
  for (const u of [...generated.units, ...MULTI_UNITS]) {
    if (!unitMap.has(u.id)) unitMap.set(u.id, u);
  }
  const units = Array.from(unitMap.values()).filter(u => lessons.some(l => l.unitId === u.id));

  return { units, lessons };
}

export function getLessonById(pair: LangPair, lessonId: string): MultiLesson | null {
  const { lessons } = getLessonsForPair(pair);
  return lessons.find(l => l.id === lessonId) || null;
}