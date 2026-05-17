import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const log = (step: string, details?: any) =>
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` — ${JSON.stringify(details)}` : ""}`);

// ── Price ID → course key mapping (one-time purchases) ──
const PRICE_TO_COURSE: Record<string, string> = {
  "price_1TXuIsD5KOEmeWH2gw9eXyGi": "gym_l2",
  "price_1TXuIsD5KOEmeWH2CjrE8w0Q": "gym_l3",
  "price_1TXuItD5KOEmeWH2zAGVTH3v": "gym_l4",
  "price_1TXuItD5KOEmeWH2QkP9L3Oz": "nutrition_l2",
  "price_1TXuIuD5KOEmeWH2fZ1yJPSr": "nutrition_l3",
  "price_1TXuIuD5KOEmeWH2KLkbYQ6i": "nutrition_l4",
  "price_1TXuIvD5KOEmeWH2Zq6L2bh5": "mindset_l2",
  "price_1TXuIvD5KOEmeWH2oDkkinkt": "mindset_l3",
  "price_1TXuIwD5KOEmeWH2CeLpOTQn": "sport_football",
  "price_1TXuIwD5KOEmeWH2KcCtfuyl": "sport_rugby",
  "price_1TXuIxD5KOEmeWH2GjPqk3y6": "sport_cricket",
  "price_1TXuIxD5KOEmeWH23nTLPsJd": "sport_tennis",
  "price_1TXuIyD5KOEmeWH2KDRwd1DQ": "sport_swimming",
  "price_1TXuIyD5KOEmeWH2wHGUWQWw": "sport_boxing",
  "price_1TXuIzD5KOEmeWH2bWMR1eVn": "sport_athletics",
  "price_1TXuIzD5KOEmeWH2CSobLFJy": "sport_cycling",
  "price_1TXuIzD5KOEmeWH2BxUyi1DW": "sport_gymnastics",
  "price_1TXuJ0D5KOEmeWH25A1MjTMX": "sport_martial_arts",
};

// Bundle price ID → list of course keys
const PRICE_TO_BUNDLE: Record<string, string[]> = {
  "price_1TXuJ0D5KOEmeWH2PWtxTQgJ": ["gym_l2", "gym_l3", "gym_l4"],
  "price_1TXuJ1D5KOEmeWH2oamniYan": ["nutrition_l2", "nutrition_l3", "nutrition_l4"],
  "price_1TXuJ1D5KOEmeWH2hMG8fGsv": ["mindset_l2", "mindset_l3"],
  "price_1TXuJ2D5KOEmeWH2u32ngbbo": [
    "gym_l2", "gym_l3", "gym_l4",
    "nutrition_l2", "nutrition_l3", "nutrition_l4",
    "mindset_l2", "mindset_l3",
  ],
};

// ── AI Token tier price IDs ──
const AI_TIER_PRICES = new Set([
  "price_1TXuIrD5KOEmeWH21kBZYWAP", // Starter £25/mo
  "price_1TXuIrD5KOEmeWH2SxYc7G14", // Pro £49/mo
  "price_1TXuIsD5KOEmeWH2JUHUujEy", // Elite £79/mo
]);

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
      log("WARNING: No webhook secret — parsing without verification");
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
      ? `Monthly ${tierName} tier renewal — ${monthlyTokens} tokens`
      : `${tierName} tier activated — ${monthlyTokens} tokens`;

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
      data: { tier: tierName, tokens_added: monthlyTokens, new_balance: newBalance },
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

          let courseKeys: string[] = [];
          if (PRICE_TO_COURSE[priceId]) courseKeys = [PRICE_TO_COURSE[priceId]];
          else if (PRICE_TO_BUNDLE[priceId]) courseKeys = PRICE_TO_BUNDLE[priceId];
          else { log("Unknown price ID", { priceId }); break; }

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
              data: { course_keys: courseKeys },
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

          if (!priceId || !AI_TIER_PRICES.has(priceId)) {
            log("Not an AI tier subscription", { priceId });
            break;
          }

          // Look up tier from DB by stripe_price_id
          const { data: tier } = await serviceClient
            .from("ai_tiers")
            .select("name, display_name, monthly_tokens")
            .eq("stripe_price_id", priceId)
            .maybeSingle();

          if (!tier) { log("Tier not found for price", { priceId }); break; }

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
          log("First invoice (subscription_create) — skipping (handled by checkout)");
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

        if (!priceId || !AI_TIER_PRICES.has(priceId)) {
          log("Renewal not for AI tier", { priceId });
          break;
        }

        const { data: tier } = await serviceClient
          .from("ai_tiers")
          .select("name, display_name, monthly_tokens")
          .eq("stripe_price_id", priceId)
          .maybeSingle();

        if (!tier) { log("Tier not found", { priceId }); break; }

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

        if (!priceId || !AI_TIER_PRICES.has(priceId)) {
          log("Subscription update not for AI tier", { priceId });
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

        // Look up new tier
        const { data: tier } = await serviceClient
          .from("ai_tiers")
          .select("name, display_name, monthly_tokens")
          .eq("stripe_price_id", priceId)
          .maybeSingle();

        if (!tier) break;

        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        // Update tier (don't add tokens — that happens on invoice.payment_succeeded)
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

        // Downgrade to free — keep existing balance (they earned those tokens)
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
          balance_after: 0, // We don't zero balance — they keep what they have
          type: "tier_cancelled",
          description: "Subscription cancelled — downgraded to Free tier",
          metadata: { subscription_id: subscription.id },
        });

        // Notify
        await serviceClient.from("notifications").insert({
          user_id: userId,
          type: "subscription_cancelled",
          title: "Subscription Cancelled",
          body: "Your Unbreakable Token subscription has ended. Your remaining tokens are still available. You can resubscribe anytime.",
          data: { subscription_id: subscription.id },
        }).catch(() => {});

        log("Subscription cancelled — downgraded to free", { userId });

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
