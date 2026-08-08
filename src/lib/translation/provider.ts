// Simple translation provider – can be extended with real API later
export type TranslationProvider = {
  translate: (text: string, sourceLang: string, targetLang: string) => Promise<string>;
};

const mockProvider: TranslationProvider = {
  translate: async (text) => {
    // Mock: return the original text (no real translation)
    return text;
  },
};

let currentProvider: TranslationProvider = mockProvider;

export function setTranslationProvider(provider: TranslationProvider): void {
  currentProvider = provider;
}

export function getTranslationProvider(): TranslationProvider {
  return currentProvider;
}