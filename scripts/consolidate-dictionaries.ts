import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

function main() {
  console.log('📖 Starting dictionary consolidation (using dictionary.json only)...');
  
  const dictPath = path.join(process.cwd(), 'data/dictionaries/dictionary.json');
  
  let dict: Record<string, { hy: string; en: string; ru: string }> = {};
  try {
    const content = readFileSync(dictPath, 'utf-8');
    dict = JSON.parse(content);
    console.log(`✅ Loaded dictionary.json with ${Object.keys(dict).length} entries`);
  } catch (e) {
    console.error('❌ Failed to parse dictionary.json:', e);
    process.exit(1);
  }
  
  const consolidated: Record<string, { id: string; hy: string; en: string; ru: string }> = {};
  
  for (const [key, val] of Object.entries(dict)) {
    if (val.hy && (val.en || val.ru)) {
      consolidated[key] = {
        id: key,
        hy: val.hy.trim(),
        en: val.en?.trim() || '',
        ru: val.ru?.trim() || '',
      };
    }
  }
  
  const sortedEntries = Object.values(consolidated).sort((a, b) => a.id.localeCompare(b.id));
  
  const output = {
    entries: sortedEntries,
    metadata: {
      totalEntries: sortedEntries.length,
      languages: ['hy', 'en', 'ru'],
      generatedAt: new Date().toISOString(),
      sourceFiles: ['dictionary.json'],
    },
  };
  
  const outputPath = path.join(process.cwd(), 'src/lib/lexicon/master-dictionary.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`✅ Master dictionary created with ${sortedEntries.length} entries`);
  console.log(`📁 Saved to: ${outputPath}`);
}

main();