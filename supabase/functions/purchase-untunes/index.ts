import { rateLimit, rateLimitResponse, getClientIP } from "../_shared/rateLimiter.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Purchase Un-Tunes content with tokens.
 *
 * Body:
 *   { type: 'single', trackId: string }
 *   { type: 'album', albumId: string }
 *   { type: 'bundle' }
 *
 * Returns:
 *   { success, purchase, cards[], tokensSpent, newBalance }
 *
 * Pricing (in tokens):
 *   Single track:  3 tokens  (≈ £1)
 *   Album:        30 tokens  (≈ £10)
 *   Bundle (all): 50 tokens  (price of 2 = 60, discounted to 50)
 */

// ── Pricing ──
const SINGLE_COST = 3;
const ALBUM_COST = 30;
const BUNDLE_COST = 50; // All albums for price of 2 minus discount

// ── Rarity odds ──
// Diamond (10%) and Platinum (1.5%) are PACK-EXCLUSIVE — singles/albums/bundles only drop gold or standard
const RARITY_ODDS = {
  single: { platinum: 0,     diamond: 0,    gold: 0.10 },  // 10% gold, 90% standard — no diamond/platinum outside packs
  album:  { platinum: 0,     diamond: 0,    gold: 0.15 },  // 15% gold, 85% standard
  bundle: { platinum: 0,     diamond: 0,    gold: 0.20 },  // 20% gold, 80% standard — best gold odds
  pack:   { platinum: 0.015, diamond: 0.10, gold: 0.25 },  // 1.5% platinum, 10% diamond, 25% gold — pack exclusive
};
const MAX_DIAMOND_EDITIONS = 1000;  // Only 1,000 diamond editions ever
const MAX_PLATINUM_EDITIONS = 250;  // Only 250 platinum editions ever

