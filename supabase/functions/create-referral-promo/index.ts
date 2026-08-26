import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Returns the caller's personal referral code, creating it on first use.
 *
 * The code is stored in `referral_codes` and mirrored into Stripe as a
 * promotion code attached to the referral coupon, so it discounts a real
 * subscription at checkout rather than only unlocking things app-side.
 * Checkout already has `allow_promotion_codes: true`, so the member's
 * friend simply types the code into Stripe checkout.
 */
const REFERRAL_COUPON_ID = "mZ00pC0V"; // £25 off, forever — keeps the price at £50

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization") ?? "";
    const { data: userData } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    // Generate (or fetch) the member's code.
    const { data: code, error: codeErr } = await serviceClient.rpc(
      "get_or_create_referral_code",
      { p_user_id: user.id },
    );
    if (codeErr || !code) throw new Error(codeErr?.message || "Could not create referral code");

    const { data: row } = await serviceClient
      .from("referral_codes")
      .select("id, code, stripe_promotion_code_id, times_used")
      .eq("user_id", user.id)
      .maybeSingle();

    // Mirror into Stripe once. If this fails the member still has a code —
    // we just retry the Stripe half on the next call.
    if (row && !row.stripe_promotion_code_id) {
      try {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
          apiVersion: "2025-08-27.basil",
        });
        const promo = await stripe.promotionCodes.create({
          coupon: REFERRAL_COUPON_ID,
          code: String(code),
          metadata: { user_id: user.id, purpose: "referral" },
        });
        await serviceClient
          .from("referral_codes")
          .update({ stripe_promotion_code_id: promo.id })
          .eq("id", row.id);
      } catch (stripeErr) {
        console.error("Stripe promotion code creation failed:", String(stripeErr));
      }
    }

    const { count } = await serviceClient
      .from("referral_signups")
      .select("id", { count: "exact", head: true })
      .eq("referral_code_id", row?.id ?? "");

    return new Response(
      JSON.stringify({ code, timesUsed: count ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
