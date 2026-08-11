import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { note_id, visitor_token, type } = await req.json();

    if (!note_id || !visitor_token || !type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Hash visitor token
    const encoder = new TextEncoder();
    const data = encoder.encode(visitor_token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const visitorTokenHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // 2. Fetch the note first to check owner and calculate new expiration
    const { data: note, error: fetchError } = await supabaseClient
      .from("wall_notes")
      .select("created_at, owner_token_hash")
      .eq("id", note_id)
      .single();

    if (fetchError || !note) throw new Error("Note not found");

    // 3. Block self-voting
    if (note.owner_token_hash === visitorTokenHash) {
      return new Response(JSON.stringify({ error: "You cannot vote on your own note" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Handle Interaction (One vote per user per note)
    const { data: existing } = await supabaseClient
      .from("wall_note_interactions")
      .select("id, type")
      .match({ note_id, visitor_token_hash: visitorTokenHash })
      .maybeSingle();

    let toggledOff = false;
    let changedFrom = null;

    if (existing) {
      if (existing.type === type) {
        // Toggle off
        const { error: deleteError } = await supabaseClient
          .from("wall_note_interactions")
          .delete()
          .eq("id", existing.id);
        if (deleteError) throw deleteError;
        toggledOff = true;
      } else {
        // Change vote
        const { error: updateError } = await supabaseClient
          .from("wall_note_interactions")
          .update({ type })
          .eq("id", existing.id);
        if (updateError) throw updateError;
        changedFrom = existing.type;
      }
    } else {
      // Insert new vote
      const { error: insertError } = await supabaseClient
        .from("wall_note_interactions")
        .insert({
          note_id,
          visitor_token_hash: visitorTokenHash,
          type,
        });
      if (insertError) {
        // Fallback for concurrency
        if (insertError.code === "23505") {
          return new Response(JSON.stringify({ error: "Already interacted concurrently" }), {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw insertError;
      }
    }

    // 5. Update note's last_interaction_at and expires_at
    const createdAt = new Date(note.created_at);
    const maxLife = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const inactiveLife = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiresAt = new Date(Math.min(maxLife.getTime(), inactiveLife.getTime()));

    const { error: updateError } = await supabaseClient
      .from("wall_notes")
      .update({
        last_interaction_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", note_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, toggledOff, changedFrom }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
