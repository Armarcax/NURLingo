/**
 * NUR Lingo — Rewards Persistence
 * Handles saving and loading HAYQ, Seeds, and Streaks from local storage.
 */

const STORAGE_KEY = "nur_lingo_seeds_v4";

export interface UserRewards {
  totalHAYQ: number;
  totalSeeds: number;
  streak: number;
  streakFreeze: number;
  lastActivityDate?: string;
  crowns: Record<string, number>;
  hearts: number;
  lastHeartUpdate: string;
  milestones: number[];
  dailyGoal: number;
  dailyActivity: Record<string, number>;
  goalClaimed: string[];
}

const DEFAULT_REWARDS: UserRewards = {
  totalHAYQ: 0,
  totalSeeds: 0,
  streak: 0,
  streakFreeze: 0,
  crowns: {},
  hearts: 5,
  lastHeartUpdate: new Date().toISOString(),
  milestones: [],
  dailyGoal: 10,
  dailyActivity: {},
  goalClaimed: [],
};

export function loadRewards(): UserRewards {
  if (typeof window === "undefined") return DEFAULT_REWARDS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_REWARDS;
    const rewards = JSON.parse(data);
    return {
      ...DEFAULT_REWARDS,
      ...rewards,
      crowns: rewards.crowns || {},
      hearts: rewards.hearts ?? 5,
      lastHeartUpdate: rewards.lastHeartUpdate || new Date().toISOString(),
      milestones: rewards.milestones || [],
      dailyGoal: rewards.dailyGoal || 10,
      dailyActivity: rewards.dailyActivity || {},
      goalClaimed: rewards.goalClaimed || [],
    };
  } catch {
    return DEFAULT_REWARDS;
  }
}

export function saveRewards(rewards: UserRewards) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards));
}

export function updateStreak(rewards: UserRewards): UserRewards {
  const today = new Date().toISOString().split("T")[0];
  if (rewards.lastActivityDate === today) return rewards;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let nextStreak = rewards.streak;
  let streakIncreased = false;
  if (rewards.lastActivityDate === yesterdayStr) {
    nextStreak += 1;
    streakIncreased = true;
  } else {
    nextStreak = 1;
    streakIncreased = true;
  }

  if (streakIncreased && typeof window !== "undefined") {
    import("./quests")
      .then(({ updateQuestProgress }) => updateQuestProgress("streak_maintain", 1))
      .catch(() => {});
  }

  return { ...rewards, streak: nextStreak, lastActivityDate: today };
}

export function addHAYQ(rewards: UserRewards, amount: number): UserRewards {
  const today = new Date().toISOString().split("T")[0];
  const currentActivity = rewards.dailyActivity[today] || 0;
  return {
    ...rewards,
    totalHAYQ: rewards.totalHAYQ + amount,
    dailyActivity: { ...rewards.dailyActivity, [today]: currentActivity + 1 },
  };
}

export function addRewards(hayq: number, seeds: number, minutes: number = 0) {
  const current = loadRewards();
  const withStreak = updateStreak(current);
  const today = new Date().toISOString().split("T")[0];
  const currentActivity = withStreak.dailyActivity[today] || 0;
  const updated: UserRewards = {
    ...withStreak,
    totalHAYQ: withStreak.totalHAYQ + hayq,
    totalSeeds: withStreak.totalSeeds + seeds,
    dailyActivity: { ...withStreak.dailyActivity, [today]: currentActivity + minutes },
  };
  saveRewards(updated);
  return updated;
}

export function buyStreakFreeze(): { success: boolean; error?: string; rewards: UserRewards } {
  const current = loadRewards();
  if (current.streakFreeze >= 2) {
    return { success: false, error: "Maximum 2 freezes allowed", rewards: current };
  }
  if (current.totalHAYQ < 50) {
    return { success: false, error: "Not enough HAYQ (needs 50)", rewards: current };
  }
  const updated = {
    ...current,
    totalHAYQ: current.totalHAYQ - 50,
    streakFreeze: current.streakFreeze + 1,
  };
  saveRewards(updated);
  return { success: true, rewards: updated };
}

export function buyHeartRefill(): { success: boolean; error?: string; rewards: UserRewards } {
  const current = syncHearts();
  if (current.hearts >= 5) {
    return { success: false, error: "Hearts already full", rewards: current };
  }
  if (current.totalHAYQ < 100) {
    return { success: false, error: "Not enough HAYQ (needs 100)", rewards: current };
  }
  const updated = {
    ...current,
    totalHAYQ: current.totalHAYQ - 100,
    hearts: 5,
    lastHeartUpdate: new Date().toISOString(),
  };
  saveRewards(updated);
  return { success: true, rewards: updated };
}

