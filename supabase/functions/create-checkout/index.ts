import { rateLimit, rateLimitResponse, getClientIP } from "../_shared/rateLimiter.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
};

// Known subscription price IDs (AI tiers + coaching tiers)
const SUBSCRIPTION_PRICES = new Set([
  // Current subscription tiers (subscriptionTiers.ts)
  "price_1TxFZED5KOEmeWH2ZSHP5Azn", // Foundation £50/mo (launch offer)
  "price_1TaPmmD5KOEmeWH2Le2bNnPh", // Absolute Base £7/mo (retention)
  "price_1TaPmmD5KOEmeWH2LeANGH4k", // Base £25/mo
  "price_1TaPmsD5KOEmeWH2dO7mg9XK", // Pro £50/mo
  "price_1TaPmmD5KOEmeWH2bemvjYM4", // Elite £100/mo
  // Un-Tunes artist subscription
  "price_1TaknRD5KOEmeWH2yPpxlfNw", // Un-Tunes Artist £5/mo
  // Legacy AI token tiers (may still be active on existing subs)
  "price_1TXuIrD5KOEmeWH21kBZYWAP", // Old Starter £25/mo
  "price_1TXuIrD5KOEmeWH2SxYc7G14", // Old Pro £49/mo
  "price_1TXuIsD5KOEmeWH2JUHUujEy", // Old Elite £79/mo
  // Legacy coaching tiers
  "price_1TOZ0iD5KOEmeWH2hXvqwBOm", // Tier 1
  "price_1TOZ0jD5KOEmeWH23osCaN4Y", // Tier 2 (121)
  "price_1T6Gc7RgwCgvPuKnfH1WiggU", // Old Tier 2
]);

// One-time purchase price IDs actually sold by this app (courses, course bundles, and
// token top-ups — must mirror stripe-webhook.ts's PRICE_TO_COURSE / PRICE_TO_BUNDLE /
// PRICE_TO_TOPUP). SECURITY: anything outside this list plus SUBSCRIPTION_PRICES is
// rejected below, so a client can no longer check out an arbitrary Stripe price ID that
// happens to exist in the same Stripe account (test prices, internal prices, etc).
const ONE_TIME_PRICES = new Set([
  // Power pillar
  "price_1TaPpuD5KOEmeWH2SgCLX7TY", "price_1TaPptD5KOEmeWH2Sqnp8zbG", "price_1TaPpzD5KOEmeWH2dKbZDJZq",
  // Fuel pillar
  "price_1TaPq3D5KOEmeWH2cKqTXZBC", "price_1TaPqAD5KOEmeWH2AfXOGEM0", "price_1TaPqBD5KOEmeWH2tx9eGeCQ",
  // Mindset pillar
  "price_1TaPqJD5KOEmeWH2bwG0iwL1", "price_1TaPqID5KOEmeWH2Dc3CNb6w", "price_1TaPqOD5KOEmeWH2aFTrPnKF",
  // Sport courses
  "price_1TaPqPD5KOEmeWH2DtBH1LZ5", "price_1TaPqLD5KOEmeWH2OQFR2rSh", "price_1TaPqJD5KOEmeWH2A6GMlIbO",
  "price_1TaPqND5KOEmeWH2wegxy9AP", "price_1TaPqQD5KOEmeWH2P2DwUhNB", "price_1TaPqMD5KOEmeWH2CWobt6Tl",
  "price_1TaPqQD5KOEmeWH2QLZaol8s", "price_1TaPqMD5KOEmeWH2wTi8yOBy", "price_1TaPqMD5KOEmeWH2RtsHUKsO",
  "price_1TaPqQD5KOEmeWH2B5G3ogSW",
  // Bundles
  "price_1TaPqQD5KOEmeWH2XLjqBvgo", "price_1TaPqQD5KOEmeWH2eYRVS2Yd", "price_1TaPqQD5KOEmeWH2vNGarseX",
  "price_1TaPqQD5KOEmeWH29Dy4Q3kN", "price_1TXuJ2D5KOEmeWH2u32ngbbo",
  // Token top-ups
  "price_1U8jm2D5KOEmeWH249kqt6M0", "price_1TaPmmD5KOEmeWH2lbJWYqDf",
  "price_1TaPmmD5KOEmeWH2aoxZv7uk", "price_1TaPmsD5KOEmeWH2NmqQQnW1",
]);

// Token top-up price IDs specifically (subset of ONE_TIME_PRICES above) — must
// mirror stripe-webhook.ts's PRICE_TO_TOPUP. Top-ups only make sense for
// members who actually have coach access to spend the fuel on; a free/manual
// account has none (see featureGating.ts's ai_coach_basic gate), so selling
// them a top-up would just be a confusing charge for something they can't
// use. Checked server-side too — not just hidden in the UI — since this
// endpoint is callable directly with any priceId in ONE_TIME_PRICES.
const TOPUP_PRICES = new Set([
  "price_1U8jm2D5KOEmeWH249kqt6M0",
  "price_1TaPmmD5KOEmeWH2lbJWYqDf",
  "price_1TaPmmD5KOEmeWH2aoxZv7uk",
  "price_1TaPmsD5KOEmeWH2NmqQQnW1",
]);

