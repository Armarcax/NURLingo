export type LangCode = "en" | "hy" | "ru";
export type LangPair = "en-hy" | "hy-en" | "ru-hy" | "hy-ru" | "en-ru" | "ru-en";

export interface LangConfig {
  pair: LangPair;
  native: LangCode;
  learning: LangCode;
}

export const UI_STRINGS: Record<LangCode, any> = {
  en: { loading: "Loading...", back: "Back", continue: "Continue" },
  hy: { loading: "Բեռնում...", back: "Հետ", continue: "Շարունակել" },
  ru: { loading: "Загрузка...", back: "Назад", continue: "Продолжить" }
};

export function loadLangConfig(): LangConfig | null {
  if (typeof window === "undefined") return null;
  const source = localStorage.getItem("nur_source_lang") as LangCode;
  const target = localStorage.getItem("nur_target_lang") as LangCode;
  if (!source || !target) return null;
  const pair = (source + "-" + target) as LangPair;
  return {
    pair,
    native: source,
    learning: target
  };
}
