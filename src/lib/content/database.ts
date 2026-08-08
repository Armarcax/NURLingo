/**
 * NUR Lingo — Unified Multilingual Content Database
 * Single source of truth for all worlds/lessons across all 6 learning directions.
 * Inspired by LingoHut topic progression; all content original.
 */

import type { LangCode } from "../i18n/multilingual";

export type Tri = Record<LangCode, string>;

export interface VocabItem {
  id: string;
  hy: string;
  en: string;
  ru: string;
  audioId?: string;   // 6-նիշանի կայուն ID, օրինակ "000001"
  notes?: string;
}

export interface PhraseItem {
  id: string;
  hy: string;
  en: string;
  ru: string;
  /** Optional alternative valid forms in each language (semantic). */
  alt?: Partial<Record<LangCode, string[]>>;
}

export interface DialogueTurn {
  speaker: "nurik" | "user";
  hy: string;
  en: string;
  ru: string;
}

export interface Dialogue {
  id: string;
  title: Tri;
  turns: DialogueTurn[];
}

export interface ContentLesson {
  id: string;          // e.g. "w1_l1"
  worldId: string;     // e.g. "w1"
  slug: string;        // "meeting-someone"
  title: Tri;
  concept: Tri;
  difficulty: "A1" | "A2" | "B1" | "B2";
  vocabulary: VocabItem[];
  phrases: PhraseItem[];
  dialogues: Dialogue[];
}

export interface World {
  id: string;
  title: Tri;
  description: Tri;
  iconEmoji: string;
  colorFrom: string;
  colorTo: string;
  lessons: string[];   // lesson ids
}

// ─── Helpers (compact builders) ──────────────────────────────────────────────

const v = (id: string, hy: string, en: string, ru: string): VocabItem => ({ id, hy, en, ru });
const p = (
  id: string,
  hy: string,
  en: string,
  ru: string,
  alt?: Partial<Record<LangCode, string[]>>
): PhraseItem => ({ id, hy, en, ru, alt });
const d = (id: string, title: Tri, turns: DialogueTurn[]): Dialogue => ({ id, title, turns });
const t = (
  speaker: "nurik" | "user",
  hy: string,
  en: string,
  ru: string
): DialogueTurn => ({ speaker, hy, en, ru });

// ─── Worlds ──────────────────────────────────────────────────────────────────

export const WORLDS: World[] = [
  {
    id: "w1",
    title: { en: "First Contact", hy: "Առաջին Հանդիպում", ru: "Первый Контакт" },
    description: {
      en: "Meet people, introduce yourself, talk about who you are.",
      hy: "Ծանոթացիր, ներկայացիր, պատմիր քո մասին։",
      ru: "Знакомьтесь, представляйтесь, рассказывайте о себе.",
    },
    iconEmoji: "👋",
    colorFrom: "#D90012",
    colorTo: "#8b0000",
    lessons: [
      "w1_l1", "w1_l2", "w1_l3", "w1_l4", "w1_l5",
      "w1_l6", "w1_l7", "w1_l8", "w1_l9", "w1_l10",
    ],
  },
  {
    id: "w2",
    title: { en: "Daily Life", hy: "Ամենօրյա Կյանք", ru: "Повседневная Жизнь" },
    description: {
      en: "Home, food, shopping, time, weather.",
      hy: "Տուն, սնունդ, գնումներ, ժամանակ, եղանակ։",
      ru: "Дом, еда, покупки, время, погода.",
    },
    iconEmoji: "🏠",
    colorFrom: "#0033A0",
    colorTo: "#001a6b",
    lessons: [
      "w2_l1", "w2_l2", "w2_l3", "w2_l4", "w2_l5",
      "w2_l6", "w2_l7", "w2_l8", "w2_l9", "w2_l10",
    ],
  },
  {
    id: "w3",
    title: { en: "Travel", hy: "Ճամփորդություն", ru: "Путешествия" },
    description: {
      en: "Airports, hotels, directions, emergencies.",
      hy: "Օդանավակայաններ, հյուրանոցներ, ուղղություններ, արտակարգ իրավիճակներ։",
      ru: "Аэропорты, отели, маршруты, экстренные ситуации.",
    },
    iconEmoji: "✈️",
    colorFrom: "#F2A800",
    colorTo: "#b07800",
    lessons: ["w3_l1", "w3_l2", "w3_l3", "w3_l4", "w3_l5", "w3_l6", "w3_l7", "w3_l8"],
  },
  {
    id: "w4",
    title: { en: "Education & Work", hy: "Կրթություն և Աշխատանք", ru: "Учёба и Работа" },
    description: {
      en: "School, university, office, professions, tech.",
      hy: "Դպրոց, համալսարան, գրասենյակ, մասնագիտություններ, տեխնոլոգիա։",
      ru: "Школа, университет, офис, профессии, технологии.",
    },
    iconEmoji: "📚",
    colorFrom: "#7C3AED",
    colorTo: "#4C1D95",
    lessons: ["w4_l1", "w4_l2", "w4_l3", "w4_l4", "w4_l5", "w4_l6"],
  },
  {
    id: "w5",
    title: { en: "Advanced Communication", hy: "Բարձր Մակարդակի Հաղորդակցում", ru: "Продвинутое Общение" },
    description: {
      en: "Opinions, emotions, storytelling, negotiation, culture.",
      hy: "Կարծիքներ, զգացմունքներ, պատմություն, բանակցություն, մշակույթ։",
      ru: "Мнения, эмоции, истории, переговоры, культура.",
    },
    iconEmoji: "💬",
    colorFrom: "#059669",
    colorTo: "#064E3B",
    lessons: ["w5_l1", "w5_l2", "w5_l3", "w5_l4", "w5_l5", "w5_l6"],
  },
  // ===== NEW WORLDS w6–w10 =====
  {
    id: "w6",
    title: { en: "Hobbies & Entertainment", hy: "Հոբբիներ և Ժամանց", ru: "Хобби и Развлечения" },
    description: {
      en: "Free time, sports, games, cinema.",
      hy: "Ազատ ժամանակ, սպորտ, խաղեր, կինո։",
      ru: "Свободное время, спорт, игры, кино.",
    },
    iconEmoji: "🎮",
    colorFrom: "#E91E63",
    colorTo: "#AD1457",
    lessons: ["w6_l1", "w6_l2", "w6_l3", "w6_l4", "w6_l5", "w6_l6", "w6_l7", "w6_l8", "w6_l9", "w6_l10"],
  },
  {
    id: "w7",
    title: { en: "Technology & Digital Life", hy: "Տեխնոլոգիա և Թվային Կյանք", ru: "Технологии и Цифровая Жизнь" },
    description: {
      en: "Computers, internet, social media, AI.",
      hy: "Համակարգիչներ, ինտերնետ, սոցցանցեր, AI։",
      ru: "Компьютеры, интернет, соцсети, ИИ.",
    },
    iconEmoji: "📱",
    colorFrom: "#2196F3",
    colorTo: "#0D47A1",
    lessons: ["w7_l1", "w7_l2", "w7_l3", "w7_l4", "w7_l5", "w7_l6", "w7_l7", "w7_l8", "w7_l9", "w7_l10"],
  },
  {
    id: "w8",
    title: { en: "Environment & Ecology", hy: "Շրջակա Միջավայր և Էկոլոգիա", ru: "Окружающая Среда и Экология" },
    description: {
      en: "Nature, climate, recycling, animals.",
      hy: "Բնություն, կլիմա, վերամշակում, կենդանիներ։",
      ru: "Природа, климат, переработка, животные.",
    },
    iconEmoji: "🌱",
    colorFrom: "#4CAF50",
    colorTo: "#1B5E20",
    lessons: ["w8_l1", "w8_l2", "w8_l3", "w8_l4", "w8_l5", "w8_l6", "w8_l7", "w8_l8", "w8_l9", "w8_l10"],
  },
  {
    id: "w9",
    title: { en: "Business & Finance", hy: "Բիզնես և Ֆինանսներ", ru: "Бизнес и Финансы" },
    description: {
      en: "Money, banking, negotiations, marketing.",
      hy: "Փող, բանկային գործ, բանակցություններ, մարքեթինգ։",
      ru: "Деньги, банковское дело, переговоры, маркетинг.",
    },
    iconEmoji: "💼",
    colorFrom: "#FF9800",
    colorTo: "#E65100",
    lessons: ["w9_l1", "w9_l2", "w9_l3", "w9_l4", "w9_l5", "w9_l6", "w9_l7", "w9_l8", "w9_l9", "w9_l10"],
  },
  {
    id: "w10",
    title: { en: "Art & Literature", hy: "Արվեստ և Գրականություն", ru: "Искусство и Литература" },
    description: {
      en: "Painting, music, books, poetry.",
      hy: "Նկարչություն, երաժշտություն, գրքեր, պոեզիա։",
      ru: "Живопись, музыка, книги, поэзия.",
    },
    iconEmoji: "🎨",
    colorFrom: "#9C27B0",
    colorTo: "#4A148C",
    lessons: ["w10_l1", "w10_l2", "w10_l3", "w10_l4", "w10_l5", "w10_l6", "w10_l7", "w10_l8", "w10_l9", "w10_l10"],
  },
];

// ─── Reusable shared vocab blocks (compact) ──────────────────────────────────

const NUMBERS_1_10: VocabItem[] = [
  v("num_1", "մեկ", "one", "один"),
  v("num_2", "երկու", "two", "два"),
  v("num_3", "երեք", "three", "три"),
  v("num_4", "չորս", "four", "четыре"),
  v("num_5", "հինգ", "five", "пять"),
  v("num_6", "վեց", "six", "шесть"),
  v("num_7", "յոթ", "seven", "семь"),
  v("num_8", "ութ", "eight", "восемь"),
  v("num_9", "ինը", "nine", "девять"),
  v("num_10", "տասը", "ten", "десять"),
];

// ─── Lessons ─────────────────────────────────────────────────────────────────

export const CONTENT_LESSONS: ContentLesson[] = [
  // ===== World 1: First Contact =====
  {
    id: "w1_l1", worldId: "w1", slug: "meeting-someone",
    title: { en: "Meeting Someone", hy: "Ծանոթություն", ru: "Знакомство" },
    concept: { en: "Greet and acknowledge a new person.", hy: "Ողջունել և ճանաչել նոր մարդու։", ru: "Поприветствовать нового человека." },
    difficulty: "A1",
    vocabulary: [
      v("greet_hello", "բարև", "hello", "привет"),
      v("greet_hi", "ողջույն", "hi", "здравствуй"),
      v("greet_morning", "բարի լույս", "good morning", "доброе утро"),
      v("greet_day", "բարի օր", "good day", "добрый день"),
      v("greet_evening", "բարի երեկո", "good evening", "добрый вечер"),
      v("greet_night", "բարի գիշեր", "good night", "спокойной ночи"),
      v("greet_bye", "ցտեսություն", "goodbye", "до свидания"),
      v("greet_seeyou", "կտեսնվենք", "see you", "увидимся"),
      v("greet_welcome", "բարի գալուստ", "welcome", "добро пожаловать"),
      v("greet_pleasure", "հաճելի է", "nice", "приятно"),
      v("greet_meet", "ծանոթանալ", "to meet", "познакомиться"),
      v("greet_name", "անուն", "name", "имя"),
      v("greet_friend", "ընկեր", "friend", "друг"),
      v("greet_mr", "պարոն", "mister", "господин"),
      v("greet_mrs", "տիկին", "missus", "госпожа"),
      v("greet_thanks", "շնորհակալություն", "thank you", "спасибо"),
      v("greet_please", "խնդրեմ", "please", "пожалуйста"),
      v("greet_sorry", "ներեցեք", "sorry", "извините"),
      v("greet_yes", "այո", "yes", "да"),
      v("greet_no", "ոչ", "no", "нет"),
      v("greet_how", "ինչպես", "how", "как"),
      v("greet_good", "լավ", "good", "хорошо"),
      v("greet_fine", "լավ եմ", "fine", "нормально"),
      v("greet_bad", "վատ", "bad", "плохо"),
      v("greet_okay", "լավ", "okay", "ладно"),
    ],
    phrases: [
      p("ph_w1l1_1", "Բարև, ինչպե՞ս ես։", "Hello, how are you?", "Привет, как дела?",
        { en: ["Hi, how are you?"], ru: ["Привет, как ты?"] }),
      p("ph_w1l1_2", "Շատ լավ, շնորհակալություն։", "Very well, thank you.", "Очень хорошо, спасибо.",
        { en: ["Great, thanks.", "I'm fine, thank you."] }),
      p("ph_w1l1_3", "Ինչպե՞ս է քո անունը։", "What is your name?", "Как тебя зовут?",
        { en: ["What's your name?"] }),
      p("ph_w1l1_4", "Իմ անունը Արամ է։", "My name is Aram.", "Меня зовут Арам.",
        { en: ["I'm Aram.", "I am Aram."] }),
      p("ph_w1l1_5", "Հաճելի է ծանոթանալ։", "Nice to meet you.", "Приятно познакомиться."),
      p("ph_w1l1_6", "Ինձ նույնպես։", "You too.", "Мне тоже.",
        { en: ["Me too.", "Same here."] }),
      p("ph_w1l1_7", "Բարի լույս։", "Good morning.", "Доброе утро."),
      p("ph_w1l1_8", "Բարի երեկո։", "Good evening.", "Добрый вечер."),
      p("ph_w1l1_9", "Ցտեսություն։", "Goodbye.", "До свидания.",
        { en: ["Bye."], ru: ["Пока."] }),
      p("ph_w1l1_10", "Կտեսնվենք վաղը։", "See you tomorrow.", "Увидимся завтра."),
      p("ph_w1l1_11", "Շնորհակալություն շատ։", "Thank you very much.", "Большое спасибо."),
      p("ph_w1l1_12", "Խնդրեմ։", "You're welcome.", "Пожалуйста."),
    ],
    dialogues: [
      d("dlg_w1l1_1",
        { en: "First Hello", hy: "Առաջին Բարև", ru: "Первое Приветствие" },
        [
          t("nurik", "Բարև։ Ինչպե՞ս ես։", "Hello! How are you?", "Привет! Как дела?"),
          t("user", "Բարև, լավ եմ։", "Hi, I'm fine.", "Привет, хорошо."),
          t("nurik", "Իմ անունը Նուրիկն է։ Իսկ քոնը՞։", "My name is Nurik. And yours?", "Меня зовут Нурик. А тебя?"),
          t("user", "Իմ անունը …", "My name is …", "Меня зовут …"),
          t("nurik", "Հաճելի է ծանոթանալ։", "Nice to meet you.", "Приятно познакомиться."),
        ]),
      d("dlg_w1l1_2",
        { en: "Morning Greeting", hy: "Առավոտյան Ողջույն", ru: "Утреннее Приветствие" },
        [
          t("nurik", "Բարի լույս։", "Good morning.", "Доброе утро."),
          t("user", "Բարի լույս, Նուրիկ։", "Good morning, Nurik.", "Доброе утро, Нурик."),
          t("nurik", "Ինչպե՞ս է քո օրը։", "How is your day?", "Как твой день?"),
          t("user", "Շատ լավ, շնորհակալություն։", "Very good, thank you.", "Очень хорошо, спасибо."),
        ]),
      d("dlg_w1l1_3",
        { en: "Saying Goodbye", hy: "Հրաժեշտ", ru: "Прощание" },
        [
          t("nurik", "Ես պետք է գնամ։", "I have to go.", "Мне пора идти."),
          t("user", "Լավ, ցտեսություն։", "Okay, goodbye.", "Хорошо, до свидания."),
          t("nurik", "Կտեսնվենք վաղը։", "See you tomorrow.", "Увидимся завтра."),
          t("user", "Բարի գիշեր։", "Good night.", "Спокойной ночи."),
        ]),
    ],
  },

  {
    id: "w1_l2", worldId: "w1", slug: "greetings",
    title: { en: "Greetings", hy: "Ողջույններ", ru: "Приветствия" },
    concept: { en: "Formal and informal greetings.", hy: "Պաշտոնական և ոչ պաշտոնական ողջույններ։", ru: "Формальные и неформальные приветствия." },
    difficulty: "A1",
    vocabulary: [
      v("g_formal", "պաշտոնական", "formal", "формальный"),
      v("g_informal", "ոչ պաշտոնական", "informal", "неформальный"),
      v("g_handshake", "ձեռքսեղմում", "handshake", "рукопожатие"),
      v("g_hug", "գրկախառնություն", "hug", "объятие"),
      v("g_kiss", "համբույր", "kiss", "поцелуй"),
      v("g_wave", "ձեռքով անել", "to wave", "махать"),
      v("g_smile", "ժպիտ", "smile", "улыбка"),
      v("g_polite", "քաղաքավարի", "polite", "вежливый"),
      v("g_rude", "կոպիտ", "rude", "грубый"),
      v("g_respect", "հարգանք", "respect", "уважение"),
      v("g_elder", "մեծահասակ", "elder", "старший"),
      v("g_young", "երիտասարդ", "young", "молодой"),
      v("g_stranger", "անծանոթ", "stranger", "незнакомец"),
      v("g_neighbor", "հարևան", "neighbor", "сосед"),
      v("g_colleague", "գործընկեր", "colleague", "коллега"),
      v("g_boss", "ղեկավար", "boss", "начальник"),
      v("g_guest", "հյուր", "guest", "гость"),
      v("g_host", "տանտեր", "host", "хозяин"),
      v("g_again", "նորից", "again", "снова"),
      v("g_long_time", "վաղուց", "long time", "давно"),
      v("g_how_are", "ինչպես ես", "how are you", "как ты"),
      v("g_what_news", "ի՞նչ նորություն", "what's new", "что нового"),
      v("g_take_care", "հոգ տար", "take care", "береги себя"),
      v("g_have_good", "բարի օր անցկացրու", "have a good day", "хорошего дня"),
      v("g_god_be", "Աստված հետդ", "God be with you", "с Богом"),
    ],
    phrases: [
      p("ph_w1l2_1", "Շատ վաղուց չենք տեսել իրար։", "Long time no see.", "Давно не виделись."),
      p("ph_w1l2_2", "Ի՞նչ նոր կա։", "What's new?", "Что нового?"),
      p("ph_w1l2_3", "Ամեն ինչ լավ է։", "Everything is good.", "Всё хорошо."),
      p("ph_w1l2_4", "Ուրախ եմ քեզ տեսնելու համար։", "I'm happy to see you.", "Рад тебя видеть."),
      p("ph_w1l2_5", "Բարի օր անցկացրու։", "Have a good day.", "Хорошего дня."),
      p("ph_w1l2_6", "Հոգ տար քեզ։", "Take care of yourself.", "Береги себя."),
      p("ph_w1l2_7", "Ողջունի՛ր ընտանիքին։", "Greet your family.", "Передавай привет семье."),
      p("ph_w1l2_8", "Շնորհակալ եմ, դու էլ։", "Thanks, you too.", "Спасибо, ты тоже."),
      p("ph_w1l2_9", "Մինչ հանդիպման։", "Until we meet.", "До встречи."),
      p("ph_w1l2_10", "Շնորհակալ եմ այցի համար։", "Thanks for visiting.", "Спасибо за визит."),
      p("ph_w1l2_11", "Բարի վերադարձ։", "Welcome back.", "С возвращением."),
      p("ph_w1l2_12", "Ինչպե՞ս է ընտանիքը։", "How is the family?", "Как семья?"),
    ],
    dialogues: [
      d("dlg_w1l2_1",
        { en: "Old Friends", hy: "Հին ընկերներ", ru: "Старые друзья" },
        [
          t("nurik", "Շատ վաղուց չենք տեսել իրար։", "Long time no see!", "Давно не виделись!"),
          t("user", "Այո, ճիշտ է։", "Yes, that's right.", "Да, точно."),
          t("nurik", "Ի՞նչ նոր կա։", "What's new?", "Что нового?"),
          t("user", "Ամեն ինչ լավ է, շնորհակալություն։", "Everything is good, thanks.", "Всё хорошо, спасибо."),
        ]),
      d("dlg_w1l2_2",
        { en: "Polite Goodbye", hy: "Քաղաքավարի Հրաժեշտ", ru: "Вежливое Прощание" },
        [
          t("nurik", "Բարի օր անցկացրու։", "Have a good day.", "Хорошего дня."),
          t("user", "Շնորհակալ եմ, դու էլ։", "Thanks, you too.", "Спасибо, ты тоже."),
          t("nurik", "Ողջունի՛ր ընտանիքին։", "Greet your family.", "Передавай привет семье."),
          t("user", "Անպայման։", "Definitely.", "Обязательно."),
        ]),
      d("dlg_w1l2_3",
        { en: "Meeting Again", hy: "Կրկին հանդիպում", ru: "Снова встретились" },
        [
          t("nurik", "Բարի վերադարձ։", "Welcome back.", "С возвращением."),
          t("user", "Շնորհակալություն։", "Thank you.", "Спасибо."),
          t("nurik", "Ինչպե՞ս ընտանիքը։", "How is the family?", "Как семья?"),
          t("user", "Բոլորը լավ են։", "Everyone is well.", "Все хорошо."),
        ]),
    ],
  },

  {
    id: "w1_l3", worldId: "w1", slug: "introductions",
    title: { en: "Introductions", hy: "Ներկայացում", ru: "Представления" },
    concept: { en: "Introduce yourself and others.", hy: "Ներկայացրու քեզ և ուրիշներին։", ru: "Представить себя и других." },
    difficulty: "A1",
    vocabulary: [
      v("i_i", "ես", "I", "я"),
      v("i_you", "դու", "you", "ты"),
      v("i_he", "նա", "he", "он"),
      v("i_she", "նա", "she", "она"),
      v("i_we", "մենք", "we", "мы"),
      v("i_they", "նրանք", "they", "они"),
      v("i_my", "իմ", "my", "мой"),
      v("i_your", "քո", "your", "твой"),
      v("i_his", "նրա", "his", "его"),
      v("i_her", "նրա", "her", "её"),
      v("i_name", "անուն", "name", "имя"),
      v("i_surname", "ազգանուն", "surname", "фамилия"),
      v("i_be", "լինել", "to be", "быть"),
      v("i_call", "կոչվել", "to be called", "называться"),
      v("i_introduce", "ներկայացնել", "to introduce", "представить"),
      v("i_this", "սա", "this", "это"),
      v("i_that", "դա", "that", "то"),
      v("i_person", "մարդ", "person", "человек"),
      v("i_man", "տղամարդ", "man", "мужчина"),
      v("i_woman", "կին", "woman", "женщина"),
      v("i_boy", "տղա", "boy", "мальчик"),
      v("i_girl", "աղջիկ", "girl", "девочка"),
      v("i_child", "երեխա", "child", "ребёнок"),
      v("i_student", "ուսանող", "student", "студент"),
      v("i_teacher", "ուսուցիչ", "teacher", "учитель"),
    ],
    phrases: [
      p("ph_w1l3_1", "Ես Արամ եմ։", "I am Aram.", "Я — Арам.",
        { en: ["I'm Aram.", "My name is Aram."] }),
      p("ph_w1l3_2", "Սա իմ ընկերն է։", "This is my friend.", "Это мой друг."),
      p("ph_w1l3_3", "Նրա անունը Անի է։", "Her name is Ani.", "Её зовут Ани."),
      p("ph_w1l3_4", "Թույլ տուր ներկայացնեմ։", "Let me introduce.", "Позволь представить."),
      p("ph_w1l3_5", "Ով ես դու։", "Who are you?", "Кто ты?"),
      p("ph_w1l3_6", "Ես ուսանող եմ։", "I am a student.", "Я студент."),
      p("ph_w1l3_7", "Իմ ազգանունը Պետրոսյան է։", "My surname is Petrosyan.", "Моя фамилия Петросян."),
      p("ph_w1l3_8", "Մենք ընկերներ ենք։", "We are friends.", "Мы друзья."),
      p("ph_w1l3_9", "Նա իմ եղբայրն է։", "He is my brother.", "Он мой брат."),
      p("ph_w1l3_10", "Ինչպե՞ս է քո ազգանունը։", "What is your surname?", "Какая твоя фамилия?"),
      p("ph_w1l3_11", "Հաճելի է ձեզ ճանաչել։", "Nice to know you.", "Приятно вас знать."),
      p("ph_w1l3_12", "Ես շատ ուրախ եմ։", "I am very happy.", "Я очень рад."),
    ],
    dialogues: [
      d("dlg_w1l3_1",
        { en: "Introducing a Friend", hy: "Ընկեր ներկայացնել", ru: "Представить друга" },
        [
          t("nurik", "Սա իմ ընկեր Արամն է։", "This is my friend Aram.", "Это мой друг Арам."),
          t("user", "Բարև, Արամ։ Հաճելի է։", "Hi, Aram. Nice to meet you.", "Привет, Арам. Приятно."),
          t("nurik", "Արամը ուսանող է։", "Aram is a student.", "Арам — студент."),
          t("user", "Ի՞նչ ես սովորում։", "What do you study?", "Что ты изучаешь?"),
        ]),
      d("dlg_w1l3_2",
        { en: "Who Are You?", hy: "Ով ես դու", ru: "Кто ты" },
        [
          t("nurik", "Ով ես դու։", "Who are you?", "Кто ты?"),
          t("user", "Ես … եմ։", "I am ….", "Я ...."),
          t("nurik", "Ի՞նչ է քո ազգանունը։", "What is your surname?", "Какая твоя фамилия?"),
          t("user", "Իմ ազգանունը … է։", "My surname is ….", "Моя фамилия ...."),
        ]),
      d("dlg_w1l3_3",
        { en: "Family Member", hy: "Ընտանիքի անդամ", ru: "Член семьи" },
        [
          t("nurik", "Սա ո՞վ է։", "Who is this?", "Кто это?"),
          t("user", "Սա իմ եղբայրն է։", "This is my brother.", "Это мой брат."),
          t("nurik", "Ի՞նչ է նրա անունը։", "What is his name?", "Как его зовут?"),
          t("user", "Նրա անունը … է։", "His name is ….", "Его зовут ...."),
        ]),
    ],
  },

  // (Lessons 4–10 of World 1, plus all of W2–W5, use a compact builder below to stay efficient)
];

// ─── Compact builder for remaining lessons ───────────────────────────────────
//
// To keep the file readable while still meeting the 20+ vocab / 10+ phrases /
// 3 dialogues requirement, the remaining lessons are constructed from compact
// trilingual arrays via the helper below.

interface QuickLesson {
  id: string;
  worldId: string;
  slug: string;
  title: Tri;
  concept: Tri;
  difficulty: "A1" | "A2" | "B1" | "B2";
  vocab: Array<[hy: string, en: string, ru: string]>;
  phrases: Array<[hy: string, en: string, ru: string, altEn?: string[]]>;
  dialogues: Array<{ title: Tri; turns: Array<[speaker: "nurik" | "user", hy: string, en: string, ru: string]> }>;
}

function expand(q: QuickLesson): ContentLesson {
  return {
    id: q.id, worldId: q.worldId, slug: q.slug,
    title: q.title, concept: q.concept, difficulty: q.difficulty,
    vocabulary: q.vocab.map(([h, e, r], i) => v(`${q.id}_v${i}`, h, e, r)),
    phrases: q.phrases.map(([h, e, r, altEn], i) =>
      p(`${q.id}_p${i}`, h, e, r, altEn ? { en: altEn } : undefined)
    ),
    dialogues: q.dialogues.map((dl, i) => d(`${q.id}_d${i}`, dl.title,
      dl.turns.map(([s, h, e, r]) => t(s, h, e, r))
    )),
  };
}

