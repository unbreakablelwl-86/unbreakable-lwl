import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Purchase an Un-Tunes card download with tokens.
 *
 * Body:
 *   { cardId: string }
 *
 * Pricing:
 *   1 token per card (PDF download of full image)
 *
 * Returns:
 *   { success, purchased, tokensSpent, newBalance }
 */

const CARD_COST = 1;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { cardId } = body;

    if (!cardId) {
      return new Response(JSON.stringify({ error: "cardId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify card exists and belongs to user
    const { data: card, error: cardError } = await supabase
      .from("un_tunes_user_cards")
      .select("id, user_id, rarity, track_id, album_id, card_type, purchased")
      .eq("id", cardId)
      .single();

    if (cardError || !card) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (card.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not your card" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already purchased
    if (card.purchased) {
      return new Response(
        JSON.stringify({
          success: true,
          already_purchased: true,
          message: "Card already purchased, download available",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for dev/coach bypass
    const { data: isDevRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "dev",
    });
    const { data: isCoachRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "coach",
    });
    const hasFullAccess = isDevRole || isCoachRole;

    // Check token balance (pre-check for UX; atomic deduction happens via spend_tokens below)
    const { data: balanceRow } = await supabase
      .from("token_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!balanceRow) {
      return new Response(
        JSON.stringify({ error: "No token balance found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentBalance = Number(balanceRow.balance);

    if (!hasFullAccess && currentBalance < CARD_COST) {
      return new Response(
        JSON.stringify({
          error: "Not enough tokens",
          balance: currentBalance,
          required: CARD_COST,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get card title for transaction log
    let cardTitle = "Un-Tunes Card";
    if (card.track_id) {
      const { data: track } = await supabase
        .from("un_tunes_tracks")
        .select("title")
        .eq("id", card.track_id)
        .single();
      if (track) cardTitle = track.title;
    } else if (card.album_id) {
      const { data: album } = await supabase
        .from("un_tunes_albums")
        .select("title")
        .eq("id", card.album_id)
        .single();
      if (album) cardTitle = album.title;
    }

    // Deduct tokens atomically (locks the balance row, prevents double-spend) unless full-access bypass
    let newBalance = currentBalance;
    let tokensSpent = 0;
    if (!hasFullAccess) {
      const { data: newBal, error: spendErr } = await supabase.rpc(
        "spend_tokens",
        {
          p_user_id: user.id,
          p_amount: CARD_COST,
          p_type: "untunes_card_purchase",
          p_description: `Un-Tunes card purchase, ${cardTitle} [${card.rarity}]`,
        }
      );

      if (spendErr) {
        console.error("spend_tokens error:", spendErr);
        return new Response(
          JSON.stringify({ error: "Failed to deduct tokens" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (Number(newBal) < 0) {
        return new Response(
          JSON.stringify({
            error: "Not enough tokens",
            required: CARD_COST,
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      newBalance = Number(newBal);
      tokensSpent = CARD_COST;
    }

    // Mark card as purchased
    const { error: purchaseError } = await supabase
      .from("un_tunes_user_cards")
      .update({ purchased: true })
      .eq("id", cardId);

    if (purchaseError) {
      // Refund
      if (!hasFullAccess) {
        const { error: refundErr } = await supabase.rpc("refund_tokens", {
          p_user_id: user.id,
          p_amount: CARD_COST,
          p_description: "Refund, Un-Tunes card purchase failed",
        });
        if (refundErr) {
          console.error("refund_tokens error:", refundErr);
        }
      }
      return new Response(
        JSON.stringify({ error: "Purchase failed. Tokens refunded." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        purchased: true,
        tokensSpent,
        newBalance,
        cardId,
        message: "Card unlocked! PDF download now available.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("purchase-untunes-card error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
