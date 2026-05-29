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

    const { coach_id, service_type, block_type, session_date, session_time, price_gbp } = await req.json();

    // Validate coach exists and has Stripe
    const { data: coachProfile } = await supabase
      .from("coaching_profiles")
      .select("stripe_connect_id, stripe_onboarded, user_id")
      .eq("user_id", coach_id)
      .single();

    if (!coachProfile) {
      return new Response(JSON.stringify({ error: "Coach not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check max 2 sessions per week for this user with this coach
    const sessionDateObj = new Date(session_date);
    const weekStart = new Date(sessionDateObj);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const { count: weekBookings } = await supabase
      .from("coaching_bookings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("coach_id", coach_id)
      .gte("session_date", weekStart.toISOString().split("T")[0])
      .lt("session_date", weekEnd.toISOString().split("T")[0])
      .neq("status", "cancelled");

    if ((weekBookings || 0) >= 2) {
      return new Response(JSON.stringify({ error: "Maximum 2 sessions per week with this coach. Please choose a different week." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check slot not already booked
    const { data: existingBooking } = await supabase
      .from("coaching_bookings")
      .select("id")
      .eq("coach_id", coach_id)
      .eq("session_date", session_date)
      .eq("session_time", session_time)
      .neq("status", "cancelled")
      .single();

    if (existingBooking) {
      return new Response(JSON.stringify({ error: "This time slot is already booked. Please choose another." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseUrl = req.headers.get("origin") || "https://unbreakable.app";

    // Free consultation, no payment needed
    if (price_gbp === 0 || service_type === "consultation") {
      const { data: booking, error: bookErr } = await supabase
        .from("coaching_bookings")
        .insert({
          user_id: user.id,
          coach_id: coach_id,
          service_type,
          block_type: block_type || "single",
          session_date,
          session_time,
          price_gbp: 0,
          status: "confirmed",
          payment_status: "free",
        })
        .select()
        .single();

      if (bookErr) throw bookErr;

      return new Response(JSON.stringify({ success: true, booking_id: booking.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Paid session, create Stripe checkout via coach's connected account
    if (coachProfile.stripe_connect_id && coachProfile.stripe_onboarded) {
      const blockSessions = block_type === "block4" ? 4 : block_type === "block8" ? 8 : block_type === "block12" ? 12 : 1;
      const sessionLabel = service_type === "hybrid" ? "Hybrid Coaching (Monthly)" : `1-2-1 Session (${service_type}) × ${blockSessions}`;

      const session = await stripe.checkout.sessions.create({
        mode: service_type === "hybrid" ? "subscription" : "payment",
        line_items: [{
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Unbreakable Coaching: ${sessionLabel}`,
              description: `Coaching with your PT. ${blockSessions > 1 ? `Block of ${blockSessions} sessions.` : "Single session."} Max 2 per week.`,
            },
            unit_amount: Math.round(price_gbp * 100),
            ...(service_type === "hybrid" ? { recurring: { interval: "month" } } : {}),
          },
          quantity: 1,
        }],
        // 100% goes to coach, 0% platform fee
        payment_intent_data: service_type !== "hybrid" ? {
          application_fee_amount: 0,
          transfer_data: {
            destination: coachProfile.stripe_connect_id,
          },
        } : undefined,
        subscription_data: service_type === "hybrid" ? {
          application_fee_percent: 0,
          transfer_data: {
            destination: coachProfile.stripe_connect_id,
          },
        } : undefined,
        success_url: `${baseUrl}/coach/${coach_id}?booking=success`,
        cancel_url: `${baseUrl}/coach/${coach_id}?booking=cancelled`,
        metadata: {
          user_id: user.id,
          coach_id,
          service_type,
          block_type: block_type || "single",
          session_date,
          session_time,
          platform: "unbreakable",
        },
      });

      // Create pending booking
      await supabase
        .from("coaching_bookings")
        .insert({
          user_id: user.id,
          coach_id,
          service_type,
          block_type: block_type || "single",
          session_date,
          session_time,
          price_gbp,
          status: "pending_payment",
          payment_status: "pending",
          stripe_session_id: session.id,
          sessions_remaining: block_type === "block4" ? 4 : block_type === "block8" ? 8 : block_type === "block12" ? 12 : 1,
        });

      return new Response(JSON.stringify({ checkout_url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Coach hasn't set up Stripe yet, create booking as pending
    const { data: booking } = await supabase
      .from("coaching_bookings")
      .insert({
        user_id: user.id,
        coach_id,
        service_type,
        block_type: block_type || "single",
        session_date,
        session_time,
        price_gbp,
        status: "pending_payment",
        payment_status: "awaiting_coach_stripe",
      })
      .select()
      .single();

    return new Response(JSON.stringify({ 
      success: true, 
      booking_id: booking?.id,
      note: "Coach payment setup pending. Your booking is reserved." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Booking error:", err);
    return new Response(JSON.stringify({ error: err.message || "Booking failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
