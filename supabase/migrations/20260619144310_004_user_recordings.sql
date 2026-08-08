-- User recordings table: stores references to audio recordings per word
CREATE TABLE IF NOT EXISTS user_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, word_id)
);

ALTER TABLE user_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_recordings" ON user_recordings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_recordings" ON user_recordings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_recordings" ON user_recordings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_recordings" ON user_recordings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Index for fast lookup by user + word
CREATE INDEX idx_user_recordings_lookup ON user_recordings(user_id, word_id);
