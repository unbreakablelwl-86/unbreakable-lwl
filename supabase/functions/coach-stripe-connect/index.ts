import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Auth
    const authHeader = req.headers.get("authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user is a coach
    const { data: coachProfile } = await supabase
      .from("coaching_profiles")
      .select("role, stripe_connect_id, stripe_onboarded")
      .eq("user_id", user.id)
      .single();

    if (!coachProfile || !["coach", "owner", "admin"].includes(coachProfile.role)) {
      return new Response(JSON.stringify({ error: "Not a coach" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json();
    const baseUrl = req.headers.get("origin") || "https://unbreakable.app";

    if (action === "create_account") {
      let accountId = coachProfile.stripe_connect_id;

      // Create Stripe Connect account if not exists
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          country: "GB",
          default_currency: "gbp",
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: "individual",
          metadata: {
            user_id: user.id,
            platform: "unbreakable",
          },
        });
        accountId = account.id;

        // Save to DB
        await supabase
          .from("coaching_profiles")
          .update({ stripe_connect_id: accountId })
          .eq("user_id", user.id);
      }

      // Create onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${baseUrl}/coach-dashboard?stripe=refresh`,
        return_url: `${baseUrl}/coach-dashboard?stripe=success`,
        type: "account_onboarding",
      });

      return new Response(JSON.stringify({ url: accountLink.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "dashboard_link") {
      if (!coachProfile.stripe_connect_id) {
        return new Response(JSON.stringify({ error: "No Stripe account connected" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const loginLink = await stripe.accounts.createLoginLink(coachProfile.stripe_connect_id);

      return new Response(JSON.stringify({ url: loginLink.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_status") {
      if (!coachProfile.stripe_connect_id) {
        return new Response(JSON.stringify({ connected: false, onboarded: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const account = await stripe.accounts.retrieve(coachProfile.stripe_connect_id);
      const onboarded = account.charges_enabled && account.payouts_enabled;

      // Update DB if status changed
      if (onboarded !== coachProfile.stripe_onboarded) {
        await supabase
          .from("coaching_profiles")
          .update({ stripe_onboarded: onboarded })
          .eq("user_id", user.id);
      }

      return new Response(JSON.stringify({ connected: true, onboarded }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Coach Stripe Connect error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
