import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { body, color, x, y, latitude, longitude, name, owner, turnstileToken } = await req.json();

    // 1. Validate payload basics
    if (!body || !color || x === undefined || y === undefined || !owner) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Validate Turnstile (Mocked for now, you'd call Cloudflare's API)
    // const turnstileSecret = Deno.env.get("TURNSTILE_SECRET");
    // const formData = new FormData();
    // formData.append("secret", turnstileSecret!);
    // formData.append("response", turnstileToken);
    // const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: formData });
    // const outcome = await result.json();
    // if (!outcome.success) throw new Error("Turnstile failed");

    // 3. Hash owner token
    const encoder = new TextEncoder();
    const data = encoder.encode(owner);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ownerTokenHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // 4. Calculate expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // 5. Insert note
    const { data: note, error } = await supabaseClient
      .from("wall_notes")
      .insert({
        body: body.substring(0, 180),
        color,
        x,
        y,
        latitude,
        longitude,
        name: name ? name.substring(0, 24) : null,
        owner_token_hash: ownerTokenHash,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(note), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});