const QUICK_LESSONS: QuickLesson[] = [
  // ===== World 1: lessons 4–10 =====
  {
    id: "w1_l4", worldId: "w1", slug: "countries", difficulty: "A1",
    title: { en: "Countries", hy: "Երկրներ", ru: "Страны" },
    concept: { en: "Names of countries.", hy: "Երկրների անունները։", ru: "Названия стран." },
    vocab: [
      ["Հայաստան", "Armenia", "Армения"], ["Ռուսաստան", "Russia", "Россия"],
      ["Ամերիկա", "America", "Америка"], ["Անգլիա", "England", "Англия"],
      ["Ֆրանսիա", "France", "Франция"], ["Գերմանիա", "Germany", "Германия"],
      ["Իտալիա", "Italy", "Италия"], ["Իսպանիա", "Spain", "Испания"],
      ["Չինաստան", "China", "Китай"], ["Ճապոնիա", "Japan", "Япония"],
      ["Հնդկաստան", "India", "Индия"], ["Բրազիլիա", "Brazil", "Бразилия"],
      ["Թուրքիա", "Turkey", "Турция"], ["Իրան", "Iran", "Иран"],
      ["Վրաստան", "Georgia", "Грузия"], ["Ուկրաինա", "Ukraine", "Украина"],
      ["Կանադա", "Canada", "Канада"], ["Մեքսիկա", "Mexico", "Мексика"],
      ["Հունաստան", "Greece", "Греция"], ["Եգիպտոս", "Egypt", "Египет"],
      ["երկիր", "country", "страна"], ["մայրաքաղաք", "capital", "столица"],
      ["քաղաք", "city", "город"], ["գյուղ", "village", "деревня"],
      ["աշխարհ", "world", "мир"],
    ],
    phrases: [
      ["Ես Հայաստանից եմ։", "I am from Armenia.", "Я из Армении.", ["I'm from Armenia."]],
      ["Որտեղի՞ց ես։", "Where are you from?", "Откуда ты?"],
      ["Ես ապրում եմ Երևանում։", "I live in Yerevan.", "Я живу в Ереване."],
      ["Մայրաքաղաքը Երևանն է։", "The capital is Yerevan.", "Столица — Ереван."],
      ["Ո՞ր երկրից ես։", "Which country are you from?", "Из какой ты страны?"],
      ["Դա գեղեցիկ երկիր է։", "It is a beautiful country.", "Это красивая страна."],
      ["Ես երբեք չեմ եղել Ճապոնիայում։", "I have never been to Japan.", "Я никогда не был в Японии."],
      ["Ուզում եմ այցելել Իտալիա։", "I want to visit Italy.", "Я хочу посетить Италию."],
      ["Իմ ընտանիքը Ռուսաստանում է։", "My family is in Russia.", "Моя семья в России."],
      ["Մեր քաղաքը մեծ է։", "Our city is big.", "Наш город большой."],
      ["Որտե՞ղ է գտնվում Հայաստանը։", "Where is Armenia located?", "Где находится Армения?"],
      ["Հայաստանը Կովկասում է։", "Armenia is in the Caucasus.", "Армения на Кавказе."],
    ],
    dialogues: [
      { title: { en: "Where From", hy: "Որտեղից", ru: "Откуда" }, turns: [
        ["nurik", "Որտեղի՞ց ես։", "Where are you from?", "Откуда ты?"],
        ["user", "Ես Հայաստանից եմ։", "I am from Armenia.", "Я из Армении."],
        ["nurik", "Որ քաղաքից։", "From which city?", "Из какого города?"],
        ["user", "Երևանից։", "From Yerevan.", "Из Еревана."],
      ]},
      { title: { en: "Travel Plans", hy: "Ճամփորդական ծրագրեր", ru: "Планы поездок" }, turns: [
        ["nurik", "Ուր ես ուզում գնալ։", "Where do you want to go?", "Куда ты хочешь поехать?"],
        ["user", "Ուզում եմ այցելել Իտալիա։", "I want to visit Italy.", "Я хочу посетить Италию."],
        ["nurik", "Ինչու։", "Why?", "Почему?"],
        ["user", "Որովհետև գեղեցիկ է։", "Because it is beautiful.", "Потому что красиво."],
      ]},
      { title: { en: "Capital City", hy: "Մայրաքաղաք", ru: "Столица" }, turns: [
        ["nurik", "Ինչ է Հայաստանի մայրաքաղաքը։", "What is the capital of Armenia?", "Какая столица Армении?"],
        ["user", "Երևանը։", "Yerevan.", "Ереван."],
        ["nurik", "Ճիշտ է։ Իսկ Ֆրանսիայի՞։", "Correct. And France's?", "Верно. А Франции?"],
        ["user", "Փարիզը։", "Paris.", "Париж."],
      ]},
    ],
  },
  {
    id: "w1_l5", worldId: "w1", slug: "nationalities", difficulty: "A1",
    title: { en: "Nationalities", hy: "Ազգություններ", ru: "Национальности" },
    concept: { en: "Talk about where people are from.", hy: "Խոսել մարդկանց ծագման մասին։", ru: "Говорить о происхождении людей." },
    vocab: [
      ["հայ", "Armenian", "армянин"], ["ռուս", "Russian", "русский"],
      ["ամերիկացի", "American", "американец"], ["անգլիացի", "English", "англичанин"],
      ["ֆրանսիացի", "French", "француз"], ["գերմանացի", "German", "немец"],
      ["իտալացի", "Italian", "итальянец"], ["իսպանացի", "Spanish", "испанец"],
      ["չինացի", "Chinese", "китаец"], ["ճապոնացի", "Japanese", "японец"],
      ["հնդիկ", "Indian", "индиец"], ["թուրք", "Turkish", "турок"],
      ["իրանցի", "Iranian", "иранец"], ["վրացի", "Georgian", "грузин"],
      ["ուկրաինացի", "Ukrainian", "украинец"], ["կանադացի", "Canadian", "канадец"],
      ["հույն", "Greek", "грек"], ["եգիպտացի", "Egyptian", "египтянин"],
      ["ազգություն", "nationality", "национальность"], ["ծագում", "origin", "происхождение"],
      ["քաղաքացի", "citizen", "гражданин"], ["անձնագիր", "passport", "паспорт"],
      ["ընտանիք", "family", "семья"], ["լեզու", "language", "язык"],
      ["մշակույթ", "culture", "культура"],
    ],
    phrases: [
      ["Ես հայ եմ։", "I am Armenian.", "Я армянин.", ["I'm Armenian."]],
      ["Դու ո՞ր ազգությանն ես։", "What is your nationality?", "Какая твоя национальность?"],
      ["Իմ ընտանիքը ռուսներ են։", "My family are Russians.", "Моя семья — русские."],
      ["Նա ֆրանսիացի է։", "He is French.", "Он француз."],
      ["Մենք հայեր ենք։", "We are Armenians.", "Мы армяне."],
      ["Հպարտ եմ իմ ծագմամբ։", "I am proud of my origin.", "Я горжусь своим происхождением."],
      ["Իմ ընկերն ամերիկացի է։", "My friend is American.", "Мой друг — американец."],
      ["Նա խոսում է երկու լեզվով։", "She speaks two languages.", "Она говорит на двух языках."],
      ["Մենք տարբեր մշակույթներից ենք։", "We are from different cultures.", "Мы из разных культур."],
      ["Քո անձնագիրը որտե՞ղ է։", "Where is your passport?", "Где твой паспорт?"],
      ["Ես երկու երկրի քաղաքացի եմ։", "I am a citizen of two countries.", "Я гражданин двух стран."],
      ["Հայերը հնագույն ժողովուրդ են։", "Armenians are an ancient people.", "Армяне — древний народ."],
    ],
    dialogues: [
      { title: { en: "Are You Armenian?", hy: "Հայ ե՞ս", ru: "Ты армянин?" }, turns: [
        ["nurik", "Հայ ե՞ս։", "Are you Armenian?", "Ты армянин?"],
        ["user", "Այո, ես հայ եմ։", "Yes, I am Armenian.", "Да, я армянин."],
        ["nurik", "Որտեղ ես ծնվել։", "Where were you born?", "Где ты родился?"],
        ["user", "Երևանում։", "In Yerevan.", "В Ереване."],
      ]},
      { title: { en: "Mixed Family", hy: "Խառը ընտանիք", ru: "Смешанная семья" }, turns: [
        ["nurik", "Քո ընտանիքն ո՞ր ազգությունից է։", "What nationality is your family?", "Какой национальности твоя семья?"],
        ["user", "Հայր հայ է, մայր ռուս է։", "Father is Armenian, mother is Russian.", "Отец армянин, мать русская."],
        ["nurik", "Որքա՜ն հետաքրքիր։", "How interesting!", "Как интересно!"],
        ["user", "Այո, երկու մշակույթ ունեմ։", "Yes, I have two cultures.", "Да, у меня две культуры."],
      ]},
      { title: { en: "New Friend", hy: "Նոր ընկեր", ru: "Новый друг" }, turns: [
        ["nurik", "Իմ նոր ընկերն ֆրանսիացի է։", "My new friend is French.", "Мой новый друг — француз."],
        ["user", "Նա խոսո՞ւմ է հայերեն։", "Does he speak Armenian?", "Он говорит по-армянски?"],
        ["nurik", "Մի քիչ։", "A little.", "Немного."],
        ["user", "Հիանալի։", "Excellent.", "Отлично."],
      ]},
    ],
  },
  {
    id: "w1_l6", worldId: "w1", slug: "languages", difficulty: "A1",
    title: { en: "Languages", hy: "Լեզուներ", ru: "Языки" },
    concept: { en: "Talk about languages you speak.", hy: "Խոսել քո լեզուների մասին։", ru: "Говорить о языках, которыми владеете." },
    vocab: [
      ["հայերեն", "Armenian (language)", "армянский"], ["ռուսերեն", "Russian (language)", "русский"],
      ["անգլերեն", "English", "английский"], ["ֆրանսերեն", "French", "французский"],
      ["գերմաներեն", "German", "немецкий"], ["իտալերեն", "Italian", "итальянский"],
      ["իսպաներեն", "Spanish", "испанский"], ["չինարեն", "Chinese", "китайский"],
      ["ճապոներեն", "Japanese", "японский"], ["արաբերեն", "Arabic", "арабский"],
      ["խոսել", "to speak", "говорить"], ["հասկանալ", "to understand", "понимать"],
      ["կարդալ", "to read", "читать"], ["գրել", "to write", "писать"],
      ["սովորել", "to learn", "учить"], ["բառ", "word", "слово"],
      ["նախադասություն", "sentence", "предложение"], ["քերականություն", "grammar", "грамматика"],
      ["արտասանություն", "pronunciation", "произношение"], ["բառարան", "dictionary", "словарь"],
      ["մայրենի", "native", "родной"], ["օտար", "foreign", "иностранный"],
      ["հեշտ", "easy", "лёгкий"], ["դժվար", "difficult", "трудный"],
      ["պրակտիկա", "practice", "практика"],
    ],
    phrases: [
      ["Ես խոսում եմ հայերեն։", "I speak Armenian.", "Я говорю по-армянски."],
      ["Ի՞նչ լեզուներ գիտես։", "What languages do you know?", "Какие языки ты знаешь?"],
      ["Ես սովորում եմ ռուսերեն։", "I am learning Russian.", "Я учу русский."],
      ["Հասկանու՞մ ես ինձ։", "Do you understand me?", "Ты меня понимаешь?"],
      ["Մի քիչ խոսում եմ անգլերեն։", "I speak a little English.", "Я немного говорю по-английски."],
      ["Կրկնի՛ր խնդրեմ։", "Please repeat.", "Повтори, пожалуйста."],
      ["Ինչպե՞ս է սա ասվում հայերեն։", "How do you say this in Armenian?", "Как это сказать по-армянски?"],
      ["Իմ մայրենին հայերենն է։", "My native language is Armenian.", "Мой родной язык — армянский."],
      ["Հայերենը դժվար է։", "Armenian is difficult.", "Армянский трудный."],
      ["Բայց հետաքրքիր է։", "But interesting.", "Но интересно."],
      ["Կարդա՛ դանդաղ։", "Read slowly.", "Читай медленно."],
      ["Գրի՛ր այս բառը։", "Write this word.", "Напиши это слово."],
    ],
    dialogues: [
      { title: { en: "Speaking Languages", hy: "Լեզուներ խոսել", ru: "Говорить на языках" }, turns: [
        ["nurik", "Ի՞նչ լեզուներ գիտես։", "What languages do you know?", "Какие языки ты знаешь?"],
        ["user", "Հայերեն և անգլերեն։", "Armenian and English.", "Армянский и английский."],
        ["nurik", "Ռուսերեն խոսու՞մ ես։", "Do you speak Russian?", "Говоришь по-русски?"],
        ["user", "Մի քիչ։", "A little.", "Немного."],
      ]},
      { title: { en: "Learning a Language", hy: "Լեզու սովորել", ru: "Учить язык" }, turns: [
        ["nurik", "Ի՞նչ ես սովորում։", "What are you learning?", "Что ты учишь?"],
        ["user", "Սովորում եմ ճապոներեն։", "I am learning Japanese.", "Я учу японский."],
        ["nurik", "Դժվա՞ր է։", "Is it difficult?", "Трудно?"],
        ["user", "Այո, բայց հետաքրքիր է։", "Yes, but interesting.", "Да, но интересно."],
      ]},
      { title: { en: "Practice", hy: "Պրակտիկա", ru: "Практика" }, turns: [
        ["nurik", "Ինչպե՞ս ես սովորում։", "How do you learn?", "Как ты учишь?"],
        ["user", "Կարդում եմ ամեն օր։", "I read every day.", "Я читаю каждый день."],
        ["nurik", "Հիանալի։", "Excellent.", "Отлично."],
        ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
      ]},
    ],
  },
  {
    id: "w1_l7", worldId: "w1", slug: "age", difficulty: "A1",
    title: { en: "Age", hy: "Տարիք", ru: "Возраст" },
    concept: { en: "Ask and tell ages.", hy: "Հարցնել ու ասել տարիքը։", ru: "Спрашивать и говорить о возрасте." },
    vocab: [
      ...NUMBERS_1_10.map(x => [x.hy, x.en, x.ru] as [string, string, string]),
      ["քսան", "twenty", "двадцать"], ["երեսուն", "thirty", "тридцать"],
      ["քառասուն", "forty", "сорок"], ["հիսուն", "fifty", "пятьдесят"],
      ["վաթսուն", "sixty", "шестьдесят"], ["յոթանասուն", "seventy", "семьдесят"],
      ["ութսուն", "eighty", "восемьдесят"], ["իննսուն", "ninety", "девяносто"],
      ["հարյուր", "hundred", "сто"], ["տարի", "year", "год"],
      ["տարեկան", "years old", "лет"], ["ծնունդ", "birthday", "день рождения"],
      ["երիտասարդ", "young", "молодой"], ["մեծ", "old/big", "старый/большой"],
      ["փոքր", "small/young", "маленький/молодой"],
    ],
    phrases: [
      ["Քանի՞ տարեկան ես։", "How old are you?", "Сколько тебе лет?"],
      ["Ես երեսուն տարեկան եմ։", "I am thirty years old.", "Мне тридцать лет.", ["I'm thirty.", "I'm 30."]],
      ["Իմ եղբայրը տասը տարեկան է։", "My brother is ten.", "Моему брату десять."],
      ["Շնորհավոր ծնունդդ։", "Happy birthday.", "С днём рождения."],
      ["Ե՞րբ է քո ծնունդը։", "When is your birthday?", "Когда твой день рождения?"],
      ["Իմ ծնունդը մարտին է։", "My birthday is in March.", "Мой день рождения в марте."],
      ["Մենք նույն տարեկից ենք։", "We are the same age.", "Мы одного возраста."],
      ["Նա ինձնից մեծ է։", "She is older than me.", "Она старше меня."],
      ["Ես նրանից փոքր եմ։", "I am younger than him.", "Я младше его."],
      ["Քանի՞ տարեկան է քո մայրը։", "How old is your mother?", "Сколько лет твоей маме?"],
      ["Նա հիսուն տարեկան է։", "She is fifty.", "Ей пятьдесят."],
      ["Դեռ երիտասարդ եմ։", "I am still young.", "Я ещё молод."],
    ],
    dialogues: [
      { title: { en: "How Old?", hy: "Քանի տարեկան", ru: "Сколько лет" }, turns: [
        ["nurik", "Քանի՞ տարեկան ես։", "How old are you?", "Сколько тебе лет?"],
        ["user", "Ես քսանհինգ տարեկան եմ։", "I am twenty-five.", "Мне двадцать пять."],
        ["nurik", "Իսկ քո եղբայրը։", "And your brother?", "А твой брат?"],
        ["user", "Նա քսան տարեկան է։", "He is twenty.", "Ему двадцать."],
      ]},
      { title: { en: "Birthday", hy: "Ծնունդ", ru: "День рождения" }, turns: [
        ["nurik", "Ե՞րբ է քո ծնունդը։", "When is your birthday?", "Когда твой день рождения?"],
        ["user", "Մարտի տասին։", "March tenth.", "Десятого марта."],
        ["nurik", "Շնորհավոր նախապես։", "Happy birthday in advance.", "С днём рождения заранее."],
        ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
      ]},
      { title: { en: "Family Ages", hy: "Ընտանիքի տարիքները", ru: "Возраст семьи" }, turns: [
        ["nurik", "Քանի՞ տարեկան է մայրդ։", "How old is your mother?", "Сколько лет твоей маме?"],
        ["user", "Նա հիսուն տարեկան է։", "She is fifty.", "Ей пятьдесят."],
        ["nurik", "Իսկ հայրդ։", "And your father?", "А отец?"],
        ["user", "Հիսուներեք։", "Fifty-three.", "Пятьдесят три."],
      ]},
    ],
  },
  {
    id: "w1_l8", worldId: "w1", slug: "family", difficulty: "A1",
    title: { en: "Family", hy: "Ընտանիք", ru: "Семья" },
    concept: { en: "Family members and relations.", hy: "Ընտանիքի անդամներ։", ru: "Члены семьи." },
    vocab: [
      ["մայր", "mother", "мать"], ["հայր", "father", "отец"],
      ["քույր", "sister", "сестра"], ["եղբայր", "brother", "брат"],
      ["որդի", "son", "сын"], ["դուստր", "daughter", "дочь"],
      ["տատիկ", "grandmother", "бабушка"], ["պապիկ", "grandfather", "дедушка"],
      ["հորեղբայր", "uncle (paternal)", "дядя"], ["մորեղբայր", "uncle (maternal)", "дядя"],
      ["հորաքույր", "aunt (paternal)", "тётя"], ["մորաքույր", "aunt (maternal)", "тётя"],
      ["զարմիկ", "cousin (m)", "двоюродный брат"], ["զարմուհի", "cousin (f)", "двоюродная сестра"],
      ["ամուսին", "husband", "муж"], ["կին", "wife", "жена"],
      ["երեխա", "child", "ребёнок"], ["երեխաներ", "children", "дети"],
      ["ընտանիք", "family", "семья"], ["հարազատ", "relative", "родственник"],
      ["փոքր", "younger", "младший"], ["մեծ", "older", "старший"],
      ["միակ", "only", "единственный"], ["երկվորյակ", "twin", "близнец"],
      ["ամուսնացած", "married", "женат/замужем"],
    ],
    phrases: [
      ["Ունե՞ս ընտանիք։", "Do you have a family?", "У тебя есть семья?"],
      ["Ունեմ մի քույր և մի եղբայր։", "I have one sister and one brother.", "У меня одна сестра и один брат."],
      ["Իմ մայրը ուսուցիչ է։", "My mother is a teacher.", "Моя мама — учительница."],
      ["Իմ հայրը բժիշկ է։", "My father is a doctor.", "Мой отец — врач."],
      ["Մենք մեծ ընտանիք ենք։", "We are a big family.", "Мы большая семья."],
      ["Իմ տատիկը ապրում է գյուղում։", "My grandmother lives in a village.", "Моя бабушка живёт в деревне."],
      ["Քանի՞ եղբայր ունես։", "How many brothers do you have?", "Сколько у тебя братьев?"],
      ["Ես միակ երեխան եմ։", "I am the only child.", "Я единственный ребёнок."],
      ["Իմ քույրը ամուսնացած է։", "My sister is married.", "Моя сестра замужем."],
      ["Մենք երկվորյակ ենք։", "We are twins.", "Мы близнецы."],
      ["Իմ զարմիկները շատ են։", "I have many cousins.", "У меня много двоюродных братьев."],
      ["Սիրում եմ իմ ընտանիքին։", "I love my family.", "Я люблю свою семью."],
    ],
    dialogues: [
      { title: { en: "Family Size", hy: "Ընտանիքի մեծությունը", ru: "Размер семьи" }, turns: [
        ["nurik", "Քանի՞ մարդ կա քո ընտանիքում։", "How many people are in your family?", "Сколько человек в твоей семье?"],
        ["user", "Հինգ։ Մայր, հայր, երկու քույր և ես։", "Five. Mother, father, two sisters, and me.", "Пятеро. Мама, папа, две сестры и я."],
        ["nurik", "Մեծ ընտանիք է։", "Big family.", "Большая семья."],
        ["user", "Այո, ես երջանիկ եմ։", "Yes, I am happy.", "Да, я счастлив."],
      ]},
      { title: { en: "Parents", hy: "Ծնողներ", ru: "Родители" }, turns: [
        ["nurik", "Ինչով են զբաղվում քո ծնողները։", "What do your parents do?", "Чем занимаются твои родители?"],
        ["user", "Մայրը ուսուցիչ է, հայրը բժիշկ։", "Mother is a teacher, father a doctor.", "Мама учительница, отец врач."],
        ["nurik", "Հիանալի։", "Excellent.", "Замечательно."],
        ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
      ]},
      { title: { en: "Grandparents", hy: "Տատիկ-պապիկ", ru: "Бабушка и дедушка" }, turns: [
        ["nurik", "Ապրում ե՞ն տատիկդ ու պապիկդ։", "Are your grandparents alive?", "Твои бабушка и дедушка живы?"],
        ["user", "Այո, գյուղում։", "Yes, in the village.", "Да, в деревне."],
        ["nurik", "Հաճա՞խ ես այցելում։", "Do you visit often?", "Часто навещаешь?"],
        ["user", "Ամեն ամառ։", "Every summer.", "Каждое лето."],
      ]},
    ],
  },
  {
    id: "w1_l9", worldId: "w1", slug: "friends", difficulty: "A1",
    title: { en: "Friends", hy: "Ընկերներ", ru: "Друзья" },
    concept: { en: "Talk about friends.", hy: "Խոսել ընկերների մասին։", ru: "Говорить о друзьях." },
    vocab: [
      ["ընկեր", "friend (m)", "друг"], ["ընկերուհի", "friend (f)", "подруга"],
      ["լավագույն", "best", "лучший"], ["մտերիմ", "close", "близкий"],
      ["հին", "old", "старый"], ["նոր", "new", "новый"],
      ["հանդիպել", "to meet", "встретить"], ["զանգել", "to call", "звонить"],
      ["գրել", "to write", "писать"], ["հաղորդակցվել", "to communicate", "общаться"],
      ["խոսել", "to talk", "разговаривать"], ["խաղալ", "to play", "играть"],
      ["քայլել", "to walk", "гулять"], ["ծիծաղել", "to laugh", "смеяться"],
      ["զվարճանալ", "to have fun", "веселиться"], ["վստահել", "to trust", "доверять"],
      ["աջակցել", "to support", "поддерживать"], ["բարի", "kind", "добрый"],
      ["հավատարիմ", "loyal", "верный"], ["հետաքրքիր", "interesting", "интересный"],
      ["զվարճալի", "funny", "смешной"], ["հանգիստ", "calm", "спокойный"],
      ["աղմկոտ", "noisy", "шумный"], ["ընկերություն", "friendship", "дружба"],
      ["հանդիպում", "meeting", "встреча"],
    ],
    phrases: [
      ["Իմ լավագույն ընկերը Արամն է։", "My best friend is Aram.", "Мой лучший друг — Арам."],
      ["Մենք վաղուց ենք ընկերներ։", "We have been friends for a long time.", "Мы давно дружим."],
      ["Հաճախ ենք հանդիպում։", "We meet often.", "Мы часто встречаемся."],
      ["Նա շատ հավատարիմ ընկեր է։", "He is a very loyal friend.", "Он очень верный друг."],
      ["Ուզու՞մ ես իմ ընկեր լինել։", "Do you want to be my friend?", "Хочешь быть моим другом?"],
      ["Շատ ընկերներ ունեմ։", "I have many friends.", "У меня много друзей."],
      ["Մենք միասին զվարճանում ենք։", "We have fun together.", "Мы вместе веселимся."],
      ["Զանգի՛ր ինձ վաղը։", "Call me tomorrow.", "Позвони мне завтра."],
      ["Գրի՛ր նրան։", "Write to him.", "Напиши ему."],
      ["Ընկերությունը կարևոր է։", "Friendship is important.", "Дружба важна."],
      ["Ես նրան վստահում եմ։", "I trust him.", "Я ему доверяю."],
      ["Մենք միասին ենք դպրոցում։", "We are together at school.", "Мы вместе в школе."],
    ],
    dialogues: [
      { title: { en: "Best Friend", hy: "Լավագույն ընկեր", ru: "Лучший друг" }, turns: [
        ["nurik", "Ով է քո լավագույն ընկերը։", "Who is your best friend?", "Кто твой лучший друг?"],
        ["user", "Իմ լավագույն ընկերը Արամն է։", "My best friend is Aram.", "Мой лучший друг — Арам."],
        ["nurik", "Որքա՞ն վաղուց եք ընկերներ։", "How long have you been friends?", "Как давно дружите?"],
        ["user", "Տասը տարի։", "Ten years.", "Десять лет."],
      ]},
      { title: { en: "Meeting Up", hy: "Հանդիպել", ru: "Встретиться" }, turns: [
        ["nurik", "Ե՞րբ ենք հանդիպելու։", "When are we meeting?", "Когда встретимся?"],
        ["user", "Շաբաթ օրը։", "On Saturday.", "В субботу."],
        ["nurik", "Որտե՞ղ։", "Where?", "Где?"],
        ["user", "Սրճարանում։", "At the café.", "В кафе."],
      ]},
      { title: { en: "New Friend", hy: "Նոր ընկեր", ru: "Новый друг" }, turns: [
        ["nurik", "Նոր ընկերներ ունե՞ս։", "Do you have new friends?", "У тебя есть новые друзья?"],
        ["user", "Այո, դպրոցում։", "Yes, at school.", "Да, в школе."],
        ["nurik", "Հիանալի։", "Excellent.", "Отлично."],
        ["user", "Շատ բարի մարդիկ են։", "Very kind people.", "Очень добрые люди."],
      ]},
    ],
  },
  {
    id: "w1_l10", worldId: "w1", slug: "occupations", difficulty: "A1",
    title: { en: "Occupations", hy: "Մասնագիտություններ", ru: "Профессии" },
    concept: { en: "Jobs and professions.", hy: "Աշխատանք և մասնագիտություն։", ru: "Работа и профессии." },
    vocab: [
      ["բժիշկ", "doctor", "врач"], ["ուսուցիչ", "teacher", "учитель"],
      ["ինժեներ", "engineer", "инженер"], ["ծրագրավորող", "programmer", "программист"],
      ["լրագրող", "journalist", "журналист"], ["իրավաբան", "lawyer", "юрист"],
      ["արտիստ", "artist", "артист"], ["երաժիշտ", "musician", "музыкант"],
      ["խոհարար", "cook", "повар"], ["մատուցող", "waiter", "официант"],
      ["վարորդ", "driver", "водитель"], ["ոստիկան", "policeman", "полицейский"],
      ["զինվոր", "soldier", "солдат"], ["քարտուղարուհի", "secretary", "секретарь"],
      ["մենեջեր", "manager", "менеджер"], ["տնօրեն", "director", "директор"],
      ["գիտնական", "scientist", "учёный"], ["բուժքույր", "nurse", "медсестра"],
      ["ճարտարապետ", "architect", "архитектор"], ["լուսանկարիչ", "photographer", "фотограф"],
      ["աշխատանք", "work", "работа"], ["մասնագիտություն", "profession", "профессия"],
      ["գործ", "job", "дело"], ["աշխատել", "to work", "работать"],
      ["գրասենյակ", "office", "офис"],
    ],
    phrases: [
      ["Ինչով ե՞ս զբաղվում։", "What do you do?", "Чем ты занимаешься?"],
      ["Ես ուսուցիչ եմ։", "I am a teacher.", "Я учитель."],
      ["Աշխատում եմ հիվանդանոցում։", "I work in a hospital.", "Я работаю в больнице."],
      ["Իմ աշխատանքը հետաքրքիր է։", "My job is interesting.", "Моя работа интересная."],
      ["Որտե՞ղ ես աշխատում։", "Where do you work?", "Где работаешь?"],
      ["Ես ուսանող եմ։", "I am a student.", "Я студент."],
      ["Դեռ չեմ աշխատում։", "I don't work yet.", "Я ещё не работаю."],
      ["Ուզում եմ բժիշկ դառնալ։", "I want to become a doctor.", "Хочу стать врачом."],
      ["Իմ հայրը ինժեներ է։", "My father is an engineer.", "Мой отец инженер."],
      ["Աշխատանքս դժվար է, բայց սիրում եմ։", "My work is hard but I love it.", "Работа трудная, но я люблю её."],
      ["Ութ ժամ եմ աշխատում։", "I work eight hours.", "Я работаю восемь часов."],
      ["Ես աշխատաթ չեմ։", "I am unemployed.", "Я безработный."],
    ],
    dialogues: [
      { title: { en: "What Job?", hy: "Ինչ մասնագիտություն", ru: "Какая профессия" }, turns: [
        ["nurik", "Ինչով ե՞ս զբաղվում։", "What do you do?", "Чем ты занимаешься?"],
        ["user", "Ես ծրագրավորող եմ։", "I am a programmer.", "Я программист."],
        ["nurik", "Որտե՞ղ ես աշխատում։", "Where do you work?", "Где работаешь?"],
        ["user", "Մեծ ընկերությունում։", "At a big company.", "В большой компании."],
      ]},
      { title: { en: "Dream Job", hy: "Երազանքի աշխատանք", ru: "Работа мечты" }, turns: [
        ["nurik", "Ինչ ես ուզում դառնալ։", "What do you want to become?", "Кем хочешь стать?"],
        ["user", "Ուզում եմ բժիշկ դառնալ։", "I want to become a doctor.", "Хочу стать врачом."],
        ["nurik", "Ինչու։", "Why?", "Почему?"],
        ["user", "Ուզում եմ օգնել մարդկանց։", "I want to help people.", "Хочу помогать людям."],
      ]},
      { title: { en: "Family Jobs", hy: "Ընտանիքի աշխատանքները", ru: "Работа в семье" }, turns: [
        ["nurik", "Ինչով են զբաղվում քո ծնողները։", "What do your parents do?", "Чем занимаются твои родители?"],
        ["user", "Մայրը ուսուցիչ է, հայրը ինժեներ։", "Mother is a teacher, father an engineer.", "Мама учитель, отец инженер."],
        ["nurik", "Մեծ տուն եք պետք։", "You need a big house.", "Нужен большой дом."],
        ["user", "Այո, որպեսզի բոլորը տեղավորվեն։", "Yes, for everyone to fit.", "Да, чтобы все поместились."],
      ]},
    ],
  },

  // ===== World 2: Daily Life =====
  ...buildWorld2(),
  // ===== World 3 =====
  ...buildWorld3(),
  // ===== World 4 =====
  ...buildWorld4(),
  // ===== World 5 =====
  ...buildWorld5(),
  // ===== NEW WORLDS w6–w10 =====
  ...buildWorld6(),
  ...buildWorld7(),
  ...buildWorld8(),
  ...buildWorld9(),
  ...buildWorld10(),
];

