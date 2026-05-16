import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// Known Tier 2 (121 coaching) price ID
const TIER2_PRICE_ID = "price_1T6Gc7RgwCgvPuKnfH1WiggU";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const { priceId } = await req.json();
    if (!priceId || typeof priceId !== "string" || !priceId.startsWith("price_")) {
      throw new Error("Invalid price ID");
    }
    logStep("Price ID received", { priceId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    // Find or skip existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://www.unbreakable-lwl.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7,
        metadata: { user_id: user.id },
      },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/plans`,
    });

    logStep("Checkout session created", { sessionId: session.id });

    // If Tier 2 (121 coaching), notify all dev users
    if (priceId === TIER2_PRICE_ID) {
      logStep("Tier 2 (121) selected — notifying devs");
      try {
        // Get user profile for display name
        const { data: profileData } = await serviceClient
          .from("profiles")
          .select("display_name, username")
          .eq("user_id", user.id)
          .maybeSingle();

        const displayName = profileData?.display_name || profileData?.username || user.email;

        // Find all dev users
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
            data: { athlete_id: user.id, price_id: priceId },
          }));

          await serviceClient.from("notifications").insert(notifications);
          logStep("Dev notifications sent", { count: notifications.length });
        }
      } catch (notifyErr) {
        // Don't fail checkout if notification fails
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