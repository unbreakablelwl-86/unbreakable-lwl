import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader ?? "" } } }
    );
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { card_id } = await req.json();
    if (!card_id) {
      return new Response(JSON.stringify({ error: "card_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the Un-Tunes card with track/album/brand data
    const { data: card, error: cardErr } = await serviceClient
      .from("un_tunes_user_cards")
      .select(`
        *,
        track:un_tunes_tracks(title, genre, duration_seconds, cover_url, artist_id,
          artist:un_tunes_artists(artist_name)
        ),
        album:un_tunes_albums(title, cover_url),
        brand_card:un_tunes_brand_cards(title, description)
      `)
      .eq("id", card_id)
      .eq("user_id", user.id)
      .single();

    if (cardErr || !card) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine card type and context
    const isTrackCard = !!card.track_id;
    const isAlbumCard = !!card.album_id;
    const isBrandCard = !!card.brand_card_id;

    let cardTitle = "Unknown";
    let artistName = "Unbreakable";
    let genre = "";
    let categoryTag = card.category_tag || "Workout";

    if (isTrackCard && card.track) {
      cardTitle = card.track.title || "Unknown Track";
      artistName = card.track.artist?.artist_name || "Unbreakable";
      genre = card.track.genre || "";
    } else if (isAlbumCard && card.album) {
      cardTitle = card.album.title || "Unknown Album";
    } else if (isBrandCard && card.brand_card) {
      cardTitle = card.brand_card.title || "Unknown Brand Card";
    }

    const rarity = card.rarity || "standard";
    const playCount = card.play_count || 0;
    const cardType = isTrackCard ? "Track" : isAlbumCard ? "Album" : isBrandCard ? "Artist" : "Unknown";

    const prompt = `You write ultra-short, punchy one-line descriptors for collectable music cards in a fitness app called Unbreakable. These cards are earned through music streaming during workouts. The tone is energetic, musical, and premium, like album liner notes meets trading card flavour text.

Rules:
- Exactly ONE sentence, max 12 words
- No quotation marks, no hashtags, no emojis
- Reference the music, vibe, or workout energy
- Sound like a music critic meets a hype commentator
- Match the category: ${categoryTag} (Workout = high energy, Warm Up = building, Recovery = calm, Focus = intense concentration, Hype = maximum energy)

Context:
- Card Type: ${cardType} Card
- Title: ${cardTitle}
- Artist: ${artistName}
${genre ? 

IMPORTANT FORMATTING RULE: Never use dashes or hyphens (— – -) as punctuation in your response. Use commas instead. Write naturally flowing sentences with commas, not dash-separated clauses.`- Genre: ${genre}` : ""}
- Category: ${categoryTag}
- Rarity: ${rarity.toUpperCase()}
- Play Count: ${playCount} plays
${isBrandCard ? "- This is a rare artist/brand collector card" : ""}

Write the one-line descriptor:`;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 60,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Anthropic error:", errText);
      throw new Error(`Anthropic API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const bioLine =
      aiData.content?.[0]?.text?.trim().replace(/^["']|["']$/g, "").replace(/\.+$/, "") || "";

    // Save bio to card
    if (bioLine) {
      await serviceClient
        .from("un_tunes_user_cards")
        .update({ bio_line: bioLine })
        .eq("id", card_id)
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({ bio_line: bioLine }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-untunes-card-bio error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
