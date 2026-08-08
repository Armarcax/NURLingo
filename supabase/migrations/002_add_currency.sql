-- Update user_lesson_progress to include hayq_earned and seeds_earned
ALTER TABLE user_lesson_progress 
ADD COLUMN IF NOT EXISTS hayq_earned INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS seeds_earned INTEGER NOT NULL DEFAULT 0;

-- Ensure users table has currency columns with NOT NULL constraints
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hayq_total INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS seeds_total INTEGER NOT NULL DEFAULT 0;

-- Rename XP columns to HAYQ for consistency with idempotent checks
DO $$
BEGIN
  -- lessons.xp_total -> hayq_total
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='lessons' AND column_name='xp_total') THEN
    ALTER TABLE lessons RENAME COLUMN xp_total TO hayq_total;
  END IF;

  -- exercises.xp_reward -> hayq_reward
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='exercises' AND column_name='xp_reward') THEN
    ALTER TABLE exercises RENAME COLUMN xp_reward TO hayq_reward;
  END IF;

  -- exercise_attempts.xp_awarded -> hayq_awarded
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='exercise_attempts' AND column_name='xp_awarded') THEN
    ALTER TABLE exercise_attempts RENAME COLUMN xp_awarded TO hayq_awarded;
  END IF;
END $$;
