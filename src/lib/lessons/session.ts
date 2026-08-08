// Add to existing file
export interface AttemptTracker {
  [questionId: string]: { attempts: number; maxAttempts: number };
}

export function recordAttempt(tracker: AttemptTracker, questionId: string, maxAttempts: number = 4): { attemptsLeft: number; isFailed: boolean } {
  const current = tracker[questionId]?.attempts || 0;
  const newAttempts = current + 1;
  tracker[questionId] = { attempts: newAttempts, maxAttempts };
  const attemptsLeft = maxAttempts - newAttempts;
  const isFailed = newAttempts >= maxAttempts;
  return { attemptsLeft, isFailed };
}

export function resetAttempts(tracker: AttemptTracker, questionId: string) {
  delete tracker[questionId];
}