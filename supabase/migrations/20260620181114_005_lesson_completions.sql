-- Lesson completions: device-level progress, no auth required
-- Each device gets a UUID stored in localStorage as device_id
CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  accuracy INTEGER NOT NULL DEFAULT 0,
  hayq_earned INTEGER NOT NULL DEFAULT 0,
  crown_level INTEGER NOT NULL DEFAULT 1,
  duration_ms INTEGER,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(device_id, lesson_id)
);

-- Anyone can read/write their own device completions (public table, no auth needed)
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_device_completions" ON lesson_completions FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "public_insert_device_completions" ON lesson_completions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "public_update_device_completions" ON lesson_completions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_lesson_completions_device ON lesson_completions(device_id);
CREATE INDEX idx_lesson_completions_lesson ON lesson_completions(lesson_id);
