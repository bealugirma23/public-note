-- Insert dummy data to demonstrate clustering
-- We insert them with longitude and latitude.

-- Clear previous data
TRUNCATE TABLE public.wall_note_interactions CASCADE;
TRUNCATE TABLE public.wall_notes CASCADE;

INSERT INTO public.wall_notes (id, body, color, x, y, latitude, longitude, name, owner_token_hash, created_at, expires_at)
VALUES 
  -- Cluster A: New York Region (~ Lat: 40.7, Lng: -74.0)
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a1', 'Hello from NYC! It is so busy today.', 'amber', -2220, -1221, 40.71, -74.01, 'NYer', 'hash1', now(), now() + interval '7 days'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a2', 'Best pizza here. Central park is a vibe.', 'rose', -2225, -1225, 40.75, -73.98, 'PizzaFan', 'hash2', now(), now() + interval '7 days'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a3', 'Watching the sunset over the hudson.', 'sky', -2215, -1228, 40.78, -73.96, 'Walker', 'hash3', now(), now() + interval '7 days'),

  -- Cluster B: London Region (~ Lat: 51.5, Lng: -0.1)
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4b1', 'Rainy again in London. Typical.', 'mint', -3, -1545, 51.51, -0.11, 'Brit', 'hash4', now(), now() + interval '7 days'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4b2', 'Mind the gap on the central line!', 'lilac', -4, -1542, 51.50, -0.12, 'Tube', 'hash5', now(), now() + interval '7 days'),

  -- Cluster C: Tokyo Region (~ Lat: 35.6, Lng: 139.6)
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4c1', 'Tokyo is so busy! The lights are amazing.', 'blush', 4188, -1068, 35.68, 139.65, 'Traveler', 'hash6', now(), now() + interval '7 days');


-- Add some dummy interactions (Likes, Dislikes, Claps)
INSERT INTO public.wall_note_interactions (note_id, visitor_token_hash, type)
VALUES 
  -- NYC Note 1 gets 3 likes, 1 clap
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a1', 'vhash1', 'like'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a1', 'vhash2', 'like'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a1', 'vhash3', 'like'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a1', 'vhash4', 'clap'),

  -- NYC Note 2 gets 1 dislike, 2 claps
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a2', 'vhash5', 'dislike'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a2', 'vhash6', 'clap'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4a2', 'vhash7', 'clap'),

  -- London Note 1 gets 5 claps
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4b1', 'vhash8', 'clap'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4b1', 'vhash9', 'clap'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4b1', 'vhash10', 'clap'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4b1', 'vhash11', 'clap'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4b1', 'vhash12', 'clap'),

  -- Tokyo Note 1 gets 2 likes, 1 dislike
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4c1', 'vhash13', 'like'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4c1', 'vhash14', 'like'),
  ('d1f11c7d-30e4-4c4c-9f8a-c6b22f48f4c1', 'vhash15', 'dislike');
