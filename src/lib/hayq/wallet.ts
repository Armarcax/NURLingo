// HAYQ digital wallet – connects to seeds.ts rewards
import { loadRewards, saveRewards, addHAYQ, type UserRewards } from "../rewards/seeds";

export interface Wallet {
  balance: number;
  add(amount: number): void;
  spend(amount: number): boolean;
}

export function getWallet(): Wallet {
  const rewards = loadRewards();
  return {
    balance: rewards.totalHAYQ,
    add(amount: number) {
      const updated = addHAYQ(loadRewards(), amount);
      saveRewards(updated);
      this.balance = updated.totalHAYQ;
    },
    spend(amount: number) {
      if (this.balance < amount) return false;
      const rewards = loadRewards();
      rewards.totalHAYQ -= amount;
      saveRewards(rewards);
      this.balance = rewards.totalHAYQ;
      return true;
    },
  };
}

export function getBalance(): number {
  return loadRewards().totalHAYQ;
}