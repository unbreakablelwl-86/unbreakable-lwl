import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Check active + trialing subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSub) {
      logStep("No active subscription");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log raw subscription fields to debug date issues
    logStep("Raw sub fields", {
      status: activeSub.status,
      current_period_end: activeSub.current_period_end,
      trial_end: (activeSub as any).trial_end,
      created: activeSub.created,
      typeof_cpe: typeof activeSub.current_period_end,
    });

    const productId = activeSub.items.data[0]?.price?.product as string;
    const isTrialing = activeSub.status === "trialing";

    // Safely determine subscription end date
    let subscriptionEnd: string | null = null;
    // Try current_period_end, then trial_end for trialing subs
    const endTs = activeSub.current_period_end ?? (activeSub as any).trial_end;
    if (typeof endTs === "number" && endTs > 0) {
      subscriptionEnd = new Date(endTs * 1000).toISOString();
    }

    // Trial users can always cancel. After trial (active), 3-month lock-in applies.
    let canCancel = isTrialing;
    if (!isTrialing) {
      const startTs = (activeSub as any).start_date ?? activeSub.created ?? 0;
      if (typeof startTs === "number" && startTs > 0) {
        const subscriptionStart = new Date(startTs * 1000);
        const now = new Date();
        const monthsActive = (now.getFullYear() - subscriptionStart.getFullYear()) * 12 +
          (now.getMonth() - subscriptionStart.getMonth());
        canCancel = monthsActive >= 3;
      }
    }

    logStep("Active subscription found", { productId, subscriptionEnd, isTrialing, canCancel });

    return new Response(JSON.stringify({
      subscribed: true,
      product_id: productId,
      subscription_end: subscriptionEnd,
      status: activeSub.status,
      is_trialing: isTrialing,
      can_cancel: canCancel,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
