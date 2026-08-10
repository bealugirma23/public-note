ALTER TABLE wall_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_note_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible notes"
ON wall_notes
FOR SELECT
USING (hidden = false);

CREATE POLICY "Public can read interactions"
ON wall_note_interactions
FOR SELECT
USING (true);