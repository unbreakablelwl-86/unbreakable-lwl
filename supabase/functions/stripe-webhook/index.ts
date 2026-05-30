import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const log = (step: string, details?: any) =>
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? `, ${JSON.stringify(details)}` : ""}`);

// ── Price ID → course key mapping (one-time purchases) ──
// Updated 2026-05-26 to match current Stripe products
const PRICE_TO_COURSE: Record<string, string> = {
  // Power pillar
  "price_1TaPpuD5KOEmeWH2SgCLX7TY": "gym_l2",       // Power Level 2 £50
  "price_1TaPptD5KOEmeWH2Sqnp8zbG": "gym_l3",       // Power Level 3 £50
  "price_1TaPpzD5KOEmeWH2dKbZDJZq": "gym_l4",       // Power Level 4 £50
  // Fuel pillar
  "price_1TaPq3D5KOEmeWH2cKqTXZBC": "nutrition_l2", // Fuel Level 2 £50
  "price_1TaPqAD5KOEmeWH2AfXOGEM0": "nutrition_l3", // Fuel Level 3 £50
  "price_1TaPqBD5KOEmeWH2tx9eGeCQ": "nutrition_l4", // Fuel Level 4 £50
  // Mindset pillar
  "price_1TaPqJD5KOEmeWH2bwG0iwL1": "mindset_l2",   // Mindset Level 2 £50
  "price_1TaPqID5KOEmeWH2Dc3CNb6w": "mindset_l3",   // Mindset Level 3 £50
  "price_1TaPqOD5KOEmeWH2aFTrPnKF": "mindset_l4",   // Mindset Level 4 £50
  // Sport courses
  "price_1TaPqPD5KOEmeWH2DtBH1LZ5": "sport_football",    // £50
  "price_1TaPqLD5KOEmeWH2OQFR2rSh": "sport_rugby",       // £50
  "price_1TaPqJD5KOEmeWH2A6GMlIbO": "sport_cricket",     // £50
  "price_1TaPqND5KOEmeWH2wegxy9AP": "sport_tennis",      // £50
  "price_1TaPqQD5KOEmeWH2P2DwUhNB": "sport_swimming",    // £50
  "price_1TaPqMD5KOEmeWH2CWobt6Tl": "sport_boxing",      // £50
  "price_1TaPqQD5KOEmeWH2QLZaol8s": "sport_athletics",   // £50
  "price_1TaPqMD5KOEmeWH2wTi8yOBy": "sport_cycling",     // £50
  "price_1TaPqMD5KOEmeWH2RtsHUKsO": "sport_gymnastics",  // £50
  "price_1TaPqQD5KOEmeWH2B5G3ogSW": "sport_martial_arts", // £50
};

// Bundle price ID → list of course keys
const PRICE_TO_BUNDLE: Record<string, string[]> = {
  // Power Bundle (L2+L3+L4) £117
  "price_1TaPqQD5KOEmeWH2XLjqBvgo": ["gym_l2", "gym_l3", "gym_l4"],
  // Fuel Bundle (L2+L3+L4) £117
  "price_1TaPqQD5KOEmeWH2eYRVS2Yd": ["nutrition_l2", "nutrition_l3", "nutrition_l4"],
  // Mindset Bundle (L2+L3+L4) £117
  "price_1TaPqQD5KOEmeWH2vNGarseX": ["mindset_l2", "mindset_l3", "mindset_l4"],
  // Mega Bundle (All Courses) £300
  "price_1TaPqQD5KOEmeWH29Dy4Q3kN": [
    "gym_l2", "gym_l3", "gym_l4",
    "nutrition_l2", "nutrition_l3", "nutrition_l4",
    "mindset_l2", "mindset_l3", "mindset_l4",
  ],
  // Legacy All Courses (from old Stripe setup, same content)
  "price_1TXuJ2D5KOEmeWH2u32ngbbo": [
    "gym_l2", "gym_l3", "gym_l4",
    "nutrition_l2", "nutrition_l3", "nutrition_l4",
    "mindset_l2", "mindset_l3",
  ],
};

// ── Token top-up price IDs (one-time purchases that provision tokens) ──
const PRICE_TO_TOPUP: Record<string, { tokens: number; label: string }> = {
  "price_1TaPmmD5KOEmeWH2lbJWYqDf": { tokens: 50, label: "Small Top-Up (50 tokens)" },
  "price_1TaPmmD5KOEmeWH2aoxZv7uk": { tokens: 150, label: "Medium Top-Up (150 tokens)" },
  "price_1TaPmsD5KOEmeWH2NmqQQnW1": { tokens: 300, label: "Large Top-Up (300 tokens)" },
};

// ── AI Token tier price IDs ──
// Dynamically loaded from ai_tiers table (see lookupTier helper below)
// Covers both legacy and new subscription tiers automatically.

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
      log("WARNING: No webhook secret, parsing without verification");
    }
  } catch (err: any) {
    log("Signature verification failed", { error: err.message });
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  log("Event received", { type: event.type, id: event.id });

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // ── Helper: look up AI tier from DB by stripe_price_id ──
  async function lookupTier(priceId: string) {
    const { data: tier } = await serviceClient
      .from("ai_tiers")
      .select("name, display_name, monthly_tokens")
      .eq("stripe_price_id", priceId)
      .maybeSingle();
    return tier;
  }

  // ── Helper: resolve Stripe customer email → Supabase user_id ──
  async function resolveUserId(
    stripe: Stripe,
    customerId: string | null,
    metadataUserId?: string,
  ): Promise<string | null> {
    // Prefer metadata user_id
    if (metadataUserId) return metadataUserId;
    if (!customerId) return null;

    try {
      const customer = await stripe.customers.retrieve(customerId);
      if ((customer as any).deleted) return null;
      const email = (customer as Stripe.Customer).email;
      if (!email) return null;

      const { data } = await serviceClient.auth.admin.listUsers();
      const user = data?.users?.find((u: any) => u.email === email);
      return user?.id ?? null;
    } catch {
      return null;
    }
  }

  // ── Helper: provision tokens for a subscription tier ──
  async function provisionTierTokens(
    userId: string,
    tierName: string,
    monthlyTokens: number,
    subscriptionId: string,
    renewsAt: string | null,
    isRenewal: boolean,
  ) {
    const description = isRenewal
      ? `Monthly ${tierName} tier renewal, ${monthlyTokens} tokens`
      : `${tierName} tier activated, ${monthlyTokens} tokens`;

    // Update token_balances: set tier, add tokens, record subscription
    const { data: existing } = await serviceClient
      .from("token_balances")
      .select("balance, lifetime_earned")
      .eq("user_id", userId)
      .maybeSingle();

    const currentBalance = existing?.balance ?? 0;
    const currentLifetime = existing?.lifetime_earned ?? 0;
    const newBalance = Number(currentBalance) + monthlyTokens;
    const newLifetime = Number(currentLifetime) + monthlyTokens;

    const { error: balError } = await serviceClient
      .from("token_balances")
      .upsert(
        {
          user_id: userId,
          balance: newBalance,
          lifetime_earned: newLifetime,
          current_tier: tierName,
          stripe_subscription_id: subscriptionId,
          tier_renews_at: renewsAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (balError) {
      log("Token balance update error", { error: balError.message });
      return;
    }

    // Log transaction
    await serviceClient.from("token_transactions").insert({
      user_id: userId,
      amount: monthlyTokens,
      balance_after: newBalance,
      type: isRenewal ? "tier_renewal" : "tier_activation",
      description,
      metadata: {
        tier: tierName,
        subscription_id: subscriptionId,
      },
    });

    log("Tokens provisioned", { userId, tierName, monthlyTokens, newBalance, isRenewal });

    // Send notification
    await serviceClient.from("notifications").insert({
      user_id: userId,
      type: isRenewal ? "token_renewal" : "token_tier_activated",
      title: isRenewal ? "Tokens Topped Up! ⚡" : `${tierName} Tier Activated! 🚀`,
      body: isRenewal
        ? `Your monthly ${monthlyTokens} Unbreakable Tokens have been added. Balance: ${newBalance}.`
        : `Welcome to ${tierName}! ${monthlyTokens} Unbreakable Tokens added to your balance.`,
      data: { tier: tierName, tokens_added: monthlyTokens, new_balance: newBalance, link: "/ai-tokens" },
    }).then(() => log("Notification sent")).catch(() => log("Notification error (non-fatal)"));
  }

  try {
    switch (event.type) {
      // ━━━ CHECKOUT COMPLETED ━━━
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        log("Checkout completed", { mode: session.mode, sessionId: session.id });

        // ── One-time purchase: university course ──
        if (session.mode === "payment") {
          const userId = session.metadata?.user_id;
          const priceId = session.metadata?.price_id;
          if (!userId || !priceId) { log("Missing metadata", { userId, priceId }); break; }

          // ── Token top-up ──
          if (PRICE_TO_TOPUP[priceId]) {
            const topUp = PRICE_TO_TOPUP[priceId];
            log("Token top-up purchase", { userId, tokens: topUp.tokens, label: topUp.label });

            const { data: existing } = await serviceClient
              .from("token_balances")
              .select("balance, lifetime_earned")
              .eq("user_id", userId)
              .maybeSingle();

            const currentBalance = Number(existing?.balance ?? 0);
            const currentLifetime = Number(existing?.lifetime_earned ?? 0);
            const newBalance = currentBalance + topUp.tokens;

            await serviceClient
              .from("token_balances")
              .upsert(
                {
                  user_id: userId,
                  balance: newBalance,
                  lifetime_earned: currentLifetime + topUp.tokens,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
              );

            await serviceClient.from("token_transactions").insert({
              user_id: userId,
              amount: topUp.tokens,
              balance_after: newBalance,
              type: "top_up",
              description: topUp.label,
              metadata: { price_id: priceId, session_id: session.id },
            });

            await serviceClient.from("notifications").insert({
              user_id: userId,
              type: "token_top_up",
              title: "Tokens Added! 💰",
              body: `${topUp.tokens} Unbreakable Tokens have been added to your balance. New balance: ${newBalance}.`,
              data: { tokens_added: topUp.tokens, new_balance: newBalance, link: "/ai-tokens" },
            }).catch(() => {});

            log("Top-up processed", { userId, tokensAdded: topUp.tokens, newBalance });
            break;
          }

          // ── Course purchase ──
          let courseKeys: string[] = [];
          if (PRICE_TO_COURSE[priceId]) courseKeys = [PRICE_TO_COURSE[priceId]];
          else if (PRICE_TO_BUNDLE[priceId]) courseKeys = PRICE_TO_BUNDLE[priceId];
          else { log("Unknown payment price ID", { priceId }); break; }

          log("Recording course purchase", { userId, courseKeys });

          for (const courseKey of courseKeys) {
            const { error } = await serviceClient
              .from("course_purchases")
              .upsert(
                {
                  user_id: userId,
                  course_key: courseKey,
                  stripe_session_id: session.id,
                  stripe_payment_intent_id:
                    typeof session.payment_intent === "string" ? session.payment_intent : null,
                },
                { onConflict: "user_id,course_key" }
              );
            if (error) log("Insert error", { courseKey, error: error.message });
            else log("Course recorded", { courseKey });
          }

          // Notify user
          try {
            const courseNames = courseKeys
              .map((k) =>
                k.replace("gym_", "Power L").replace("nutrition_", "Fuel L")
                  .replace("mindset_", "Mindset L").replace("sport_", "Sport: ")
                  .replace(/_/g, " ")
                  .replace(/^(.)/, (m) => m.toUpperCase())
              )
              .join(", ");
            await serviceClient.from("notifications").insert({
              user_id: userId,
              type: "course_purchased",
              title: "Course Unlocked! 🎓",
              body: `You now have full access to ${courseNames}. Head to University to start learning.`,
              data: { course_keys: courseKeys, link: "/university" },
            });
          } catch (e) { log("Notification error (non-fatal)", { error: String(e) }); }
        }

        // ── Subscription checkout: AI token tier ──
        if (session.mode === "subscription") {
          const userId = session.metadata?.user_id;
          const subscriptionId = typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription as any)?.id;

          if (!userId || !subscriptionId) {
            log("Missing userId or subscriptionId", { userId, subscriptionId });
            break;
          }

          // Retrieve subscription to get price ID and period end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id;
          const periodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;

          // Look up tier from DB by stripe_price_id (covers all tier versions)
          const tier = priceId ? await lookupTier(priceId) : null;

          if (!tier) {
            log("Not a known AI tier subscription or tier not found", { priceId });
            break;
          }

          log("AI tier subscription activated", {
            userId,
            tier: tier.name,
            tokens: tier.monthly_tokens,
            trial: subscription.status === "trialing",
          });

          await provisionTierTokens(
            userId,
            tier.name,
            tier.monthly_tokens,
            subscriptionId,
            periodEnd,
            false, // not a renewal
          );
        }

        break;
      }

      // ━━━ INVOICE PAID (monthly renewal) ━━━
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        // Skip the first invoice (that's the checkout.session.completed event)
        if (invoice.billing_reason === "subscription_create") {
          log("First invoice (subscription_create), skipping (handled by checkout)");
          break;
        }

        // Only handle recurring subscription invoices
        if (invoice.billing_reason !== "subscription_cycle") {
          log("Non-cycle invoice", { billing_reason: invoice.billing_reason });
          break;
        }

        const subscriptionId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : (invoice.subscription as any)?.id;

        if (!subscriptionId) { log("No subscription on invoice"); break; }

        // Look up user by subscription ID in our token_balances
        const { data: balRow } = await serviceClient
          .from("token_balances")
          .select("user_id, current_tier")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        let userId = balRow?.user_id;

        // Fallback: resolve via Stripe customer
        if (!userId) {
          const custId = typeof invoice.customer === "string"
            ? invoice.customer
            : (invoice.customer as any)?.id;
          userId = await resolveUserId(stripe, custId) ?? undefined;
        }

        if (!userId) { log("Cannot resolve user for renewal", { subscriptionId }); break; }

        // Get subscription details for price and period
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        // Look up tier from DB dynamically (covers all tier versions)
        const tier = priceId ? await lookupTier(priceId) : null;

        if (!tier) {
          log("Renewal not for a known AI tier", { priceId });
          break;
        }

        log("Monthly renewal", { userId, tier: tier.name, tokens: tier.monthly_tokens });

        await provisionTierTokens(
          userId,
          tier.name,
          tier.monthly_tokens,
          subscriptionId,
          periodEnd,
          true, // is renewal
        );

        break;
      }

      // ━━━ SUBSCRIPTION UPDATED (upgrade/downgrade) ━━━
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price?.id;

        // Look up tier from DB dynamically
        const tier = priceId ? await lookupTier(priceId) : null;

        if (!tier) {
          log("Subscription update not for a known AI tier", { priceId });
          break;
        }

        // Find user
        const { data: balRow } = await serviceClient
          .from("token_balances")
          .select("user_id, current_tier")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        let userId = balRow?.user_id;
        if (!userId) {
          const custId = typeof subscription.customer === "string"
            ? subscription.customer
            : (subscription.customer as any)?.id;
          userId = await resolveUserId(stripe, custId) ?? undefined;
        }

        if (!userId) { log("Cannot resolve user for sub update"); break; }

        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        // Update tier (don't add tokens, that happens on invoice.payment_succeeded)
        await serviceClient
          .from("token_balances")
          .upsert(
            {
              user_id: userId,
              current_tier: tier.name,
              stripe_subscription_id: subscription.id,
              tier_renews_at: periodEnd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        log("Tier updated (no token change until next invoice)", {
          userId, newTier: tier.name, oldTier: balRow?.current_tier,
        });

        break;
      }

      // ━━━ SUBSCRIPTION CANCELLED ━━━
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Find user
        const { data: balRow } = await serviceClient
          .from("token_balances")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        let userId = balRow?.user_id;
        if (!userId) {
          const custId = typeof subscription.customer === "string"
            ? subscription.customer
            : (subscription.customer as any)?.id;
          userId = await resolveUserId(stripe, custId) ?? undefined;
        }

        if (!userId) { log("Cannot resolve user for cancellation"); break; }

        // Downgrade to free, keep existing balance (they earned those tokens)
        await serviceClient
          .from("token_balances")
          .upsert(
            {
              user_id: userId,
              current_tier: "free",
              stripe_subscription_id: null,
              tier_renews_at: null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        // Log transaction
        await serviceClient.from("token_transactions").insert({
          user_id: userId,
          amount: 0,
          balance_after: 0, // We don't zero balance, they keep what they have
          type: "tier_cancelled",
          description: "Subscription cancelled, downgraded to Free tier",
          metadata: { subscription_id: subscription.id },
        });

        // Notify
        await serviceClient.from("notifications").insert({
          user_id: userId,
          type: "subscription_cancelled",
          title: "Subscription Cancelled",
          body: "Your Unbreakable Token subscription has ended. Your remaining tokens are still available. You can resubscribe anytime.",
          data: { subscription_id: subscription.id, link: "/ai-tokens" },
        }).catch(() => {});

        log("Subscription cancelled, downgraded to free", { userId });

        break;
      }

      default:
        log("Unhandled event type", { type: event.type });
    }
  } catch (err: any) {
    log("Processing error", { error: err.message });
    return new Response(`Webhook Error: ${err.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
