import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const log = (step: string, details?: any) =>
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` — ${JSON.stringify(details)}` : ""}`);

// Price ID → course key mapping (must stay in sync with coursePricing.ts)
const PRICE_TO_COURSE: Record<string, string> = {
  // Individual courses
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
  "price_1TXuJ0D5KOEmeWH2PWtxTQgJ": ["gym_l2", "gym_l3", "gym_l4"],           // Power bundle
  "price_1TXuJ1D5KOEmeWH2oamniYan": ["nutrition_l2", "nutrition_l3", "nutrition_l4"], // Fuel bundle
  "price_1TXuJ1D5KOEmeWH2hMG8fGsv": ["mindset_l2", "mindset_l3"],              // Mindset bundle
  "price_1TXuJ2D5KOEmeWH2u32ngbbo": [                                            // All courses
    "gym_l2", "gym_l3", "gym_l4",
    "nutrition_l2", "nutrition_l3", "nutrition_l4",
    "mindset_l2", "mindset_l3",
  ],
};

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
      // Fallback: parse without verification (dev only)
      event = JSON.parse(body) as Stripe.Event;
      log("WARNING: No webhook secret set — parsing event without signature verification");
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        log("Checkout completed", { mode: session.mode, sessionId: session.id });

        if (session.mode === "payment") {
          // One-time purchase — university course or bundle
          const userId = session.metadata?.user_id;
          const priceId = session.metadata?.price_id;

          if (!userId || !priceId) {
            log("Missing metadata", { userId, priceId });
            break;
          }

          // Resolve course keys
          let courseKeys: string[] = [];

          if (PRICE_TO_COURSE[priceId]) {
            courseKeys = [PRICE_TO_COURSE[priceId]];
          } else if (PRICE_TO_BUNDLE[priceId]) {
            courseKeys = PRICE_TO_BUNDLE[priceId];
          } else {
            log("Unknown price ID — not a course purchase", { priceId });
            break;
          }

          log("Recording course purchase", { userId, courseKeys });

          // Upsert each course (ignore duplicates)
          for (const courseKey of courseKeys) {
            const { error } = await serviceClient
              .from("course_purchases")
              .upsert(
                {
                  user_id: userId,
                  course_key: courseKey,
                  stripe_session_id: session.id,
                  stripe_payment_intent_id:
                    typeof session.payment_intent === "string"
                      ? session.payment_intent
                      : null,
                },
                { onConflict: "user_id,course_key" }
              );

            if (error) {
              log("Insert error", { courseKey, error: error.message });
            } else {
              log("Course recorded", { courseKey });
            }
          }

          // Send notification to user
          try {
            const courseNames = courseKeys
              .map((k) => {
                const entry = Object.entries(PRICE_TO_COURSE).find(([, v]) => v === k);
                // Format nicely: gym_l2 → Power L2
                const formatted = k
                  .replace("gym_", "Power L")
                  .replace("nutrition_", "Fuel L")
                  .replace("mindset_", "Mindset L")
                  .replace("sport_", "Sport: ")
                  .replace(/_/g, " ");
                return formatted.charAt(0).toUpperCase() + formatted.slice(1);
              })
              .join(", ");

            await serviceClient.from("notifications").insert({
              user_id: userId,
              type: "course_purchased",
              title: "Course Unlocked! 🎓",
              body: `You now have full access to ${courseNames}. Head to University to start learning.`,
              data: { course_keys: courseKeys },
            });
          } catch (notifyErr) {
            log("Notification error (non-fatal)", { error: String(notifyErr) });
          }
        }

        if (session.mode === "subscription") {
          // Subscription created — handled by existing subscription system
          log("Subscription checkout — handled by existing system");
        }

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
