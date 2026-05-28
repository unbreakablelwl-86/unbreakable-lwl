import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Purchase a PB card download with tokens.
 *
 * Body:
 *   { cardId: string, mediaType: 'image' | 'video' }
 *
 * Pricing:
 *   Image card download: 3 tokens
 *   Video card download: 5 tokens
 *
 * Returns:
 *   { success, purchased, tokensSpent, newBalance }
 */

const IMAGE_COST = 3;
const VIDEO_COST = 5;

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
    const { cardId, mediaType } = body;

    if (!cardId) {
      return new Response(JSON.stringify({ error: "cardId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["image", "video"].includes(mediaType)) {
      return new Response(
        JSON.stringify({ error: "mediaType must be 'image' or 'video'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cost = mediaType === "video" ? VIDEO_COST : IMAGE_COST;

    // Verify card exists and belongs to user
    const { data: card, error: cardError } = await supabase
      .from("achievement_cards")
      .select("id, user_id, title, exercise_name, rarity, purchased")
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
          message: "Card already purchased — download available",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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

    // Check token balance
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

    if (!hasFullAccess && currentBalance < cost) {
      return new Response(
        JSON.stringify({
          error: "Not enough tokens",
          balance: currentBalance,
          required: cost,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Deduct tokens
    let newBalance = currentBalance;
    if (!hasFullAccess) {
      newBalance = currentBalance - cost;
      const { error: updateError } = await supabase
        .from("token_balances")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to deduct tokens" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Log transaction
      await supabase.from("token_transactions").insert({
        user_id: user.id,
        amount: -cost,
        balance_after: newBalance,
        type: "card_purchase",
        description: `PB Card purchase (${mediaType}) — ${card.exercise_name || card.title} [${card.rarity}]`,
      });
    }

    // Mark card as purchased
    const { error: purchaseError } = await supabase
      .from("achievement_cards")
      .update({ purchased: true })
      .eq("id", cardId);

    if (purchaseError) {
      // Refund
      if (!hasFullAccess) {
        await supabase
          .from("token_balances")
          .update({
            balance: currentBalance,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        await supabase.from("token_transactions").insert({
          user_id: user.id,
          amount: cost,
          balance_after: currentBalance,
          type: "refund",
          description: "Refund — card purchase failed",
        });
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
        mediaType,
        tokensSpent: hasFullAccess ? 0 : cost,
        newBalance: hasFullAccess ? currentBalance : newBalance,
        cardId,
        message: `${mediaType === "video" ? "Video" : "Image"} card unlocked! Download now available.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("purchase-card error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
