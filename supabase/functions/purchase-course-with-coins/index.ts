import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Purchase a university course (or bundle of courses) by spending coins.
 *
 * Body: { courseKeys: string[], coinCost: number, label: string }
 *   - courseKeys: array of course keys to unlock (e.g. ['gym_l2'] or ['gym_l2','gym_l3','gym_l4'])
 *   - coinCost: total coins to deduct (validated server-side against known pricing)
 *   - label: human-readable name for the transaction log
 */

// ── Known pricing (must match frontend coursePricing.ts & guideData.ts) ──
const COURSE_COIN_COST = 150;
const GUIDE_COIN_COST = 15;

const BUNDLE_COSTS: Record<string, { courses: string[]; coinCost: number }> = {
  power:   { courses: ["gym_l2", "gym_l3", "gym_l4"], coinCost: 375 },
  fuel:    { courses: ["nutrition_l2", "nutrition_l3", "nutrition_l4"], coinCost: 375 },
  mindset: { courses: ["mindset_l2", "mindset_l3"], coinCost: 250 },
  all:     { courses: ["gym_l2", "gym_l3", "gym_l4", "nutrition_l2", "nutrition_l3", "nutrition_l4", "mindset_l2", "mindset_l3"], coinCost: 900 },
  guide_bundle_all: {
    courses: ["guide_01","guide_02","guide_03","guide_04","guide_05","guide_06","guide_07","guide_08","guide_09","guide_10",
              "guide_11","guide_12","guide_13","guide_14","guide_15","guide_16","guide_17","guide_18","guide_19","guide_20"],
    coinCost: 150,
  },
};

// Guide keys
const GUIDE_KEYS = new Set([
  "guide_01","guide_02","guide_03","guide_04","guide_05",
  "guide_06","guide_07","guide_08","guide_09","guide_10",
  "guide_11","guide_12","guide_13","guide_14","guide_15",
  "guide_16","guide_17","guide_18","guide_19","guide_20",
]);

const VALID_COURSE_KEYS = new Set([
  "gym_l2", "gym_l3", "gym_l4",
  "nutrition_l2", "nutrition_l3", "nutrition_l4",
  "mindset_l2", "mindset_l3",
  "sport_football", "sport_rugby", "sport_cricket", "sport_tennis",
  "sport_swimming", "sport_boxing", "sport_athletics", "sport_cycling",
  "sport_gymnastics", "sport_martial_arts",
  // Guides
  ...GUIDE_KEYS,
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { courseKeys, coinCost, label, bundleKey } = await req.json();

    // ── Validate inputs ──
    if (!Array.isArray(courseKeys) || courseKeys.length === 0) {
      return new Response(JSON.stringify({ error: "courseKeys required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate all course keys
    for (const key of courseKeys) {
      if (!VALID_COURSE_KEYS.has(key)) {
        return new Response(JSON.stringify({ error: `Invalid course key: ${key}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── Server-side price validation ──
    let expectedCost: number;

    if (bundleKey && BUNDLE_COSTS[bundleKey]) {
      const bundle = BUNDLE_COSTS[bundleKey];
      // Verify the course keys match the bundle
      const sortedInput = [...courseKeys].sort().join(",");
      const sortedBundle = [...bundle.courses].sort().join(",");
      if (sortedInput !== sortedBundle) {
        return new Response(JSON.stringify({ error: "Course keys don't match bundle" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      expectedCost = bundle.coinCost;
    } else {
      // Calculate cost per item, guides cost GUIDE_COIN_COST, courses cost COURSE_COIN_COST
      expectedCost = courseKeys.reduce((sum: number, key: string) => {
        return sum + (GUIDE_KEYS.has(key) ? GUIDE_COIN_COST : COURSE_COIN_COST);
      }, 0);
    }

    if (coinCost !== expectedCost) {
      return new Response(JSON.stringify({ error: `Price mismatch: expected ${expectedCost} coins` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Check which courses user already owns ──
    const { data: existing } = await supabase
      .from("course_purchases")
      .select("course_key")
      .eq("user_id", user.id)
      .in("course_key", courseKeys);

    const alreadyOwned = new Set((existing || []).map((r: any) => r.course_key));
    const newCourses = courseKeys.filter((k: string) => !alreadyOwned.has(k));

    if (newCourses.length === 0) {
      return new Response(JSON.stringify({ error: "You already own all these courses" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Check coin balance ──
    const { data: balanceRow, error: balError } = await supabase
      .from("token_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (balError || !balanceRow) {
      return new Response(JSON.stringify({ error: "No coin balance found. Please sign out and back in." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentBalance = Number(balanceRow.balance);
    if (currentBalance < expectedCost) {
      return new Response(JSON.stringify({
        error: "Not enough coins",
        balance: currentBalance,
        required: expectedCost,
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Deduct coins ──
    const newBalance = currentBalance - expectedCost;
    const { error: updateError } = await supabase
      .from("token_balances")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Balance update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to deduct coins" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Log token transaction ──
    await supabase.from("token_transactions").insert({
      user_id: user.id,
      amount: -expectedCost,
      balance_after: newBalance,
      action: "course_purchase",
      description: label || `Purchased: ${newCourses.join(", ")}`,
    });

    // ── Grant course access ──
    const purchases = newCourses.map((key: string) => ({
      user_id: user.id,
      course_key: key,
      payment_method: "coins",
      coins_spent: bundleKey ? null : COURSE_COIN_COST,
    }));

    const { error: insertError } = await supabase
      .from("course_purchases")
      .insert(purchases);

    if (insertError) {
      // Refund coins on failure
      console.error("Course insert error:", insertError);
      await supabase
        .from("token_balances")
        .update({ balance: currentBalance, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      await supabase.from("token_transactions").insert({
        user_id: user.id,
        amount: expectedCost,
        balance_after: currentBalance,
        action: "refund",
        description: `Refund, course purchase failed: ${newCourses.join(", ")}`,
      });

      return new Response(JSON.stringify({ error: "Failed to grant course access. Coins refunded." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      purchased: newCourses,
      skipped: courseKeys.filter((k: string) => alreadyOwned.has(k)),
      coinsSpent: expectedCost,
      newBalance,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("purchase-course-with-coins error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
