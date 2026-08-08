// HAYQ event tracking (for achievements and analytics)
export type HayqEventType = "earn" | "spend" | "reward" | "bonus";

export interface HayqEvent {
  type: HayqEventType;
  amount: number;
  reason: string;
  timestamp: number;
}

const eventStore: HayqEvent[] = [];

export function recordEvent(event: HayqEvent): void {
  eventStore.push(event);
  if (eventStore.length > 100) eventStore.shift();
}

export function getRecentEvents(limit = 20): HayqEvent[] {
  return [...eventStore].reverse().slice(0, limit);
}

export function getTotalEarnedToday(): number {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  return eventStore
    .filter(e => e.type === "earn" && e.timestamp >= todayStart)
    .reduce((sum, e) => sum + e.amount, 0);
}