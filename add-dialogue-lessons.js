const fs = require('fs');
const path = require('path');

// Ֆայլի ուղին
const filePath = path.join(__dirname, 'src/lib/i18n/multilingual.ts');

// 20 նոր դասերի ստեղծում
function generateDialogueLessons() {
  const topics = [
    { hy: "Ծանոթություն", en: "Introduction", ru: "Знакомство" },
    { hy: "Ընտանիք", en: "Family", ru: "Семья" },
    { hy: "Տուն", en: "Home", ru: "Дом" },
    { hy: "Սնունդ", en: "Food", ru: "Еда" },
    { hy: "Խմիչք", en: "Drinks", ru: "Напитки" },
    { hy: "Գնումներ", en: "Shopping", ru: "Покупки" },
    { hy: "Ճամփորդություն", en: "Travel", ru: "Путешествие" },
    { hy: "Ժամանակ", en: "Time", ru: "Время" },
    { hy: "Եղանակ", en: "Weather", ru: "Погода" },
    { hy: "Աշխատանք", en: "Work", ru: "Работа" },
    { hy: "Հոբբի", en: "Hobby", ru: "Хобби" },
    { hy: "Բժիշկ", en: "Doctor", ru: "Врач" },
    { hy: "Հյուրանոց", en: "Hotel", ru: "Отель" },
    { hy: "Ռեստորան", en: "Restaurant", ru: "Ресторан" },
    { hy: "Ֆիլմ", en: "Movie", ru: "Фильм" },
    { hy: "Երաժշտություն", en: "Music", ru: "Музыка" },
    { hy: "Սպորտ", en: "Sport", ru: "Спорт" },
    { hy: "Տեխնոլոգիա", en: "Technology", ru: "Технологии" },
    { hy: "Կրթություն", en: "Education", ru: "Образование" },
    { hy: "Բնություն", en: "Nature", ru: "Природа" }
  ];
  
  const lessons = [];
  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    const id = `hyen_dlg_${i+1}`;
    lessons.push(`  {
    id: "${id}",
    unitId: "u1",
    title: { hy: "${t.hy}", en: "${t.en}", ru: "${t.ru}" },
    description: { hy: "Զրույց ${t.hy} թեմայով", en: "Dialogue about ${t.en}", ru: "Диалог на тему ${t.ru}" },
    estimatedMinutes: 6,
    hayqTotal: 60,
    exercises: [
      {
        id: "${id}_ex1",
        type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես դու»", en: "Translate to English", ru: "Переведите на английский" },
        targetAnswer: "How are you?",
        acceptableAnswers: ["How are you", "How are you?"],
        hayqReward: 10,
      },
      {
        id: "${id}_ex2",
        type: "multiple_choice",
        prompt: { hy: "«Ցտեսություն»-ի անգլերեն թարգմանությունը", en: "English for «Goodbye»", ru: "Английский для «До свидания»" },
        targetAnswer: "Goodbye",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        hayqReward: 10,
      },
      {
        id: "${id}_ex3",
        type: "word_order",
        prompt: { hy: "Դասավորել բառերը", en: "Arrange words", ru: "Составьте" },
        targetAnswer: "I love learning Armenian",
        words: ["I", "love", "learning", "Armenian"],
        hayqReward: 10,
      }
    ]
  }`);
  }
  return lessons.join(',\n');
}

// Հիմնական ֆունկցիա
function addDialogueLessons() {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Ֆայլը չի գտնվել: ${filePath}`);
    return;
  }
  
  // Backup
  const backupPath = filePath + '.backup';
  fs.copyFileSync(filePath, backupPath);
  console.log(`✅ Backup ստեղծվել է: ${backupPath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Փնտրում ենք HY_EN_LESSONS զանգվածի վերջը
  // HY_EN_LESSONS-ը սահմանված է const HY_EN_LESSONS: MultiLesson[] = [ ... ];
  // Մենք պետք է գտնենք վերջին փակագիծը `];` նախքան հաջորդ const-ը (օրինակ՝ RU_HY_LESSONS)
  const startPattern = /const HY_EN_LESSONS: MultiLesson\[\] = \[/;
  const endPattern = /^];\s*$/m;
  
  const startMatch = content.match(startPattern);
  if (!startMatch) {
    console.error("❌ Չգտնվեց HY_EN_LESSONS սահմանումը:");
    return;
  }
  
  // Գտնել HY_EN_LESSONS-ի սկիզբը
  const startIndex = startMatch.index + startMatch[0].length;
  let bracketCount = 1;
  let endIndex = startIndex;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '[') bracketCount++;
    if (content[i] === ']') bracketCount--;
    if (bracketCount === 0) {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === startIndex) {
    console.error("❌ Չհաջողվեց գտնել զանգվածի ավարտը:");
    return;
  }
  
  // Կտրում ենք զանգվածի բովանդակությունը
  const arrayContent = content.slice(startIndex, endIndex);
  const newLessons = generateDialogueLessons();
  
  // Ավելացնում ենք նոր դասերը զանգվածի վերջում (ստուգում ենք, որ վերջին տարրից հետո ստորակետ կա)
  let modifiedArrayContent = arrayContent.trim();
  if (!modifiedArrayContent.endsWith(',')) {
    modifiedArrayContent += ',';
  }
  modifiedArrayContent += '\n' + newLessons;
  
  // Կազմում ենք նոր ամբողջական ֆայլ
  const newContent = content.slice(0, startIndex) + modifiedArrayContent + content.slice(endIndex);
  
  // Գրում ենք
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("✅ 20 նոր դասեր հաջողությամբ ավելացվեցին HY_EN_LESSONS-ում:");
  console.log("🎉 Այժմ կարող ես վերագործարկել dev server-ը և տեսնել նոր դասերը:");
  console.log("   npm run dev");
}

addDialogueLessons();