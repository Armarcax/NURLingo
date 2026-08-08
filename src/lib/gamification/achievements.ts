export interface Achievement {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardHayq: number;
}

const STORAGE_KEY = "nur_achievements";

const ACHIEVEMENTS_LIST: Omit<Achievement, "progress" | "completed" | "claimed">[] = [
  {
    id: "first_lesson",
    title: { en: "First Step", hy: "Առաջին քայլ", ru: "Первый шаг" },
    description: { en: "Complete your first lesson", hy: "Ավարտիր առաջին դասը", ru: "Завершите первый урок" },
    target: 1,
    rewardHayq: 50,
  },
  {
    id: "streak_7",
    title: { en: "7‑Day Warrior", hy: "7‑օրյա մարտիկ", ru: "7‑дневный воин" },
    description: { en: "Maintain a 7‑day streak", hy: "Պահպանիր 7‑օրյա սթրիք", ru: "Сохраните 7‑дневную серию" },
    target: 7,
    rewardHayq: 200,
  },
  {
    id: "perfect_lesson",
    title: { en: "Flawless", hy: "Անթերի", ru: "Безупречно" },
    description: { en: "Get 100% on a lesson", hy: "Ստացիր 100% մեկ դասում", ru: "Получите 100% на уроке" },
    target: 1,
    rewardHayq: 100,
  },
];

export function loadAchievements(): Achievement[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return ACHIEVEMENTS_LIST.map(a => ({
    ...a,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

export function saveAchievements(achievements: Achievement[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
}

export function updateProgress(achievementId: string, increment: number): void {
  const achievements = loadAchievements();
  const ach = achievements.find(a => a.id === achievementId);
  if (!ach || ach.completed) return;
  ach.progress = Math.min(ach.target, ach.progress + increment);
  if (ach.progress >= ach.target && !ach.completed) {
    ach.completed = true;
  }
  saveAchievements(achievements);
}

export function claimReward(achievementId: string): number | null {
  const achievements = loadAchievements();
  const ach = achievements.find(a => a.id === achievementId);
  if (!ach || !ach.completed || ach.claimed) return null;
  ach.claimed = true;
  saveAchievements(achievements);
  return ach.rewardHayq;
}