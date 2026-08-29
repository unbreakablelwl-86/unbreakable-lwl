import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for DB operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get or initialize balance
    let { data: balance } = await serviceClient
      .from("token_balances")
      .select("balance, lifetime_earned, lifetime_spent, current_tier, tier_renews_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!balance) {
      // Initialize for this user
      await serviceClient.rpc("initialize_token_balance", { p_user_id: user.id });
      const { data: newBalance } = await serviceClient
        .from("token_balances")
        .select("balance, lifetime_earned, lifetime_spent, current_tier, tier_renews_at")
        .eq("user_id", user.id)
        .single();
      balance = newBalance;
    }

    // Get tier info
    const { data: tier } = await serviceClient
      .from("ai_tiers")
      .select("display_name, monthly_tokens, price_pence, features")
      .eq("name", balance?.current_tier || "free")
      .single();

    // Get recent transactions (last 10)
    const { data: transactions } = await serviceClient
      .from("token_transactions")
      .select("amount, type, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Check if user is dev or coach (unlimited access)
    const { data: isDev } = await serviceClient.rpc("has_role", {
      _user_id: user.id,
      _role: "dev",
    });
    const { data: isCoach } = await serviceClient.rpc("has_role", {
      _user_id: user.id,
      _role: "coach",
    });
    const isUnlimited = !!isDev || !!isCoach;

    return new Response(
      JSON.stringify({
        balance: isUnlimited ? 999999 : balance?.balance ?? 0,
        lifetime_earned: balance?.lifetime_earned ?? 0,
        lifetime_spent: balance?.lifetime_spent ?? 0,
        // Dev/coach accounts get unlimited access via is_unlimited below, but
        // current_tier must stay one of the real subscription tiers
        // ('free' | 'absolute_base' | 'foundation') — the frontend's TierKey
        // type doesn't know an "elite" tier, and indexing TIERS['elite']
        // crashed the AI Coach page with "Cannot read properties of
        // undefined (reading 'rank')" for dev/coach testers.
        current_tier: balance?.current_tier ?? "free",
        tier_display_name: isUnlimited ? (isDev ? "Dev" : "Coach") : tier?.display_name ?? "Free",
        monthly_tokens: isUnlimited ? 999999 : tier?.monthly_tokens ?? 5,
        tier_renews_at: balance?.tier_renews_at,
        is_unlimited: isUnlimited,
        recent_transactions: transactions ?? [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("check-tokens error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