export function deductHeart(): UserRewards {
  const current = syncHearts();
  if (current.hearts <= 0) return current;
  const updated = {
    ...current,
    hearts: current.hearts - 1,
    lastHeartUpdate: current.hearts === 5 ? new Date().toISOString() : current.lastHeartUpdate,
  };
  saveRewards(updated);
  return updated;
}

const HEART_RECOVERY_MINUTES = 5;
const HEART_RECOVERY_MS = HEART_RECOVERY_MINUTES * 60 * 1000;
const MAX_HEARTS = 5;

export function syncHearts(): UserRewards {
  const current = loadRewards();
  if (current.hearts >= MAX_HEARTS) return current;
  const now = new Date();
  const lastUpdate = new Date(current.lastHeartUpdate);
  const diffMs = now.getTime() - lastUpdate.getTime();
  if (diffMs >= HEART_RECOVERY_MS) {
    const heartsToAdd = Math.floor(diffMs / HEART_RECOVERY_MS);
    const newHearts = Math.min(MAX_HEARTS, current.hearts + heartsToAdd);
    const remainingTime = diffMs % HEART_RECOVERY_MS;
    const newUpdateDate = new Date(now.getTime() - remainingTime);
    const updated = {
      ...current,
      hearts: newHearts,
      lastHeartUpdate: newHearts === MAX_HEARTS ? now.toISOString() : newUpdateDate.toISOString(),
    };
    saveRewards(updated);
    return updated;
  }
  return current;
}

export function getNextHeartCountdown(current: UserRewards): number {
  if (current.hearts >= MAX_HEARTS) return 0;
  const lastUpdate = new Date(current.lastHeartUpdate);
  const nextHeartTime = lastUpdate.getTime() + HEART_RECOVERY_MS;
  return Math.max(0, nextHeartTime - new Date().getTime());
}

export function earnHeartByPractice(): { success: boolean; rewards: UserRewards } {
  const current = syncHearts();
  if (current.hearts >= MAX_HEARTS) {
    return { success: false, rewards: current };
  }
  const updated = {
    ...current,
    hearts: current.hearts + 1,
    lastHeartUpdate: new Date().toISOString(),
  };
  saveRewards(updated);
  return { success: true, rewards: updated };
}

export function checkStreakMilestones(): { milestone: number | null; rewards: UserRewards } {
  const current = loadRewards();
  const milestones = [7, 30, 100];
  const newMilestone = milestones.find((m) => current.streak >= m && !current.milestones.includes(m));
  if (newMilestone) {
    const updated = {
      ...current,
      totalSeeds: current.totalSeeds + 1,
      totalHAYQ: current.totalHAYQ + newMilestone * 2,
      milestones: [...current.milestones, newMilestone],
    };
    saveRewards(updated);
    return { milestone: newMilestone, rewards: updated };
  }
  return { milestone: null, rewards: current };
}

export function checkDailyGoalBonus(): { achieved: boolean; rewards: UserRewards } {
  const current = loadRewards();
  const today = new Date().toISOString().split("T")[0];
  const minutes = current.dailyActivity[today] || 0;
  if (minutes >= current.dailyGoal && !current.goalClaimed.includes(today)) {
    const updated = {
      ...current,
      totalHAYQ: current.totalHAYQ + 20,
      goalClaimed: [...current.goalClaimed, today],
    };
    saveRewards(updated);
    return { achieved: true, rewards: updated };
  }
  return { achieved: false, rewards: current };
}

export function setDailyGoal(minutes: number) {
  const current = loadRewards();
  saveRewards({ ...current, dailyGoal: minutes });
}

export function saveCrownLevel(lessonId: string, level: number): UserRewards {
  const current = loadRewards();
  const updated = {
    ...current,
    crowns: {
      ...current.crowns,
      [lessonId]: Math.min(3, Math.max(current.crowns[lessonId] || 0, level)),
    },
  };
  saveRewards(updated);
  return updated;
}

export function checkAndApplyFreeze(): UserRewards {
  const current = loadRewards();
  if (!current.lastActivityDate) return current;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(current.lastActivityDate);
  lastDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(Math.abs(today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) {
    if (current.streakFreeze > 0) {
      const updated = {
        ...current,
        streakFreeze: current.streakFreeze - 1,
        lastActivityDate: new Date(today.getTime() - 86400000).toISOString().split("T")[0],
      };
      saveRewards(updated);
      return updated;
    } else {
      const updated = { ...current, streak: 0 };
      saveRewards(updated);
      return updated;
    }
  }
  return current;
}