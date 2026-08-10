CREATE TABLE wall_note_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES wall_notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  visitor_token_hash TEXT,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_interaction UNIQUE(note_id, visitor_token_hash, type)
);