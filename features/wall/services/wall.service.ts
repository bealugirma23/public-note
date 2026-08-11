import { supabase } from "@/lib/supabase/init";
import { WallNote } from "../types/note";

export function getOwnerToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem("wall_owner");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("wall_owner", token);
  }
  return token;
}

export function trackOwnedNote(id: string) {
  if (typeof window === "undefined") return;
  const owned = JSON.parse(localStorage.getItem("owned_notes") || "[]");
  if (!owned.includes(id)) {
    owned.push(id);
    localStorage.setItem("owned_notes", JSON.stringify(owned));
  }
}

export function isNoteOwned(id: string): boolean {
  if (typeof window === "undefined") return false;
  const owned = JSON.parse(localStorage.getItem("owned_notes") || "[]");
  return owned.includes(id);
}

export async function fetchNotes(): Promise<WallNote[]> {
  const { data, error } = await supabase
    .from("wall_notes_with_stats")
    .select("id, body, color, x, y, latitude, longitude, name, created_at, last_interaction_at, likes, dislikes, emojis")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(800);

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
  return data as WallNote[];
}

export function subscribeToNotes(
  onInsert: (note: WallNote) => void,
  onUpdate: (note: WallNote) => void,
  onDelete: (id: string) => void
) {
  return supabase
    .channel("wall")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "wall_notes", filter: "hidden=eq.false" },
      (payload) => onInsert(payload.new as WallNote)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "wall_notes", filter: "hidden=eq.false" },
      (payload) => onUpdate(payload.new as WallNote)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "wall_notes" },
      (payload) => onDelete(payload.old.id)
    )
    .subscribe();
}

export function subscribeToInteractions(
  onInteraction: (interaction: { note_id: string; type: string; old_type?: string; action: "INSERT" | "DELETE" | "UPDATE" }) => void
) {
  return supabase
    .channel("wall-interactions")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "wall_note_interactions" },
      (payload) => onInteraction({ ...payload.new as { note_id: string; type: string }, action: "INSERT" })
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "wall_note_interactions" },
      (payload) => onInteraction({ ...payload.old as { note_id: string; type: string }, action: "DELETE" })
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "wall_note_interactions" },
      (payload) => onInteraction({ 
        ...payload.new as { note_id: string; type: string }, 
        old_type: (payload.old as { type?: string }).type,
        action: "UPDATE" 
      })
    )
    .subscribe();
}

export async function postNote(
  body: string,
  color: string,
  x: number,
  y: number,
  latitude: number | null,
  longitude: number | null,
  name?: string
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-wall-note`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          body, color, x, y, latitude, longitude, name,
          owner: getOwnerToken(),
          turnstileToken: "dummy",
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create note");
    }

    const data = await res.json();
    trackOwnedNote(data.id);
    return data;
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      console.warn("⚠️ Network Error: Edge Function 'create-wall-note' is unreachable.");
      throw new Error("Edge function not deployed or unreachable.");
    }
    throw error;
  }
}

export async function updateNote(id: string, body: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-wall-note`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ id, body, owner: getOwnerToken() }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to update note");
    }
    return await res.json();
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      console.warn("⚠️ Network Error: Edge Function 'update-wall-note' is unreachable.");
      throw new Error("Edge function not deployed or unreachable.");
    }
    throw error;
  }
}

export async function reactToNote(noteId: string, type: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/interact-wall-note`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ note_id: noteId, type, visitor_token: getOwnerToken() }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to interact with note");
    }
    return await res.json();
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      console.warn("⚠️ Network Error: Edge Function 'interact-wall-note' is unreachable. Ensure it is deployed to Supabase.");
      throw new Error("Edge function not deployed or unreachable.");
    }
    throw error;
  }
}