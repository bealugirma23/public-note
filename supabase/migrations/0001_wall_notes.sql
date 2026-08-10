CREATE TABLE wall_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body TEXT NOT NULL,
  color TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  name TEXT,
  user_id UUID REFERENCES auth.users(id),
  owner_token_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_interaction_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  hidden BOOLEAN NOT NULL DEFAULT false,
  
  CONSTRAINT body_length CHECK (char_length(body) BETWEEN 1 AND 180),
  CONSTRAINT name_length CHECK (char_length(name) <= 24),
  CONSTRAINT color_check CHECK (
    color IN ('amber', 'rose', 'sky', 'mint', 'lilac', 'blush')
  )
);