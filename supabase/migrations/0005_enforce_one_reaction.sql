ALTER TABLE wall_note_interactions DROP CONSTRAINT IF EXISTS unique_interaction;
ALTER TABLE wall_note_interactions ADD CONSTRAINT unique_interaction UNIQUE(note_id, visitor_token_hash);
ALTER TABLE wall_note_interactions REPLICA IDENTITY FULL;