function rollRarity(type: "single" | "album" | "bundle"): "standard" | "gold" | "diamond" | "platinum" {
  const roll = Math.random();
  const odds = RARITY_ODDS[type];
  if (roll < odds.platinum) return "platinum";
  if (roll < odds.platinum + odds.diamond) return "diamond";
  if (roll < odds.platinum + odds.diamond + odds.gold) return "gold";
  return "standard";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate limiting
  const ip = getClientIP(req);
  const rl = rateLimit(ip, 10, 60);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { type } = body;

    if (!["single", "album", "bundle"].includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid purchase type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Determine cost & what to grant ──
    let cost: number;
    let trackIds: string[] = [];
    let albumIds: string[] = [];

    if (type === "single") {
      if (!body.trackId) {
        return new Response(JSON.stringify({ error: "trackId required for single purchase" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Verify track exists
      const { data: track } = await supabase.from("un_tunes_tracks").select("id, title, album_id").eq("id", body.trackId).single();
      if (!track) {
        return new Response(JSON.stringify({ error: "Track not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      cost = SINGLE_COST;
      trackIds = [track.id];

    } else if (type === "album") {
      if (!body.albumId) {
        return new Response(JSON.stringify({ error: "albumId required for album purchase" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: album } = await supabase.from("un_tunes_albums").select("id, title").eq("id", body.albumId).single();
      if (!album) {
        return new Response(JSON.stringify({ error: "Album not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Get all tracks in album
      const { data: albumTracks } = await supabase.from("un_tunes_tracks").select("id").eq("album_id", album.id);
      cost = ALBUM_COST;
      albumIds = [album.id];
      trackIds = (albumTracks || []).map((t: any) => t.id);

    } else {
      // Bundle, all albums
      const { data: allAlbums } = await supabase.from("un_tunes_albums").select("id");
      const { data: allTracks } = await supabase.from("un_tunes_tracks").select("id");
      cost = BUNDLE_COST;
      albumIds = (allAlbums || []).map((a: any) => a.id);
      trackIds = (allTracks || []).map((t: any) => t.id);
    }

    // ── Check for duplicates (already owned) ──
    const { data: existingCards } = await supabase
      .from("un_tunes_user_cards")
      .select("track_id, album_id, rarity")
      .eq("user_id", user.id);

    const ownedTrackIds = new Set((existingCards || []).filter((c: any) => c.track_id).map((c: any) => c.track_id));
    const ownedAlbumIds = new Set((existingCards || []).filter((c: any) => c.album_id && !c.track_id).map((c: any) => c.album_id));

    // Filter to new items only (re-purchases still roll for rare variants!)
    // Actually, allow re-purchase, you can collect multiple rarities

    // ── Check if user is dev/coach (bypass token deduction) ──
    const { data: isDevRole } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'dev' });
    const { data: isCoachRole } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'coach' });
    const hasFullAccess = isDevRole || isCoachRole;

    // ── Check token balance ──
    const { data: balanceRow } = await supabase
      .from("token_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!balanceRow) {
      return new Response(JSON.stringify({ error: "No token balance found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentBalance = Number(balanceRow.balance);

    // Dev/coach accounts bypass balance check
    if (!hasFullAccess && currentBalance < cost) {
      return new Response(JSON.stringify({
        error: "Not enough tokens",
        balance: currentBalance,
        required: cost,
      }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Deduct tokens (skip for dev/coach) ──
    // Uses the spend_tokens RPC, which row-locks the balance, checks funds,
    // deducts, and logs the token_transactions row atomically — preventing
    // the double-spend race that the old read-then-write pattern allowed.
    let newBalance = currentBalance;
    if (!hasFullAccess) {
      const { data: newBal, error: spendErr } = await supabase.rpc('spend_tokens', {
        p_user_id: user.id,
        p_amount: cost,
        p_type: 'untunes_purchase',
        p_description: `Un-Tunes ${type} purchase`,
      });

      if (spendErr) {
        return new Response(JSON.stringify({ error: "Failed to deduct tokens" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (Number(newBal) < 0) {
        return new Response(JSON.stringify({ error: "Not enough tokens", required: cost }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      newBalance = Number(newBal);
    }

    // ── Create purchase record ──
    const { data: purchase, error: purchaseError } = await supabase
      .from("un_tunes_purchases")
      .insert({
        user_id: user.id,
        track_id: type === "single" ? trackIds[0] : null,
        album_id: type === "album" ? albumIds[0] : null,
        amount_gbp: 0,
        tokens_spent: cost,
        purchase_type: type,
      })
      .select()
      .single();

    if (purchaseError) {
      // Refund tokens (only if we actually deducted them)
      if (!hasFullAccess) {
        await supabase.rpc('refund_tokens', {
          p_user_id: user.id,
          p_amount: cost,
          p_description: "Refund, purchase failed",
        });
      }
      return new Response(JSON.stringify({ error: "Purchase failed. Tokens refunded." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Generate collectible cards ──
    const cards: any[] = [];

    // Album cover cards
    for (const albumId of albumIds) {
      const rarity = rollRarity(type as any);
      let editionNumber = 0;

      if (rarity === "diamond") {
        const { data: edNum } = await supabase.rpc("claim_diamond_edition", { p_album_id: albumId });
        if (edNum === -1) {
          // No diamond editions left, downgrade to gold
          cards.push({ user_id: user.id, album_id: albumId, card_type: "album", rarity: "gold", edition_number: 0, purchase_id: purchase.id });
          continue;
        }
        editionNumber = edNum;
      }

      cards.push({
        user_id: user.id,
        album_id: albumId,
        track_id: null,
        card_type: "album",
        rarity,
        edition_number: editionNumber,
        purchase_id: purchase.id,
      });
    }

    // Track cards
    for (const trackId of trackIds) {
      const rarity = rollRarity(type as any);
      let editionNumber = 0;

      if (rarity === "diamond") {
        const { data: edNum } = await supabase.rpc("claim_diamond_edition", { p_track_id: trackId });
        if (edNum === -1) {
          cards.push({ user_id: user.id, track_id: trackId, card_type: "track", rarity: "gold", edition_number: 0, purchase_id: purchase.id });
          continue;
        }
        editionNumber = edNum;
      }

      cards.push({
        user_id: user.id,
        track_id: trackId,
        card_type: "track",
        rarity,
        edition_number: editionNumber,
        purchase_id: purchase.id,
      });
    }

    // ── Brand card drops (ultra-rare, per-pack chance) ──
    try {
      const { data: brandCards } = await supabase
        .from("un_tunes_brand_cards")
        .select("id, slug, title, max_standard, max_gold, max_diamond, drop_rate_standard, drop_rate_gold, drop_rate_diamond");

      if (brandCards && brandCards.length > 0) {
        for (const bc of brandCards) {
          // Roll for each rarity independently (diamond first, then gold, then standard)
          const dRoll = Math.random();
          const gRoll = Math.random();
          const sRoll = Math.random();

          let brandRarity: "diamond" | "gold" | "standard" | null = null;
          if (dRoll < Number(bc.drop_rate_diamond)) brandRarity = "diamond";
          else if (gRoll < Number(bc.drop_rate_gold)) brandRarity = "gold";
          else if (sRoll < Number(bc.drop_rate_standard)) brandRarity = "standard";

          if (brandRarity) {
            // Check edition availability via RPC
            const { data: edNum } = await supabase.rpc("claim_brand_edition", {
              p_brand_card_id: bc.id,
              p_rarity: brandRarity,
            });

            if (edNum && edNum > 0) {
              cards.push({
                user_id: user.id,
                track_id: null,
                album_id: null,
                brand_card_id: bc.id,
                lyric_card_id: null,
                card_type: "brand",
                rarity: brandRarity,
                edition_number: edNum,
                purchase_id: purchase.id,
              });
            }
          }
        }
      }
    } catch (e) {
      console.error("Brand card roll error (non-fatal):", e);
    }

    // Insert all cards (track + album + brand)
    const { data: insertedCards, error: cardError } = await supabase
      .from("un_tunes_user_cards")
      .insert(cards)
      .select("*, un_tunes_tracks(title, cover_url, audio_url), un_tunes_albums(title, cover_url)");

    if (cardError) {
      console.error("Card insert error:", cardError);
      // Purchase succeeded but cards failed, log it but don't refund
    }

    return new Response(JSON.stringify({
      success: true,
      purchase,
      cards: insertedCards || [],
      tokensSpent: cost,
      newBalance,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("purchase-untunes error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