// ─── World 2–5 builders (kept as functions for readability) ──────────────────
// (These are exactly as in your original file – I'm including them completely)

function buildWorld2(): QuickLesson[] {
  return [
    qL("w2_l1", "w2", "home", "Home", "Տուն", "Дом", "Describe your home.",
      [
        ["տուն", "house", "дом"], ["բնակարան", "apartment", "квартира"],
        ["սենյակ", "room", "комната"], ["խոհանոց", "kitchen", "кухня"],
        ["ննջարան", "bedroom", "спальня"], ["հյուրասենյակ", "living room", "гостиная"],
        ["լոգարան", "bathroom", "ванная"], ["պատշգամբ", "balcony", "балкон"],
        ["միջանցք", "hallway", "коридор"], ["դուռ", "door", "дверь"],
        ["պատուհան", "window", "окно"], ["հատակ", "floor", "пол"],
        ["առաստաղ", "ceiling", "потолок"], ["պատ", "wall", "стена"],
        ["տանիք", "roof", "крыша"], ["աստիճան", "stair", "лестница"],
        ["բակ", "yard", "двор"], ["այգի", "garden", "сад"],
        ["հարկ", "floor (level)", "этаж"], ["մուտք", "entrance", "вход"],
        ["բանալի", "key", "ключ"], ["կողպեք", "lock", "замок"],
        ["հանգիստ", "cozy", "уютный"], ["մաքուր", "clean", "чистый"],
        ["լուսավոր", "bright", "светлый"],
      ],
      [
        ["Իմ տունը մեծ է։", "My house is big.", "Мой дом большой."],
        ["Ապրում եմ բնակարանում։", "I live in an apartment.", "Я живу в квартире."],
        ["Քանի՞ սենյակ ունի տունդ։", "How many rooms does your house have?", "Сколько комнат в твоём доме?"],
        ["Չորս սենյակ ունի։", "It has four rooms.", "Четыре комнаты."],
        ["Իմ ննջարանը փոքր է։", "My bedroom is small.", "Моя спальня маленькая."],
        ["Խոհանոցը լուսավոր է։", "The kitchen is bright.", "Кухня светлая."],
        ["Պատշգամբից տեսարան կա։", "There's a view from the balcony.", "С балкона есть вид."],
        ["Ապրում եմ երրորդ հարկում։", "I live on the third floor.", "Я живу на третьем этаже."],
        ["Բանալին կորցրեցի։", "I lost the key.", "Я потерял ключ."],
        ["Տունը շատ հանգիստ է։", "The house is very cozy.", "Дом очень уютный."],
        ["Բաց արա պատուհանը։", "Open the window.", "Открой окно."],
        ["Փակիր դուռը։", "Close the door.", "Закрой дверь."],
      ],
      [
        { title: { en: "Showing the Home", hy: "Տուն ցույց տալ", ru: "Показать дом" }, turns: [
          ["nurik", "Արի, ցույց տամ տունը։", "Come, let me show the house.", "Пойдём, покажу дом."],
          ["user", "Մեծ է։", "It's big.", "Большой."],
          ["nurik", "Չորս սենյակ ունի։", "It has four rooms.", "Четыре комнаты."],
          ["user", "Շատ լուսավոր է։", "Very bright.", "Очень светло."],
        ]},
        { title: { en: "New Apartment", hy: "Նոր բնակարան", ru: "Новая квартира" }, turns: [
          ["nurik", "Տեղափոխվել եմ նոր բնակարան։", "I moved to a new apartment.", "Я переехал в новую квартиру."],
          ["user", "Որտե՞ղ։", "Where?", "Где?"],
          ["nurik", "Կենտրոնում։", "In the center.", "В центре."],
          ["user", "Շնորհավորում եմ։", "Congratulations.", "Поздравляю."],
        ]},
        { title: { en: "Lost Key", hy: "Կորած բանալի", ru: "Потерянный ключ" }, turns: [
          ["nurik", "Որտե՞ղ է բանալին։", "Where is the key?", "Где ключ?"],
          ["user", "Չգիտեմ, կորցրեցի։", "I don't know, I lost it.", "Не знаю, потерял."],
          ["nurik", "Փնտրի՛ր ուշադիր։", "Search carefully.", "Поищи внимательно."],
          ["user", "Գտա, պայուսակիս մեջ էր։", "Found it, in my bag.", "Нашёл, в сумке."],
        ]},
      ]),
    qL("w2_l2", "w2", "rooms", "Rooms", "Սենյակներ", "Комнаты", "Rooms in the house.",
      [
        ["խոհանոց", "kitchen", "кухня"], ["ննջարան", "bedroom", "спальня"],
        ["հյուրասենյակ", "living room", "гостиная"], ["լոգարան", "bathroom", "ванная"],
        ["զուգարան", "toilet", "туалет"], ["աշխատասենյակ", "study", "кабинет"],
        ["պահեստ", "storage", "кладовая"], ["նկուղ", "basement", "подвал"],
        ["ձեղնահարկ", "attic", "чердак"], ["ճաշասենյակ", "dining room", "столовая"],
        ["մանկական", "nursery", "детская"], ["հյուրերի սենյակ", "guest room", "комната для гостей"],
        ["դարան", "closet", "шкаф"], ["դարակ", "shelf", "полка"],
        ["անկյուն", "corner", "угол"], ["կենտրոն", "center", "центр"],
        ["մուտք", "entrance", "вход"], ["ելք", "exit", "выход"],
        ["մեծ", "big", "большой"], ["փոքր", "small", "маленький"],
        ["լայն", "wide", "широкий"], ["նեղ", "narrow", "узкий"],
        ["բարձր", "high", "высокий"], ["ցածր", "low", "низкий"],
        ["տաք", "warm", "тёплый"],
      ],
      [
        ["Որտե՞ղ է լոգարանը։", "Where is the bathroom?", "Где ванная?"],
        ["Աջ կողմում է։", "It's on the right.", "Справа."],
        ["Խոհանոցը հյուրասենյակի կողքին է։", "Kitchen is next to living room.", "Кухня рядом с гостиной."],
        ["Իմ ննջարանը երկրորդ հարկում է։", "My bedroom is on the second floor.", "Моя спальня на втором этаже."],
        ["Աշխատասենյակում աղմկոտ չէ։", "It's quiet in the study.", "В кабинете тихо."],
        ["Մանկական սենյակը գունավոր է։", "The nursery is colorful.", "Детская яркая."],
        ["Ճաշասենյակում ուտում ենք։", "We eat in the dining room.", "Мы едим в столовой."],
        ["Նկուղում սառն է։", "It's cold in the basement.", "В подвале холодно."],
        ["Ձեղնահարկում շատ բաներ կան։", "Many things in the attic.", "На чердаке много вещей."],
        ["Դարակում գրքեր կան։", "There are books on the shelf.", "На полке книги."],
        ["Անկյունում աթոռ կա։", "A chair in the corner.", "В углу стул."],
        ["Սենյակը մաքուր է։", "The room is clean.", "Комната чистая."],
      ],
      [
        { title: { en: "Where Bathroom", hy: "Որտեղ լոգարան", ru: "Где ванная" }, turns: [
          ["user", "Որտե՞ղ է լոգարանը։", "Where is the bathroom?", "Где ванная?"],
          ["nurik", "Աջ կողմում, միջանցքի վերջում։", "On the right, at the end of the hallway.", "Справа, в конце коридора."],
          ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
          ["nurik", "Խնդրեմ։", "You're welcome.", "Пожалуйста."],
        ]},
        { title: { en: "Favorite Room", hy: "Սիրած սենյակ", ru: "Любимая комната" }, turns: [
          ["nurik", "Ո՞ր սենյակն ես սիրում։", "Which room do you like?", "Какую комнату любишь?"],
          ["user", "Հյուրասենյակը։", "The living room.", "Гостиную."],
          ["nurik", "Ինչու։", "Why?", "Почему?"],
          ["user", "Որովհետև մեծ ու լուսավոր է։", "Because it's big and bright.", "Потому что большая и светлая."],
        ]},
        { title: { en: "Cleaning", hy: "Մաքրում", ru: "Уборка" }, turns: [
          ["nurik", "Ո՞ր սենյակն ես մաքրում։", "Which room are you cleaning?", "Какую комнату убираешь?"],
          ["user", "Խոհանոցը։", "The kitchen.", "Кухню."],
          ["nurik", "Օգնեմ։", "Let me help.", "Помогу."],
          ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
        ]},
      ]),
    qL("w2_l3", "w2", "furniture", "Furniture", "Կահույք", "Мебель", "Furniture vocabulary.",
      [
        ["աթոռ", "chair", "стул"], ["սեղան", "table", "стол"],
        ["մահճակալ", "bed", "кровать"], ["բազմոց", "sofa", "диван"],
        ["բազկաթոռ", "armchair", "кресло"], ["դարան", "wardrobe", "шкаф"],
        ["գրասեղան", "desk", "письменный стол"], ["գրապահարան", "bookcase", "книжный шкаф"],
        ["հայելի", "mirror", "зеркало"], ["լամպ", "lamp", "лампа"],
        ["գորգ", "carpet", "ковёр"], ["վարագույր", "curtain", "штора"],
        ["բարձ", "pillow", "подушка"], ["վերմակ", "blanket", "одеяло"],
        ["սավան", "sheet", "простыня"], ["սառնարան", "refrigerator", "холодильник"],
        ["վառարան", "stove", "плита"], ["լվացքի մեքենա", "washing machine", "стиральная машина"],
        ["հեռուստացույց", "television", "телевизор"], ["համակարգիչ", "computer", "компьютер"],
        ["ժամացույց", "clock", "часы"], ["նկար", "picture", "картина"],
        ["ծաղկաման", "vase", "ваза"], ["մոմ", "candle", "свеча"],
        ["գիրք", "book", "книга"],
      ],
      [
        ["Աթոռը կոտրված է։", "The chair is broken.", "Стул сломан."],
        ["Սեղանի վրա գիրք կա։", "There is a book on the table.", "На столе книга."],
        ["Մահճակալը հարմարավետ է։", "The bed is comfortable.", "Кровать удобная."],
        ["Բազմոցը նոր է։", "The sofa is new.", "Диван новый."],
        ["Գորգը գեղեցիկ է։", "The carpet is beautiful.", "Ковёр красивый."],
        ["Լամպը չի աշխատում։", "The lamp doesn't work.", "Лампа не работает."],
        ["Հեռուստացույցը մեծ էկրան ունի։", "The TV has a big screen.", "У телевизора большой экран."],
        ["Համակարգիչը արագ է։", "The computer is fast.", "Компьютер быстрый."],
        ["Սառնարանը դատարկ է։", "The fridge is empty.", "Холодильник пустой."],
        ["Դարանում շորեր կան։", "There are clothes in the wardrobe.", "В шкафу одежда."],
        ["Հայելու մեջ ինձ եմ տեսնում։", "I see myself in the mirror.", "Я вижу себя в зеркале."],
        ["Գրապահարանում շատ գրքեր կան։", "Many books in the bookcase.", "В шкафу много книг."],
      ],
      [
        { title: { en: "Buying Furniture", hy: "Կահույք գնել", ru: "Купить мебель" }, turns: [
          ["nurik", "Ի՞նչ ենք գնելու։", "What are we buying?", "Что купим?"],
          ["user", "Նոր բազմոց։", "A new sofa.", "Новый диван."],
          ["nurik", "Ի՞նչ գույնի։", "What color?", "Какого цвета?"],
          ["user", "Մոխրագույն։", "Grey.", "Серого."],
        ]},
        { title: { en: "Broken Chair", hy: "Կոտրված աթոռ", ru: "Сломанный стул" }, turns: [
          ["user", "Աթոռը կոտրվեց։", "The chair broke.", "Стул сломался."],
          ["nurik", "Կարո՞ղ ենք նորոգել։", "Can we fix it?", "Можем починить?"],
          ["user", "Չեմ կարծում։", "I don't think so.", "Не думаю."],
          ["nurik", "Նորը գնենք։", "Let's buy a new one.", "Купим новый."],
        ]},
        { title: { en: "TV Time", hy: "Հեռուստացույց", ru: "Телевизор" }, turns: [
          ["nurik", "Հեռուստացույց դիտե՞նք։", "Shall we watch TV?", "Посмотрим телевизор?"],
          ["user", "Այո, ինչ։", "Yes, what?", "Да, что?"],
          ["nurik", "Ֆիլմ։", "A movie.", "Фильм."],
          ["user", "Հիանալի։", "Great.", "Отлично."],
        ]},
      ]),
    qL("w2_l4", "w2", "food", "Food", "Ուտելիք", "Еда", "Food vocabulary.",
      [
        ["հաց", "bread", "хлеб"], ["պանիր", "cheese", "сыр"],
        ["կարագ", "butter", "масло"], ["ձու", "egg", "яйцо"],
        ["կաթ", "milk", "молоко"], ["մածուն", "yogurt", "мацун"],
        ["միս", "meat", "мясо"], ["հավ", "chicken", "курица"],
        ["ձուկ", "fish", "рыба"], ["բրինձ", "rice", "рис"],
        ["կարտոֆիլ", "potato", "картофель"], ["լոլիկ", "tomato", "помидор"],
        ["վարունգ", "cucumber", "огурец"], ["սոխ", "onion", "лук"],
        ["սխտոր", "garlic", "чеснок"], ["խնձոր", "apple", "яблоко"],
        ["բանան", "banana", "банан"], ["նարինջ", "orange", "апельсин"],
        ["խաղող", "grape", "виноград"], ["ձմերուկ", "watermelon", "арбуз"],
        ["աղ", "salt", "соль"], ["պղպեղ", "pepper", "перец"],
        ["շաքար", "sugar", "сахар"], ["մեղր", "honey", "мёд"],
        ["ապուր", "soup", "суп"],
      ],
      [
        ["Ուզու՞մ ես հաց։", "Do you want bread?", "Хочешь хлеба?"],
        ["Այո, շնորհակալություն։", "Yes, thank you.", "Да, спасибо."],
        ["Ի՞նչ ես ուտում։", "What are you eating?", "Что ты ешь?"],
        ["Ուտում եմ պանիր և հաց։", "I'm eating cheese and bread.", "Ем сыр и хлеб."],
        ["Ապուրը համեղ է։", "The soup is delicious.", "Суп вкусный."],
        ["Միս չեմ ուտում։", "I don't eat meat.", "Я не ем мясо."],
        ["Ես բուսակեր եմ։", "I am vegetarian.", "Я вегетарианец."],
        ["Քաղցած եմ։", "I am hungry.", "Я голоден."],
        ["Կուշտ եմ։", "I am full.", "Я сыт."],
        ["Աղ տու՞ր։", "Pass the salt?", "Передашь соль?"],
        ["Ի՞նչ կա ուտելու։", "What is there to eat?", "Что есть поесть?"],
        ["Հաց ենք գնում։", "We are buying bread.", "Мы покупаем хлеб."],
      ],
      [
        { title: { en: "Hungry", hy: "Քաղցած", ru: "Голодный" }, turns: [
          ["user", "Քաղցած եմ։", "I am hungry.", "Я голоден."],
          ["nurik", "Ի՞նչ ուզում ես ուտել։", "What do you want to eat?", "Что хочешь поесть?"],
          ["user", "Ապուր և հաց։", "Soup and bread.", "Суп и хлеб."],
          ["nurik", "Հիմա պատրաստեմ։", "I'll make it now.", "Сейчас приготовлю."],
        ]},
        { title: { en: "Shopping List", hy: "Գնումների ցուցակ", ru: "Список покупок" }, turns: [
          ["nurik", "Ի՞նչ պետք է գնել։", "What do we need to buy?", "Что нужно купить?"],
          ["user", "Կաթ, հաց և ձու։", "Milk, bread, and eggs.", "Молоко, хлеб и яйца."],
          ["nurik", "Մրգեր էլ։", "Fruits too.", "И фрукты."],
          ["user", "Լավ, խնձոր և բանան։", "OK, apples and bananas.", "Хорошо, яблоки и бананы."],
        ]},
        { title: { en: "Vegetarian", hy: "Բուսակեր", ru: "Вегетарианец" }, turns: [
          ["nurik", "Միս ուտու՞մ ես։", "Do you eat meat?", "Ты ешь мясо?"],
          ["user", "Ոչ, բուսակեր եմ։", "No, I'm vegetarian.", "Нет, я вегетарианец."],
          ["nurik", "Իսկ ձուկ։", "And fish?", "А рыбу?"],
          ["user", "Երբեմն։", "Sometimes.", "Иногда."],
        ]},
      ]),
    qL("w2_l5", "w2", "drinks", "Drinks", "Ըմպելիքներ", "Напитки", "Drinks vocabulary.",
      [
        ["ջուր", "water", "вода"], ["թեյ", "tea", "чай"],
        ["սուրճ", "coffee", "кофе"], ["կաթ", "milk", "молоко"],
        ["հյութ", "juice", "сок"], ["գարեջուր", "beer", "пиво"],
        ["գինի", "wine", "вино"], ["կոնյակ", "cognac", "коньяк"],
        ["օղի", "vodka", "водка"], ["լիմոնադ", "lemonade", "лимонад"],
        ["կոկակոլա", "Coca-Cola", "кока-кола"], ["կաթնահյութ", "milkshake", "молочный коктейль"],
        ["տաք", "hot", "горячий"], ["սառը", "cold", "холодный"],
        ["քաղցր", "sweet", "сладкий"], ["դառը", "bitter", "горький"],
        ["թթու", "sour", "кислый"], ["բաժակ", "cup/glass", "стакан"],
        ["գավաթ", "mug", "кружка"], ["շիշ", "bottle", "бутылка"],
        ["բանկա", "can", "банка"], ["խմել", "to drink", "пить"],
        ["լցնել", "to pour", "наливать"], ["պատվիրել", "to order", "заказать"],
        ["ծարավ", "thirsty", "жажда"],
      ],
      [
        ["Ծարավ եմ։", "I am thirsty.", "Я хочу пить."],
        ["Ուզու՞մ ես թեյ։", "Do you want tea?", "Хочешь чая?"],
        ["Մի բաժակ ջուր, խնդրեմ։", "A glass of water, please.", "Стакан воды, пожалуйста."],
        ["Սուրճը տաք է։", "The coffee is hot.", "Кофе горячий."],
        ["Հյութը քաղցր է։", "The juice is sweet.", "Сок сладкий."],
        ["Չեմ խմում ալկոհոլ։", "I don't drink alcohol.", "Я не пью алкоголь."],
        ["Կարո՞ղ եմ մի շիշ ջուր։", "Can I get a bottle of water?", "Можно бутылку воды?"],
        ["Թեյը կաթո՞վ թե առանց։", "Tea with milk or without?", "Чай с молоком или без?"],
        ["Առանց շաքարի։", "Without sugar.", "Без сахара."],
        ["Գարեջուր պատվիրեմ։", "Let me order a beer.", "Закажу пиво."],
        ["Կենաց։", "Cheers.", "Будем."],
        ["Ուզու՞մ ես ևս մեկ բաժակ։", "Want another cup?", "Хочешь ещё чашку?"],
      ],
      [
        { title: { en: "Café Order", hy: "Սրճարանում պատվեր", ru: "Заказ в кафе" }, turns: [
          ["nurik", "Ի՞նչ ես ուզում խմել։", "What do you want to drink?", "Что хочешь пить?"],
          ["user", "Մի սուրճ։", "A coffee.", "Кофе."],
          ["nurik", "Կաթո՞վ։", "With milk?", "С молоком?"],
          ["user", "Այո, և առանց շաքարի։", "Yes, and without sugar.", "Да, и без сахара."],
        ]},
        { title: { en: "Thirsty", hy: "Ծարավ", ru: "Жажда" }, turns: [
          ["user", "Ծարավ եմ։", "I am thirsty.", "Я хочу пить."],
          ["nurik", "Մի բաժակ ջուր։", "A glass of water.", "Стакан воды."],
          ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
          ["nurik", "Խնդրեմ։", "You're welcome.", "Пожалуйста."],
        ]},
        { title: { en: "Toast", hy: "Կենաց", ru: "Тост" }, turns: [
          ["nurik", "Կենաց բարեկամության։", "A toast to friendship.", "Тост за дружбу."],
          ["user", "Կենաց։", "Cheers.", "Будем."],
          ["nurik", "Առողջություն։", "Health.", "За здоровье."],
          ["user", "Բոլորիս։", "To all of us.", "За всех нас."],
        ]},
      ]),
    qL("w2_l6", "w2", "restaurant", "Restaurant", "Ռեստորան", "Ресторан", "Eating out.",
      [
        ["ռեստորան", "restaurant", "ресторан"], ["սրճարան", "café", "кафе"],
        ["մատուցող", "waiter", "официант"], ["մենյու", "menu", "меню"],
        ["պատվեր", "order", "заказ"], ["հաշիվ", "bill", "счёт"],
        ["թեյավճար", "tip", "чаевые"], ["սեղան", "table", "стол"],
        ["ամրագրում", "reservation", "бронь"], ["նախուտեստ", "appetizer", "закуска"],
        ["աղցան", "salad", "салат"], ["ապուր", "soup", "суп"],
        ["գլխավոր ճաշատեսակ", "main course", "основное блюдо"], ["աղանդեր", "dessert", "десерт"],
        ["պաղպաղակ", "ice cream", "мороженое"], ["տորթ", "cake", "торт"],
        ["պատառաքաղ", "fork", "вилка"], ["գդալ", "spoon", "ложка"],
        ["դանակ", "knife", "нож"], ["ափսե", "plate", "тарелка"],
        ["բաժակ", "glass", "стакан"], ["անձեռոցիկ", "napkin", "салфетка"],
        ["համեղ", "delicious", "вкусный"], ["թարմ", "fresh", "свежий"],
        ["պատվիրել", "to order", "заказать"],
      ],
      [
        ["Սեղան երկու հոգու համար։", "Table for two.", "Столик на двоих."],
        ["Մենյուն, խնդրեմ։", "Menu, please.", "Меню, пожалуйста."],
        ["Ի՞նչ եք առաջարկում։", "What do you recommend?", "Что порекомендуете?"],
        ["Ես կուզեմ աղցան։", "I'll have salad.", "Я возьму салат."],
        ["Հաշիվը, խնդրեմ։", "The bill, please.", "Счёт, пожалуйста."],
        ["Կարո՞ղ եմ քարտով վճարել։", "Can I pay by card?", "Можно картой?"],
        ["Շատ համեղ էր։", "It was very delicious.", "Очень вкусно было."],
        ["Մի սխալ կա հաշվում։", "There's an error in the bill.", "Ошибка в счёте."],
        ["Թեյավճարը ներառվա՞ծ է։", "Is tip included?", "Чаевые включены?"],
        ["Ուզում եմ ամրագրել սեղան։", "I want to reserve a table.", "Хочу забронировать столик."],
        ["Ո՞ր ճաշատեսակն է հանրահայտ։", "Which dish is popular?", "Какое блюдо популярно?"],
        ["Միս չեմ ուտում։", "I don't eat meat.", "Я не ем мясо."],
      ],
      [
        { title: { en: "Ordering", hy: "Պատվիրել", ru: "Заказ" }, turns: [
          ["nurik", "Ի՞նչ եք ցանկանում։", "What would you like?", "Что желаете?"],
          ["user", "Մեկ աղցան և ապուր։", "One salad and soup.", "Один салат и суп."],
          ["nurik", "Խմիչք։", "A drink?", "Напиток?"],
          ["user", "Ջուր, խնդրեմ։", "Water, please.", "Воду, пожалуйста."],
        ]},
        { title: { en: "Bill Please", hy: "Հաշիվ խնդրեմ", ru: "Счёт пожалуйста" }, turns: [
          ["user", "Հաշիվը, խնդրեմ։", "The bill, please.", "Счёт, пожалуйста."],
          ["nurik", "Հինգ հազար դրամ։", "Five thousand dram.", "Пять тысяч драмов."],
          ["user", "Քարտո՞վ կարող եմ։", "Can I use card?", "Можно картой?"],
          ["nurik", "Այո, իհարկե։", "Yes, of course.", "Да, конечно."],
        ]},
        { title: { en: "Reservation", hy: "Ամրագրում", ru: "Бронь" }, turns: [
          ["user", "Ուզում եմ ամրագրել սեղան։", "I want to reserve a table.", "Хочу забронировать столик."],
          ["nurik", "Քանի՞ հոգու համար։", "For how many people?", "На сколько человек?"],
          ["user", "Չորս հոգու։", "Four people.", "Четверых."],
          ["nurik", "Ե՞րբ։", "When?", "Когда?"],
        ]},
      ]),
    qL("w2_l7", "w2", "shopping", "Shopping", "Գնումներ", "Покупки", "Shopping vocabulary.",
      [
        ["խանութ", "shop", "магазин"], ["շուկա", "market", "рынок"],
        ["գին", "price", "цена"], ["զեղչ", "discount", "скидка"],
        ["վաճառք", "sale", "распродажа"], ["գնել", "to buy", "купить"],
        ["վաճառել", "to sell", "продавать"], ["վճարել", "to pay", "платить"],
        ["կանխիկ", "cash", "наличные"], ["քարտ", "card", "карта"],
        ["ստուգում", "receipt", "чек"], ["փոխարկում", "exchange", "обмен"],
        ["վերադարձ", "return", "возврат"], ["հաճախորդ", "customer", "клиент"],
        ["վաճառող", "seller", "продавец"], ["պայուսակ", "bag", "сумка"],
        ["էժան", "cheap", "дешёвый"], ["թանկ", "expensive", "дорогой"],
        ["որակյալ", "quality", "качественный"], ["չափ", "size", "размер"],
        ["գույն", "color", "цвет"], ["մեծ", "big", "большой"],
        ["փոքր", "small", "маленький"], ["նոր", "new", "новый"],
        ["հին", "old", "старый"],
      ],
      [
        ["Որքա՞ն արժե։", "How much does it cost?", "Сколько стоит?"],
        ["Շատ թանկ է։", "It's very expensive.", "Очень дорого."],
        ["Կարո՞ղ եք զեղչ տալ։", "Can you give a discount?", "Можете дать скидку?"],
        ["Ուզում եմ գնել։", "I want to buy.", "Хочу купить."],
        ["Որտե՞ղ է վճարման կասսան։", "Where is the cashier?", "Где касса?"],
        ["Կանխի՞կ թե քարտով։", "Cash or card?", "Наличные или карта?"],
        ["Տվեք ստուգում, խնդրեմ։", "Give me the receipt, please.", "Дайте чек, пожалуйста."],
        ["Կարո՞ղ եմ վերադարձնել։", "Can I return it?", "Можно вернуть?"],
        ["Ուրիշ չափ կա՞։", "Is there another size?", "Есть другой размер?"],
        ["Ուրիշ գույն ունե՞ք։", "Do you have another color?", "Есть другой цвет?"],
        ["Շատ որակյալ է։", "Very high quality.", "Очень качественно."],
        ["Ե՞րբ է վաճառքը։", "When is the sale?", "Когда распродажа?"],
      ],
      [
        { title: { en: "At the Market", hy: "Շուկայում", ru: "На рынке" }, turns: [
          ["nurik", "Ի՞նչ ես փնտրում։", "What are you looking for?", "Что ищешь?"],
          ["user", "Թարմ մրգեր։", "Fresh fruits.", "Свежие фрукты."],
          ["nurik", "Այստեղ լավն են։", "They're good here.", "Здесь хорошие."],
          ["user", "Որքան է խնձորը։", "How much are apples?", "Сколько яблоки?"],
        ]},
        { title: { en: "Discount", hy: "Զեղչ", ru: "Скидка" }, turns: [
          ["user", "Կարո՞ղ եք զեղչ տալ։", "Can you give a discount?", "Можете дать скидку?"],
          ["nurik", "Տասը տոկոս։", "Ten percent.", "Десять процентов."],
          ["user", "Հիանալի, գնում եմ։", "Great, I'll take it.", "Отлично, беру."],
          ["nurik", "Շնորհակալություն։", "Thank you.", "Спасибо."],
        ]},
        { title: { en: "Return", hy: "Վերադարձ", ru: "Возврат" }, turns: [
          ["user", "Ուզում եմ վերադարձնել։", "I want to return this.", "Хочу вернуть."],
          ["nurik", "Ստուգում ունե՞ք։", "Do you have the receipt?", "Чек есть?"],
          ["user", "Այո, այստեղ։", "Yes, here.", "Да, вот."],
          ["nurik", "Լավ, գումարը կվերադարձնեմ։", "OK, I'll refund.", "Хорошо, верну деньги."],
        ]},
      ]),
    qL("w2_l8", "w2", "clothing", "Clothing", "Հագուստ", "Одежда", "Clothes vocabulary.",
      [
        ["շապիկ", "shirt", "рубашка"], ["տաբատ", "trousers", "брюки"],
        ["զգեստ", "dress", "платье"], ["փեշ", "skirt", "юбка"],
        ["բաճկոն", "jacket", "куртка"], ["վերարկու", "coat", "пальто"],
        ["գուլպաներ", "socks", "носки"], ["կոշիկներ", "shoes", "обувь"],
        ["գլխարկ", "hat", "шляпа"], ["շարֆ", "scarf", "шарф"],
        ["ձեռնոցներ", "gloves", "перчатки"], ["գոտի", "belt", "ремень"],
        ["փողկապ", "tie", "галстук"], ["պայուսակ", "bag", "сумка"],
        ["հովանոց", "umbrella", "зонт"], ["ակնոց", "glasses", "очки"],
        ["ժամացույց", "watch", "часы"], ["մատանի", "ring", "кольцо"],
        ["վզնոց", "necklace", "ожерелье"], ["հագնել", "to wear", "носить"],
        ["հանել", "to take off", "снимать"], ["փոխել", "to change", "менять"],
        ["փորձել", "to try on", "примерять"], ["չափ", "size", "размер"],
        ["գույն", "color", "цвет"],
      ],
      [
        ["Ի՞նչ եմ հագնում այսօր։", "What am I wearing today?", "Что мне надеть сегодня?"],
        ["Հագիր տաք վերարկու։", "Wear a warm coat.", "Надень тёплое пальто."],
        ["Կարո՞ղ եմ փորձել։", "Can I try it on?", "Можно примерить?"],
        ["Մեծ է ինձ համար։", "It's too big for me.", "Мне велико."],
        ["Փոքր է։", "It's small.", "Маленький."],
        ["Հենց իմ չափն է։", "It's just my size.", "Как раз мой размер."],
        ["Այս գույնը գեղեցիկ է։", "This color is nice.", "Этот цвет красивый."],
        ["Կարմիր շապիկ ուզում եմ։", "I want a red shirt.", "Хочу красную рубашку."],
        ["Ուրիշ չափ կա՞։", "Is there another size?", "Есть другой размер?"],
        ["Կոշիկները նոր են։", "The shoes are new.", "Обувь новая."],
        ["Փողկապ չեմ կրում։", "I don't wear ties.", "Я не ношу галстуки."],
        ["Հովանոց վերցրու։", "Take an umbrella.", "Возьми зонт."],
      ],
      [
        { title: { en: "Trying On", hy: "Փորձել", ru: "Примерить" }, turns: [
          ["user", "Կարո՞ղ եմ փորձել այս շապիկը։", "Can I try on this shirt?", "Можно примерить эту рубашку?"],
          ["nurik", "Այո, փորձասենյակը այստեղ է։", "Yes, fitting room is here.", "Да, примерочная здесь."],
          ["user", "Մեծ է մի քիչ։", "It's a bit big.", "Великовато."],
          ["nurik", "Փոքր չափը կբերեմ։", "I'll bring a smaller size.", "Принесу размер меньше."],
        ]},
        { title: { en: "Choosing Clothes", hy: "Հագուստ ընտրել", ru: "Выбрать одежду" }, turns: [
          ["nurik", "Ի՞նչ ես ուզում գնել։", "What do you want to buy?", "Что хочешь купить?"],
          ["user", "Նոր բաճկոն ձմռանը։", "A new jacket for winter.", "Новую куртку на зиму."],
          ["nurik", "Ի՞նչ գույն։", "What color?", "Какого цвета?"],
          ["user", "Սև։", "Black.", "Чёрного."],
        ]},
        { title: { en: "Wear Warm", hy: "Տաք հագիր", ru: "Надень тёплое" }, turns: [
          ["nurik", "Դրսում ցուրտ է։", "It's cold outside.", "На улице холодно."],
          ["user", "Հագնեմ վերարկու։", "I'll wear a coat.", "Надену пальто."],
          ["nurik", "Շարֆ էլ։", "Scarf too.", "И шарф."],
          ["user", "Լավ։", "OK.", "Хорошо."],
        ]},
      ]),
    qL("w2_l9", "w2", "weather", "Weather", "Եղանակ", "Погода", "Weather talk.",
      [
        ["արև", "sun", "солнце"], ["ամպ", "cloud", "облако"],
        ["անձրև", "rain", "дождь"], ["ձյուն", "snow", "снег"],
        ["քամի", "wind", "ветер"], ["փոթորիկ", "storm", "буря"],
        ["ամպրոպ", "thunder", "гром"], ["կայծակ", "lightning", "молния"],
        ["մառախուղ", "fog", "туман"], ["ցողեր", "dew", "роса"],
        ["տաք", "warm", "тёплый"], ["շոգ", "hot", "жаркий"],
        ["սառը", "cold", "холодный"], ["ցուրտ", "freezing", "морозный"],
        ["զով", "cool", "прохладный"], ["արևոտ", "sunny", "солнечный"],
        ["ամպամած", "cloudy", "облачно"], ["անձրևոտ", "rainy", "дождливо"],
        ["ձյունոտ", "snowy", "снежно"], ["քամոտ", "windy", "ветрено"],
        ["գարուն", "spring", "весна"], ["ամառ", "summer", "лето"],
        ["աշուն", "autumn", "осень"], ["ձմեռ", "winter", "зима"],
        ["աստիճան", "degree", "градус"],
      ],
      [
        ["Ի՞նչ եղանակ է։", "What's the weather?", "Какая погода?"],
        ["Արևոտ է։", "It's sunny.", "Солнечно."],
        ["Անձրև է գալիս։", "It's raining.", "Идёт дождь."],
        ["Ձյուն է գալիս։", "It's snowing.", "Идёт снег."],
        ["Շատ շոգ է։", "It's very hot.", "Очень жарко."],
        ["Շատ ցուրտ է։", "It's very cold.", "Очень холодно."],
        ["Քսան աստիճան է։", "It's twenty degrees.", "Двадцать градусов."],
        ["Քամի է փչում։", "The wind is blowing.", "Ветер дует."],
        ["Մառախուղ կա։", "There is fog.", "Туман."],
        ["Գարունն իմ սիրած եղանակն է։", "Spring is my favorite.", "Весна — моё любимое."],
        ["Ձմռանը ձյուն է գալիս։", "In winter it snows.", "Зимой идёт снег."],
        ["Հովանոց վերցրու։", "Take an umbrella.", "Возьми зонт."],
      ],
      [
        { title: { en: "Weather Today", hy: "Այսօրվա եղանակ", ru: "Погода сегодня" }, turns: [
          ["user", "Ի՞նչ եղանակ է այսօր։", "What's the weather today?", "Какая сегодня погода?"],
          ["nurik", "Արևոտ և տաք։", "Sunny and warm.", "Солнечно и тепло."],
          ["user", "Հիանալի։", "Excellent.", "Отлично."],
          ["nurik", "Գնանք զբոսնելու։", "Let's go for a walk.", "Пойдём гулять."],
        ]},
        { title: { en: "Cold Day", hy: "Ցուրտ օր", ru: "Холодный день" }, turns: [
          ["nurik", "Դրսում ցուրտ է։", "It's cold outside.", "На улице холодно."],
          ["user", "Քանի՞ աստիճան։", "How many degrees?", "Сколько градусов?"],
          ["nurik", "Մինուս հինգ։", "Minus five.", "Минус пять."],
          ["user", "Տաք հագնվեմ։", "I'll dress warmly.", "Тепло оденусь."],
        ]},
        { title: { en: "Rain", hy: "Անձրև", ru: "Дождь" }, turns: [
          ["nurik", "Անձրև է գալիս։", "It's raining.", "Идёт дождь."],
          ["user", "Հովանոց չունեմ։", "I don't have an umbrella.", "У меня нет зонта."],
          ["nurik", "Իմն վերցրու։", "Take mine.", "Возьми мой."],
          ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
        ]},
      ]),
    qL("w2_l10", "w2", "time", "Time", "Ժամանակ", "Время", "Time and clock.",
      [
        ["ժամ", "hour", "час"], ["րոպե", "minute", "минута"],
        ["վայրկյան", "second", "секунда"], ["օր", "day", "день"],
        ["շաբաթ", "week", "неделя"], ["ամիս", "month", "месяц"],
        ["տարի", "year", "год"], ["այսօր", "today", "сегодня"],
        ["վաղը", "tomorrow", "завтра"], ["երեկ", "yesterday", "вчера"],
        ["հիմա", "now", "сейчас"], ["հետո", "later", "потом"],
        ["առավոտ", "morning", "утро"], ["կեսօր", "noon", "полдень"],
        ["երեկո", "evening", "вечер"], ["գիշեր", "night", "ночь"],
        ["երկուշաբթի", "Monday", "понедельник"], ["երեքշաբթի", "Tuesday", "вторник"],
        ["չորեքշաբթի", "Wednesday", "среда"], ["հինգշաբթի", "Thursday", "четверг"],
        ["ուրբաթ", "Friday", "пятница"], ["շաբաթ", "Saturday", "суббота"],
        ["կիրակի", "Sunday", "воскресенье"], ["ժամացույց", "clock", "часы"],
        ["օրացույց", "calendar", "календарь"],
      ],
      [
        ["Ժամը քանի՞սն է։", "What time is it?", "Который час?"],
        ["Ժամը երեքն է։", "It is three o'clock.", "Три часа."],
        ["Ուշանում եմ։", "I am late.", "Я опаздываю."],
        ["Ուշ է։", "It is late.", "Поздно."],
        ["Շուտով հանդիպենք։", "See you soon.", "Скоро увидимся."],
        ["Ե՞րբ ենք հանդիպելու։", "When are we meeting?", "Когда встретимся?"],
        ["Շաբաթ օրը։", "On Saturday.", "В субботу."],
        ["Ո՞ր օրն է այսօր։", "What day is today?", "Какой сегодня день?"],
        ["Չորեքշաբթի։", "Wednesday.", "Среда."],
        ["Վաղը պետք է վաղ արթնանամ։", "Tomorrow I have to wake up early.", "Завтра нужно встать рано."],
        ["Մի րոպե սպասիր։", "Wait a minute.", "Подожди минуту."],
        ["Ամիսը երեսուն օր ունի։", "The month has thirty days.", "В месяце тридцать дней."],
      ],
      [
        { title: { en: "What Time?", hy: "Ժամը քանիսն է", ru: "Который час" }, turns: [
          ["user", "Ժամը քանի՞սն է։", "What time is it?", "Который час?"],
          ["nurik", "Կեսօրվա մեկն է։", "It is one in the afternoon.", "Час дня."],
          ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
          ["nurik", "Խնդրեմ։", "You're welcome.", "Пожалуйста."],
        ]},
        { title: { en: "Late", hy: "Ուշանում եմ", ru: "Опаздываю" }, turns: [
          ["nurik", "Ուշանում ես։", "You are late.", "Ты опаздываешь."],
          ["user", "Ներեցեք, շատրվանի մոտ էի։", "Sorry, I was near the fountain.", "Извини, был у фонтана."],
          ["nurik", "Ոչինչ, սկսենք։", "It's OK, let's start.", "Ничего, начнём."],
          ["user", "Լավ։", "OK.", "Хорошо."],
        ]},
        { title: { en: "Meeting Time", hy: "Հանդիպման ժամ", ru: "Время встречи" }, turns: [
          ["user", "Ե՞րբ ենք հանդիպելու։", "When are we meeting?", "Когда встретимся?"],
          ["nurik", "Վաղը երեկոյան յոթին։", "Tomorrow evening at seven.", "Завтра вечером в семь."],
          ["user", "Որտե՞ղ։", "Where?", "Где?"],
          ["nurik", "Սրճարանում։", "At the café.", "В кафе."],
        ]},
      ]),
  ];
}

