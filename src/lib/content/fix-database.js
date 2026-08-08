const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'database.ts');

console.log('🔧 Fixing database.ts type annotations for dialogues...');

let content = fs.readFileSync(filePath, 'utf8');

// Տիպի անոտացիա, որը պետք է ավելացնել
const typedDialogues = `const dialogues: Array<{ title: Tri; turns: Array<[speaker: "nurik" | "user", hy: string, en: string, ru: string]> }> = [`; 

// Ֆունկցիաների անունները, որոնցում պետք է ուղղել
const funcs = ['makeHobbyLesson', 'makeTechLesson', 'makeEnvLesson', 'makeBizLesson', 'makeArtLesson'];

let fixedCount = 0;

for (const func of funcs) {
    // Գտնել ֆունկցիայի սահմանման սկիզբը
    const funcStart = content.indexOf(`function ${func}(`);
    if (funcStart === -1) {
        console.log(`⚠️ Function ${func} not found, skipping.`);
        continue;
    }
    // Գտնել ֆունկցիայի մարմնի բացող փակագիծը
    let braceIndex = content.indexOf('{', funcStart);
    if (braceIndex === -1) {
        console.log(`⚠️ No opening brace for ${func}, skipping.`);
        continue;
    }
    // Փնտրել 'const dialogues = [' այդ փակագծից հետո
    const searchStr = 'const dialogues = [';
    let dialoguesIndex = content.indexOf(searchStr, braceIndex);
    if (dialoguesIndex === -1) {
        console.log(`ℹ️ No 'const dialogues = [' found in ${func}, skipping.`);
        continue;
    }
    // Փոխարինել
    content = content.slice(0, dialoguesIndex) + typedDialogues + content.slice(dialoguesIndex + searchStr.length);
    fixedCount++;
    console.log(`✅ Fixed ${func}`);
}

if (fixedCount === 0) {
    console.log('❌ No functions were fixed. The file might already be correct or the pattern changed.');
} else {
    // Գրել թարմացված ֆայլը
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`🎉 Successfully fixed ${fixedCount} function(s). You can now run 'npm run build'.`);
}