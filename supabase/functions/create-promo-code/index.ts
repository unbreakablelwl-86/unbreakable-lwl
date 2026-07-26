import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
const CH = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (d: any, s = 200) => new Response(JSON.stringify(d), { headers: { ...CH, "Content-Type": "application/json" }, status: s });
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CH });
  try {
    const sc = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
    const { action, user_id } = await req.json();
    if (action === "check_flow") {
      const { data: drip } = await sc.from("email_drip").select("*").eq("user_id", user_id);
      const { data: follows } = await sc.from("follows").select("*").or(`follower_id.eq.c219f448-c05a-4fe3-ae11-793222b7dced,following_id.eq.${user_id}`);
      const { data: convos } = await sc.from("conversation_participants").select("conversation_id").eq("user_id", user_id);
      const { data: notifs } = await sc.from("notifications").select("type,title,body").eq("type", "new_signup").order("created_at", { ascending: false }).limit(3);
      return json({ drip_count: drip?.length, drip, follows: follows?.length, convos: convos?.length, recent_signup_notifs: notifs });
    }
    if (action === "test_checkout") {
      // Test that Foundation price is accessible
      const { data: tier } = await sc.from("ai_tiers").select("*").eq("stripe_price_id", "price_1TxFZED5KOEmeWH2ZSHP5Azn").maybeSingle();
      return json({ foundation_tier: tier });
    }
    return json({ error: "Unknown" }, 400);
  } catch (e) { return json({ error: String(e) }, 500); }
});