function buildWorld3(): QuickLesson[] {
  const topics: Array<[string, string, string, string, string]> = [
    ["airport", "Airport", "Օդանավակայան", "Аэропорт", "At the airport."],
    ["taxi", "Taxi", "Տաքսի", "Такси", "Catching a taxi."],
    ["hotel", "Hotel", "Հյուրանոց", "Отель", "Hotel check-in and stay."],
    ["directions", "Directions", "Ուղղություններ", "Маршруты", "Asking directions."],
    ["train", "Train", "Գնացք", "Поезд", "Train travel."],
    ["bus", "Bus", "Ավտոբուս", "Автобус", "Bus travel."],
    ["tourism", "Tourism", "Զբոսաշրջություն", "Туризм", "Sightseeing."],
    ["emergency", "Emergencies", "Արտակարգ իրավիճակներ", "Экстренные ситуации", "Calling for help."],
  ];
  return topics.map(([slug, en, hy, ru, desc], i) =>
    makeTravelLesson(`w3_l${i + 1}`, slug, en, hy, ru, desc)
  );
}

function makeTravelLesson(
  id: string, slug: string, enT: string, hyT: string, ruT: string, conceptEn: string
): QuickLesson {
  const banks: Record<string, { vocab: Array<[string, string, string]>; phrases: Array<[string, string, string]>; dialogues: any[] }> = {
    airport: {
      vocab: [
        ["օդանավակայան", "airport", "аэропорт"], ["ինքնաթիռ", "airplane", "самолёт"],
        ["տոմս", "ticket", "билет"], ["անձնագիր", "passport", "паспорт"],
        ["վիզա", "visa", "виза"], ["ուղեբեռ", "luggage", "багаж"],
        ["չվերթ", "flight", "рейс"], ["ուշացում", "delay", "задержка"],
        ["ուղևոր", "passenger", "пассажир"], ["անձնակազմ", "crew", "экипаж"],
        ["գրանցում", "check-in", "регистрация"], ["անձնագրային հսկողություն", "passport control", "паспортный контроль"],
        ["մաքսային", "customs", "таможня"], ["անվտանգություն", "security", "безопасность"],
        ["տերմինալ", "terminal", "терминал"], ["դարպաս", "gate", "выход"],
        ["նստեցում", "boarding", "посадка"], ["վայրէջք", "landing", "посадка (приземление)"],
        ["թռիչք", "takeoff", "взлёт"], ["կոնտրոլ", "control", "контроль"],
        ["հետաձգում", "postponement", "отложение"], ["չեղարկում", "cancellation", "отмена"],
        ["ստուգում", "inspection", "проверка"], ["դույլ", "tray", "поднос"],
        ["պայուսակ", "bag", "сумка"],
      ],
      phrases: [
        ["Որտե՞ղ է գրանցումը։", "Where is check-in?", "Где регистрация?"],
        ["Իմ չվերթը ուշանում է։", "My flight is delayed.", "Мой рейс задерживается."],
        ["Որքա՞ն ուղեբեռ ունեմ։", "How much luggage do I have?", "Сколько у меня багажа?"],
        ["Անձնագիրը, խնդրեմ։", "Passport, please.", "Паспорт, пожалуйста."],
        ["Որ դարպասից։", "From which gate?", "С какого выхода?"],
        ["Ե՞րբ է նստեցումը։", "When is boarding?", "Когда посадка?"],
        ["Կորցրել եմ տոմսը։", "I lost the ticket.", "Я потерял билет."],
        ["Միայն ձեռքի ուղեբեռ։", "Only hand luggage.", "Только ручная кладь."],
        ["Չվերթը չեղարկվել է։", "The flight is cancelled.", "Рейс отменён."],
        ["Մաքսային հայտարարագիր չունեմ։", "I have nothing to declare.", "Мне нечего декларировать."],
        ["Որտե՞ղ է ելքը։", "Where is the exit?", "Где выход?"],
        ["Անձնակազմը հիանալի էր։", "The crew was great.", "Экипаж был отличным."],
      ],
      dialogues: [
        { en: "Check-in", hy: "Գրանցում", ru: "Регистрация",
          turns: [
            ["nurik", "Անձնագիրը, խնդրեմ։", "Passport, please.", "Паспорт, пожалуйста."],
            ["user", "Ահա։", "Here it is.", "Вот."],
            ["nurik", "Ուղեբեռ ունե՞ք։", "Do you have luggage?", "У вас есть багаж?"],
            ["user", "Մեկ պայուսակ։", "One bag.", "Одна сумка."],
          ]},
        { en: "Delayed Flight", hy: "Ուշացած չվերթ", ru: "Задержанный рейс",
          turns: [
            ["user", "Իմ չվերթը ուշանում է։", "My flight is delayed.", "Мой рейс задерживается."],
            ["nurik", "Որքա՞ն։", "How long?", "На сколько?"],
            ["user", "Երկու ժամ։", "Two hours.", "Два часа."],
            ["nurik", "Ցավում եմ։", "I'm sorry.", "Мне жаль."],
          ]},
        { en: "Lost Bag", hy: "Կորած պայուսակ", ru: "Потерянная сумка",
          turns: [
            ["user", "Չեմ գտնում իմ ուղեբեռը։", "I can't find my luggage.", "Не могу найти багаж."],
            ["nurik", "Ի՞նչ գույնի էր։", "What color was it?", "Какого цвета?"],
            ["user", "Սև։", "Black.", "Чёрного."],
            ["nurik", "Կօգնեմ ձեզ։", "I'll help you.", "Я вам помогу."],
          ]},
      ],
    },
    taxi: {
      vocab: [
        ["տաքսի", "taxi", "такси"], ["վարորդ", "driver", "водитель"],
        ["հասցե", "address", "адрес"], ["հաշվիչ", "meter", "счётчик"],
        ["գին", "price", "цена"], ["կանգառ", "stop", "остановка"],
        ["փողոց", "street", "улица"], ["պողոտա", "avenue", "проспект"],
        ["քառուղի", "intersection", "перекрёсток"], ["լույս", "light", "светофор"],
        ["աջ", "right", "право"], ["ձախ", "left", "лево"],
        ["ուղիղ", "straight", "прямо"], ["հետ", "back", "назад"],
        ["արագ", "fast", "быстро"], ["դանդաղ", "slow", "медленно"],
        ["կանգնել", "to stop", "остановиться"], ["գնալ", "to go", "ехать"],
        ["շրջել", "to turn", "повернуть"], ["կամուրջ", "bridge", "мост"],
        ["քիլոմետր", "kilometer", "километр"], ["քարտեզ", "map", "карта"],
        ["զբոսաշրջիկ", "tourist", "турист"], ["կողքին", "next to", "рядом"],
        ["մոտ", "near", "близко"],
      ],
      phrases: [
        ["Տաքսի, խնդրեմ։", "Taxi, please.", "Такси, пожалуйста."],
        ["Որքա՞ն կարժենա։", "How much will it cost?", "Сколько будет стоить?"],
        ["Տարեք ինձ օդանավակայան։", "Take me to the airport.", "Везите меня в аэропорт."],
        ["Հասցեն այստեղ է։", "The address is here.", "Адрес здесь."],
        ["Արագացրեք, խնդրեմ։", "Speed up, please.", "Поторопитесь, пожалуйста."],
        ["Կանգնեք այստեղ։", "Stop here.", "Остановитесь здесь."],
        ["Միացրեք հաշվիչը։", "Turn on the meter.", "Включите счётчик."],
        ["Ուղիղ գնացեք։", "Go straight.", "Едьте прямо."],
        ["Աջ թեքվեք։", "Turn right.", "Поверните направо."],
        ["Ձախ թեքվեք։", "Turn left.", "Поверните налево."],
        ["Քանի՞ կիլոմետր է։", "How many kilometers?", "Сколько километров?"],
        ["Շնորհակալություն, պահեք մանրը։", "Thanks, keep the change.", "Спасибо, сдачи не надо."],
      ],
      dialogues: [
        { en: "Calling a Taxi", hy: "Տաքսի կանչել", ru: "Вызвать такси",
          turns: [
            ["user", "Ուր եք գնում։", "Where are you going?", "Куда едете?"],
            ["nurik", "Կենտրոն, խնդրեմ։", "Center, please.", "В центр, пожалуйста."],
            ["user", "Որքա՞ն կարժենա։", "How much?", "Сколько?"],
            ["nurik", "Երկու հազար դրամ։", "Two thousand dram.", "Две тысячи драмов."],
          ]},
        { en: "Stop Here", hy: "Կանգնեք այստեղ", ru: "Остановите здесь",
          turns: [
            ["user", "Կանգնեք այստեղ, խնդրեմ։", "Stop here, please.", "Остановите здесь, пожалуйста."],
            ["nurik", "Հիմա։", "Now?", "Сейчас?"],
            ["user", "Այո։", "Yes.", "Да."],
            ["nurik", "Լավ։", "OK.", "Хорошо."],
          ]},
        { en: "Lost the Way", hy: "Կորած ճանապարհ", ru: "Сбились с пути",
          turns: [
            ["user", "Կարծում եմ՝ կորել ենք։", "I think we are lost.", "Кажется, мы заблудились."],
            ["nurik", "Թողեք քարտեզը նայեմ։", "Let me check the map.", "Дайте посмотрю карту."],
            ["user", "Շնորհակալություն։", "Thanks.", "Спасибо."],
            ["nurik", "Մի անհանգստացեք։", "Don't worry.", "Не волнуйтесь."],
          ]},
      ],
    },
    hotel: {
      vocab: [
        ["հյուրանոց", "hotel", "отель"], ["համար", "room", "номер"],
        ["ընդունարան", "reception", "ресепшн"], ["բանալի", "key", "ключ"],
        ["հարկ", "floor", "этаж"], ["վերելակ", "elevator", "лифт"],
        ["աստիճան", "stairs", "лестница"], ["անկողին", "bed", "кровать"],
        ["լոգարան", "bathroom", "ванная"], ["սրբիչ", "towel", "полотенце"],
        ["օճառ", "soap", "мыло"], ["շամպուն", "shampoo", "шампунь"],
        ["նախաճաշ", "breakfast", "завтрак"], ["ճաշ", "lunch", "обед"],
        ["ընթրիք", "dinner", "ужин"], ["wifi", "wifi", "wifi"],
        ["կլիմայատար", "air conditioner", "кондиционер"], ["հեռուստացույց", "TV", "телевизор"],
        ["պատուհան", "window", "окно"], ["հանգիստ", "quiet", "тихий"],
        ["աղմկոտ", "noisy", "шумный"], ["մաքուր", "clean", "чистый"],
        ["կեղտոտ", "dirty", "грязный"], ["ամրագրում", "reservation", "бронь"],
        ["հաշիվ", "bill", "счёт"],
      ],
      phrases: [
        ["Ունե՞ք ազատ սենյակ։", "Do you have a free room?", "У вас есть свободные номера?"],
        ["Ուզում եմ ամրագրել։", "I want to book.", "Хочу забронировать."],
        ["Մեկ գիշերվա համար։", "For one night.", "На одну ночь."],
        ["Որքա՞ն արժե գիշերը։", "How much per night?", "Сколько за ночь?"],
        ["Նախաճաշը ներառվա՞ծ է։", "Is breakfast included?", "Завтрак включён?"],
        ["Որտե՞ղ է վերելակը։", "Where is the elevator?", "Где лифт?"],
        ["Կլիմայատարը չի աշխատում։", "The AC doesn't work.", "Кондиционер не работает."],
        ["Կարո՞ղ եմ լիցքավորիչ ստանալ։", "Can I get a charger?", "Можно зарядку?"],
        ["Wifi-ի գաղտնաբառը։", "Wifi password.", "Пароль от wifi."],
        ["Ի՞նչ ժամին է նախաճաշը։", "What time is breakfast?", "Во сколько завтрак?"],
        ["Ուզում եմ դուրս գալ։", "I want to check out.", "Хочу выехать."],
        ["Շատ լավ սենյակ էր։", "It was a great room.", "Очень хороший номер."],
      ],
      dialogues: [
        { en: "Check-in", hy: "Մուտք", ru: "Заселение",
          turns: [
            ["user", "Ամրագրում ունեմ։", "I have a reservation.", "У меня бронь."],
            ["nurik", "Անունով։", "Under what name?", "На какое имя?"],
            ["user", "Արամ Պետրոսյան։", "Aram Petrosyan.", "Арам Петросян."],
            ["nurik", "Համար 305-ը, երրորդ հարկ։", "Room 305, third floor.", "Номер 305, третий этаж."],
          ]},
        { en: "Broken AC", hy: "Փչացած կլիմայատար", ru: "Сломанный кондиционер",
          turns: [
            ["user", "Կլիմայատարը չի աշխատում։", "The AC isn't working.", "Кондиционер не работает."],
            ["nurik", "Հիմա կուղարկեմ մեկին։", "I'll send someone now.", "Сейчас пришлю кого-нибудь."],
            ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
            ["nurik", "Ներեցեք անհանգստության համար։", "Sorry for the trouble.", "Извините за неудобства."],
          ]},
        { en: "Check-out", hy: "Հեռանալ", ru: "Выезд",
          turns: [
            ["user", "Ուզում եմ դուրս գալ։", "I want to check out.", "Хочу выехать."],
            ["nurik", "Հաշիվը պատրաստ է։", "The bill is ready.", "Счёт готов."],
            ["user", "Քարտով եմ վճարում։", "I'll pay by card.", "Заплачу картой."],
            ["nurik", "Շնորհակալություն մնալու համար։", "Thanks for staying.", "Спасибо за визит."],
          ]},
      ],
    },
    directions: {
      vocab: [
        ["աջ", "right", "направо"], ["ձախ", "left", "налево"],
        ["ուղիղ", "straight", "прямо"], ["հետ", "back", "назад"],
        ["հյուսիս", "north", "север"], ["հարավ", "south", "юг"],
        ["արևելք", "east", "восток"], ["արևմուտք", "west", "запад"],
        ["կողքին", "next to", "рядом"], ["դիմաց", "in front of", "напротив"],
        ["հետևում", "behind", "сзади"], ["մեջ", "in", "в"],
        ["վրա", "on", "на"], ["տակ", "under", "под"],
        ["մոտ", "near", "близко"], ["հեռու", "far", "далеко"],
        ["խաչմերուկ", "crossroads", "перекрёсток"], ["անկյուն", "corner", "угол"],
        ["պողոտա", "avenue", "проспект"], ["փողոց", "street", "улица"],
        ["քարտեզ", "map", "карта"], ["կողմնացույց", "compass", "компас"],
        ["գալ", "to come", "приходить"], ["գնալ", "to go", "идти"],
        ["անցնել", "to cross", "переходить"],
      ],
      phrases: [
        ["Որտե՞ղ է թանգարանը։", "Where is the museum?", "Где музей?"],
        ["Գնացեք ուղիղ։", "Go straight.", "Идите прямо."],
        ["Թեքվեք աջ։", "Turn right.", "Поверните направо."],
        ["Թեքվեք ձախ։", "Turn left.", "Поверните налево."],
        ["Մի քանի մետր այնտեղ։", "A few meters over there.", "Несколько метров туда."],
        ["Կորել եմ։", "I am lost.", "Я заблудился."],
        ["Կարո՞ղ եք օգնել։", "Can you help?", "Можете помочь?"],
        ["Մոտ է, թե հեռու։", "Is it near or far?", "Близко или далеко?"],
        ["Հինգ րոպեի ճանապարհ է։", "It's a five-minute walk.", "Пять минут пешком."],
        ["Անկյունից հետո։", "After the corner.", "После угла."],
        ["Կամուրջի վրայով։", "Over the bridge.", "Через мост."],
        ["Կողքին է բանկի։", "It's next to the bank.", "Рядом с банком."],
      ],
      dialogues: [
        { en: "Lost Tourist", hy: "Կորած զբոսաշրջիկ", ru: "Заблудившийся турист",
          turns: [
            ["user", "Կորել եմ։ Որտեղ է կենտրոնը։", "I'm lost. Where is the center?", "Я заблудился. Где центр?"],
            ["nurik", "Ուղիղ գնացեք, ապա աջ։", "Go straight then right.", "Прямо, потом направо."],
            ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
            ["nurik", "Խնդրեմ։", "You're welcome.", "Пожалуйста."],
          ]},
        { en: "Asking a Local", hy: "Տեղացուն հարցնել", ru: "Спросить местного",
          turns: [
            ["user", "Որտե՞ղ է մետրոյի կայարանը։", "Where is the metro station?", "Где станция метро?"],
            ["nurik", "Անկյունի շուրջն է։", "Around the corner.", "За углом."],
            ["user", "Մոտ է։", "It's close.", "Близко."],
            ["nurik", "Այո, երկու րոպե։", "Yes, two minutes.", "Да, две минуты."],
          ]},
        { en: "Map", hy: "Քարտեզ", ru: "Карта",
          turns: [
            ["user", "Քարտեզ ունե՞ք։", "Do you have a map?", "У вас есть карта?"],
            ["nurik", "Այո, ահա։", "Yes, here.", "Да, вот."],
            ["user", "Ցույց տվեք, որտեղ ենք։", "Show where we are.", "Покажите, где мы."],
            ["nurik", "Այստեղ։", "Here.", "Здесь."],
          ]},
      ],
    },
    train: {
      vocab: [
        ["գնացք", "train", "поезд"], ["կայարան", "station", "вокзал"],
        ["հարթակ", "platform", "платформа"], ["տոմս", "ticket", "билет"],
        ["վագոն", "carriage", "вагон"], ["տեղ", "seat", "место"],
        ["ճանապարհ", "route", "маршрут"], ["մեկնում", "departure", "отправление"],
        ["ժամանում", "arrival", "прибытие"], ["ուղիղ", "direct", "прямой"],
        ["անցում", "transfer", "пересадка"], ["գիշերային", "night", "ночной"],
        ["ցերեկային", "day", "дневной"], ["դանդաղ", "slow", "медленный"],
        ["արագ", "fast", "быстрый"], ["մետրո", "metro", "метро"],
        ["էլեկտրագնացք", "electric train", "электричка"], ["ուղեկից", "conductor", "проводник"],
        ["հատատորեն", "specifically", "конкретно"], ["ուղևոր", "passenger", "пассажир"],
        ["դուռ", "door", "дверь"], ["պատուհան", "window", "окно"],
        ["բացել", "to open", "открыть"], ["փակել", "to close", "закрыть"],
        ["նստել", "to sit", "сесть"],
      ],
      phrases: [
        ["Ե՞րբ է մեկնում գնացքը։", "When does the train leave?", "Когда отходит поезд?"],
        ["Ո՞ր հարթակից։", "From which platform?", "С какой платформы?"],
        ["Մեկ տոմս, խնդրեմ։", "One ticket, please.", "Один билет, пожалуйста."],
        ["Քանի՞ ժամ է ճանապարհը։", "How long is the trip?", "Сколько часов в пути?"],
        ["Ուղիղ գնացք կա՞։", "Is there a direct train?", "Есть прямой поезд?"],
        ["Անցում Թբիլիսիում։", "Transfer in Tbilisi.", "Пересадка в Тбилиси."],
        ["Իմ տեղը 14-ն է։", "My seat is 14.", "Моё место 14-е."],
        ["Որ վագոնում է։", "In which carriage?", "В каком вагоне?"],
        ["Գնացքը ուշանում է։", "The train is late.", "Поезд опаздывает."],
        ["Կարո՞ղ եմ բացել պատուհանը։", "Can I open the window?", "Можно открыть окно?"],
        ["Հաջորդ կայարանը ո՞րն է։", "What's the next station?", "Какая следующая станция?"],
        ["Իջնում եմ Գյումրիում։", "I get off in Gyumri.", "Я выхожу в Гюмри."],
      ],
      dialogues: [
        { en: "Ticket Office", hy: "Տոմսարկղ", ru: "Касса",
          turns: [
            ["user", "Մեկ տոմս Գյումրի։", "One ticket to Gyumri.", "Один билет до Гюмри."],
            ["nurik", "Ուղի՞ղ թե անցումով։", "Direct or with transfer?", "Прямой или с пересадкой?"],
            ["user", "Ուղիղ։", "Direct.", "Прямой."],
            ["nurik", "Երեք հազար դրամ։", "Three thousand dram.", "Три тысячи драмов."],
          ]},
        { en: "Wrong Platform", hy: "Սխալ հարթակ", ru: "Не та платформа",
          turns: [
            ["user", "Սա Գյումրիի գնացքն է։", "Is this the Gyumri train?", "Это поезд на Гюмри?"],
            ["nurik", "Ոչ, սա Երևան է գնում։", "No, this goes to Yerevan.", "Нет, этот в Ереван."],
            ["user", "Որտե՞ղ է իմը։", "Where is mine?", "Где мой?"],
            ["nurik", "Երրորդ հարթակ։", "Platform three.", "Третья платформа."],
          ]},
        { en: "On Board", hy: "Գնացքում", ru: "В поезде",
          turns: [
            ["user", "Իմ տեղը 14-ն է։", "My seat is 14.", "Моё место 14-е."],
            ["nurik", "Պատուհանի կողմն է։", "It's by the window.", "У окна."],
            ["user", "Հիանալի։", "Excellent.", "Отлично."],
            ["nurik", "Բարի ճանապարհ։", "Have a good trip.", "Счастливого пути."],
          ]},
      ],
    },
    bus: {
      vocab: [
        ["ավտոբուս", "bus", "автобус"], ["կանգառ", "stop", "остановка"],
        ["երթուղի", "route", "маршрут"], ["համար", "number", "номер"],
        ["վարորդ", "driver", "водитель"], ["տոմս", "ticket", "билет"],
        ["անցաթուղթ", "pass", "проездной"], ["կանգնել", "to stop", "остановиться"],
        ["հաջորդ", "next", "следующий"], ["նախորդ", "previous", "предыдущий"],
        ["մարդաշատ", "crowded", "переполненный"], ["դատարկ", "empty", "пустой"],
        ["նստել", "to sit", "сидеть"], ["կանգնել", "to stand", "стоять"],
        ["իջնել", "to get off", "выйти"], ["բարձրանալ", "to get on", "сесть"],
        ["կենտրոն", "center", "центр"], ["արվարձան", "suburb", "пригород"],
        ["տրանսպորտ", "transport", "транспорт"], ["հանրային", "public", "общественный"],
        ["մարշրուտկա", "minibus", "маршрутка"], ["տրոլեյբուս", "trolleybus", "троллейбус"],
        ["մետրո", "metro", "метро"], ["քարտ", "card", "карта"],
        ["փոխվճար", "transfer", "пересадка"],
      ],
      phrases: [
        ["Ո՞ր ավտոբուսը գնում է կենտրոն։", "Which bus goes to center?", "Какой автобус едет в центр?"],
        ["Քսանմեկը։", "Number twenty-one.", "Двадцать первый."],
        ["Որքա՞ն է տոմսը։", "How much is the ticket?", "Сколько билет?"],
        ["Հարյուր դրամ։", "One hundred dram.", "Сто драмов."],
        ["Հաջորդ կանգառը ո՞րն է։", "What's the next stop?", "Какая следующая остановка?"],
        ["Իջնում եմ հաջորդ կանգառում։", "I get off at the next stop.", "Выхожу на следующей."],
        ["Կանգնեցրեք, խնդրեմ։", "Stop, please.", "Остановите, пожалуйста."],
        ["Մարդաշատ է։", "It's crowded.", "Переполнено."],
        ["Որքա՞ն ժամ է գնում։", "How long does it take?", "Сколько идёт?"],
        ["Քաղաքից դուրս է գնում։", "It goes out of the city.", "Едет за город."],
        ["Փոխվճար անհրաժե՞շտ է։", "Is a transfer needed?", "Нужна пересадка?"],
        ["Որտե՞ղ է կանգառը։", "Where is the stop?", "Где остановка?"],
      ],
      dialogues: [
        { en: "Finding the Bus", hy: "Ավտոբուս գտնել", ru: "Найти автобус",
          turns: [
            ["user", "Ո՞ր ավտոբուսն է կենտրոն գնում։", "Which bus goes to center?", "Какой автобус в центр?"],
            ["nurik", "Քսանմեկը։", "Number twenty-one.", "Двадцать первый."],
            ["user", "Որտե՞ղ է կանգառը։", "Where is the stop?", "Где остановка?"],
            ["nurik", "Փողոցի դիմաց։", "Across the street.", "Через улицу."],
          ]},
        { en: "Stop Please", hy: "Կանգնեցրեք", ru: "Остановите",
          turns: [
            ["user", "Կանգնեցրեք հաջորդ կանգառում։", "Stop at the next stop.", "Остановите на следующей."],
            ["nurik", "Լավ։", "OK.", "Хорошо."],
            ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
            ["nurik", "Բարի ճանապարհ։", "Have a good trip.", "Счастливого пути."],
          ]},
        { en: "Crowded Bus", hy: "Մարդաշատ ավտոբուս", ru: "Полный автобус",
          turns: [
            ["user", "Շատ մարդաշատ է։", "Very crowded.", "Очень переполнено."],
            ["nurik", "Այս ժամին միշտ։", "Always at this hour.", "Всегда в этот час."],
            ["user", "Հաջորդը կսպասեմ։", "I'll wait for the next.", "Подожду следующий."],
            ["nurik", "Դա խելացի որոշում է։", "A wise choice.", "Мудрый выбор."],
          ]},
      ],
    },
    tourism: {
      vocab: [
        ["զբոսաշրջիկ", "tourist", "турист"], ["զբոսաշրջություն", "tourism", "туризм"],
        ["թանգարան", "museum", "музей"], ["եկեղեցի", "church", "церковь"],
        ["վանք", "monastery", "монастырь"], ["բերդ", "fortress", "крепость"],
        ["քանդակ", "sculpture", "скульптура"], ["հուշարձան", "monument", "памятник"],
        ["այգի", "park", "парк"], ["հրապարակ", "square", "площадь"],
        ["էքսկուրսիա", "tour", "экскурсия"], ["ուղեկցորդ", "guide", "гид"],
        ["տոմս", "ticket", "билет"], ["լուսանկար", "photo", "фото"],
        ["հուշանվեր", "souvenir", "сувенир"], ["պատմություն", "history", "история"],
        ["մշակույթ", "culture", "культура"], ["արվեստ", "art", "искусство"],
        ["հին", "ancient", "древний"], ["գեղեցիկ", "beautiful", "красивый"],
        ["տպավորիչ", "impressive", "впечатляющий"], ["հանրահայտ", "famous", "знаменитый"],
        ["այցելել", "to visit", "посетить"], ["տեսնել", "to see", "видеть"],
        ["լուսանկարել", "to photograph", "фотографировать"],
      ],
      phrases: [
        ["Որո՞նք են տեսարժան վայրերը։", "What are the sights?", "Какие достопримечательности?"],
        ["Ուզում եմ այցելել թանգարան։", "I want to visit the museum.", "Хочу посетить музей."],
        ["Որքա՞ն է մուտքավճարը։", "How much is admission?", "Сколько вход?"],
        ["Կա՞ ուղեցույց հայերեն։", "Is there a guide in Armenian?", "Есть гид на армянском?"],
        ["Կարո՞ղ եմ լուսանկարել։", "Can I take photos?", "Можно фотографировать?"],
        ["Շատ գեղեցիկ է։", "It's very beautiful.", "Очень красиво."],
        ["Քանի՞ տարեկան է։", "How old is it?", "Сколько ему лет?"],
        ["Հազար տարեկան է։", "It's a thousand years old.", "Тысяча лет."],
        ["Հուշանվեր որտեղ գնեմ։", "Where to buy souvenirs?", "Где купить сувениры?"],
        ["Մոտակայքում սրճարան կա՞։", "Is there a café nearby?", "Кафе рядом есть?"],
        ["Այցելության ժամերը։", "Visiting hours.", "Часы посещения."],
        ["Փակ է երկուշաբթի։", "Closed on Monday.", "Закрыто в понедельник."],
      ],
      dialogues: [
        { en: "At the Museum", hy: "Թանգարանում", ru: "В музее",
          turns: [
            ["user", "Որքա՞ն է տոմսը։", "How much is the ticket?", "Сколько билет?"],
            ["nurik", "Հազար հինգ հարյուր դրամ։", "1500 dram.", "Полторы тысячи драмов."],
            ["user", "Ուղեցույց ունե՞ք։", "Do you have a guide?", "Гид есть?"],
            ["nurik", "Այո, անգլերեն և ռուսերեն։", "Yes, in English and Russian.", "Да, на английском и русском."],
          ]},
        { en: "Taking Photos", hy: "Լուսանկարել", ru: "Фотографировать",
          turns: [
            ["user", "Կարո՞ղ եմ լուսանկարել։", "Can I take photos?", "Можно фотографировать?"],
            ["nurik", "Այո, բայց առանց ֆլեշի։", "Yes, but without flash.", "Да, но без вспышки."],
            ["user", "Հասկացա, շնորհակալություն։", "Got it, thanks.", "Понял, спасибо."],
            ["nurik", "Վայելեք այցելությունը։", "Enjoy your visit.", "Приятного посещения."],
          ]},
        { en: "Souvenirs", hy: "Հուշանվերներ", ru: "Сувениры",
          turns: [
            ["user", "Որտեղ վաճառվում են հուշանվերներ։", "Where are souvenirs sold?", "Где продаются сувениры?"],
            ["nurik", "Ելքի մոտ։", "Near the exit.", "У выхода."],
            ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
            ["nurik", "Խնդրեմ։", "You're welcome.", "Пожалуйста."],
          ]},
      ],
    },
    emergency: {
      vocab: [
        ["արտակարգ", "emergency", "экстренный"], ["օգնություն", "help", "помощь"],
        ["ոստիկանություն", "police", "полиция"], ["շտապ օգնություն", "ambulance", "скорая"],
        ["հրշեջ", "fire", "пожарный"], ["հիվանդանոց", "hospital", "больница"],
        ["բժիշկ", "doctor", "врач"], ["դեղատուն", "pharmacy", "аптека"],
        ["վթար", "accident", "авария"], ["հրդեհ", "fire", "пожар"],
        ["գող", "thief", "вор"], ["կորած", "lost", "потерянный"],
        ["վնասված", "injured", "раненый"], ["հիվանդ", "sick", "больной"],
        ["ցավ", "pain", "боль"], ["արյուն", "blood", "кровь"],
        ["դեղ", "medicine", "лекарство"], ["հեռախոս", "phone", "телефон"],
        ["զանգել", "to call", "звонить"], ["օգնել", "to help", "помогать"],
        ["փրկել", "to save", "спасать"], ["վտանգ", "danger", "опасность"],
        ["անվտանգ", "safe", "безопасно"], ["արագ", "quickly", "быстро"],
        ["խնդիր", "problem", "проблема"],
      ],
      phrases: [
        ["Օգնեցեք։", "Help!", "Помогите!"],
        ["Կանչեք շտապ օգնություն։", "Call an ambulance.", "Вызовите скорую."],
        ["Կանչեք ոստիկանություն։", "Call the police.", "Вызовите полицию."],
        ["Հրդեհ է։", "Fire!", "Пожар!"],
        ["Գողացել են պայուսակս։", "My bag was stolen.", "У меня украли сумку."],
        ["Անհրաժեշտ է բժիշկ։", "I need a doctor.", "Нужен врач."],
        ["Որտե՞ղ է հիվանդանոցը։", "Where is the hospital?", "Где больница?"],
        ["Վնասվել եմ։", "I'm injured.", "Я ранен."],
        ["Շատ ցավում է։", "It hurts a lot.", "Очень больно."],
        ["Չեմ կարող շնչել։", "I can't breathe.", "Не могу дышать."],
        ["Կորցրել եմ ճանապարհս։", "I lost my way.", "Я потерял дорогу."],
        ["Զանգեք համար 911։", "Call 911.", "Звоните 911."],
      ],
      dialogues: [
        { en: "Calling for Help", hy: "Օգնություն կանչել", ru: "Звать на помощь",
          turns: [
            ["user", "Օգնեցեք, խնդրեմ։", "Help, please.", "Помогите, пожалуйста."],
            ["nurik", "Ինչ է եղել։", "What happened?", "Что случилось?"],
            ["user", "Իմ ընկերը վատ է զգում։", "My friend feels bad.", "Моему другу плохо."],
            ["nurik", "Հիմա կզանգեմ շտապ օգնություն։", "I'll call ambulance now.", "Сейчас вызову скорую."],
          ]},
        { en: "Stolen Bag", hy: "Գողացված պայուսակ", ru: "Украденная сумка",
          turns: [
            ["user", "Գողացել են պայուսակս։", "My bag was stolen.", "У меня украли сумку."],
            ["nurik", "Որտեղ։", "Where?", "Где?"],
            ["user", "Կենտրոնում։", "In the center.", "В центре."],
            ["nurik", "Գնանք ոստիկանություն։", "Let's go to the police.", "Пойдём в полицию."],
          ]},
        { en: "At the Pharmacy", hy: "Դեղատանը", ru: "В аптеке",
          turns: [
            ["user", "Գլխացավի դեղ ունե՞ք։", "Do you have headache medicine?", "Есть от головной боли?"],
            ["nurik", "Այո, այս հաբերը։", "Yes, these pills.", "Да, эти таблетки."],
            ["user", "Որքա՞ն։", "How much?", "Сколько?"],
            ["nurik", "Երկու հազար դրամ։", "Two thousand dram.", "Две тысячи драмов."],
          ]},
      ],
    },
  };
  const bank = banks[slug];
  return {
    id, worldId: "w3", slug, difficulty: "A2",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: conceptEn, hy: hyT, ru: ruT },
    vocab: bank.vocab, phrases: bank.phrases as any,
    dialogues: bank.dialogues.map((dl: any) => ({
      title: { en: dl.en, hy: dl.hy, ru: dl.ru },
      turns: dl.turns,
    })),
  };
}

