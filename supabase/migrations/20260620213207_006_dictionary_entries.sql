-- Custom dictionary entries: editable by users/admins
CREATE TABLE IF NOT EXISTS dictionary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id TEXT NOT NULL UNIQUE,          -- stable key, e.g. "custom_001"
  hy TEXT NOT NULL,
  en TEXT NOT NULL,
  ru TEXT NOT NULL,
  category TEXT,
  part_of_speech TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  audio_id TEXT,
  image_url TEXT,
  source TEXT DEFAULT 'custom',          -- 'custom' | 'imported' | 'generated'
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,                       -- device_id or user email
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Anyone can read; write requires device_id header (checked in app layer)
ALTER TABLE dictionary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_dictionary" ON dictionary_entries FOR SELECT
  TO anon, authenticated USING (is_active = true);

CREATE POLICY "public_insert_dictionary" ON dictionary_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "public_update_dictionary" ON dictionary_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_delete_dictionary" ON dictionary_entries FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX idx_dict_word_id ON dictionary_entries(word_id);
CREATE INDEX idx_dict_hy ON dictionary_entries USING gin(to_tsvector('simple', hy));
CREATE INDEX idx_dict_en ON dictionary_entries USING gin(to_tsvector('simple', en));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_dictionary_updated_at
  BEFORE UPDATE ON dictionary_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
