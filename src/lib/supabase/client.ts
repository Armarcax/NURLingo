import { createClient } from "@supabase/supabase-js";

// Database type for TypeScript generics
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          username: string | null;
          email: string | null;
          display_name: string | null;
          cefr_level: string;
          xp_total: number;
          hayq_total: number;
          seeds_total: number;
          streak_days: number;
          streak_last_date: string | null;
          preferences: Record<string, unknown>;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: "not_started" | "in_progress" | "completed";
          score: number;
          hayq_earned: number;
          seeds_earned: number;
          attempts: number;
          completed_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      exercise_attempts: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string | null;
          user_answer: string;
          expected_answer: string;
          is_accepted: boolean;
          score: number | null;
          hayq_awarded: number;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
  };
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function getSupabaseBrowser() {
  return supabase;
}