function buildWorld4(): QuickLesson[] {
  const topics: Array<[string, string, string, string]> = [
    ["school", "School", "Դպրոց", "Школа"],
    ["university", "University", "Համալսարան", "Университет"],
    ["office", "Office", "Գրասենյակ", "Офис"],
    ["professions", "Professions", "Մասնագիտություններ", "Профессии"],
    ["meetings", "Meetings", "Հանդիպումներ", "Встречи"],
    ["technology", "Technology", "Տեխնոլոգիա", "Технология"],
  ];
  return topics.map(([slug, en, hy, ru], i) => makeWorkEduLesson(`w4_l${i + 1}`, slug, en, hy, ru));
}

function makeWorkEduLesson(id: string, slug: string, enT: string, hyT: string, ruT: string): QuickLesson {
  const seeds: Record<string, { vocab: Array<[string, string, string]>; phrases: Array<[string, string, string]>; dialogues: any[] }> = {
    school: {
      vocab: [
        ["դպրոց", "school", "школа"], ["աշակերտ", "pupil", "ученик"],
        ["ուսուցիչ", "teacher", "учитель"], ["դաս", "lesson", "урок"],
        ["դասարան", "classroom", "класс"], ["տնային", "homework", "домашка"],
        ["քննություն", "exam", "экзамен"], ["գնահատական", "grade", "оценка"],
        ["գիրք", "book", "книга"], ["տետր", "notebook", "тетрадь"],
        ["գրիչ", "pen", "ручка"], ["մատիտ", "pencil", "карандаш"],
        ["գրատախտակ", "blackboard", "доска"], ["կավիճ", "chalk", "мел"],
        ["պայուսակ", "bag", "сумка"], ["ընդմիջում", "break", "перемена"],
        ["մաթեմատիկա", "mathematics", "математика"], ["պատմություն", "history", "история"],
        ["աշխարհագրություն", "geography", "география"], ["ֆիզիկա", "physics", "физика"],
        ["քիմիա", "chemistry", "химия"], ["լեզու", "language", "язык"],
        ["գրականություն", "literature", "литература"], ["սպորտ", "sport", "спорт"],
        ["արվեստ", "art", "искусство"],
      ],
      phrases: [
        ["Ես դպրոցում եմ։", "I am at school.", "Я в школе."],
        ["Տնային աշխատանք ունեմ։", "I have homework.", "У меня домашка."],
        ["Քննություն ունեմ վաղը։", "I have an exam tomorrow.", "Завтра экзамен."],
        ["Իմ սիրած առարկան մաթեմատիկան է։", "My favorite subject is math.", "Любимый предмет — математика."],
        ["Ուսուցիչը խիստ է։", "The teacher is strict.", "Учитель строгий."],
        ["Լավ գնահատական ստացա։", "I got a good grade.", "Получил хорошую оценку."],
        ["Դասարանում քսան աշակերտ կա։", "There are twenty pupils in class.", "В классе двадцать учеников."],
        ["Ընդմիջումը տասը րոպե է։", "The break is ten minutes.", "Перемена десять минут."],
        ["Չհասկացա այս թեման։", "I didn't understand this topic.", "Не понял эту тему."],
        ["Կօգնե՞ք ինձ։", "Can you help me?", "Можете помочь?"],
        ["Հաջորդ դասը ֆիզիկա է։", "Next lesson is physics.", "Следующий урок — физика."],
        ["Դպրոցը կենտրոնում է։", "The school is in the center.", "Школа в центре."],
      ],
      dialogues: [
        { en: "Homework", hy: "Տնային", ru: "Домашка",
          turns: [
            ["nurik", "Տնային արել ե՞ս։", "Have you done homework?", "Сделал домашку?"],
            ["user", "Դեռ ոչ։", "Not yet.", "Ещё нет."],
            ["nurik", "Շտապիր։", "Hurry.", "Поторопись."],
            ["user", "Հիմա անեմ։", "I'll do it now.", "Сейчас сделаю."],
          ]},
        { en: "Favorite Subject", hy: "Սիրած առարկա", ru: "Любимый предмет",
          turns: [
            ["nurik", "Ո՞րն է քո սիրած առարկան։", "What's your favorite subject?", "Какой любимый предмет?"],
            ["user", "Մաթեմատիկան։", "Math.", "Математика."],
            ["nurik", "Հեշտ է քեզ համար։", "Easy for you?", "Тебе легко?"],
            ["user", "Այո, շատ։", "Yes, very.", "Да, очень."],
          ]},
        { en: "Exam Day", hy: "Քննության օր", ru: "День экзамена",
          turns: [
            ["user", "Վաղը քննություն եմ տալիս։", "Tomorrow I have an exam.", "Завтра экзамен."],
            ["nurik", "Հաջողություն։", "Good luck.", "Удачи."],
            ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
            ["nurik", "Հանգիստ արա այսօր։", "Rest today.", "Отдохни сегодня."],
          ]},
      ],
    },
    university: {
      vocab: [
        ["համալսարան", "university", "университет"], ["ուսանող", "student", "студент"],
        ["դասախոս", "lecturer", "лектор"], ["պրոֆեսոր", "professor", "профессор"],
        ["ֆակուլտետ", "faculty", "факультет"], ["մասնագիտություն", "major", "специальность"],
        ["կուրս", "course/year", "курс"], ["սեմեստր", "semester", "семестр"],
        ["լեկցիա", "lecture", "лекция"], ["սեմինար", "seminar", "семинар"],
        ["քննություն", "exam", "экзамен"], ["զաչոտ", "credit test", "зачёт"],
        ["դիպլոմ", "diploma", "диплом"], ["գիտություն", "science", "наука"],
        ["հետազոտություն", "research", "исследование"], ["գրադարան", "library", "библиотека"],
        ["լաբորատորիա", "lab", "лаборатория"], ["հանրակացարան", "dorm", "общежитие"],
        ["կրթաթոշակ", "scholarship", "стипендия"], ["մագիստրատուրա", "master's", "магистратура"],
        ["բակալավրիատ", "bachelor's", "бакалавриат"], ["ասպիրանտուրա", "PhD program", "аспирантура"],
        ["գիտաժողով", "conference", "конференция"], ["հոդված", "article", "статья"],
        ["թեզ", "thesis", "диссертация"],
      ],
      phrases: [
        ["Ես ուսանող եմ։", "I am a student.", "Я студент."],
        ["Սովորում եմ բժշկական ֆակուլտետում։", "I study at the medical faculty.", "Учусь на медфаке."],
        ["Երրորդ կուրսում եմ։", "I'm in third year.", "Я на третьем курсе."],
        ["Իմ մասնագիտությունը ինժեներություն է։", "My major is engineering.", "Моя специальность — инженерия."],
        ["Լեկցիան ձանձրալի է։", "The lecture is boring.", "Лекция скучная."],
        ["Քննություն ունեմ ուրբաթ։", "I have an exam on Friday.", "Экзамен в пятницу."],
        ["Կրթաթոշակ եմ ստանում։", "I get a scholarship.", "Получаю стипендию."],
        ["Ապրում եմ հանրակացարանում։", "I live in the dorm.", "Живу в общежитии."],
        ["Գրադարանում եմ սովորում։", "I study in the library.", "Учусь в библиотеке."],
        ["Թեզ եմ գրում։", "I'm writing a thesis.", "Пишу диссертацию."],
        ["Մագիստրատուրա կընդունվեմ։", "I'll enter master's program.", "Поступлю в магистратуру."],
        ["Համալսարանն մեծ է։", "The university is big.", "Университет большой."],
      ],
      dialogues: [
        { en: "Which Faculty?", hy: "Ո՞ր ֆակուլտետ", ru: "Какой факультет",
          turns: [
            ["nurik", "Ո՞ր ֆակուլտետում ես։", "Which faculty are you in?", "На каком факультете?"],
            ["user", "Տնտեսագիտական։", "Economics.", "Экономический."],
            ["nurik", "Որ կուրս։", "Which year?", "Какой курс?"],
            ["user", "Երկրորդ։", "Second.", "Второй."],
          ]},
        { en: "Exams", hy: "Քննություններ", ru: "Экзамены",
          turns: [
            ["user", "Քանի՞ քննություն ունես։", "How many exams do you have?", "Сколько экзаменов?"],
            ["nurik", "Հինգ։", "Five.", "Пять."],
            ["user", "Շատ է։", "That's a lot.", "Много."],
            ["nurik", "Այո, շատ եմ սովորում։", "Yes, I study a lot.", "Да, много учусь."],
          ]},
        { en: "Thesis", hy: "Թեզ", ru: "Диссертация",
          turns: [
            ["nurik", "Թեզիդ թեման։", "Your thesis topic?", "Тема диссертации?"],
            ["user", "Արհեստական բանականություն։", "Artificial intelligence.", "Искусственный интеллект."],
            ["nurik", "Հետաքրքիր է։", "Interesting.", "Интересно."],
            ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
          ]},
      ],
    },
    office: {
      vocab: [
        ["գրասենյակ", "office", "офис"], ["աշխատակից", "employee", "сотрудник"],
        ["գործընկեր", "colleague", "коллега"], ["ղեկավար", "manager", "руководитель"],
        ["տնօրեն", "director", "директор"], ["փոխտնօրեն", "deputy director", "замдиректора"],
        ["աշխատանք", "work", "работа"], ["պայմանագիր", "contract", "контракт"],
        ["աշխատավարձ", "salary", "зарплата"], ["արձակուրդ", "vacation", "отпуск"],
        ["հանդիպում", "meeting", "встреча"], ["զեկույց", "report", "отчёт"],
        ["նախագիծ", "project", "проект"], ["խնդիր", "task", "задача"],
        ["վերջնաժամկետ", "deadline", "дедлайн"], ["զանգ", "call", "звонок"],
        ["էլեկտրոնային փոստ", "email", "электронная почта"], ["համակարգիչ", "computer", "компьютер"],
        ["տպիչ", "printer", "принтер"], ["ֆայլ", "file", "файл"],
        ["փաստաթուղթ", "document", "документ"], ["ստորագրություն", "signature", "подпись"],
        ["կնիք", "stamp", "печать"], ["հաճախորդ", "client", "клиент"],
        ["ընկերություն", "company", "компания"],
      ],
      phrases: [
        ["Աշխատում եմ ութից հինգ։", "I work eight to five.", "Работаю с восьми до пяти."],
        ["Հանդիպում ունենք երեքին։", "We have a meeting at three.", "Встреча в три."],
        ["Վերջնաժամկետը վաղն է։", "Deadline is tomorrow.", "Дедлайн — завтра."],
        ["Ուղարկիր էլեկտրոնային։", "Send an email.", "Отправь email."],
        ["Տպիր այս փաստաթուղթը։", "Print this document.", "Распечатай документ."],
        ["Պայմանագիրը ստորագրված է։", "The contract is signed.", "Контракт подписан."],
        ["Աշխատավարձը ուշանում է։", "Salary is delayed.", "Зарплата задерживается."],
        ["Արձակուրդ եմ խնդրում։", "I'm requesting vacation.", "Прошу отпуск."],
        ["Նախագիծը ավարտված է։", "The project is finished.", "Проект завершён."],
        ["Հաճախորդը գոհ է։", "The client is happy.", "Клиент доволен."],
        ["Համակարգիչը չի աշխատում։", "Computer isn't working.", "Компьютер не работает."],
        ["Գործընկերոջս հետ եմ։", "I'm with my colleague.", "Я с коллегой."],
      ],
      dialogues: [
        { en: "Meeting at Three", hy: "Հանդիպում երեքին", ru: "Встреча в три",
          turns: [
            ["nurik", "Երեքին հանդիպում ունենք։", "Meeting at three.", "Встреча в три."],
            ["user", "Որտե՞ղ։", "Where?", "Где?"],
            ["nurik", "Մեծ դահլիճում։", "In the big hall.", "В большом зале."],
            ["user", "Կլինեմ։", "I'll be there.", "Буду."],
          ]},
        { en: "Print Document", hy: "Փաստաթուղթ տպել", ru: "Распечатать документ",
          turns: [
            ["user", "Տպիչը չի աշխատում։", "Printer isn't working.", "Принтер не работает."],
            ["nurik", "IT-ին զանգիր։", "Call IT.", "Позвони в айти."],
            ["user", "Արդեն զանգել եմ։", "Already did.", "Уже звонил."],
            ["nurik", "Շուտով կգան։", "They'll come soon.", "Скоро придут."],
          ]},
        { en: "Vacation Request", hy: "Արձակուրդի դիմում", ru: "Заявление на отпуск",
          turns: [
            ["user", "Ուզում եմ արձակուրդ։", "I want vacation.", "Хочу отпуск."],
            ["nurik", "Քանի՞ օր։", "How many days?", "Сколько дней?"],
            ["user", "Տասը։", "Ten.", "Десять."],
            ["nurik", "Լավ, կհաստատեմ։", "OK, I'll approve.", "Хорошо, утвержу."],
          ]},
      ],
    },
    professions: {
      vocab: [
        ["բժիշկ", "doctor", "врач"], ["ուսուցիչ", "teacher", "учитель"],
        ["ինժեներ", "engineer", "инженер"], ["ծրագրավորող", "programmer", "программист"],
        ["լրագրող", "journalist", "журналист"], ["իրավաբան", "lawyer", "юрист"],
        ["արտիստ", "artist", "артист"], ["երաժիշտ", "musician", "музыкант"],
        ["խոհարար", "chef", "повар"], ["մատուցող", "waiter", "официант"],
        ["վարորդ", "driver", "водитель"], ["ոստիկան", "policeman", "полицейский"],
        ["քարտուղար", "secretary", "секретарь"], ["մենեջեր", "manager", "менеджер"],
        ["տնօրեն", "director", "директор"], ["գիտնական", "scientist", "учёный"],
        ["բուժքույր", "nurse", "медсестра"], ["ճարտարապետ", "architect", "архитектор"],
        ["լուսանկարիչ", "photographer", "фотограф"], ["դիզայներ", "designer", "дизайнер"],
        ["հաշվապահ", "accountant", "бухгалтер"], ["բանվոր", "worker", "рабочий"],
        ["գյուղացի", "farmer", "фермер"], ["զինվոր", "soldier", "солдат"],
        ["հոգևորական", "priest", "священник"],
      ],
      phrases: [
        ["Ինչով ե՞ս զբաղվում։", "What do you do?", "Чем занимаешься?"],
        ["Ես ծրագրավորող եմ։", "I'm a programmer.", "Я программист."],
        ["Աշխատում եմ բանկում։", "I work at a bank.", "Работаю в банке."],
        ["Իմ աշխատանքը հետաքրքիր է։", "My work is interesting.", "Работа интересная."],
        ["Շատ եմ սիրում աշխատանքս։", "I love my job.", "Очень люблю работу."],
        ["Աշխատանք եմ փնտրում։", "I'm looking for work.", "Ищу работу."],
        ["Ուզում եմ մասնագիտություն փոխել։", "I want to change profession.", "Хочу сменить профессию."],
        ["Բժիշկը հանճար է։", "The doctor is a genius.", "Врач — гений."],
        ["Իմ եղբայրը ինժեներ է։", "My brother is an engineer.", "Брат — инженер."],
        ["Աշխատանքս կանգուն է։", "My job is stable.", "Работа стабильная."],
        ["Աշխատավարձը բարձր է։", "Salary is high.", "Зарплата высокая."],
        ["Ուսուցիչը պատասխանատու մասնագիտություն է։", "Teacher is a responsible profession.", "Учитель — ответственная профессия."],
      ],
      dialogues: [
        { en: "What Do You Do?", hy: "Ինչով ես զբաղվում", ru: "Чем занимаешься",
          turns: [
            ["nurik", "Ինչով ե՞ս զբաղվում։", "What do you do?", "Чем занимаешься?"],
            ["user", "Ես լրագրող եմ։", "I'm a journalist.", "Я журналист."],
            ["nurik", "Որ թերթում։", "At what newspaper?", "В какой газете?"],
            ["user", "Ազատամտություն։", "Azatamtutyun.", "Азатамтутюн."],
          ]},
        { en: "Career Change", hy: "Կարիերայի փոփոխություն", ru: "Смена карьеры",
          turns: [
            ["user", "Մասնագիտություն եմ փոխում։", "I'm changing profession.", "Меняю профессию."],
            ["nurik", "Ի՞նչ ես դառնում։", "What are you becoming?", "Кем становишься?"],
            ["user", "Ծրագրավորող։", "Programmer.", "Программистом."],
            ["nurik", "Հաջողություն։", "Good luck.", "Удачи."],
          ]},
        { en: "Job Hunt", hy: "Աշխատանքի որոնում", ru: "Поиск работы",
          turns: [
            ["user", "Աշխատանք եմ փնտրում։", "I'm looking for work.", "Ищу работу."],
            ["nurik", "Որ ոլորտում։", "In what field?", "В какой сфере?"],
            ["user", "Մարքեթինգ։", "Marketing.", "Маркетинг."],
            ["nurik", "Հաջողություն։", "Good luck.", "Удачи."],
          ]},
      ],
    },
    meetings: {
      vocab: [
        ["հանդիպում", "meeting", "встреча"], ["քննարկում", "discussion", "обсуждение"],
        ["որոշում", "decision", "решение"], ["օրակարգ", "agenda", "повестка"],
        ["նիստ", "session", "заседание"], ["մասնակից", "participant", "участник"],
        ["նախագահ", "chair", "председатель"], ["քարտուղար", "secretary", "секретарь"],
        ["զեկույց", "report", "доклад"], ["ներկայացում", "presentation", "презентация"],
        ["հարց", "question", "вопрос"], ["պատասխան", "answer", "ответ"],
        ["կարծիք", "opinion", "мнение"], ["առաջարկ", "proposal", "предложение"],
        ["քվեարկություն", "vote", "голосование"], ["համաձայնություն", "agreement", "соглашение"],
        ["դեմ", "against", "против"], ["կողմ", "for", "за"],
        ["ձեռնպահ", "abstain", "воздержался"], ["արձանագրություն", "minutes", "протокол"],
        ["պաշտոնական", "official", "официальный"], ["ոչ պաշտոնական", "informal", "неформальный"],
        ["հեռակա", "remote", "удалённый"], ["տեսազանգ", "video call", "видеозвонок"],
        ["ընդմիջում", "break", "перерыв"],
      ],
      phrases: [
        ["Հանդիպումը սկսենք։", "Let's start the meeting.", "Начнём встречу."],
        ["Օրակարգում երեք հարց է։", "There are three items on the agenda.", "В повестке три вопроса."],
        ["Ո՞վ ուզում է խոսել։", "Who wants to speak?", "Кто хочет высказаться?"],
        ["Իմ կարծիքով…", "In my opinion…", "По моему мнению…"],
        ["Համաձայն եմ։", "I agree.", "Согласен."],
        ["Չեմ համաձայնում։", "I disagree.", "Не согласен."],
        ["Քվեարկենք։", "Let's vote.", "Голосуем."],
        ["Կողմ եմ։", "I'm in favor.", "Я за."],
        ["Դեմ եմ։", "I'm against.", "Я против."],
        ["Ընդմիջում տանք։", "Let's take a break.", "Давайте перерыв."],
        ["Հանդիպումն ավարտված է։", "Meeting is over.", "Встреча окончена."],
        ["Արձանագրությունը կուղարկեմ։", "I'll send the minutes.", "Отправлю протокол."],
      ],
      dialogues: [
        { en: "Starting Meeting", hy: "Հանդիպումի սկիզբ", ru: "Начало встречи",
          turns: [
            ["nurik", "Բոլորը այստե՞ղ են։", "Is everyone here?", "Все здесь?"],
            ["user", "Երկու հոգի ուշանում են։", "Two are late.", "Двое опаздывают."],
            ["nurik", "Չենք սպասում, սկսենք։", "Let's not wait, start.", "Не ждём, начинаем."],
            ["user", "Համաձայն եմ։", "I agree.", "Согласен."],
          ]},
        { en: "Voting", hy: "Քվեարկություն", ru: "Голосование",
          turns: [
            ["nurik", "Քվեարկենք առաջարկի համար։", "Let's vote on the proposal.", "Голосуем за предложение."],
            ["user", "Ես կողմ եմ։", "I'm for it.", "Я за."],
            ["nurik", "Մյուսները։", "Others?", "Остальные?"],
            ["user", "Բոլորը կողմ։", "Everyone in favor.", "Все за."],
          ]},
        { en: "Wrapping Up", hy: "Ավարտել", ru: "Завершение",
          turns: [
            ["nurik", "Հանդիպումն ավարտված է։", "Meeting is over.", "Встреча окончена."],
            ["user", "Շնորհակալություն բոլորին։", "Thanks everyone.", "Спасибо всем."],
            ["nurik", "Արձանագրությունը կուղարկեմ։", "I'll send the minutes.", "Пришлю протокол."],
            ["user", "Հիանալի։", "Excellent.", "Отлично."],
          ]},
      ],
    },
    technology: {
      vocab: [
        ["համակարգիչ", "computer", "компьютер"], ["նոութբուք", "laptop", "ноутбук"],
        ["հեռախոս", "phone", "телефон"], ["պլանշետ", "tablet", "планшет"],
        ["էկրան", "screen", "экран"], ["ստեղնաշար", "keyboard", "клавиатура"],
        ["մկնիկ", "mouse", "мышь"], ["ֆայլ", "file", "файл"],
        ["թղթապանակ", "folder", "папка"], ["ծրագիր", "program", "программа"],
        ["հավելված", "app", "приложение"], ["կայք", "website", "сайт"],
        ["էջ", "page", "страница"], ["հղում", "link", "ссылка"],
        ["գաղտնաբառ", "password", "пароль"], ["օգտանուն", "username", "имя пользователя"],
        ["հաշիվ", "account", "аккаунт"], ["ինտերնետ", "internet", "интернет"],
        ["wifi", "wifi", "wifi"], ["ցանց", "network", "сеть"],
        ["տվյալներ", "data", "данные"], ["կրկնօրինակ", "backup", "резервная копия"],
        ["թարմացում", "update", "обновление"], ["սխալ", "error", "ошибка"],
        ["վիրուս", "virus", "вирус"],
      ],
      phrases: [
        ["Համակարգիչը կախված է։", "The computer is frozen.", "Компьютер завис."],
        ["Վերաբեռնիր։", "Restart it.", "Перезагрузи."],
        ["Wifi-ի գաղտնաբառը։", "Wifi password.", "Пароль от wifi."],
        ["Մոռացել եմ գաղտնաբառս։", "I forgot my password.", "Забыл пароль."],
        ["Ստեղծիր նոր հաշիվ։", "Create a new account.", "Создай новый аккаунт."],
        ["Ուղարկիր ֆայլը։", "Send the file.", "Отправь файл."],
        ["Թարմացում կա։", "There's an update.", "Есть обновление."],
        ["Սխալ ցույց է տալիս։", "It shows an error.", "Показывает ошибку."],
        ["Կայքն չի բացվում։", "The site won't open.", "Сайт не открывается."],
        ["Ինտերնետ չկա։", "There's no internet.", "Нет интернета."],
        ["Բեռնի՛ր հավելվածը։", "Download the app.", "Скачай приложение."],
        ["Ապահով գաղտնաբառ դիր։", "Set a strong password.", "Поставь надёжный пароль."],
      ],
      dialogues: [
        { en: "Frozen Computer", hy: "Կախված համակարգիչ", ru: "Зависший компьютер",
          turns: [
            ["user", "Համակարգիչը կախված է։", "Computer is frozen.", "Компьютер завис."],
            ["nurik", "Վերաբեռնիր։", "Restart it.", "Перезагрузи."],
            ["user", "Փորձեցի՝ չստացվեց։", "I tried, didn't work.", "Попробовал, не получилось."],
            ["nurik", "IT-ին զանգիր։", "Call IT.", "Позвони в айти."],
          ]},
        { en: "Forgot Password", hy: "Մոռացած գաղտնաբառ", ru: "Забыл пароль",
          turns: [
            ["user", "Մոռացել եմ գաղտնաբառս։", "I forgot my password.", "Забыл пароль."],
            ["nurik", "Վերականգնիր այն։", "Reset it.", "Сбрось его."],
            ["user", "Ինչպե՞ս։", "How?", "Как?"],
            ["nurik", "Սեղմիր «մոռացել եմ»։", "Click 'forgot'.", "Нажми «забыл»."],
          ]},
        { en: "No Internet", hy: "Ինտերնետ չկա", ru: "Нет интернета",
          turns: [
            ["user", "Ինտերնետ չկա։", "No internet.", "Нет интернета."],
            ["nurik", "Ստուգիր ռոութերը։", "Check the router.", "Проверь роутер."],
            ["user", "Կարմիր լույս է վառվում։", "Red light is on.", "Горит красный."],
            ["nurik", "Զանգիր մատակարարին։", "Call the provider.", "Позвони провайдеру."],
          ]},
      ],
    },
  };
  const bank = seeds[slug] ?? seeds.school;
  return {
    id, worldId: "w4", slug, difficulty: "A2",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: enT, hy: hyT, ru: ruT },
    vocab: bank.vocab, phrases: bank.phrases as any,
    dialogues: bank.dialogues.map((dl: any) => ({
      title: { en: dl.en, hy: dl.hy, ru: dl.ru }, turns: dl.turns,
    })),
  };
}

