// Spaced Repetition System (SRS) – mastery tracking
export interface MasteryEntry {
  wordId: string;
  level: number;          // 0..5 (0 = never seen, 5 = mastered)
  nextReviewDate: number; // timestamp
  lastScore: number;      // 0..1
  intervalDays: number;
}

const STORAGE_KEY = "nur_mastery";

export function loadMastery(): Record<string, MasteryEntry> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function saveMastery(mastery: Record<string, MasteryEntry>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mastery));
}

export function updateMastery(wordId: string, score: number): void {
  const mastery = loadMastery();
  const entry = mastery[wordId] || {
    wordId,
    level: 0,
    nextReviewDate: Date.now(),
    lastScore: 0,
    intervalDays: 0,
  };

  // Simple Leitner-like progression
  if (score >= 0.9) {
    entry.level = Math.min(5, entry.level + 1);
    entry.intervalDays = [0, 1, 2, 4, 7, 14][entry.level];
  } else if (score < 0.7) {
    entry.level = Math.max(0, entry.level - 1);
    entry.intervalDays = [0, 1, 2, 4, 7, 14][entry.level];
  }
  entry.lastScore = score;
  entry.nextReviewDate = Date.now() + entry.intervalDays * 24 * 60 * 60 * 1000;
  mastery[wordId] = entry;
  saveMastery(mastery);
}

export function getDueWords(): string[] {
  const now = Date.now();
  const mastery = loadMastery();
  return Object.values(mastery)
    .filter(e => e.nextReviewDate <= now && e.level < 5)
    .map(e => e.wordId);
}