// Tier 2 (121 coaching) price IDs that trigger dev notifications
const COACHING_121_PRICES = new Set([
  "price_1TOZ0jD5KOEmeWH23osCaN4Y",
  "price_1T6Gc7RgwCgvPuKnfH1WiggU",
]);

// "New Beginning" launch offer: 7-day free trial, then billed at the normal
// rate. Stripe coupons can't set a subscription's trial length — only
// subscription_data.trial_period_days on the Checkout Session can — so this
// code is validated here rather than as a Stripe promotion code. Restricted
// to brand-new customers (no existing Stripe customer record for the email)
// so it can't be repeatedly reapplied by an existing/returning subscriber.
const TRIAL_OFFER_CODE = "NEWBEGINNING7";
const TRIAL_OFFER_DAYS = 7;
const TRIAL_ELIGIBLE_PRICES = new Set([
  "price_1TxFZED5KOEmeWH2ZSHP5Azn", // Foundation £50/mo
]);

// Private "100% off for life" code — JJ's own, shared personally, never
// surfaced in any user-facing copy. Unlike NEWBEGINNING7 (a hardcoded trial
// flag), this one is a REAL Stripe Promotion Code that JJ created directly
// in the Stripe dashboard (a 100%-off, duration=forever coupon). So rather
// than hardcode a discount here, we look the code up live against Stripe by
// its `code` string (Stripe matches promotion codes case-insensitively) and
// apply it as an actual Checkout discount. That also means whatever
// redemption limit, expiry or "first-time customer only" restriction JJ set
// on the Promotion Code itself in Stripe is enforced by Stripe, not
// duplicated here — if the code is inactive, maxed out, or the customer
// isn't eligible, Stripe simply won't apply it (or the session create call
// below will fail, caught by the outer try/catch same as any other error).
//
// IMPORTANT: this code must never appear in any user-facing marketing copy,
// hero section, banner, or hint text anywhere in the app (JJ, 2026-09-26 —
// see claude/2026-09-26-private-lifetime-promo-code.md). Do not "fix" that.
const LIFETIME_FREE_CODE = "LIVEWITHOUTLIMITS";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting — this previously lived inside the OPTIONS branch above
  // (the closing brace was misplaced), so it never actually ran on a real
  // POST request. Moved outside so it applies to every non-OPTIONS request.
  const ip = getClientIP(req);
  const rl = rateLimit(ip, 10, 60);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // ── Analytics (Commercial event slice, see claude/ANALYTICS_ARCHITECTURE.md) ──
  // Strictly additive / non-blocking: never throws, never changes control flow or the
  // checkout response. Mirrors the identical helper in stripe-webhook/index.ts. Always
  // awaited at each call site (not fire-and-forget) because a Deno edge function's
  // isolate can be frozen immediately after the response is sent, which would silently
  // drop an un-awaited background insert.
  async function trackServerEvent(
    eventName: string,
    userId: string | null,
    properties: Record<string, unknown> = {},
  ) {
    try {
      await serviceClient.from("analytics_events").insert({
        user_id: userId,
        event_name: eventName,
        properties,
        source: "server",
      });
    } catch (e) {
      logStep("Analytics insert failed (non-fatal)", { event: eventName, error: String(e) });
    }
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const { priceId, promoCode } = await req.json();
    if (!priceId || typeof priceId !== "string" || !priceId.startsWith("price_")) {
      throw new Error("Invalid price ID");
    }
    if (!SUBSCRIPTION_PRICES.has(priceId) && !ONE_TIME_PRICES.has(priceId)) {
      throw new Error("This price is not available for checkout");
    }
    logStep("Price ID received", { priceId });

    // Top-ups require existing coach access (Unbreakable, or the £7 retention
    // tier which gets limited coach access too). Free/manual accounts have no
    // tier that can spend coach fuel, so block the purchase before it reaches
    // Stripe rather than let someone pay £10 for tokens they can't use.
    // Dev/coach roles bypass this, same as every other paywall in the app.
    if (TOPUP_PRICES.has(priceId)) {
      const { data: roleRow } = await serviceClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["dev", "coach"])
        .maybeSingle();

      if (!roleRow) {
        const { data: balanceRow } = await serviceClient
          .from("token_balances")
          .select("current_tier")
          .eq("user_id", user.id)
          .maybeSingle();
        const tier = balanceRow?.current_tier || "free";
        if (tier === "free") {
          throw new Error("Top-ups are for members with coach access — upgrade to Unbreakable first.");
        }
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://www.unbreakable-lwl.com";
    const isSubscription = SUBSCRIPTION_PRICES.has(priceId);
    const mode = isSubscription ? "subscription" : "payment";

    logStep("Checkout mode", { mode, isSubscription });

    const rawPromo = typeof promoCode === "string" ? promoCode.trim() : "";
    const normalizedPromo = rawPromo.toUpperCase();
    const grantsTrial =
      isSubscription &&
      TRIAL_ELIGIBLE_PRICES.has(priceId) &&
      normalizedPromo === TRIAL_OFFER_CODE &&
      !customerId; // new customers only
    if (normalizedPromo === TRIAL_OFFER_CODE) {
      logStep("Trial offer code presented", { grantsTrial, hadExistingCustomer: !!customerId });
    }

    // Private lifetime-free code — resolve it against Stripe's real Promotion
    // Codes rather than trusting the string. Scoped to the same subscription
    // prices as the trial offer (the only subscription actually sold through
    // signup/AI Tokens).
    let lifetimePromotionCodeId: string | undefined;
    if (isSubscription && TRIAL_ELIGIBLE_PRICES.has(priceId) && normalizedPromo === LIFETIME_FREE_CODE) {
      try {
        const found = await stripe.promotionCodes.list({ code: rawPromo, active: true, limit: 1 });
        if (found.data.length > 0) {
          lifetimePromotionCodeId = found.data[0].id;
          logStep("Lifetime free code resolved", { promotionCodeId: lifetimePromotionCodeId });
        } else {
          logStep("Lifetime free code typed but not found/active in Stripe", {});
        }
      } catch (promoLookupErr) {
        logStep("Lifetime free code lookup failed", { error: String(promoLookupErr) });
      }
    }

    // Build session config. `discounts` and `allow_promotion_codes` are
    // mutually exclusive on a Checkout Session — pre-apply the resolved
    // lifetime discount when we found one, otherwise fall back to letting
    // anyone enter a promo code on Stripe's own checkout page as before.
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${origin}/?checkout=success`,
      cancel_url: isSubscription ? `${origin}/ai-tokens` : `${origin}/university`,
      metadata: { user_id: user.id, price_id: priceId },
    };

    if (lifetimePromotionCodeId) {
      sessionConfig.discounts = [{ promotion_code: lifetimePromotionCodeId }];
    } else {
      sessionConfig.allow_promotion_codes = true;
    }

    if (isSubscription) {
      sessionConfig.subscription_data = {
        metadata: { user_id: user.id },
        ...(grantsTrial ? { trial_period_days: TRIAL_OFFER_DAYS } : {}),
      };
    } else {
      // One-time payment, attach user_id for webhook processing
      sessionConfig.payment_intent_data = {
        metadata: { user_id: user.id, price_id: priceId },
      };
    }

    // Idempotency key: prevents duplicate sessions from double-click / retry
    const offerTag = grantsTrial ? "trial" : lifetimePromotionCodeId ? "lifetime" : "std";
    const idempotencyKey = `checkout_${user.id}_${priceId}_${offerTag}_${Math.floor(Date.now() / 30000)}`;
    const session = await stripe.checkout.sessions.create(sessionConfig, {
      idempotencyKey,
    });
    logStep("Checkout session created", { sessionId: session.id, mode, idempotencyKey });

    // Analytics (Commercial event slice, see claude/ANALYTICS_ARCHITECTURE.md).
    // Strictly additive / non-blocking: trackServerEvent never throws, so it can never
    // affect the checkout response below — but it IS awaited (not fire-and-forget)
    // before that response is returned, because a Deno edge function's isolate can be
    // frozen immediately after the response is sent, which would silently drop an
    // un-awaited background insert. Awaiting these fast inserts adds negligible latency
    // and does not change control flow, error handling, or the checkout outcome.
    await trackServerEvent("checkout_started", user.id, {
      price_id: priceId,
      mode,
      is_trial: grantsTrial,
      is_lifetime_discount: !!lifetimePromotionCodeId,
    });
    if (grantsTrial) {
      await trackServerEvent("trial_started", user.id, { price_id: priceId, trial_days: TRIAL_OFFER_DAYS });
    }
    if (lifetimePromotionCodeId) {
      await trackServerEvent("lifetime_discount_applied", user.id, { price_id: priceId });
    }

    // If Tier 2 (121 coaching), notify all dev users
    if (COACHING_121_PRICES.has(priceId)) {
      logStep("121 coaching selected, notifying devs");
      try {
        const { data: profileData } = await serviceClient
          .from("profiles")
          .select("display_name, username")
          .eq("user_id", user.id)
          .maybeSingle();

        const displayName = profileData?.display_name || profileData?.username || user.email;

        const { data: devRoles } = await serviceClient
          .from("user_roles")
          .select("user_id")
          .eq("role", "dev");

        if (devRoles && devRoles.length > 0) {
          const notifications = devRoles.map((r: any) => ({
            user_id: r.user_id,
            type: "tier2_signup",
            title: "New 121 Coaching Signup",
            body: `${displayName} has started checkout for Unbreakable 1-to-1 coaching (7-day trial). Review in your coaching dashboard.`,
            data: { athlete_id: user.id, price_id: priceId, link: "/coach?tab=requests" },
          }));

          await serviceClient.from("notifications").insert(notifications);
          logStep("Dev notifications sent", { count: notifications.length });
        }
      } catch (notifyErr) {
        logStep("Notification error (non-fatal)", { error: String(notifyErr) });
      }
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