function buildWorld5(): QuickLesson[] {
  const topics: Array<[string, string, string, string]> = [
    ["opinions", "Opinions", "Կարծիքներ", "Мнения"],
    ["emotions", "Emotions", "Զգացմունքներ", "Эмоции"],
    ["storytelling", "Storytelling", "Պատմվածք", "Рассказы"],
    ["problem-solving", "Problem Solving", "Խնդիրների լուծում", "Решение проблем"],
    ["negotiation", "Negotiation", "Բանակցություն", "Переговоры"],
    ["culture", "Culture", "Մշակույթ", "Культура"],
  ];
  return topics.map(([slug, en, hy, ru], i) => makeAdvancedLesson(`w5_l${i + 1}`, slug, en, hy, ru));
}

function makeAdvancedLesson(id: string, slug: string, enT: string, hyT: string, ruT: string): QuickLesson {
  const banks: Record<string, { vocab: Array<[string, string, string]>; phrases: Array<[string, string, string]>; dialogues: any[] }> = {
    opinions: {
      vocab: [
        ["կարծիք", "opinion", "мнение"], ["տեսակետ", "viewpoint", "точка зрения"],
        ["համաձայն", "agree", "согласен"], ["անհամաձայն", "disagree", "не согласен"],
        ["քննարկում", "discussion", "обсуждение"], ["փաստարկ", "argument", "аргумент"],
        ["ապացույց", "proof", "доказательство"], ["փաստ", "fact", "факт"],
        ["կարծել", "to think", "думать"], ["հավատալ", "to believe", "верить"],
        ["մտածել", "to consider", "размышлять"], ["տպավորություն", "impression", "впечатление"],
        ["համոզմունք", "conviction", "убеждение"], ["կասկած", "doubt", "сомнение"],
        ["տրամաբանական", "logical", "логичный"], ["հակասական", "contradictory", "противоречивый"],
        ["ուժեղ", "strong", "сильный"], ["թույլ", "weak", "слабый"],
        ["խելամիտ", "reasonable", "разумный"], ["անհիմն", "groundless", "необоснованный"],
        ["կասկածել", "to doubt", "сомневаться"], ["հիմնավորել", "to justify", "обосновать"],
        ["կողմ", "side", "сторона"], ["հակառակորդ", "opponent", "оппонент"],
        ["համախոհ", "supporter", "сторонник"],
      ],
      phrases: [
        ["Իմ կարծիքով։", "In my opinion.", "По-моему."],
        ["Կարծում եմ՝ դու ճիշտ ես։", "I think you're right.", "Думаю, ты прав."],
        ["Հակառակն եմ կարծում։", "I think the opposite.", "Думаю наоборот."],
        ["Համաձայն եմ քեզ հետ։", "I agree with you.", "Согласен с тобой."],
        ["Չեմ համաձայնում։", "I disagree.", "Не согласен."],
        ["Բացատրիր, խնդրեմ։", "Explain, please.", "Объясни, пожалуйста."],
        ["Քո փաստարկը թույլ է։", "Your argument is weak.", "Твой аргумент слабый."],
        ["Տրամաբանական է։", "It's logical.", "Это логично."],
        ["Կասկած ունեմ։", "I have doubts.", "Сомневаюсь."],
        ["Հիմնավորիր ասածդ։", "Justify what you said.", "Обоснуй сказанное."],
        ["Երկու կողմ էլ ճիշտ են։", "Both sides are right.", "Обе стороны правы."],
        ["Փոխզիջում գտնենք։", "Let's find a compromise.", "Найдём компромисс."],
      ],
      dialogues: [
        { en: "Different Opinions", hy: "Տարբեր կարծիքներ", ru: "Разные мнения",
          turns: [
            ["nurik", "Կարծում եմ՝ ֆիլմը հիասթափեցնող է։", "I think the film is disappointing.", "Думаю, фильм разочаровывает."],
            ["user", "Հակառակը՝ ինձ դուր եկավ։", "On the contrary, I liked it.", "Наоборот, мне понравился."],
            ["nurik", "Ինչու։", "Why?", "Почему?"],
            ["user", "Խոր թեմա ուներ։", "It had a deep theme.", "Глубокая тема."],
          ]},
        { en: "Debate", hy: "Բանավեճ", ru: "Дебаты",
          turns: [
            ["user", "Քո փաստարկը թույլ է։", "Your argument is weak.", "Твой аргумент слабый."],
            ["nurik", "Ինչու։", "Why?", "Почему?"],
            ["user", "Ապացույց չունես։", "You have no proof.", "Нет доказательств."],
            ["nurik", "Կա, թույլ տուր ցույց տամ։", "I do, let me show.", "Есть, дай показать."],
          ]},
        { en: "Compromise", hy: "Փոխզիջում", ru: "Компромисс",
          turns: [
            ["nurik", "Փոխզիջում գտնենք։", "Let's compromise.", "Найдём компромисс."],
            ["user", "Համաձայն եմ։", "Agreed.", "Согласен."],
            ["nurik", "Ի՞նչ ես առաջարկում։", "What do you propose?", "Что предлагаешь?"],
            ["user", "Միջին լուծում։", "A middle solution.", "Среднее решение."],
          ]},
      ],
    },
    emotions: {
      vocab: [
        ["երջանիկ", "happy", "счастливый"], ["տխուր", "sad", "грустный"],
        ["զայրացած", "angry", "злой"], ["զարմացած", "surprised", "удивлённый"],
        ["վախեցած", "scared", "испуганный"], ["հոգնած", "tired", "уставший"],
        ["հանգիստ", "calm", "спокойный"], ["անհանգիստ", "anxious", "тревожный"],
        ["հուզված", "excited", "взволнованный"], ["ձանձրացած", "bored", "скучающий"],
        ["հպարտ", "proud", "гордый"], ["ամաչկոտ", "shy", "стеснительный"],
        ["սիրահարված", "in love", "влюблённый"], ["ատելի", "hateful", "ненавистный"],
        ["ուրախ", "joyful", "радостный"], ["հիասթափված", "disappointed", "разочарованный"],
        ["շփոթված", "confused", "растерянный"], ["համբերատար", "patient", "терпеливый"],
        ["անհամբեր", "impatient", "нетерпеливый"], ["ընկճված", "depressed", "подавленный"],
        ["զգացմունք", "feeling", "чувство"], ["տրամադրություն", "mood", "настроение"],
        ["արցունք", "tear", "слеза"], ["ծիծաղ", "laughter", "смех"],
        ["ժպիտ", "smile", "улыбка"],
      ],
      phrases: [
        ["Ինչպե՞ս ես իրեն զգում։", "How do you feel?", "Как себя чувствуешь?"],
        ["Շատ երջանիկ եմ։", "I am very happy.", "Я очень счастлив."],
        ["Տխուր եմ։", "I'm sad.", "Грустно."],
        ["Ինչու ես տխուր։", "Why are you sad?", "Почему ты грустишь?"],
        ["Հոգնած եմ։", "I'm tired.", "Я устал."],
        ["Անհանգիստ եմ։", "I'm anxious.", "Я тревожусь."],
        ["Ուրախ եմ քեզ տեսնելու համար։", "I'm happy to see you.", "Рад тебя видеть."],
        ["Շատ զայրացած եմ։", "I'm very angry.", "Очень зол."],
        ["Մի՛ վախեցիր։", "Don't be afraid.", "Не бойся."],
        ["Հանգստացիր։", "Calm down.", "Успокойся."],
        ["Հպարտ եմ քեզնով։", "I'm proud of you.", "Горжусь тобой."],
        ["Կարոտել եմ քեզ։", "I miss you.", "Скучаю по тебе."],
      ],
      dialogues: [
        { en: "Bad Day", hy: "Վատ օր", ru: "Плохой день",
          turns: [
            ["nurik", "Ինչպե՞ս ես։", "How are you?", "Как ты?"],
            ["user", "Վատ եմ։", "I'm bad.", "Плохо."],
            ["nurik", "Ինչ է եղել։", "What happened?", "Что случилось?"],
            ["user", "Հոգնած եմ ու տխուր։", "Tired and sad.", "Устал и грущу."],
          ]},
        { en: "Good News", hy: "Բարի լուր", ru: "Хорошие новости",
          turns: [
            ["user", "Շատ ուրախ եմ։", "I'm very happy.", "Очень радуюсь."],
            ["nurik", "Ինչու։", "Why?", "Почему?"],
            ["user", "Աշխատանք եմ գտել։", "I found a job.", "Нашёл работу."],
            ["nurik", "Շնորհավորում եմ։", "Congratulations.", "Поздравляю."],
          ]},
        { en: "Calm Down", hy: "Հանգստացիր", ru: "Успокойся",
          turns: [
            ["nurik", "Հանգստացիր։", "Calm down.", "Успокойся."],
            ["user", "Չեմ կարող։", "I can't.", "Не могу."],
            ["nurik", "Խոր շնչիր։", "Take a deep breath.", "Глубоко вдохни."],
            ["user", "Շնորհակալություն։", "Thank you.", "Спасибо."],
          ]},
      ],
    },
    storytelling: {
      vocab: [
        ["պատմություն", "story", "история"], ["հեքիաթ", "fairytale", "сказка"],
        ["հերոս", "hero", "герой"], ["հերոսուհի", "heroine", "героиня"],
        ["չարագործ", "villain", "злодей"], ["սկիզբ", "beginning", "начало"],
        ["մեջտեղ", "middle", "середина"], ["վերջ", "end", "конец"],
        ["կերպար", "character", "персонаж"], ["սյուժե", "plot", "сюжет"],
        ["իրադարձություն", "event", "событие"], ["տեղ", "place", "место"],
        ["ժամանակ", "time", "время"], ["արկած", "adventure", "приключение"],
        ["գաղտնիք", "secret", "тайна"], ["հրաշք", "miracle", "чудо"],
        ["պատահել", "to happen", "случиться"], ["պատմել", "to tell", "рассказать"],
        ["հիշել", "to remember", "помнить"], ["մոռանալ", "to forget", "забыть"],
        ["հնում", "long ago", "давным-давно"], ["հանկարծ", "suddenly", "вдруг"],
        ["վերջապես", "finally", "наконец"], ["հետո", "then", "потом"],
        ["մինչդեռ", "meanwhile", "тем временем"],
      ],
      phrases: [
        ["Ուզում եմ պատմություն պատմել։", "I want to tell a story.", "Хочу рассказать историю."],
        ["Հնում, շատ վաղուց…", "Long, long ago…", "Давным-давно…"],
        ["Կար, չկար։", "Once upon a time.", "Жили-были."],
        ["Հանկարծ ինչ-որ բան պատահեց։", "Suddenly something happened.", "Вдруг что-то случилось."],
        ["Հերոսը խիզախ էր։", "The hero was brave.", "Герой был храбрым."],
        ["Վերջապես լուծեց խնդիրը։", "Finally he solved the problem.", "Наконец решил проблему."],
        ["Հիշում եմ մի դեպք։", "I remember an incident.", "Помню один случай."],
        ["Մի անգամ…", "Once…", "Однажды…"],
        ["Հետո ինչ եղավ։", "What happened next?", "Что было потом?"],
        ["Շատ հետաքրքիր պատմություն է։", "Very interesting story.", "Очень интересная история."],
        ["Չեմ կարող մոռանալ։", "I can't forget.", "Не могу забыть."],
        ["Վերջը երջանիկ էր։", "The end was happy.", "Конец был счастливым."],
      ],
      dialogues: [
        { en: "Long Ago", hy: "Հնում", ru: "Давным-давно",
          turns: [
            ["nurik", "Պատմություն պատմեմ։", "Let me tell a story.", "Расскажу историю."],
            ["user", "Լսում եմ։", "I'm listening.", "Слушаю."],
            ["nurik", "Հնում, երբ ես երեխա էի…", "Long ago when I was a child…", "Давно, когда я был ребёнком…"],
            ["user", "Հետո՞։", "Then?", "А потом?"],
          ]},
        { en: "Funny Incident", hy: "Զվարճալի դեպք", ru: "Смешной случай",
          turns: [
            ["user", "Հիշում եմ մի զվարճալի դեպք։", "I remember a funny incident.", "Помню смешной случай."],
            ["nurik", "Պատմիր։", "Tell it.", "Расскажи."],
            ["user", "Մի անգամ դպրոցում…", "Once at school…", "Однажды в школе…"],
            ["nurik", "Հետաքրքիր է։", "Interesting.", "Интересно."],
          ]},
        { en: "Happy End", hy: "Երջանիկ ավարտ", ru: "Счастливый конец",
          turns: [
            ["user", "Հետո ի՞նչ եղավ։", "What happened then?", "Что было потом?"],
            ["nurik", "Բոլորը երջանիկ ապրեցին։", "Everyone lived happily.", "Все жили счастливо."],
            ["user", "Հիանալի։", "Excellent.", "Отлично."],
            ["nurik", "Շնորհակալություն լսելու համար։", "Thanks for listening.", "Спасибо, что слушал."],
          ]},
      ],
    },
    "problem-solving": {
      vocab: [
        ["խնդիր", "problem", "проблема"], ["լուծում", "solution", "решение"],
        ["պատճառ", "cause", "причина"], ["հետևանք", "consequence", "последствие"],
        ["վերլուծել", "to analyze", "анализировать"], ["որոշել", "to decide", "решать"],
        ["մտածել", "to think", "думать"], ["փորձել", "to try", "пробовать"],
        ["հաջողվել", "to succeed", "удаваться"], ["ձախողվել", "to fail", "проваливаться"],
        ["քայլ", "step", "шаг"], ["տարբերակ", "option", "вариант"],
        ["ընտրություն", "choice", "выбор"], ["որոշում", "decision", "решение"],
        ["բարդություն", "difficulty", "трудность"], ["հաջողություն", "success", "успех"],
        ["ձախողում", "failure", "провал"], ["կարճ ճանապարհ", "shortcut", "короткий путь"],
        ["լավագույն", "best", "лучший"], ["արագ", "fast", "быстрый"],
        ["ստեղծագործ", "creative", "креативный"], ["համբերություն", "patience", "терпение"],
        ["աշխատանք", "work", "работа"], ["պլան", "plan", "план"],
        ["հանգստություն", "calmness", "спокойствие"],
      ],
      phrases: [
        ["Խնդիր ունենք։", "We have a problem.", "У нас проблема."],
        ["Լուծում գտնենք։", "Let's find a solution.", "Найдём решение."],
        ["Ի՞նչ ես առաջարկում։", "What do you suggest?", "Что предлагаешь?"],
        ["Մի քանի տարբերակ կա։", "There are several options.", "Есть несколько вариантов."],
        ["Որն է լավագույնը։", "Which is best?", "Какой лучший?"],
        ["Փորձենք այս կերպ։", "Let's try this way.", "Попробуем так."],
        ["Չհաջողվեց։", "It didn't work.", "Не получилось."],
        ["Փորձենք նորից։", "Let's try again.", "Попробуем снова."],
        ["Մտածենք միասին։", "Let's think together.", "Подумаем вместе."],
        ["Պետք է պլան։", "We need a plan.", "Нужен план."],
        ["Քայլ առ քայլ։", "Step by step.", "Шаг за шагом."],
        ["Համբերություն ունենանք։", "Let's be patient.", "Будем терпеливы."],
      ],
      dialogues: [
        { en: "Big Problem", hy: "Մեծ խնդիր", ru: "Большая проблема",
          turns: [
            ["user", "Մեծ խնդիր ունենք։", "We have a big problem.", "У нас большая проблема."],
            ["nurik", "Ի՞նչ խնդիր։", "What problem?", "Какая проблема?"],
            ["user", "Հաճախորդը դժգոհ է։", "The client is unhappy.", "Клиент недоволен."],
            ["nurik", "Մտածենք լուծում։", "Let's think of a solution.", "Подумаем над решением."],
          ]},
        { en: "Trying Again", hy: "Կրկին փորձել", ru: "Снова попробовать",
          turns: [
            ["user", "Չհաջողվեց։", "It didn't work.", "Не получилось."],
            ["nurik", "Փորձենք նորից։", "Let's try again.", "Попробуем снова."],
            ["user", "Ինչպե՞ս։", "How?", "Как?"],
            ["nurik", "Այլ մոտեցումով։", "With another approach.", "Другим подходом."],
          ]},
        { en: "Making a Plan", hy: "Պլան կազմել", ru: "Составить план",
          turns: [
            ["nurik", "Պետք է պլան։", "We need a plan.", "Нужен план."],
            ["user", "Գրենք քայլերը։", "Let's write steps.", "Запишем шаги."],
            ["nurik", "Առաջին քայլը։", "First step.", "Первый шаг."],
            ["user", "Վերլուծել իրավիճակը։", "Analyze the situation.", "Проанализировать ситуацию."],
          ]},
      ],
    },
    negotiation: {
      vocab: [
        ["բանակցություն", "negotiation", "переговоры"], ["համաձայնագիր", "agreement", "соглашение"],
        ["պայմաններ", "terms", "условия"], ["գին", "price", "цена"],
        ["զեղչ", "discount", "скидка"], ["առաջարկ", "offer", "предложение"],
        ["հակաառաջարկ", "counter-offer", "контрпредложение"], ["համաձայն", "agreed", "согласовано"],
        ["մերժել", "to reject", "отклонить"], ["ընդունել", "to accept", "принять"],
        ["քննարկել", "to discuss", "обсуждать"], ["պայմանավորվել", "to agree", "договориться"],
        ["զիջել", "to concede", "уступать"], ["պահանջել", "to demand", "требовать"],
        ["փոխզիջում", "compromise", "компромисс"], ["շահ", "benefit", "выгода"],
        ["պարտություն", "loss", "потеря"], ["ռիսկ", "risk", "риск"],
        ["հնարավորություն", "opportunity", "возможность"], ["պայման", "condition", "условие"],
        ["ստորագրել", "to sign", "подписать"], ["հեղինակություն", "authority", "полномочие"],
        ["կողմ", "side", "сторона"], ["հաճախորդ", "client", "клиент"],
        ["մատակարար", "supplier", "поставщик"],
      ],
      phrases: [
        ["Գինը շատ բարձր է։", "The price is too high.", "Цена слишком высокая."],
        ["Կարո՞ղ եք զեղչ տալ։", "Can you give a discount?", "Можете дать скидку?"],
        ["Որքա՞ն եք առաջարկում։", "How much do you offer?", "Сколько предлагаете?"],
        ["Հակաառաջարկ ունեմ։", "I have a counter-offer.", "У меня контрпредложение."],
        ["Պայմանները ընդունում եմ։", "I accept the terms.", "Принимаю условия."],
        ["Մերժում եմ առաջարկը։", "I reject the offer.", "Отклоняю предложение."],
        ["Քննարկենք մանրամասները։", "Let's discuss details.", "Обсудим детали."],
        ["Պայմանավորվե՞նք։", "Shall we agree?", "Договоримся?"],
        ["Փոխզիջում գտնենք։", "Let's find a compromise.", "Найдём компромисс."],
        ["Ստորագրենք պայմանագիրը։", "Let's sign the contract.", "Подпишем контракт."],
        ["Ինձ ժամանակ է պետք մտածելու։", "I need time to think.", "Нужно время подумать."],
        ["Համաձայն ենք։", "We agree.", "Согласны."],
      ],
      dialogues: [
        { en: "Price Talk", hy: "Գնի շուրջ", ru: "О цене",
          turns: [
            ["user", "Գինը բարձր է։", "Price is high.", "Цена высокая."],
            ["nurik", "Որքա՞ն եք առաջարկում։", "How much do you offer?", "Сколько предлагаете?"],
            ["user", "Տասը տոկոս պակաս։", "Ten percent less.", "На десять процентов меньше."],
            ["nurik", "Համաձայն եմ։", "Agreed.", "Согласен."],
          ]},
        { en: "Counter-Offer", hy: "Հակաառաջարկ", ru: "Контрпредложение",
          turns: [
            ["nurik", "Մերժում եմ ձեր առաջարկը։", "I reject your offer.", "Отклоняю ваше предложение."],
            ["user", "Հակաառաջարկ ունե՞ք։", "Do you have a counter?", "Есть контрпредложение?"],
            ["nurik", "Այո, լսեք։", "Yes, listen.", "Да, слушайте."],
            ["user", "Շարունակեք։", "Continue.", "Продолжайте."],
          ]},
        { en: "Signing", hy: "Ստորագրում", ru: "Подписание",
          turns: [
            ["nurik", "Ստորագրենք պայմանագիրը։", "Let's sign the contract.", "Подпишем контракт."],
            ["user", "Մի պահ, կարդամ նորից։", "One moment, I'll read again.", "Минуту, перечитаю."],
            ["nurik", "Իհարկե։", "Of course.", "Конечно."],
            ["user", "Ամեն ինչ կարգին է, ստորագրում եմ։", "All good, I'm signing.", "Всё в порядке, подписываю."],
          ]},
      ],
    },
    culture: {
      vocab: [
        ["մշակույթ", "culture", "культура"], ["ավանդույթ", "tradition", "традиция"],
        ["սովորույթ", "custom", "обычай"], ["տոն", "holiday", "праздник"],
        ["կրոն", "religion", "религия"], ["արվեստ", "art", "искусство"],
        ["երաժշտություն", "music", "музыка"], ["պար", "dance", "танец"],
        ["խոհանոց", "cuisine", "кухня"], ["լեզու", "language", "язык"],
        ["գրականություն", "literature", "литература"], ["պոեզիա", "poetry", "поэзия"],
        ["պատմություն", "history", "история"], ["ժողովուրդ", "people", "народ"],
        ["ազգ", "nation", "нация"], ["հայրենիք", "homeland", "родина"],
        ["արմատներ", "roots", "корни"], ["ինքնություն", "identity", "идентичность"],
        ["արժեքներ", "values", "ценности"], ["հարգանք", "respect", "уважение"],
        ["տարբերություն", "difference", "разница"], ["բազմազանություն", "diversity", "разнообразие"],
        ["հանդուրժողականություն", "tolerance", "толерантность"], ["համատեղ", "shared", "общий"],
        ["հպարտություն", "pride", "гордость"],
      ],
      phrases: [
        ["Հայկական մշակույթը հնագույն է։", "Armenian culture is ancient.", "Армянская культура древняя."],
        ["Մեր ավանդույթները հարուստ են։", "Our traditions are rich.", "Наши традиции богаты."],
        ["Ո՞րն է քո սիրած տոնը։", "What's your favorite holiday?", "Какой любимый праздник?"],
        ["Ամանորը կարևոր է։", "New Year is important.", "Новый год важен."],
        ["Հայկական խոհանոցը համեղ է։", "Armenian cuisine is delicious.", "Армянская кухня вкусная."],
        ["Սիրում եմ ազգային պարերը։", "I love national dances.", "Люблю народные танцы."],
        ["Մեր լեզուն գեղեցիկ է։", "Our language is beautiful.", "Наш язык красив."],
        ["Հպարտ եմ իմ արմատներով։", "I'm proud of my roots.", "Горжусь своими корнями."],
        ["Հարգեմ այլ մշակույթներ։", "Let's respect other cultures.", "Уважаем другие культуры."],
        ["Բազմազանությունը հարստություն է։", "Diversity is wealth.", "Разнообразие — богатство."],
        ["Երաժշտությունը միավորում է։", "Music unites.", "Музыка объединяет."],
        ["Պետք է պահպանենք ավանդույթները։", "We must preserve traditions.", "Должны хранить традиции."],
      ],
      dialogues: [
        { en: "Favorite Holiday", hy: "Սիրած տոն", ru: "Любимый праздник",
          turns: [
            ["nurik", "Ո՞րն է քո սիրած տոնը։", "What's your favorite holiday?", "Какой любимый праздник?"],
            ["user", "Ամանորը։", "New Year.", "Новый год."],
            ["nurik", "Ինչու։", "Why?", "Почему?"],
            ["user", "Ընտանիքով ենք հավաքվում։", "We gather with family.", "Собираемся семьёй."],
          ]},
        { en: "Armenian Cuisine", hy: "Հայկական խոհանոց", ru: "Армянская кухня",
          turns: [
            ["user", "Փորձե՞լ ես խորոված։", "Have you tried khorovats?", "Пробовал хоровац?"],
            ["nurik", "Այո, շատ համեղ է։", "Yes, very delicious.", "Да, очень вкусно."],
            ["user", "Իսկ դոլմա։", "And dolma?", "А долма?"],
            ["nurik", "Դա էլ։", "That too.", "Тоже."],
          ]},
        { en: "Roots", hy: "Արմատներ", ru: "Корни",
          turns: [
            ["nurik", "Հպարտ ե՞ս արմատներով։", "Are you proud of your roots?", "Гордишься корнями?"],
            ["user", "Շատ։", "Very.", "Очень."],
            ["nurik", "Ինչու։", "Why?", "Почему?"],
            ["user", "Որովհետև հարուստ պատմություն ունենք։", "Because we have a rich history.", "Потому что богатая история."],
          ]},
      ],
    },
  };
  const bank = banks[slug];
  return {
    id, worldId: "w5", slug, difficulty: "B1",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: enT, hy: hyT, ru: ruT },
    vocab: bank.vocab, phrases: bank.phrases as any,
    dialogues: bank.dialogues.map((dl: any) => ({
      title: { en: dl.en, hy: dl.hy, ru: dl.ru }, turns: dl.turns,
    })),
  };
}

