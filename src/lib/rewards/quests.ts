// src/lib/rewards/quests.ts
import type { LangCode } from "../i18n/index";

export interface Quest {
  id: string;
  description: Record<LangCode, string>;
  target: number;
  progress: number;
  reward: { hayq: number; seeds?: number };
  completed: boolean;
  claimed: boolean;
}

const STORAGE_KEY = "nur_daily_quests";

const DEFAULT_QUESTS: Omit<Quest, "progress" | "completed" | "claimed">[] = [
  {
    id: "complete_lessons",
    description: {
      en: "Complete 3 lessons",
      hy: "Ավարտիր 3 դաս",
      ru: "Завершите 3 урока",
    },
    target: 3,
    reward: { hayq: 30, seeds: 1 },
  },
  {
    id: "earn_hayq",
    description: {
      en: "Earn 100 HAYQ",
      hy: "Վաստակիր 100 HAYQ",
      ru: "Заработайте 100 HAYQ",
    },
    target: 100,
    reward: { hayq: 50 },
  },
  {
    id: "streak_maintain",
    description: {
      en: "Maintain streak (1 day)",
      hy: "Պահպանիր սթրիքը (1 օր)",
      ru: "Сохраните серию (1 день)",
    },
    target: 1,
    reward: { hayq: 20, seeds: 1 },
  },
];

export function loadQuests(): Quest[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const fresh = DEFAULT_QUESTS.map(q => ({
        ...q,
        progress: 0,
        completed: false,
        claimed: false,
      }));
      saveQuests(fresh);
      return fresh;
    }
    const data = JSON.parse(stored);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) {
      const fresh = DEFAULT_QUESTS.map(q => ({
        ...q,
        progress: 0,
        completed: false,
        claimed: false,
      }));
      saveQuests(fresh);
      return fresh;
    }
    return data.quests;
  } catch {
    return DEFAULT_QUESTS.map(q => ({ ...q, progress: 0, completed: false, claimed: false }));
  }
}

function saveQuests(quests: Quest[]) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, quests }));
}

export function updateQuestProgress(questId: string, increment: number) {
  const quests = loadQuests();
  const quest = quests.find(q => q.id === questId);
  if (!quest || quest.completed || quest.claimed) return;
  quest.progress = Math.min(quest.target, quest.progress + increment);
  if (quest.progress >= quest.target) {
    quest.completed = true;
  }
  saveQuests(quests);
}

export function claimReward(questId: string): { hayq: number; seeds: number } | null {
  const quests = loadQuests();
  const quest = quests.find(q => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) return null;
  quest.claimed = true;
  saveQuests(quests);
  return {
    hayq: quest.reward.hayq,
    seeds: quest.reward.seeds ?? 0,
  };
}

export function addQuestProgressAndUpdateRewards(
  questId: string,
  increment: number,
  _currentRewards: { totalHAYQ: number; totalSeeds: number }
): { hayqAdded: number; seedsAdded: number } | null {
  updateQuestProgress(questId, increment);
  const quests = loadQuests();
  const quest = quests.find(q => q.id === questId);
  if (quest?.completed && !quest.claimed) {
    const reward = claimReward(questId);
    if (reward) {
      return {
        hayqAdded: reward.hayq,
        seedsAdded: reward.seeds,
      };
    }
  }
  return null;
}