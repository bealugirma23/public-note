export interface WallNote {
  id: string;
  body: string;
  color: string;
  x: number;
  y: number;
  latitude?: number | null;
  longitude?: number | null;
  name: string | null;
  created_at: string;
  last_interaction_at: string;
  likes?: number;
  dislikes?: number;
  claps?: number;
  emojis?: Record<string, number>;
}
