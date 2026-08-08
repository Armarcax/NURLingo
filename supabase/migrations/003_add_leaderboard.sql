-- Leaderboard Weekly Table
-- Tracks HAYQ earned by users each week for league competition.

CREATE TABLE IF NOT EXISTS public.leaderboard_weekly (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start   DATE NOT NULL DEFAULT (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER),
  hayq_earned  INTEGER NOT NULL DEFAULT 0,
  league       TEXT NOT NULL DEFAULT 'Bronze', -- Bronze, Silver, Gold, Sapphire, Ruby, Emerald, Amethyst, Pearl, Obsidian, Diamond
  rank         INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, week_start)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_week ON public.leaderboard_weekly(week_start);
CREATE INDEX IF NOT EXISTS idx_leaderboard_league ON public.leaderboard_weekly(league);
CREATE INDEX IF NOT EXISTS idx_leaderboard_hayq ON public.leaderboard_weekly(hayq_earned DESC);

-- RLS
ALTER TABLE public.leaderboard_weekly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all leaderboard entries"
  ON public.leaderboard_weekly FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own leaderboard entry"
  ON public.leaderboard_weekly FOR UPDATE
  USING (auth.uid() = user_id);

-- Leagues:
-- 1. Bronze
-- 2. Silver
-- 3. Gold
-- 4. Sapphire
-- 5. Ruby
-- 6. Emerald
-- 7. Amethyst
-- 8. Pearl
-- 9. Obsidian
-- 10. Diamond