// ===== WORLD 6–10 BUILDER FUNCTIONS =====

function buildWorld6(): QuickLesson[] {
  const topics = [
    ["sports", "Sports", "Սպորտ", "Спорт"],
    ["games", "Games", "Խաղեր", "Игры"],
    ["reading", "Reading", "Ընթերցանություն", "Чтение"],
    ["music", "Music", "Երաժշտություն", "Музыка"],
    ["painting", "Painting", "Նկարչություն", "Живопись"],
    ["cooking", "Cooking", "Խոհարարություն", "Приготовление еды"],
    ["photography", "Photography", "Լուսանկարչություն", "Фотография"],
    ["gardening", "Gardening", "Այգեգործություն", "Садоводство"],
    ["diy", "DIY / Crafts", "DIY / Արհեստներ", "DIY / Ремёсла"],
    ["travel", "Travel as Hobby", "Ճամփորդություն որպես հոբբի", "Путешествия как хобби"],
  ];
  return topics.map(([slug, enT, hyT, ruT], idx) =>
    makeHobbyLesson(`w6_l${idx + 1}`, slug, enT, hyT, ruT)
  );
}

function makeHobbyLesson(id: string, slug: string, enT: string, hyT: string, ruT: string): QuickLesson {
  const commonVocab: Array<[string, string, string]> = [
    ["հոբբի", "hobby", "хобби"], ["ազատ ժամանակ", "free time", "свободное время"],
    ["հետաքրքրություն", "interest", "интерес"], ["սիրել", "to love", "любить"],
    ["վայելել", "to enjoy", "наслаждаться"], ["զբաղվել", "to practice", "заниматься"],
    ["հմտություն", "skill", "навык"], ["պարապմունք", "practice", "тренировка"],
    ["ակումբ", "club", "клуб"], ["ուսուցիչ", "teacher", "учитель"],
    ["ընկերներ", "friends", "друзья"], ["ժամանակ անցկացնել", "to spend time", "проводить время"],
    ["հանգիստ", "relaxation", "отдых"], ["առողջություն", "health", "здоровье"],
    ["սարքավորում", "equipment", "оборудование"], ["ծախս", "cost", "расход"],
    ["ժամանակացույց", "schedule", "расписание"], ["մրցույթ", "competition", "соревнование"],
    ["սիրողական", "amateur", "любительский"], ["պրոֆեսիոնալ", "professional", "профессиональный"],
    ["էներգիա", "energy", "энергия"], ["հաջողություն", "success", "успех"],
    ["սովորել", "to learn", "учиться"], ["բարելավել", "to improve", "улучшать"],
    ["հանգստանալ", "to relax", "расслабляться"]
  ];
  const phrases: Array<[string, string, string, string[]?]> = [
    ["Ինչպիսի՞ հոբբիներ ունես։", "What hobbies do you have?", "Какие у тебя хобби?"],
    ["Իմ հոբբին է ...", "My hobby is ...", "Моё хобби — ..."],
    ["Սիրում եմ ազատ ժամանակս անցկացնել ...", "I love spending my free time ...", "Люблю проводить свободное время ..."],
    ["Շաբաթը երկու անգամ եմ պարապում։", "I practice twice a week.", "Занимаюсь два раза в неделю."],
    ["Դժվար է, բայց հետաքրքիր է։", "It's difficult but interesting.", "Трудно, но интересно."],
    ["Միացել եմ ակումբի։", "I joined a club.", "Вступил в клуб."],
    ["Ուզում եմ բարելավել իմ հմտությունները։", "I want to improve my skills.", "Хочу улучшить навыки."],
    ["Իմ ընկերներն էլ են սիրում այս հոբբին։", "My friends also like this hobby.", "Мои друзья тоже любят это хобби."],
    ["Սա թանկ հոբբի է։", "This is an expensive hobby.", "Это дорогое хобби."],
    ["Ինձ նոր սարքավորում է պետք։", "I need new equipment.", "Мне нужно новое оборудование."],
    ["Հոբբին օգնում է հանգստանալ։", "Hobbies help to relax.", "Хобби помогает расслабиться."],
    ["Ո՞ր հոբբին ես առաջարկում։", "Which hobby do you recommend?", "Какое хобби посоветуешь?"]
  ];
  const dialogues: Array<{ title: Tri; turns: Array<[speaker: "nurik" | "user", hy: string, en: string, ru: string]> }> = [
    { title: { en: "Talking About Hobbies", hy: "Խոսենք հոբբիների մասին", ru: "Разговор о хобби" }, turns: [
      ["nurik", "Ի՞նչ ես սիրում անել ազատ ժամանակ։", "What do you like to do in your free time?", "Что любишь делать в свободное время?"],
      ["user", "Ես սիրում եմ ...", "I like ...", "Мне нравится ..."],
      ["nurik", "Որքա՞ն հաճախ ես զբաղվում դրանով։", "How often do you do it?", "Как часто ты этим занимаешься?"],
      ["user", "Ամեն օր։", "Every day.", "Каждый день."]
    ]},
    { title: { en: "Joining a Club", hy: "Ակումբին միանալ", ru: "Вступление в клуб" }, turns: [
      ["user", "Ես ուզում եմ միանալ ակումբին։", "I want to join the club.", "Хочу вступить в клуб."],
      ["nurik", "Լավ ընտրություն է։", "Good choice.", "Хороший выбор."],
      ["user", "Ե՞րբ են հանդիպումները։", "When are the meetings?", "Когда встречи?"],
      ["nurik", "Երեքշաբթի և հինգշաբթի երեկոյան։", "Tuesday and Thursday evenings.", "Вторник и четверг вечером."]
    ]},
    { title: { en: "Expensive Hobby", hy: "Թանկ հոբբի", ru: "Дорогое хобби" }, turns: [
      ["nurik", "Լուսանկարչությունը թանկ հոբբի է։", "Photography is an expensive hobby.", "Фотография — дорогое хобби."],
      ["user", "Այո, սարքավորումը շատ արժե։", "Yes, equipment costs a lot.", "Да, оборудование стоит дорого."],
      ["nurik", "Բայց արժե այն։", "But it's worth it.", "Но оно того стоит."],
      ["user", "Լիովին համաձայն եմ։", "I completely agree.", "Полностью согласен."]
    ]}
  ];
  return {
    id, worldId: "w6", slug, difficulty: "A2",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: `Talking about ${enT.toLowerCase()} as a hobby.`, hy: `Խոսել ${hyT.toLowerCase()} հոբբիի մասին։`, ru: `Говорить о хобби ${ruT.toLowerCase()}.` },
    vocab: commonVocab, phrases, dialogues
  };
}

function buildWorld7(): QuickLesson[] {
  const topics = [
    ["computers", "Computers", "Համակարգիչներ", "Компьютеры"],
    ["internet", "Internet", "Ինտերնետ", "Интернет"],
    ["smartphones", "Smartphones", "Խելացի հեռախոսներ", "Смартфоны"],
    ["social_media", "Social Media", "Սոցիալական ցանցեր", "Социальные сети"],
    ["apps", "Apps", "Հավելվածներ", "Приложения"],
    ["ai", "Artificial Intelligence", "Արհեստական բանականություն", "Искусственный интеллект"],
    ["cybersecurity", "Cybersecurity", "Կիբերանվտանգություն", "Кибербезопасность"],
    ["gaming", "Gaming", "Խաղեր", "Игры"],
    ["cloud", "Cloud Computing", "Ամպային հաշվարկ", "Облачные вычисления"],
    ["future_tech", "Future Tech", "Ապագայի տեխնոլոգիաներ", "Технологии будущего"]
  ];
  return topics.map(([slug, enT, hyT, ruT], idx) =>
    makeTechLesson(`w7_l${idx + 1}`, slug, enT, hyT, ruT)
  );
}

