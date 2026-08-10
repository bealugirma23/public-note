CREATE OR REPLACE VIEW wall_notes_with_stats WITH (security_invoker = true) AS
SELECT 
  n.id,
  n.body,
  n.color,
  n.x,
  n.y,
  n.latitude,
  n.longitude,
  n.name,
  n.user_id,
  n.owner_token_hash,
  n.created_at,
  n.last_interaction_at,
  n.expires_at,
  n.hidden,
  COALESCE(SUM(CASE WHEN i.type = 'like' THEN 1 ELSE 0 END), 0) as likes,
  COALESCE(SUM(CASE WHEN i.type = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes,
  COALESCE(SUM(CASE WHEN i.type = 'clap' THEN 1 ELSE 0 END), 0) as claps
FROM wall_notes n
LEFT JOIN wall_note_interactions i ON n.id = i.note_id
GROUP BY n.id;
