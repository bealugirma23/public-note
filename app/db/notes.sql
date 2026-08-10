-- migrations/0001_init.sql
CREATE TABLE IF NOT EXISTS notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  body        TEXT    NOT NULL,
  color       TEXT    NOT NULL,            -- 调色板键: amber|rose|sky|mint|lilac|blush
  x           REAL    NOT NULL,            -- 中心点归一化 0..1
  y           REAL    NOT NULL,            -- 中心点归一化 0..1
  name        TEXT,                        -- 可选署名 (见决策 D1)
  owner       TEXT    NOT NULL,            -- 客户端不透明 token, 用于归属
  created_at  INTEGER NOT NULL,            -- epoch ms
  hidden      INTEGER NOT NULL DEFAULT 0,  -- 审核软删
  ip_hash     TEXT                         -- 限流/审核, 不可逆 hash
);
CREATE INDEX IF NOT EXISTS idx_notes_visible   ON notes (hidden, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_ratelimit ON notes (ip_hash, created_at);