function makeTechLesson(id: string, slug: string, enT: string, hyT: string, ruT: string): QuickLesson {
  const commonVocab: Array<[string, string, string]> = [
    ["համակարգիչ", "computer", "компьютер"], ["նոութբուք", "laptop", "ноутбук"],
    ["հեռախոս", "phone", "телефон"], ["պլանշետ", "tablet", "планшет"],
    ["էկրան", "screen", "экран"], ["ստեղնաշար", "keyboard", "клавиатура"],
    ["մկնիկ", "mouse", "мышь"], ["ինտերնետ", "internet", "интернет"],
    ["wifi", "wifi", "wifi"], ["ցանց", "network", "сеть"],
    ["հավելված", "app", "приложение"], ["կայք", "website", "сайт"],
    ["գաղտնաբառ", "password", "пароль"], ["հաշիվ", "account", "аккаунт"],
    ["տվյալներ", "data", "данные"], ["ամպ", "cloud", "облако"],
    ["անվտանգություն", "security", "безопасность"], ["վիրուս", "virus", "вирус"],
    ["թարմացում", "update", "обновление"], ["սխալ", "error", "ошибка"],
    ["ծրագրավորում", "programming", "программирование"], ["արհեստական բանականություն", "AI", "ИИ"],
    ["վիրտուալ", "virtual", "виртуальный"], ["խելացի", "smart", "умный"],
    ["արագ", "fast", "быстрый"]
  ];
  const phrases: Array<[string, string, string, string[]?]> = [
    ["Օգտագործու՞մ ես սոցիալական ցանցեր։", "Do you use social media?", "Пользуешься соцсетями?"],
    ["Իմ սիրած հավելվածը ...", "My favorite app is ...", "Моё любимое приложение ..."],
    ["Ինչպե՞ս միացնել wifi-ն։", "How to connect to wifi?", "Как подключиться к wifi?"],
    ["Մոռացել եմ գաղտնաբառս։", "I forgot my password.", "Забыл пароль."],
    ["Այս կայքը հուսալի է։", "This website is reliable.", "Этот сайт надёжный."],
    ["Իմ համակարգիչը կախված է։", "My computer is frozen.", "Мой компьютер завис."],
    ["Կարո՞ղ ես օգնել թարմացնել ծրագիրը։", "Can you help update the software?", "Можешь помочь обновить программу?"],
    ["Արհեստական բանականությունը փոխում է աշխարհը։", "AI is changing the world.", "ИИ меняет мир."],
    ["Ինչպե՞ս պաշտպանվել կիբերհարձակումներից։", "How to protect against cyberattacks?", "Как защититься от кибератак?"],
    ["Պետք է կրկնօրինակեմ իմ ֆայլերը։", "I need to back up my files.", "Нужно сделать бэкап файлов."],
    ["Խաղում ես առցանց խաղեր։", "Do you play online games?", "Играешь в онлайн-игры?"],
    ["Վաղը թողարկվում է նոր մոդելը։", "The new model is released tomorrow.", "Завтра выходит новая модель."]
  ];
  const dialogues: Array<{ title: Tri; turns: Array<[speaker: "nurik" | "user", hy: string, en: string, ru: string]> }> = [
    { title: { en: "Computer Trouble", hy: "Համակարգչային խնդիր", ru: "Проблема с компьютером" }, turns: [
      ["user", "Համակարգիչս չի միանում։", "My computer won't turn on.", "Мой компьютер не включается."],
      ["nurik", "Ստուգիր հոսանքի լարը։", "Check the power cord.", "Проверь шнур питания."],
      ["user", "Ամեն ինչ միացված է, բայց չի աշխատում։", "Everything is connected, but it doesn't work.", "Всё подключено, но не работает."],
      ["nurik", "Տար service կենտրոն։", "Take it to a service center.", "Отнеси в сервисный центр."]
    ]},
    { title: { en: "New App", hy: "Նոր հավելված", ru: "Новое приложение" }, turns: [
      ["nurik", "Բեռնել եմ նոր հավելված սովորելու համար։", "I downloaded a new learning app.", "Скачал новое учебное приложение."],
      ["user", "Ի՞նչ է անում։", "What does it do?", "Что оно делает?"],
      ["nurik", "Սովորեցնում է լեզուներ խաղերի միջոցով։", "It teaches languages through games.", "Учит языкам через игры."],
      ["user", "Հետաքրքիր է, ուղարկի՛ր հղումը։", "Interesting, send me the link.", "Интересно, скинь ссылку."]
    ]},
    { title: { en: "AI Chatbot", hy: "Արհեստական բանականության չատբոտ", ru: "Чат-бот с ИИ" }, turns: [
      ["user", "Խոսել եմ AI չատբոտի հետ երեկ։", "I talked to an AI chatbot yesterday.", "Говорил с чат-ботом ИИ вчера."],
      ["nurik", "Ինչ մասին եք խոսել։", "What did you talk about?", "О чём говорили?"],
      ["user", "Ապագա տեխնոլոգիաների մասին։", "About future technologies.", "О будущих технологиях."],
      ["nurik", "Տպավո՞րիչ պատասխաններ էր տալիս։", "Did it give impressive answers?", "Давал впечатляющие ответы?"]
    ]}
  ];
  return {
    id, worldId: "w7", slug, difficulty: "B1",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: `Discussing ${enT}.`, hy: `Քննարկել ${hyT}.`, ru: `Обсуждение ${ruT}.` },
    vocab: commonVocab, phrases, dialogues
  };
}

function buildWorld8(): QuickLesson[] {
  const topics = [
    ["climate", "Climate Change", "Կլիմայի փոփոխություն", "Изменение климата"],
    ["animals", "Wild Animals", "Վայրի կենդանիներ", "Дикие животные"],
    ["plants", "Plants & Forests", "Բույսեր և անտառներ", "Растения и леса"],
    ["pollution", "Pollution", "Աղտոտում", "Загрязнение"],
    ["recycling", "Recycling", "Վերամշակում", "Переработка"],
    ["energy", "Renewable Energy", "Վերականգնվող էներգիա", "Возобновляемая энергия"],
    ["water", "Water Conservation", "Ջրի պահպանություն", "Сохранение воды"],
    ["eco_friendly", "Eco-friendly Living", "Էկո-բարեկամական կյանք", "Эко-жизнь"],
    ["disasters", "Natural Disasters", "Բնական աղետներ", "Стихийные бедствия"],
    ["activism", "Environmental Activism", "Բնապահպանական ակտիվիզմ", "Экологический активизм"]
  ];
  return topics.map(([slug, enT, hyT, ruT], idx) =>
    makeEnvLesson(`w8_l${idx + 1}`, slug, enT, hyT, ruT)
  );
}

function makeEnvLesson(id: string, slug: string, enT: string, hyT: string, ruT: string): QuickLesson {
  const commonVocab: Array<[string, string, string]> = [
    ["բնություն", "nature", "природа"], ["շրջակա միջավայր", "environment", "окружающая среда"],
    ["կլիմա", "climate", "климат"], ["ջերմաստիճան", "temperature", "температура"],
    ["աղտոտում", "pollution", "загрязнение"], ["թափոններ", "waste", "отходы"],
    ["պլաստիկ", "plastic", "пластик"], ["վերամշակում", "recycling", "переработка"],
    ["անտառահատում", "deforestation", "вырубка лесов"], ["կենդանիներ", "animals", "животные"],
    ["վտանգված տեսակ", "endangered species", "вымирающий вид"], ["արգելոց", "reserve", "заповедник"],
    ["էկոհամակարգ", "ecosystem", "экосистема"], ["կայունություն", "sustainability", "устойчивость"],
    ["արևային էներգիա", "solar energy", "солнечная энергия"], ["քամու էներգիա", "wind energy", "ветряная энергия"],
    ["ածխածնի հետք", "carbon footprint", "углеродный след"], ["կանաչ", "green", "зелёный"],
    ["վերականգնվող", "renewable", "возобновляемый"], ["վնասակար", "harmful", "вредный"],
    ["պաշտպանել", "to protect", "защищать"], ["փրկել", "to save", "спасать"],
    ["նվազեցնել", "to reduce", "сокращать"], ["վերաօգտագործել", "to reuse", "повторно использовать"],
    ["տնկել", "to plant", "сажать"]
  ];
  const phrases: Array<[string, string, string, string[]?]> = [
    ["Ինչպե՞ս կարող ենք պաշտպանել բնությունը։", "How can we protect nature?", "Как мы можем защитить природу?"],
    ["Կլիմայի փոփոխությունը իրական խնդիր է։", "Climate change is a real problem.", "Изменение климата — реальная проблема."],
    ["Պետք է նվազեցնենք պլաստիկի օգտագործումը։", "We need to reduce plastic use.", "Нужно сократить использование пластика."],
    ["Ես տեսակավորում եմ աղբը տանը։", "I sort waste at home.", "Я сортирую мусор дома."],
    ["Արևային մարտկոցները մեծ օգուտ ունեն։", "Solar panels have great benefits.", "Солнечные батареи имеют большую пользу."],
    ["Անհետացող կենդանիներին պետք է պաշտպանել։", "Endangered animals must be protected.", "Вымирающих животных нужно защищать."],
    ["Ծառեր տնկենք ավելի շատ։", "Let's plant more trees.", "Давайте посадим больше деревьев."],
    ["Ջուրը խնայիր։", "Save water.", "Экономь воду."],
    ["Էկոլոգիական ապրանքներն ավելի թանկ են, բայց արժեն։", "Eco products are more expensive but worth it.", "Эко-товары дороже, но стоят того."],
    ["Ի՞նչ ես անում ածխածնի հետքդ նվազեցնելու համար։", "What do you do to reduce your carbon footprint?", "Что делаешь для снижения углеродного следа?"],
    ["Միասին կարող ենք փոխել աշխարհը։", "Together we can change the world.", "Вместе мы можем изменить мир."],
    ["Եկեք միանանք բնապահպանական շարժմանը։", "Let's join the environmental movement.", "Давайте присоединимся к экологическому движению."]
  ];
  const dialogues: Array<{ title: Tri; turns: Array<[speaker: "nurik" | "user", hy: string, en: string, ru: string]> }> = [
    { title: { en: "Cleaning the Beach", hy: "Լողափի մաքրում", ru: "Уборка пляжа" }, turns: [
      ["nurik", "Այս շաբաթ լողափի մաքրման ակցիա կա։", "There's a beach cleanup this week.", "На этой неделе уборка пляжа."],
      ["user", "Ես կմասնակցեմ։", "I will participate.", "Я поучаствую."],
      ["nurik", "Ժամը 10-ին հանդիպենք մուտքի մոտ։", "Let's meet at 10 at the entrance.", "Встретимся в 10 у входа."],
      ["user", "Լավ, աչքով կանեմ։", "OK, I'll be there.", "Хорошо, буду."]
    ]},
    { title: { en: "Saving Energy", hy: "Էներգիայի խնայում", ru: "Экономия энергии" }, turns: [
      ["user", "Անջատի՛ր լույսը, երբ դուրս ես գալիս սենյակից։", "Turn off the light when you leave the room.", "Выключай свет, когда выходишь из комнаты."],
      ["nurik", "Գիտեմ, ես փորձում եմ խնայել էներգիան։", "I know, I try to save energy.", "Знаю, стараюсь экономить."],
      ["user", "Կարող ենք LED լամպեր գնել։", "We can buy LED bulbs.", "Можем купить LED-лампы."],
      ["nurik", "Լավ միտք է։", "Good idea.", "Хорошая идея."]
    ]},
    { title: { en: "Endangered Animals", hy: "Անհետացող կենդանիներ", ru: "Вымирающие животные" }, turns: [
      ["nurik", "Լսե՞լ ես ամուրյան ընձառյուծի մասին։", "Have you heard of the Amur leopard?", "Слышал об амурском леопарде?"],
      ["user", "Այո, շատ քիչ են մնացել։", "Yes, very few remain.", "Да, их осталось очень мало."],
      ["nurik", "Պետք է անհապաղ միջոցներ ձեռնարկել։", "Immediate action is needed.", "Нужны срочные меры."],
      ["user", "Կազմակերպություններն արդեն աշխատում են։", "Organizations are already working.", "Организации уже работают."]
    ]}
  ];
  return {
    id, worldId: "w8", slug, difficulty: "B1",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: `Discussing ${enT}.`, hy: `Քննարկել ${hyT}.`, ru: `Обсуждение ${ruT}.` },
    vocab: commonVocab, phrases, dialogues
  };
}

function buildWorld9(): QuickLesson[] {
  const topics = [
    ["banking", "Banking", "Բանկային գործ", "Банковское дело"],
    ["marketing", "Marketing", "Մարքեթինգ", "Маркетинг"],
    ["management", "Management", "Կառավարում", "Управление"],
    ["startup", "Startups", "Ստարտափներ", "Стартапы"],
    ["sales", "Sales", "Վաճառք", "Продажи"],
    ["accounting", "Accounting", "Հաշվապահություն", "Бухгалтерия"],
    ["investing", "Investing", "Ներդրումներ", "Инвестиции"],
    ["negotiation", "Business Negotiation", "Գործնական բանակցություններ", "Деловые переговоры"],
    ["ecommerce", "E-commerce", "Էլեկտրոնային առևտուր", "Электронная коммерция"],
    ["leadership", "Leadership", "Առաջնորդություն", "Лидерство"]
  ];
  return topics.map(([slug, enT, hyT, ruT], idx) =>
    makeBizLesson(`w9_l${idx + 1}`, slug, enT, hyT, ruT)
  );
}

function makeBizLesson(id: string, slug: string, enT: string, hyT: string, ruT: string): QuickLesson {
  const commonVocab: Array<[string, string, string]> = [
    ["բիզնես", "business", "бизнес"], ["ընկերություն", "company", "компания"],
    ["հաճախորդ", "client", "клиент"], ["շուկա", "market", "рынок"],
    ["շահույթ", "profit", "прибыль"], ["ծախս", "expense", "расход"],
    ["վարկ", "loan", "кредит"], ["ավանդ", "deposit", "депозит"],
    ["հաշիվ", "account", "счёт"], ["հարկ", "tax", "налог"],
    ["աշխատավարձ", "salary", "зарплата"], ["բոնուս", "bonus", "бонус"],
    ["պայմանագիր", "contract", "контракт"], ["կնիք", "stamp", "печать"],
    ["ստորագրություն", "signature", "подпись"], ["հանդիպում", "meeting", "встреча"],
    ["ներկայացում", "presentation", "презентация"], ["վաճառք", "sales", "продажи"],
    ["գովազդ", "advertising", "реклама"], ["ապրանք", "product", "товар"],
    ["ծառայություն", "service", "услуга"], ["մենեջեր", "manager", "менеджер"],
    ["տնօրեն", "director", "директор"], ["բաժնետեր", "shareholder", "акционер"],
    ["ներդրում", "investment", "инвестиция"]
  ];
  const phrases: Array<[string, string, string, string[]?]> = [
    ["Ինչպիսի՞ բիզնեսով ես զբաղվում։", "What kind of business do you do?", "Каким бизнесом занимаешься?"],
    ["Մեր ընկերությունը զբաղվում է ...", "Our company deals with ...", "Наша компания занимается ..."],
    ["Այս եռամսյակում շահույթն աճել է։", "Profit has grown this quarter.", "Прибыль выросла в этом квартале."],
    ["Պետք է կրճատենք ծախսերը։", "We need to reduce expenses.", "Нужно сократить расходы."],
    ["Ձեր առաջարկը հետաքրքիր է, բայց գինը բարձր է։", "Your offer is interesting, but the price is high.", "Ваше предложение интересно, но цена высока."],
    ["Կարո՞ղ եք զեղչ տալ մեծ քանակի դեպքում։", "Can you give a discount for large quantity?", "Можете скидку на большой объём?"],
    ["Պայմանագիրը պետք է ստորագրվի մինչեւ ուրբաթ։", "The contract must be signed by Friday.", "Контракт должен быть подписан до пятницы."],
    ["Եկեք կազմենք մարքեթինգային պլան։", "Let's make a marketing plan.", "Давайте составим маркетинговый план."],
    ["Որո՞նք են մեր մրցակիցները։", "Who are our competitors?", "Кто наши конкуренты?"],
    ["Ինչպե՞ս բարձրացնել վաճառքը։", "How to increase sales?", "Как увеличить продажи?"],
    ["Աշխատակիցների մոտիվացիան կարեւոր է։", "Employee motivation is important.", "Мотивация сотрудников важна."],
    ["Ներդրումներ կատարել նոր տեխնոլոգիաներում։", "Invest in new technologies.", "Инвестируйте в новые технологии."]
  ];
  const dialogues: Array<{ title: Tri; turns: Array<[speaker: "nurik" | "user", hy: string, en: string, ru: string]> }> = [
    { title: { en: "Negotiating Price", hy: "Գնի շուրջ բանակցություն", ru: "Переговоры о цене" }, turns: [
      ["user", "Մեր առաջարկը 10% զեղչ է մեծ պատվերի համար։", "Our offer is 10% discount for large orders.", "Наше предложение — 10% скидка на крупные заказы."],
      ["nurik", "Ընդունում ենք, բայց առաքումը պետք է լինի անվճար։", "We accept, but shipping must be free.", "Принимаем, но доставка должна быть бесплатной."],
      ["user", "Համաձայն եմ, եթե պատվերը 1000 միավորից ավել է։", "Agreed, if the order is over 1000 units.", "Согласен, если заказ более 1000 штук."],
      ["nurik", "Լավ, ձեռքսեղմումով։", "OK, handshake.", "Хорошо, рукопожатие."]
    ]},
    { title: { en: "Startup Pitch", hy: "Ստարտափի ներկայացում", ru: "Презентация стартапа" }, turns: [
      ["nurik", "Մեր նախագիծը էկոլոգիական փաթեթավորման մասին է։", "Our project is about eco-friendly packaging.", "Наш проект об экологичной упаковке."],
      ["user", "Որքա՞ն ներդրում է անհրաժեշտ։", "How much investment is needed?", "Сколько инвестиций нужно?"],
      ["nurik", "50 հազար դոլար, և մեկ տարում կվերադարձնենք։", "$50k, and we'll return in one year.", "50 тысяч долларов, и вернём за год."],
      ["user", "Հետաքրքիր է, ներկայացրու ավելի մանրամասն։", "Interesting, present in more detail.", "Интересно, представь подробнее."]
    ]},
    { title: { en: "Annual Meeting", hy: "Տարեկան հանդիպում", ru: "Годовое собрание" }, turns: [
      ["user", "Տարվա վերջնական հաշվետվությունը պատրա՞ստ է։", "Is the annual report ready?", "Годовой отчёт готов?"],
      ["nurik", "Այո, ահա ֆայլը։", "Yes, here is the file.", "Да, вот файл."],
      ["user", "Շահույթը 20%-ով ավելացել է։", "Profit increased by 20%.", "Прибыль выросла на 20%."],
      ["nurik", "Հիանալի աշխատանք բոլորին։", "Great job everyone.", "Отличная работа всех."]
    ]}
  ];
  return {
    id, worldId: "w9", slug, difficulty: "B1",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: `Business topics: ${enT}`, hy: `Բիզնես թեմա՝ ${hyT}`, ru: `Бизнес тема: ${ruT}` },
    vocab: commonVocab, phrases, dialogues
  };
}

function buildWorld10(): QuickLesson[] {
  const topics = [
    ["painting", "Painting", "Նկարչություն", "Живопись"],
    ["music", "Music Genres", "Երաժշտական ժանրեր", "Музыкальные жанры"],
    ["literature", "Literature", "Գրականություն", "Литература"],
    ["poetry", "Poetry", "Պոեզիա", "Поэзия"],
    ["cinema", "Cinema", "Կինո", "Кино"],
    ["theater", "Theatre", "Թատրոն", "Театр"],
    ["sculpture", "Sculpture", "Քանդակագործություն", "Скульптура"],
    ["architecture", "Architecture", "Ճարտարապետություն", "Архитектура"],
    ["dance", "Dance Art", "Պարարվեստ", "Танцевальное искусство"],
    ["photography_art", "Fine Art Photography", "Գեղարվեստական լուսանկարչություն", "Художественная фотография"]
  ];
  return topics.map(([slug, enT, hyT, ruT], idx) =>
    makeArtLesson(`w10_l${idx + 1}`, slug, enT, hyT, ruT)
  );
}

function makeArtLesson(id: string, slug: string, enT: string, hyT: string, ruT: string): QuickLesson {
  const commonVocab: Array<[string, string, string]> = [
    ["արվեստ", "art", "искусство"], ["նկարիչ", "artist", "художник"],
    ["գործ", "work (art)", "произведение"], ["ցուցահանդես", "exhibition", "выставка"],
    ["թանգարան", "museum", "музей"], ["պատկերասրահ", "gallery", "галерея"],
    ["գեղեցկություն", "beauty", "красота"], ["ոգեշնչում", "inspiration", "вдохновение"],
    ["ստեղծագործել", "to create", "создавать"], ["արտահայտել", "to express", "выражать"],
    ["զգացմունք", "emotion", "эмоция"], ["գաղափար", "idea", "идея"],
    ["ոճ", "style", "стиль"], ["դասական", "classical", "классический"],
    ["ժամանակակից", "modern", "современный"], ["վեպ", "novel", "роман"],
    ["բանաստեղծություն", "poem", "стихотворение"], ["դերասան", "actor", "актёр"],
    ["ֆիլմ", "film", "фильм"], ["ռեժիսոր", "director", "режиссёр"],
    ["դեր", "role", "роль"], ["բեմ", "stage", "сцена"],
    ["հանդիսատես", "audience", "зритель"], ["քննադատ", "critic", "критик"],
    ["գլուխգործոց", "masterpiece", "шедевр"]
  ];
  const phrases: Array<[string, string, string, string[]?]> = [
    ["Սիրու՞մ ես արվեստ։", "Do you like art?", "Любишь искусство?"],
    ["Իմ սիրած նկարիչը ...", "My favorite artist is ...", "Мой любимый художник ..."],
    ["Վերջերս գնացի ցուցահանդեսի։", "I recently went to an exhibition.", "Недавно был на выставке."],
    ["Այս ֆիլմը արժանացել է Օսկարի։", "This film won an Oscar.", "Этот фильм получил Оскар."],
    ["Դասական երաժշտությունը հանգստացնում է։", "Classical music relaxes.", "Классическая музыка расслабляет."],
    ["Ես գիրք եմ գրում։", "I am writing a book.", "Я пишу книгу."],
    ["Ո՞րն է քո սիրած բանաստեղծությունը։", "What's your favorite poem?", "Какое твоё любимое стихотворение?"],
    ["Թատրոնն այլ զգացողություն է տալիս, քան կինոն։", "Theatre gives a different feeling than cinema.", "Театр даёт другие ощущения, чем кино."],
    ["Պետք է ավելի շատ աջակցել տեղական արվեստին։", "We should support local art more.", "Нужно больше поддерживать местное искусство."],
    ["Այս քանդակը շատ արտահայտիչ է։", "This sculpture is very expressive.", "Эта скульптура очень выразительна."],
    ["Ինչպե՞ս ես սովորում նկարել։", "How are you learning to paint?", "Как учишься рисовать?"],
    ["Երաժշտությունը համընդհանուր լեզու է։", "Music is a universal language.", "Музыка — универсальный язык."]
  ];
  const dialogues: Array<{ title: Tri; turns: Array<[speaker: "nurik" | "user", hy: string, en: string, ru: string]> }> = [
    { title: { en: "At the Museum", hy: "Թանգարանում", ru: "В музее" }, turns: [
      ["user", "Տեսե՞լ ես Վան Գոգի «Աստղալի գիշերը»։", "Have you seen Van Gogh's Starry Night?", "Видел «Звёздную ночь» Ван Гога?"],
      ["nurik", "Այո, ռեպրոդուկցիայով։", "Yes, in reproduction.", "Да, в репродукции."],
      ["user", "Բնօրինակը Նյու Յորքում է, պետք է տեսնել։", "The original is in New York, must see.", "Оригинал в Нью-Йорке, нужно увидеть."],
      ["nurik", "Հույս ունեմ մի օր կգնամ։", "I hope to go someday.", "Надеюсь, когда-нибудь поеду."]
    ]},
    { title: { en: "Reading Books", hy: "Գրքեր կարդալ", ru: "Чтение книг" }, turns: [
      ["nurik", "Ի՞նչ ես կարդում այս օրերին։", "What are you reading these days?", "Что читаешь в эти дни?"],
      ["user", "Պատմական վեպ Հայաստանի մասին։", "A historical novel about Armenia.", "Исторический роман об Армении."],
      ["nurik", "Հեղինակը ո՞վ է։", "Who is the author?", "Кто автор?"],
      ["user", "Մկրտիչ Հայրապետյան։", "Mkrtich Hayrapetyan.", "Мкртич Айрапетян."]
    ]},
    { title: { en: "Cinema Discussion", hy: "Կինոյի քննարկում", ru: "Обсуждение кино" }, turns: [
      ["user", "Երեկ դիտեցի մի հայկական ֆիլմ։", "Yesterday I watched an Armenian film.", "Вчера посмотрел армянский фильм."],
      ["nurik", "Ինչպիսի՞ն էր։", "How was it?", "Как он?"],
      ["user", "Շատ հուզիչ, խորհուրդ եմ տալիս։", "Very touching, I recommend it.", "Очень трогательный, рекомендую."],
      ["nurik", "Շնորհակալություն, կդիտեմ։", "Thanks, I'll watch it.", "Спасибо, посмотрю."]
    ]}
  ];
  return {
    id, worldId: "w10", slug, difficulty: "B1",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: `Exploring ${enT}`, hy: `Ուսումնասիրել ${hyT}`, ru: `Изучаем ${ruT}` },
    vocab: commonVocab, phrases, dialogues
  };
}

// ─── qL helper ──────────────────────────────────────────────────────────────

function qL(
  id: string, worldId: string, slug: string, enT: string, hyT: string, ruT: string,
  conceptEn: string,
  vocab: Array<[string, string, string]>,
  phrases: Array<[string, string, string, string[]?]>,
  dialogues: Array<{ title: Tri; turns: Array<["nurik" | "user", string, string, string]> }>
): QuickLesson {
  return {
    id, worldId, slug, difficulty: "A1",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: conceptEn, hy: conceptEn, ru: conceptEn },
    vocab, phrases, dialogues,
  };
}

// ─── Append expanded QuickLessons ──────────────────────────────────────────

CONTENT_LESSONS.push(...QUICK_LESSONS.map(expand));

// ─── Audio ID mapping (stable numeric IDs) ─────────────────────────────────

const audioIdMap: Record<string, string> = {};
let audioCounter = 1;

export function getAudioId(item: VocabItem): string {
  if (item.audioId) return item.audioId.padStart(6, "0");
  if (audioIdMap[item.id]) return audioIdMap[item.id];
  const padded = String(audioCounter).padStart(6, "0");
  audioIdMap[item.id] = padded;
  audioCounter++;
  return padded;
}

// ─── Lookup helpers ──────────────────────────────────────────────────────────

export const getWorlds = () => WORLDS;
export const getWorldById = (id: string) => WORLDS.find(w => w.id === id);
export const getContentLessonById = (id: string) => CONTENT_LESSONS.find(l => l.id === id);
export const getLessonsForWorld = (worldId: string) =>
  CONTENT_LESSONS.filter(l => l.worldId === worldId);

export function getAllLessonsOrdered(): ContentLesson[] {
  const out: ContentLesson[] = [];
  for (const w of WORLDS) {
    for (const id of w.lessons) {
      const l = CONTENT_LESSONS.find(x => x.id === id);
      if (l) out.push(l);
    }
  }
  return out;
}